import { NextRequest, NextResponse } from 'next/server';

// GET - Mendapatkan daftar model yang tersedia
export async function GET() {
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil daftar model. Pastikan Ollama berjalan.' },
      { status: 500 }
    );
  }
}

// POST - Menambah model baru (pull model)
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Nama model diperlukan' },
        { status: 400 }
      );
    }

    // Validasi nama model
    if (!/^[a-zA-Z0-9._-]+(:[\.a-zA-Z0-9_-]+)?$/.test(name)) {
      return NextResponse.json(
        { error: 'Format nama model tidak valid' },
        { status: 400 }
      );
    }

    const response = await fetch('http://localhost:11434/api/pull', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        stream: false
      }),
      signal: AbortSignal.timeout(300000), // 5 menit timeout untuk download
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      message: `Model ${name} berhasil ditambahkan`,
      data
    });
  } catch (error) {
    console.error('Error pulling model:', error);
    
    if (error instanceof Error) {
      if (error.name === 'TimeoutError') {
        return NextResponse.json(
          { error: 'Timeout - Download model membutuhkan waktu terlalu lama' },
          { status: 408 }
        );
      }
      if (error.message.includes('fetch') || error.message.includes('ECONNREFUSED')) {
        return NextResponse.json(
          { error: 'Server Ollama offline! Pastikan Ollama berjalan di localhost:11434' },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Gagal menambahkan model. Periksa nama model dan koneksi.' },
      { status: 500 }
    );
  }
}

// DELETE - Menghapus model
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modelName = searchParams.get('name');

    if (!modelName) {
      return NextResponse.json(
        { error: 'Nama model diperlukan' },
        { status: 400 }
      );
    }

    const response = await fetch('http://localhost:11434/api/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: modelName }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Ollama API error: ${response.status}`);
    }

    return NextResponse.json({
      success: true,
      message: `Model ${modelName} berhasil dihapus`
    });
  } catch (error) {
    console.error('Error deleting model:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus model' },
      { status: 500 }
    );
  }
}