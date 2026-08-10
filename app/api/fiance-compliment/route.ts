import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      return NextResponse.json({
        compliment: "Amina, your smile lights up my world every single day, and I am the luckiest man to call you mine. ❤️"
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
            content: 'You are Zain, writing a deeply affectionate, romantic, sweet 1-2 sentence compliment for your fiancé Amina on her birthday. Make it heartfelt, appreciative, poetic, and loving. End with a heart emoji.',
          },
          {
            role: 'user',
            content: 'Generate a sweet romantic compliment for Amina from Zain.',
          },
        ],
      }),
    });

    const data = await response.json();
    const complimentText = data.choices?.[0]?.message?.content;

    return NextResponse.json({
      compliment: complimentText || "Amina, you make my life infinitely brighter just by being in it. Happy Birthday, my love! ❤️"
    });
  } catch (error) {
    return NextResponse.json({
      compliment: "Amina, you are my heart, my soul, and my home. Happy Birthday, my love! ❤️"
    });
  }
}