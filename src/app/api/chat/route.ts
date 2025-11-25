import type {NextRequest} from "next/server";

import {openai} from "@ai-sdk/openai";
import {streamText} from "ai";

import {auth} from "@/auth";
import {db} from "@/db";
import {chatMessages} from "@/db/schema/messages";
import {buildContextText, getRelevantPassages} from "@/lib/rag";
import {checkMessageLimit, incrementMessageUsage} from "@/lib/usage/limits";

const SYSTEM_PROMPT = `
You are "Mentora", a warm, friendly companion who gently supports people using the wisdom of the Bhagavad-gītā As It Is by A.C. Bhaktivedanta Swami Prabhupāda.

Your purpose is simple:
Help people find calm, clarity, and direction through compassionate conversation rooted in Gītā principles.

-----------------------------------------------------
WHAT YOU CAN ANSWER
-----------------------------------------------------
You ONLY respond to:
- Emotional struggles
- Stress, anxiety, confusion
- Life problems
- Overthinking
- Purpose, detachment, discipline
- Spiritual questions
- Anything connected to Bhagavad-gītā teachings

For these topics:
- Speak gently
- Acknowledge the user’s feelings first
- Share Gītā-based guidance
- Include shlokas ONLY when truly relevant
- When including a verse, include Sanskrit, translation, and purport
- Keep the tone friendly, humble, and caring

-----------------------------------------------------
WHAT YOU CANNOT ANSWER
-----------------------------------------------------
If the user asks ANYTHING outside the above:
Math, coding, homework, AI, career advice, finance, science, trivia, general facts, technical guidance.

Reply with exactly one short, humble sentence:

"I'm here to gently guide you with Bhagavad-gītā wisdom, and I'm not trained to answer that type of question."

DO NOT add anything else.

-----------------------------------------------------
VERSE FORMAT (only when needed)
-----------------------------------------------------
When you decide a verse is necessary, use this exact format:

**Bhagavad-gītā [chapter].[verse]**

**Sanskrit:**
[text]

**Translation:**
[text]

**Purport:**
[text]

-----------------------------------------------------
STYLE
-----------------------------------------------------
- Warm, friendly, compassionate
- Simple, calm, human language
- Never preachy or forceful
- Never invent verses
- Never use "Excerpt" or numbering
- Never distort Gītā teachings

-----------------------------------------------------
GOAL
-----------------------------------------------------
Help the user feel heard, understood, supported, and gently uplifted through the timeless wisdom of Krishna.
`.trim();

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", {status: 401});
    }

    const body = await req.json();
    const {userId, plan = "Free", messages, conversationId} = body;

    if (!conversationId || typeof conversationId !== "string") {
      return new Response("Conversation ID is required", {status: 400});
    }
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response("Messages array missing", {status: 400});
    }

    const limitCheck = await checkMessageLimit(userId, plan);

    if (!limitCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: "limit_reached",
          message: "You have used all your messages for today.",
          remaining: 0,
          limit: limitCheck.limit,
        }),
        {status: 429, headers: {"Content-Type": "application/json"}}
      );
    }

    const latest = messages[messages.length - 1];
    const userQuestion = latest?.content ?? "";

    const passages = await getRelevantPassages(userQuestion);
    const context = buildContextText(passages);

    const result = await streamText({
      model: openai("gpt-4o-mini"),
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `
User's question or concern:
${userQuestion}

Relevant verses from Bhagavad-gītā As It Is:
${context}

Remember:
1. Use ONLY the verses provided above
2. Format each verse with: **Bhagavad-gītā [chapter].[verse]**, **Sanskrit:**, **Translation:**, **Purport:**
3. NEVER use "Excerpt" or generic labels
4. Always include the complete verse information
5. Use markdown formatting with ** for bold text
6. Address the user's emotional state with compassion first
          `.trim(),
        },
      ],
    });

    if (userQuestion) {
      await db.insert(chatMessages).values({
        conversationId,
        userId: session.user.id,
        role: "user",
        content: userQuestion,
        metadata: {
          relevantPassages: passages.map(p => ({
            id: p.id,
            chapter: p.chapter,
            verse: p.verse,
            score: p.score,
          })),
        },
      });
    }

    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.textStream) {
          fullResponse += chunk;
          controller.enqueue(new TextEncoder().encode(chunk));
        }

        if (fullResponse) {
          if (conversationId && session.user.id && fullResponse) {
            await db.insert(chatMessages).values({
              conversationId,
              userId: session.user.id,
              role: "assistant",
              content: fullResponse,
            });
          } else {
            console.error(
              "Missing required fields for inserting assistant message:",
              {
                conversationId,
                userId: session.user.id,
                fullResponse,
              }
            );
          }
        }

        controller.close();
      },
    });

    await incrementMessageUsage(userId);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal Server Error", {status: 500});
  }
}
