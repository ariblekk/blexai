import { NextResponse } from 'next/server';

// GET - Mendapatkan daftar model yang tersedia dari OpenRouter
export async function GET() {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Format response agar sesuai dengan format yang diharapkan oleh frontend
    // OpenRouter mengembalikan array models di data.data
    const formattedModels = data.data.map((model: any) => ({
      name: model.id,
      id: model.id,
      details: {
        family: model.architecture?.family || 'unknown',
        parameter_size: model.architecture?.parameters || 'unknown'
      }
    }));

    return NextResponse.json({ models: formattedModels });
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil daftar model dari OpenRouter.' },
      { status: 500 }
    );
  }
}