"use server";

import {z} from "zod/v4";

import {db} from "@/db";
import {SelectUserModel} from "@/db/schema/users";
import {action, handleError} from "@/lib/handlers";
import {NotFoundError} from "@/lib/http-errors";

export const getUserById = async (
  params: string
): Promise<ActionResponse<SelectUserModel>> => {
  const validationResult = await action({
    params,
    schema: z.uuid({message: "Invalid user ID"}),
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    const user = await db.query.users.findFirst({
      where: (users, {eq}) => eq(users.id, params),
    });
    if (!user) throw new NotFoundError("User");

    return {success: true, data: user, status: 200};
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};
