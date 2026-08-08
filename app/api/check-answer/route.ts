import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { realAnswer, guessedAnswer } = await request.json();

    const groqApiKey = process.env.GROQ_API_KEY;

    // If no Groq key is set, fallback to simple case-insensitive comparison
    if (!groqApiKey) {
      const isSimpleMatch = realAnswer.trim().toLowerCase() === guessedAnswer.trim().toLowerCase();
      return NextResponse.json({ isCorrect: isSimpleMatch });
    }

    // Call Groq AI API
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
            content: `You are a friendly judge in a couples trivia game. Compare the "Real Answer" (what someone answered about themselves) and the "Guessed Answer" (what their partner guessed). If they fundamentally mean the same thing, accept them as correct (e.g., "green trees" vs "trees", "mac & cheese" vs "macaroni and cheese", "pizza" vs "pepperoni pizza"). Respond ONLY with JSON in this exact format: {"isCorrect": true} or {"isCorrect": false}.`,
          },
          {
            role: 'user',
            content: `Real Answer: "${realAnswer}"\nGuessed Answer: "${guessedAnswer}"`,
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(resultText || '{"isCorrect": false}');

    return NextResponse.json({ isCorrect: parsed.isCorrect ?? false });
  } catch (error) {
    console.error('Error in check-answer API:', error);
    return NextResponse.json({ isCorrect: false, error: 'AI check failed' });
  }
}