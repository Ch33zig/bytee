import { supabase } from './supabase'

export type Profile = {
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
    rating: number
    exchange_count: number
}

export type FoodItem = {
    id: string
    user_id: string
    name: string
    quantity: number | null
    weight: number | null
    weight_unit: string | null
    category: string | null
    location: string | null
    expiry_date: string
    purchase_date: string | null
    is_shared: boolean
    created_at: string
    updated_at: string
}

export type Share = {
    id: string
    food_item_id: string
    owner_id: string
    status: 'available' | 'claimed' | 'completed'
    claimer_id: string | null
    pickup_time: string | null
    pickup_notes: string | null
    claimed_at: string | null
    completed_at: string | null
    created_at: string
}

export type ShareWithDetails = Share & {
    food_item: FoodItem
    owner: Profile
    distance?: number
}

export const getUserFoodItems = async (userId: string) => {
    const { data, error } = await supabase
        .from('food_items')
        .select('*')
        .eq('user_id', userId)
        .order('expiry_date', { ascending: true })

    if (error) throw error
    return data as FoodItem[]
}

export const addFoodItem = async (
    item: Omit<FoodItem, 'id' | 'created_at' | 'updated_at'>
) => {
    const { data, error } = await supabase
        .from('food_items')
        .insert([item])
        .select()
        .single()

    if (error) throw error
    return data as FoodItem
}

export const updateFoodItem = async (
    id: string,
    updates: Partial<FoodItem>
) => {
    const { data, error } = await supabase
        .from('food_items')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data as FoodItem
}

export const deleteFoodItem = async (id: string) => {
    const { error } = await supabase.from('food_items').delete().eq('id', id)

    if (error) throw error
}

export const getAvailableShares = async (excludeUserId?: string) => {
    let query = supabase
        .from('shares')
        .select('*')
        .eq('status', 'available')
        .not('food_item_id', 'is', null)

    if (excludeUserId) {
        query = query.neq('owner_id', excludeUserId)
    }

    const { data: shares, error } = await query

    if (error) {
        console.error('Error fetching shares:', error)
        throw error
    }

    console.log('Raw shares:', shares)

    if (!shares || shares.length === 0) {
        return []
    }

    // Fetch related data separately
    const foodItemIds = shares.map((s) => s.food_item_id).filter(Boolean)
    const ownerIds = shares.map((s) => s.owner_id).filter(Boolean)

    console.log('Food item IDs to fetch:', foodItemIds)
    console.log('Owner IDs to fetch:', ownerIds)

    const [foodItemsResult, ownersResult] = await Promise.all([
        supabase.from('food_items').select('*').in('id', foodItemIds),
        supabase.from('profiles').select('*').in('id', ownerIds),
    ])

    console.log('Food items result:', foodItemsResult)
    console.log('Owners result:', ownersResult)

    if (foodItemsResult.error) {
        console.error('Error fetching food items:', foodItemsResult.error)
    }
    if (ownersResult.error) {
        console.error('Error fetching owners:', ownersResult.error)
    }

    // Combine the data
    const result = shares
        .map((share) => ({
            ...share,
            food_item:
                foodItemsResult.data?.find(
                    (f) => f.id === share.food_item_id
                ) || null,
            owner:
                ownersResult.data?.find((o) => o.id === share.owner_id) || null,
        }))
        .filter((share) => share.food_item !== null)

    console.log('Final combined result:', result)

    return result as ShareWithDetails[]
}

export const createShare = async (
    foodItemId: string,
    ownerId: string,
    pickupTime?: string,
    pickupNotes?: string
) => {
    await supabase
        .from('food_items')
        .update({ is_shared: true })
        .eq('id', foodItemId)

    const { data, error } = await supabase
        .from('shares')
        .insert([
            {
                food_item_id: foodItemId,
                owner_id: ownerId,
                pickup_time: pickupTime,
                pickup_notes: pickupNotes,
                status: 'available',
            },
        ])
        .select()
        .single()

    if (error) throw error
    return data as Share
}

export const claimShare = async (shareId: string, claimerId: string) => {
    const { data, error } = await supabase
        .from('shares')
        .update({
            status: 'claimed',
            claimer_id: claimerId,
            claimed_at: new Date().toISOString(),
        })
        .eq('id', shareId)
        .select()
        .single()

    if (error) throw error
    return data as Share
}

export const completeShare = async (shareId: string) => {
    const { data: share, error: shareError } = await supabase
        .from('shares')
        .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
        })
        .eq('id', shareId)
        .select()
        .single()

    if (shareError) throw shareError

    const { error: updateError } = await supabase.rpc(
        'increment_exchange_count',
        {
            owner_id: share.owner_id,
            claimer_id: share.claimer_id,
        }
    )

    if (updateError) throw updateError

    return share as Share
}

export const getUserStats = async (userId: string) => {
    const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

    if (error) throw error

    if (!data) {
        const { data: newStats, error: insertError } = await supabase
            .from('user_stats')
            .insert([{ user_id: userId }])
            .select()
            .single()

        if (insertError) throw insertError
        return newStats
    }

    return data
}

export const updateUserStats = async (userId: string, updates: any) => {
    const { data, error } = await supabase
        .from('user_stats')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single()

    if (error) throw error
    return data
}

export const getProfile = async (userId: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (error) throw error
    return data as Profile
}

export const getUserShares = async (userId: string) => {
    const { data: shares, error } = await supabase
        .from('shares')
        .select('*')
        .eq('owner_id', userId)
        .not('food_item_id', 'is', null)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching user shares:', error)
        throw error
    }

    if (!shares || shares.length === 0) {
        return []
    }

    // Fetch food items separately
    const foodItemIds = shares.map((s) => s.food_item_id).filter(Boolean)
    const { data: foodItems } = await supabase
        .from('food_items')
        .select('*')
        .in('id', foodItemIds)

    // Combine the data
    const result = shares
        .map((share) => ({
            ...share,
            food_item:
                foodItems?.find((f) => f.id === share.food_item_id) || null,
        }))
        .filter((share) => share.food_item !== null)

    return result
}

export const getClaimedItems = async (userId: string) => {
    const { data: shares, error } = await supabase
        .from('shares')
        .select('*')
        .eq('claimer_id', userId)
        .in('status', ['claimed', 'completed'])
        .not('food_item_id', 'is', null)
        .order('claimed_at', { ascending: false })

    if (error) {
        console.error('Error fetching claimed items:', error)
        throw error
    }

    if (!shares || shares.length === 0) {
        return []
    }

    // Fetch related data separately
    const foodItemIds = shares.map((s) => s.food_item_id).filter(Boolean)
    const ownerIds = shares.map((s) => s.owner_id).filter(Boolean)

    const [foodItems, owners] = await Promise.all([
        supabase.from('food_items').select('*').in('id', foodItemIds),
        supabase.from('profiles').select('*').in('id', ownerIds),
    ])

    // Combine the data
    const result = shares
        .map((share) => ({
            ...share,
            food_item:
                foodItems.data?.find((f) => f.id === share.food_item_id) ||
                null,
            owner: owners.data?.find((o) => o.id === share.owner_id) || null,
        }))
        .filter((share) => share.food_item !== null)

    return result as ShareWithDetails[]
}
