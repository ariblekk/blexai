import { NextRequest, NextResponse } from 'next/server';

// Fungsi untuk memanggil Ollama API
async function callOllama(messages: Array<{ role: string; content: string }>, model: string = 'incept5/llama3.1-claude:latest') {
  console.log('🔄 Menggunakan Ollama API');

  // Format pesan sesuai Ollama API
  const ollamaMessages = messages.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content
  }));

  const response = await fetch(
    `http://localhost:11434/api/chat`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        messages: ollamaMessages,
        stream: false
      }),
      signal: AbortSignal.timeout(30000),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('❌ Ollama API Error:', response.status, errorData);
    throw new Error(`Ollama API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
  }

  const data = await response.json();
  const ollamaContent = data?.message?.content || '';
  console.log('✅ Ollama API berhasil:', ollamaContent.substring(0, 50) + '...');

  return {
    response: ollamaContent,
    model,
    provider: 'Ollama',
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messages = body.messages || (body.message ? [{ role: 'user', content: body.message }] : []);
    const model = body.model || 'incept5/llama3.1-claude:latest';
    if (!messages.length) {
      return NextResponse.json({ error: 'Message(s) is required' }, { status: 400 });
    }

    try {
      const result = await callOllama(messages, model);
      return NextResponse.json(result);
    } catch (ollamaError) {
      console.error('Ollama API gagal:', ollamaError);

      if (ollamaError instanceof Error) {
        console.error('Error message:', ollamaError.message);
        console.error('Error stack:', ollamaError.stack);
      }

      return NextResponse.json(
        {
          error: 'Ollama API tidak tersedia.',
          details: {
            ollama: ollamaError instanceof Error ? ollamaError.message : 'Unknown error',
          },
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);

    return NextResponse.json(
      { error: 'Terjadi kesalahan yang tidak terduga' },
      { status: 500 }
    );
  }
}