import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { type, relationshipMode } = await request.json();
    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      return NextResponse.json({
        prompt: type === 'truth' 
          ? "What is something you were nervous to tell your partner at first?" 
          : "Do your best 10-second dance impression right now!"
      });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `Generate a fun, creative ${type.toUpperCase()} for a game played in ${relationshipMode ? relationshipMode.toUpperCase() : 'COUPLES'} mode. Keep it engaging and under 20 words. Respond ONLY with JSON: {"prompt": "text here"}.`,
          },
          {
            role: 'user',
            content: `Give me a fresh ${type} prompt.`,
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content || '{}');

    return NextResponse.json({ prompt: parsed.prompt || "Tell your partner your favorite memory together!" });
  } catch (error) {
    return NextResponse.json({ prompt: "Share one thing that made you smile today!" });
  }
}