"use server";

import {count, desc, eq, ilike, or} from "drizzle-orm";
import {z} from "zod/v4";

import {requireRole} from "@/auth";
import {db} from "@/db";
import {users} from "@/db/schema";
import {
  GetIssuesParams,
  InsertIssueParams,
  PaginatedIssuesResponse,
  type SelectIssueModel,
  getIssuesSchema,
  insertIssueSchema,
  issues,
} from "@/db/schema/issues";
import {action, handleError} from "@/lib/handlers";
import {NotFoundError} from "@/lib/http-errors";

export const createIssue = async (
  params: unknown
): Promise<ActionResponse<SelectIssueModel>> => {
  const validationResult = await action({
    params,
    schema: insertIssueSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const {params: data} = validationResult as {params: InsertIssueParams};

  try {
    const [created] = await db.insert(issues).values(data).returning();

    return {
      success: true,
      data: created,
      status: 201,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};

export const getIssueById = async (
  params: string
): Promise<ActionResponse<SelectIssueModel>> => {
  const validationResult = await action({
    params,
    schema: z.string().uuid({message: "Invalid issue ID"}),
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    const issue = await db.query.issues.findFirst({
      where: (issues, {eq}) => eq(issues.id, params),
    });

    if (!issue) throw new NotFoundError("Issue");

    return {
      success: true,
      data: issue,
      status: 200,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};

export const getIssuesByUserId = async (
  params: string
): Promise<ActionResponse<SelectIssueModel[]>> => {
  const validationResult = await action({
    params,
    schema: z.string().uuid({message: "Invalid user ID"}),
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    const rows = await db
      .select()
      .from(issues)
      .where(eq(issues.userId, params))
      .orderBy(issues.createdAt);

    return {
      success: true,
      data: rows,
      status: 200,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};

export const resolveIssue = async (
  params: string
): Promise<ActionResponse<SelectIssueModel>> => {
  const validationResult = await action({
    params,
    schema: z.string().uuid({message: "Invalid issue ID"}),
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    const [updated] = await db
      .update(issues)
      .set({
        status: "resolved",
        updatedAt: new Date(),
      })
      .where(eq(issues.id, params))
      .returning();

    if (!updated) throw new NotFoundError("Issue");

    return {
      success: true,
      data: updated,
      status: 200,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};

export const deleteIssue = async (
  params: string
): Promise<ActionResponse<null>> => {
  const validationResult = await action({
    params,
    schema: z.string().uuid({message: "Invalid issue ID"}),
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    await db.delete(issues).where(eq(issues.id, params));

    return {
      success: true,
      data: null,
      status: 200,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};

export const getAllIssues = async (
  params: GetIssuesParams
): Promise<ActionResponse<PaginatedIssuesResponse>> => {
  await requireRole(["ADMIN"]);

  const validationResult = await action({
    params,
    schema: getIssuesSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const {page, pageSize, search, status} = validationResult.params!;

  try {
    const offset = (page - 1) * pageSize;

    const issuesQuery = db
      .select({
        id: issues.id,
        userId: issues.userId,
        userName: users.name,
        userEmail: users.email,
        title: issues.title,
        description: issues.description,
        category: issues.category,
        status: issues.status,
        createdAt: issues.createdAt,
        updatedAt: issues.updatedAt,
      })
      .from(issues)
      .leftJoin(users, eq(issues.userId, users.id))

      .$dynamic();

    const whereConditions = [];

    if (search) {
      whereConditions.push(
        or(
          ilike(issues.title, `%${search}%`),
          ilike(issues.description, `%${search}%`),
          ilike(issues.category, `%${search}%`),
          ilike(users.name, `%${search}%`),
          ilike(users.email, `%${search}%`)
        )
      );
    }

    if (status !== "all") {
      whereConditions.push(ilike(issues.status, status));
    }

    const [totalResult] = await db
      .select({count: count()})
      .from(issues)
      .leftJoin(users, eq(issues.userId, users.id))

      .where(whereConditions.length > 0 ? or(...whereConditions) : undefined);

    const total = totalResult?.count || 0;

    const issuesList = await issuesQuery
      .where(whereConditions.length > 0 ? or(...whereConditions) : undefined)
      .orderBy(desc(issues.createdAt))
      .limit(pageSize)
      .offset(offset);

    const totalPages = Math.ceil(total / pageSize);

    return {
      success: true,
      data: {
        issues: issuesList.map(issue => ({
          ...issue,
          userName: issue.userName ?? "Deleted User",
          userEmail: issue.userEmail ?? "N/A",
          createdAt: issue.createdAt!.toISOString(),
          updatedAt: issue.updatedAt!.toISOString(),
        })),
        total,
        page,
        pageSize,
        totalPages,
      },
      status: 200,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};
