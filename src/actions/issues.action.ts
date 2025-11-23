"use server";

import {eq} from "drizzle-orm";
import {z} from "zod/v4";

import {db} from "@/db";
import {
  InsertIssueParams,
  type SelectIssueModel,
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

export const getAllIssues = async (): Promise<
  ActionResponse<SelectIssueModel[]>
> => {
  try {
    const rows = await db.select().from(issues).orderBy(issues.createdAt);

    return {
      success: true,
      data: rows,
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
