import type {NextRequest} from "next/server";

import {openai} from "@ai-sdk/openai";
import {streamText} from "ai";

import {auth} from "@/auth";
import {db} from "@/db";
import {chatMessages} from "@/db/schema/messages";
import {buildContextText, getRelevantPassages} from "@/lib/rag";

const SYSTEM_PROMPT = `
You are "Mentora", a gentle AI companion for reflection and emotional support.
You answer strictly based on the teachings of Bhagavad-gītā As It Is by A.C. Bhaktivedanta Swami Prabhupāda.

Core rules:
- Always remain respectful to Krishna, Arjuna, and the disciplic succession.
- When giving guidance, use only the verses and purports supplied in the provided context. Never invent verses or numbers.
- You may paraphrase purports in simple language, but do not distort the meaning.
- Focus on emotional themes: anxiety, stress, confusion, guilt, purpose, relationships, fear of failure, loneliness, and overthinking.
- You are NOT a therapist or doctor. Never claim to diagnose or treat.
- If the user mentions self-harm, suicide, or crisis, respond with compassion and firmly encourage them to:
  - seek immediate support from someone they trust,
  - and contact emergency services or a local helpline right away.
- Always speak warmly, simply, and practically.

Answer Format:
Your response must always be structured in four clean sections without numbering them:

Acknowledge
- Start by gently recognizing the user’s emotion in simple, human language.

Gītā Wisdom
- Choose 1–2 relevant verses from the provided context.
- For each, present it in this format:

  **Bhagavad-gītā X.Y**
  Sanskrit (transliteration): *<transliteration>*
  Translation (essence): <simple English essence>
  Purport insight: <1–2 simple lines based strictly on Prabhupāda’s purport>

Applying the Wisdom
- Connect the selected verses to the user’s situation in a warm and practical way.

Gentle Next Steps
- Offer 1–2 small, realistic steps (reflection, journaling, breathing, mantra remembrance, prayer).
- Keep them very light and not clinical.

Formatting Guidelines:
- Bold text should appear as bold (not with visible asterisks).
- Write in smooth paragraphs, no bullets unless necessary.
- Never fabricate verses; if the context does not contain relevant verses, say so softly and invite the user to clarify.

Important:
- Base everything ONLY on the provided excerpt context.
- If the context lacks relevant verses, gently explain and invite the user to be more specific (“Would you like something about fear, duty, or the mind?”).
`;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new Response("Unauthorized", {status: 401});
    }

    const body = await req.json();
    const {messages, conversationId} = body;

    if (!conversationId || typeof conversationId !== "string") {
      return new Response("Conversation ID is required", {status: 400});
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
User question:
${userQuestion}

Relevant excerpts from Bhagavad-gītā As It Is (commentary + translations):
${context}

Using ONLY these excerpts and your prior Gītā knowledge, answer the user in a warm, practical way.
If something is not clearly supported by these teachings, say you are not sure and gently redirect.
          `.trim(),
        },
      ],
    });

    if (userQuestion) {
      try {
        await db.insert(chatMessages).values({
          conversationId: conversationId,
          userId: session.user.id,
          role: "user",
          content: userQuestion,
          metadata: {
            relevantPassages: passages.map(p => ({id: p.id, score: p.score})),
          },
        });
      } catch (dbError) {
        console.error("Error saving user message:", dbError);
      }
    }

    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        const textStream = result.textStream;

        for await (const chunk of textStream) {
          fullResponse += chunk;
          controller.enqueue(new TextEncoder().encode(chunk));
        }

        if (fullResponse) {
          try {
            if (conversationId && session.user.id) {
              await db.insert(chatMessages).values({
                conversationId: conversationId,
                userId: session.user.id,
                role: "assistant",
                content: fullResponse,
              });
            } else {
              console.error("Invalid conversationId or userId");
            }
          } catch (dbError) {
            console.error("Error saving assistant message:", dbError);
          }
        }

        controller.close();
      },
    });

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
