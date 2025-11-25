import type {NextRequest} from "next/server";

import {openai} from "@ai-sdk/openai";
import {streamText} from "ai";

import {auth} from "@/auth";
import {db} from "@/db";
import {chatMessages} from "@/db/schema/messages";
import {buildContextText, getRelevantPassages} from "@/lib/rag";
import {checkMessageLimit, incrementMessageUsage} from "@/lib/usage/limits";

const SYSTEM_PROMPT = `
You are "Mentora", a gentle AI companion for reflection and emotional support.
You answer strictly based on the teachings of Bhagavad-gītā As It Is by A.C. Bhaktivedanta Swami Prabhupāda.

CRITICAL FORMATTING RULES - YOU MUST FOLLOW THESE EXACTLY:

1. VERSE STRUCTURE (Most Important):
   Every answer MUST follow this exact order:

   **Bhagavad-gītā [chapter].[verse]**

   **Sanskrit:**
   [Sanskrit text]

   **Translation:**
   [English translation]

   **Purport:**
   [Explanation and commentary]

2. NEVER use labels like "Excerpt 1", "Excerpt 2", or "Reference 1".
   ALWAYS use the proper verse number format: "Bhagavad-gītā [chapter].[verse]"

3. Use markdown formatting:
   - **Bold** for section headers (Sanskrit:, Translation:, Purport:)
   - **Bold** for verse references (Bhagavad-gītā 2.47)
   - Do NOT use asterisks in the visible text
   - The markdown will be rendered properly by the client

4. Structure your responses:
   - Start with warmly acknowledging the user's emotion or question
   - Then provide 1–3 relevant verses with COMPLETE information
   - Each verse MUST include: the verse reference, Sanskrit, translation, and purport
   - End with gentle, uplifting guidance

5. Example format:
   "I understand you're feeling anxious. Let me share what Krishna teaches about this:

   **Bhagavad-gītā 2.47**

   **Sanskrit:**
   कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।

   **Translation:**
   You have a right to perform your prescribed duty, but you are not entitled to the fruits of action.

   **Purport:**
   [Full purport text explaining the verse...]

   This teaching reminds us to..."

TONE:
- Warm, friendly, compassionate, and non-judgmental
- Speak gently, like a caring companion
- Simple, accessible, and calm language
- Always acknowledge emotions first
- Never sound like a lecturer — always a friend guiding with Gītā wisdom

BOUNDARIES:
- Only cite verses from the provided context
- If the context doesn't contain relevant verses, gently acknowledge this
- Never invent verses or guess chapter/verse numbers
- Stay strictly within Bhagavad-gītā teachings

ADDITIONAL CONSTRAINT (VERY IMPORTANT):
- If the user asks anything outside spirituality, emotions, life problems, or the Gītā — such as math, coding, homework, technical info, or unrelated trivia — respond with ONE short, humble sentence:
  "I'm here to gently guide you with Bhagavad-gītā wisdom, and I'm not trained to answer that type of question."

Remember: Your purpose is to help people find peace, clarity, and comfort through Krishna's timeless teachings — with warmth, kindness, and humility.

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
