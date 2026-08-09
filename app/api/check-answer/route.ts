import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { realAnswer, guessedAnswer, relationshipMode } = await request.json();
    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      const isSimpleMatch = realAnswer.trim().toLowerCase() === guessedAnswer.trim().toLowerCase();
      return NextResponse.json({ isCorrect: isSimpleMatch });
    }

    // Dynamic prompt based on Relationship Mode
    let systemRolePrompt = 'You are a friendly judge in a trivia game.';
    if (relationshipMode === 'friends') {
      systemRolePrompt = 'You are a witty, hilarious judge in a best-friends trivia game. Compare answers for similarity.';
    } else if (relationshipMode === 'family' || relationshipMode === 'siblings') {
      systemRolePrompt = 'You are a fun family referee judging a trivia battle between siblings/family.';
    } else {
      systemRolePrompt = 'You are a romantic, supportive judge in a couples trivia game.';
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
            content: `${systemRolePrompt} Compare "Real Answer" and "Guessed Answer". If they mean the same thing, accept them as correct (e.g. "pizza" vs "pepperoni pizza", "mac & cheese" vs "macaroni"). Respond ONLY with JSON: {"isCorrect": true} or {"isCorrect": false}.`,
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
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content || '{"isCorrect": false}');

    return NextResponse.json({ isCorrect: parsed.isCorrect ?? false });
  } catch (error) {
    return NextResponse.json({ isCorrect: false });
  }
}