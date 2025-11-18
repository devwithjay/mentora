import {type NextRequest, NextResponse} from "next/server";

import {desc, eq} from "drizzle-orm";

import {auth} from "@/auth";
import {db} from "@/db";
import {conversations} from "@/db/schema/messages";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const userConversations = await db
      .select({
        id: conversations.id,
        title: conversations.title,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt,
      })
      .from(conversations)
      .where(eq(conversations.userId, session.user.id))
      .orderBy(desc(conversations.updatedAt));

    return NextResponse.json(userConversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({error: "Internal Server Error"}, {status: 500});
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const body = await req.json();
    const {title} = body;

    const [newConversation] = await db
      .insert(conversations)
      .values({
        userId: session.user.id,
        title: title || "New Chat",
      })
      .returning();

    return NextResponse.json(newConversation, {status: 201});
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json({error: "Internal Server Error"}, {status: 500});
  }
}
