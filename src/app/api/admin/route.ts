import {NextRequest, NextResponse} from "next/server";

import {count, eq, ilike, or, sql} from "drizzle-orm";

import {auth} from "@/auth";
import {db} from "@/db";
import {users} from "@/db/schema/users";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({error: "Forbidden"}, {status: 403});
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const search = searchParams.get("search") || "";

    const offset = (page - 1) * pageSize;

    const searchConditions = search
      ? or(
          ilike(users.name, `%${search}%`),
          ilike(users.username, `%${search}%`),
          ilike(users.email, `%${search}%`)
        )
      : undefined;

    const [totalResult] = await db
      .select({count: count()})
      .from(users)
      .where(searchConditions);

    const total = totalResult?.count || 0;

    const usersList = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        email: users.email,
        plan: users.plan,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(searchConditions)
      .orderBy(sql`${users.createdAt} DESC`)
      .limit(pageSize)
      .offset(offset);

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      users: usersList,
      total,
      page,
      pageSize,
      totalPages,
    });
  } catch (error) {
    console.error("[ADMIN_GET_USERS]", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
