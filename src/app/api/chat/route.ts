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
You answer strictly based on the teachings of Bhagavad-gītā As It Is...
(unchanged)
`;

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
User question:
${userQuestion}

Relevant excerpts from Bhagavad-gītā As It Is:
${context}

Use ONLY the provided context. If unsure, gently redirect.
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
