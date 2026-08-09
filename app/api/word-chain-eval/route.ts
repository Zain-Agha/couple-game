import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { word, category, requiredLetter } = await request.json();
    const groqApiKey = process.env.GROQ_API_KEY;

    const cleanWord = word ? word.trim().toUpperCase() : '';

    // 1. Basic letter check
    if (requiredLetter && cleanWord[0] !== requiredLetter.toUpperCase()) {
      return NextResponse.json({
        isValid: false,
        reason: `Word must start with letter '${requiredLetter}'!`
      });
    }

    if (!groqApiKey) {
      return NextResponse.json({ isValid: cleanWord.length >= 2, reason: '' });
    }

    // 2. Groq AI Dictionary & Category Validation
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
            content: `You are a dictionary referee for Word Chain. Check if "${cleanWord}" is a real English word and fits category "${category}". Respond ONLY with JSON: {"isValid": boolean, "reason": "short explanation if invalid"}.`,
          },
          {
            role: 'user',
            content: `Word: ${cleanWord}, Category: ${category}`,
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content || '{}');

    return NextResponse.json({
      isValid: parsed.isValid ?? true,
      reason: parsed.reason || "Not a valid word in this category!"
    });
  } catch (error) {
    return NextResponse.json({ isValid: true, reason: '' });
  }
}