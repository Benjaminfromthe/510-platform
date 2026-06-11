import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SYSTEM_PROMPT =
  "You are 510's booking assistant in Kigali, Rwanda. Help customers choose: Electronics Cleaning (RWF 15,000), Furniture Cleaning (RWF 20,000), Deep Clean Package (RWF 35,000). Ask what needs cleaning, recommend a service, and guide them to Book Now.";

export async function POST(request: Request) {
  try {
    const { messages = [] } = await request.json();

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          reply:
            "I’m ready to help, but the Groq API key is not configured yet. In the meantime, I can still recommend Electronics Cleaning (RWF 15,000), Furniture Cleaning (RWF 20,000), or Deep Clean Package (RWF 35,000).",
        },
        { status: 200 }
      );
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...(Array.isArray(messages)
            ? messages.map((message: { role?: string; content?: string }) => ({
                role: message.role === "assistant" ? "assistant" : "user",
                content: String(message.content || ""),
              }))
            : []),
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Groq request failed.");
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || "I can help recommend the right cleaning package.";

    return NextResponse.json({ reply }, { status: 200 });
  } catch (error) {
    console.error("AI chat failed:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to process your request.",
      },
      { status: 500 }
    );
  }
}
