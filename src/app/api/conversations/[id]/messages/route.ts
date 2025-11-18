import {type NextRequest, NextResponse} from "next/server";

import {and, asc, eq} from "drizzle-orm";

import {auth} from "@/auth";
import {db} from "@/db";
import {chatMessages} from "@/db/schema/messages";

export async function GET(
  req: NextRequest,
  {params}: {params: Promise<{id: string}>}
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const {id: conversationId} = await params;

    const messages = await db
      .select({
        id: chatMessages.id,
        role: chatMessages.role,
        content: chatMessages.content,
        createdAt: chatMessages.createdAt,
      })
      .from(chatMessages)
      .where(
        and(
          eq(chatMessages.conversationId, conversationId),
          eq(chatMessages.userId, session.user.id)
        )
      )
      .orderBy(asc(chatMessages.createdAt));

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({error: "Internal Server Error"}, {status: 500});
  }
}
