'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Sidebar } from '../components/Sidebar'
import { supabase } from '../lib/supabase'
import { getUserFoodItems } from '../lib/database'

type Recipe = {
    id: string
    name: string
    image: string
    ingredients: string[]
    time: string
    matchedIngredients: number
    totalIngredients: number
}

export default function RecipesPage() {
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [loading, setLoading] = useState(true)
    const [userIngredients, setUserIngredients] = useState<string[]>([])

    useEffect(() => {
        loadRecipes()
    }, [])

    const loadRecipes = async () => {
        try {
            const {
                data: { session },
            } = await supabase.auth.getSession()
            if (!session) return

            const items = await getUserFoodItems(session.user.id)
            const ingredientNames = items.map((item) =>
                item.name.toLowerCase()
            )
            setUserIngredients(ingredientNames)

            const allRecipes: Recipe[] = [
                {
                    id: '1',
                    name: 'Teriyaki Chicken Bowl',
                    image: '/Teriyaki.png',
                    ingredients: [
                        'chicken breast',
                        'rice',
                        'soy sauce',
                        'sesame oil',
                        'garlic',
                        'green onions',
                    ],
                    time: '25 min',
                    matchedIngredients: 0,
                    totalIngredients: 6,
                },
                {
                    id: '2',
                    name: 'Garlic Butter Steak',
                    image: '/Steak.jpg',
                    ingredients: [
                        'steak',
                        'garlic',
                        'potatoes',
                        'salt',
                        'pepper',
                    ],
                    time: '20 min',
                    matchedIngredients: 0,
                    totalIngredients: 5,
                },
                {
                    id: '3',
                    name: 'Fried Rice',
                    image: '/Rice.jpg',
                    ingredients: [
                        'rice',
                        'eggs',
                        'soy sauce',
                        'sesame oil',
                        'garlic',
                        'green onions',
                    ],
                    time: '15 min',
                    matchedIngredients: 0,
                    totalIngredients: 6,
                },
            ]

            const recipesWithMatches = allRecipes.map((recipe) => {
                const matched = recipe.ingredients.filter((ing) =>
                    ingredientNames.some((userIng) =>
                        userIng.includes(ing) || ing.includes(userIng)
                    )
                ).length
                return {
                    ...recipe,
                    matchedIngredients: matched,
                }
            })

            recipesWithMatches.sort(
                (a, b) => b.matchedIngredients - a.matchedIngredients
            )

            setRecipes(recipesWithMatches)
            setLoading(false)
        } catch (error) {
            console.error('Error loading recipes:', error)
            setLoading(false)
        }
    }

    return (
        <div className='min-h-screen bg-[#EBFFE0] flex'>
            <Sidebar />

            <div className='flex-1 ml-64'>
                <header className='bg-[#443104] px-8 py-6 flex items-center justify-end gap-4 fixed top-0 left-64 right-0 z-10'>
                    <button className='relative'>
                        <Image
                            src='/Notifications.svg'
                            alt='Notifications'
                            width={28}
                            height={28}
                        />
                        <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold'>
                            2
                        </span>
                    </button>
                    <button>
                        <Image
                            src='/Profile.svg'
                            alt='Profile'
                            width={28}
                            height={28}
                        />
                    </button>
                </header>

                <main className='p-8 space-y-6 mt-[88px]'>
                    <div className='space-y-2'>
                        <h1 className='text-4xl font-bold text-[#443104]'>
                            Recipes for you
                        </h1>
                        <p className='text-lg text-[#443104]'>
                            Cook delicious meals with ingredients you already have
                        </p>
                    </div>

                    {loading ? (
                        <div className='text-center py-12 text-[#443104]'>
                            Loading recipes...
                        </div>
                    ) : (
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                            {recipes.map((recipe) => (
                                <div
                                    key={recipe.id}
                                    className='bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all'
                                >
                                    <div className='relative h-48'>
                                        <Image
                                            src={recipe.image}
                                            alt={recipe.name}
                                            fill
                                            className='object-cover'
                                        />
                                    </div>
                                    <div className='p-6 space-y-4'>
                                        <div className='space-y-2'>
                                            <h3 className='text-2xl font-bold text-[#443104]'>
                                                {recipe.name}
                                            </h3>
                                            <div className='flex items-center justify-between text-sm'>
                                                <span className='text-[#443104]'>
                                                    ⏱️ {recipe.time}
                                                </span>
                                                <span
                                                    className={`font-medium ${
                                                        recipe.matchedIngredients ===
                                                        recipe.totalIngredients
                                                            ? 'text-green-600'
                                                            : 'text-[#443104]'
                                                    }`}
                                                >
                                                    {recipe.matchedIngredients}/
                                                    {recipe.totalIngredients}{' '}
                                                    ingredients
                                                </span>
                                            </div>
                                        </div>

                                        <div className='space-y-2'>
                                            <p className='text-sm font-medium text-[#443104]'>
                                                Ingredients:
                                            </p>
                                            <div className='flex flex-wrap gap-2'>
                                                {recipe.ingredients.map(
                                                    (ing, idx) => {
                                                        const hasIngredient =
                                                            userIngredients.some(
                                                                (userIng) =>
                                                                    userIng.includes(
                                                                        ing
                                                                    ) ||
                                                                    ing.includes(
                                                                        userIng
                                                                    )
                                                            )
                                                        return (
                                                            <span
                                                                key={idx}
                                                                className={`text-xs px-3 py-1 rounded-full ${
                                                                    hasIngredient
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-[#D1E1C4] text-[#443104]'
                                                                }`}
                                                            >
                                                                {ing}
                                                            </span>
                                                        )
                                                    }
                                                )}
                                            </div>
                                        </div>

                                        <button className='w-full bg-[#443104] text-white py-3 rounded-full font-medium hover:opacity-90 transition-all'>
                                            Cook this
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className='bg-[#D1E1C4] rounded-2xl p-6 text-center'>
                        <h2 className='text-2xl font-bold text-[#443104] mb-2'>
                            Want more recipes?
                        </h2>
                        <p className='text-[#443104] mb-4'>
                            Add more ingredients to your inventory to see personalized
                            recipe suggestions
                        </p>
                        <button
                            onClick={() =>
                                (window.location.href = '/upload-receipt')
                            }
                            className='bg-[#443104] text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition-all'
                        >
                            Scan a receipt
                        </button>
                    </div>
                </main>
            </div>
        </div>
    )
}

