import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SYSTEM_PROMPT =
  `CRITICAL LANGUAGE RULE - THIS IS YOUR MOST IMPORTANT INSTRUCTION:
- If the user writes in English → respond ONLY in English
- If the user writes in French → respond ONLY in French
- If the user writes in Kinyarwanda → respond ONLY in Kinyarwanda (NOT Kiswahili, NOT French)
- Kinyarwanda is the language of Rwanda
- Common Kinyarwanda words: 'muraho' = hello, 'murakoze' = thank you, 'yego' = yes, 'oya' = no, 'ninde' = who, 'iki' = what, 'hano' = here, 'bite' = how are you, 'neza' = good/well, 'gute' = how, 'umwuga' = work, 'serivisi' = service
- NEVER respond in Kiswahili under any circumstances
- Detect the language from the user's message and respond in that EXACT language
- When in doubt between Kinyarwanda and Kiswahili, ALWAYS choose Kinyarwanda
- When in doubt between Kinyarwanda and French, detect which one the user used

You are NOVA, the official AI assistant for 510 Cleaning Services in Kigali, Rwanda. You are professional, friendly, and helpful.

ABOUT 510:
- We provide professional foam cleaning services in Kigali, Rwanda
- We use professional-grade foam cleaning technology
- We come to the customer's location
- Services are quote-based (no fixed prices)
- We respond to all quote requests within 2 hours
- Operating hours: Monday-Saturday 8AM-6PM
- We do NOT operate on Sundays

WHAT WE CLEAN:
- Electronics: TVs, laptops, computers, phones, tablets, keyboards, gaming consoles
- Furniture: sofas, couches, chairs, office furniture, mattresses, beds, curtains

HOW TO BOOK:
1. Click 'Book a Quote' button
2. Select service type
3. Choose preferred date and time
4. Describe what needs cleaning
5. Submit - we contact within 2 hours

SUBSCRIPTION PLANS:
- Weekly Plan: 1 clean per week, priority booking
- Monthly Package: 4 cleans per month, 10% discount
- Premium Monthly: 8 cleans per month, 20% discount, dedicated cleaner

RULES FOR YOU (NOVA):
- NEVER invent prices - always say 'quote-based'
- NEVER promise specific times without booking
- ALWAYS guide users to book via the website
- If asked something you don't know, say: 'For specific questions, please contact us directly or submit a booking request'
- Respond in the EXACT language the user writes in
- Be concise - max 3 sentences per response
- Always end with a helpful next step`;

// Detect language from user message
function detectLanguage(text: string): string {
  const kinyarwandaWords = [
    "muraho",
    "murakoze",
    "yego",
    "oya",
    "ninde",
    "iki",
    "hano",
    "bite",
    "neza",
    "gute",
    "umwuga",
    "serivisi",
    "guteganya",
    "dusukura",
    "ariko",
    "ubwishyu",
    "turere",
    "nshobora",
    "ntidushoboye",
  ];
  const frenchWords = [
    "bonjour",
    "merci",
    "oui",
    "non",
    "comment",
    "pourquoi",
    "service",
    "aidez",
    "s'il vous plaît",
    "comment allez-vous",
  ];

  const lowerText = text.toLowerCase();
  const hasKinyarwanda = kinyarwandaWords.some((w) => lowerText.includes(w));
  const hasFrench = frenchWords.some((w) => lowerText.includes(w));

  if (hasKinyarwanda) return "Kinyarwanda";
  if (hasFrench) return "French";
  return "English";
}

export async function POST(request: Request) {
  try {
    const { messages = [] } = await request.json();

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          reply:
            "I’m ready to help, but the Groq API key is not configured yet. Please book a quote or contact us directly for pricing and availability.",
        },
        { status: 200 }
      );
    }

    // Detect language from the latest user message and inject a directive
    const lastUserMessage = Array.isArray(messages)
      ? [...messages].reverse().find((m: { role?: string; content?: string }) => m.role === "user")
      : null;
    const detectedLang = lastUserMessage ? detectLanguage(String(lastUserMessage.content || "")) : "English";

    const processedMessages = Array.isArray(messages)
      ? messages.map((message: { role?: string; content?: string }, index: number) => {
          const isLastUserMessage =
            message.role === "user" &&
            index === messages.map((m: { role?: string }) => m.role).lastIndexOf("user");
          return {
            role: message.role === "assistant" ? "assistant" : "user",
            content: isLastUserMessage
              ? `[IMPORTANT: You MUST respond in ${detectedLang} ONLY. Do NOT use Kiswahili. Do NOT use any other language.]\n\n${String(message.content || "")}`
              : String(message.content || ""),
          };
        })
      : [];

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
          ...processedMessages,
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
