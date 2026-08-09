import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { letter, p1Inputs, p2Inputs } = await request.json();
    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      return NextResponse.json({ p1Score: 4, p2Score: 4, feedback: "Great entries by both players!" });
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
            content: `You are a referee judging 'Name Place Animal Thing' starting with letter '${letter}'. Award 1 point for each valid entry (max 4 pts per player). Respond ONLY with JSON: {"p1Score": number, "p2Score": number, "feedback": "short summary"}.`,
          },
          {
            role: 'user',
            content: `Letter: ${letter}\nPlayer 1: ${JSON.stringify(p1Inputs)}\nPlayer 2: ${JSON.stringify(p2Inputs)}`,
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content || '{}');

    return NextResponse.json({
      p1Score: parsed.p1Score ?? 0,
      p2Score: parsed.p2Score ?? 0,
      feedback: parsed.feedback || "Round evaluated!"
    });
  } catch (error) {
    return NextResponse.json({ p1Score: 0, p2Score: 0, feedback: "Evaluation complete." });
  }
}