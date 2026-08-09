import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      return NextResponse.json({
        prompt: "Would you rather spend a weekend on a private beach or in a cozy mountain cabin?",
        option_a: "Private Beach",
        option_b: "Cozy Mountain Cabin"
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
            content: 'Generate a fun, romantic, or hilarious "Would You Rather" dilemma for a couple. Respond ONLY with a JSON object in this exact format: {"prompt": "Would you rather...", "option_a": "Option A text", "option_b": "Option B text"}. Keep options under 8 words each.',
          },
          {
            role: 'user',
            content: 'Give me a fresh, creative Would You Rather scenario for a couple.',
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content || '{}');

    return NextResponse.json({
      prompt: parsed.prompt || "Would you rather travel the world together or build your dream home?",
      option_a: parsed.option_a || "Travel the world",
      option_b: parsed.option_b || "Build dream home"
    });
  } catch (error) {
    console.error('Would You Rather API Error:', error);
    return NextResponse.json({
      prompt: "Would you rather have unlimited free date nights or a surprise vacation once a year?",
      option_a: "Unlimited Date Nights",
      option_b: "Surprise Annual Vacation"
    });
  }
}