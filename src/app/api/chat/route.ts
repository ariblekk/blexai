import { NextRequest, NextResponse } from 'next/server';

// Fungsi untuk memanggil OpenRouter API
async function callOpenRouter(messages: Array<{ role: string; content: string }>, model: string = 'meta-llama/llama-3.1-8b-instruct:free') {
  console.log('🔄 Menggunakan OpenRouter API');

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY tidak dikonfigurasi di environment variables.');
  }

  // Format pesan sesuai OpenRouter API (mirip dengan OpenAI API)
  const openRouterMessages = messages.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content
  }));

  const response = await fetch(
    `https://openrouter.ai/api/v1/chat/completions`,
    {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000', // Sesuaikan dengan domain Anda di production
        'X-Title': 'BlexAI Chatbot' // Nama aplikasi
      },
      body: JSON.stringify({
        model: model,
        messages: openRouterMessages,
        stream: false,
        max_tokens: 4000 // Menghindari limit "requested up to 65535 tokens"
      }),
      signal: AbortSignal.timeout(30000),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('❌ OpenRouter API Error:', response.status, errorData);
    throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const openRouterContent = data?.choices?.[0]?.message?.content || '';
  console.log('✅ OpenRouter API berhasil:', openRouterContent.substring(0, 50) + '...');

  return {
    response: openRouterContent,
    model,
    provider: 'OpenRouter',
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messages = body.messages || (body.message ? [{ role: 'user', content: body.message }] : []);
    const model = body.model || 'meta-llama/llama-3.1-8b-instruct:free';
    
    if (!messages.length) {
      return NextResponse.json({ error: 'Message(s) is required' }, { status: 400 });
    }

    try {
      const result = await callOpenRouter(messages, model);
      return NextResponse.json(result);
    } catch (apiError) {
      console.error('OpenRouter API gagal:', apiError);

      if (apiError instanceof Error) {
        console.error('Error message:', apiError.message);
        console.error('Error stack:', apiError.stack);
      }

      return NextResponse.json(
        {
          error: 'OpenRouter API tidak tersedia atau terjadi kesalahan.',
          details: {
            openrouter: apiError instanceof Error ? apiError.message : 'Unknown error',
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