import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
})

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const image = formData.get('image') as File

        if (!image) {
            return NextResponse.json(
                { error: 'No image provided' },
                { status: 400 }
            )
        }

        const buffer = await image.arrayBuffer()
        const base64Image = Buffer.from(buffer).toString('base64')

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: `You are a receipt OCR system. Extract ALL food items from this receipt image. For each item, provide:
- name: the full, proper food item name (clean up abbreviations and write out the complete name)
- quantity: if sold by count/units (e.g., 2 apples, 1 bottle), provide as integer
- weight: if sold by weight (e.g., 1.29 lb, 0.5 kg), provide as decimal number
- weight_unit: if weight is provided, specify unit (lb, kg, oz, g)
- category: categorize as Meat, Dairy, Produce, Grains, Condiments, Oils, Spices, Snacks, Bakery, or Other

Return ONLY a JSON array of items. Example format:
[
  {"name": "Chicken Breast", "weight": 1.29, "weight_unit": "lb", "category": "Meat"},
  {"name": "Milk", "quantity": 2, "category": "Dairy"},
  {"name": "Bananas", "weight": 2.52, "weight_unit": "lb", "category": "Produce"}
]

Rules:
- Clean up abbreviations and expand them to full names (e.g., "Chkn Brst" → "Chicken Breast", "GR Sea Salt" → "Green Sea Salt Grinder", "Broc Crowns" → "Broccoli Crowns")
- Write out the complete, readable food name that people would actually say
- Use quantity for countable items (bottles, cans, packages)
- Use weight for items sold by weight (meat, produce)
- Extract ALL food items from the receipt
- Do not include non-food items
- Make names clear and professional, not abbreviated receipt shorthand`,
                        },
                        {
                            inlineData: {
                                mimeType: image.type,
                                data: base64Image,
                            },
                        },
                    ],
                },
            ],
        })

        const text = response.text || ''
        
        let items
        try {
            const jsonMatch = text.match(/\[[\s\S]*\]/)
            if (jsonMatch) {
                items = JSON.parse(jsonMatch[0])
            } else {
                items = JSON.parse(text)
            }
        } catch (parseError) {
            console.error('Failed to parse Gemini response:', text)
            return NextResponse.json(
                { error: 'Failed to parse receipt data' },
                { status: 500 }
            )
        }

        return NextResponse.json({ items })
    } catch (error) {
        console.error('Error processing receipt:', error)
        return NextResponse.json(
            { error: 'Failed to process receipt' },
            { status: 500 }
        )
    }
}

