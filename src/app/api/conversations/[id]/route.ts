import {NextRequest, NextResponse} from "next/server";

import {and, eq} from "drizzle-orm";

import {auth} from "@/auth";
import {db} from "@/db";
import {conversations} from "@/db/schema";

export async function PATCH(
  req: NextRequest,
  {params}: {params: Promise<{id: string}>}
) {
  const {id} = await params;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const {title} = await req.json();
    if (!title?.trim()) {
      return NextResponse.json({error: "Title is required"}, {status: 400});
    }

    const [updated] = await db
      .update(conversations)
      .set({title: title.trim(), updatedAt: new Date()})
      .where(
        and(eq(conversations.id, id), eq(conversations.userId, session.user.id))
      )
      .returning();

    if (!updated) {
      return NextResponse.json({error: "Not found"}, {status: 404});
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating conversation:", error);
    return NextResponse.json({error: "Internal Server Error"}, {status: 500});
  }
}

export async function DELETE(
  req: NextRequest,
  {params}: {params: Promise<{id: string}>}
) {
  const {id} = await params;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const [deleted] = await db
      .delete(conversations)
      .where(
        and(eq(conversations.id, id), eq(conversations.userId, session.user.id))
      )
      .returning();

    if (!deleted) {
      return NextResponse.json({error: "Not found"}, {status: 404});
    }

    return NextResponse.json({success: true});
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json({error: "Internal Server Error"}, {status: 500});
  }
}
