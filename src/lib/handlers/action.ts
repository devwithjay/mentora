"use server";

import {Session} from "next-auth";
import {ZodError, z} from "zod/v4";

import {auth} from "@/auth";
import {UnauthorizedError, ValidationError} from "@/lib/http-errors";

type ActionOptions<T> = {
  params?: T;
  schema?: z.ZodSchema<T>;
  authorize?: boolean;
};

const action = async <T>({params, schema, authorize}: ActionOptions<T>) => {
  if (schema && params) {
    try {
      schema.parse(params);
    } catch (error) {
      if (error instanceof ZodError)
        return new ValidationError(z.flattenError(error).fieldErrors);
      return new Error("Schema validation failed");
    }
  }

  let session: Session | null = null;

  if (authorize) {
    session = await auth();

    if (!session) return new UnauthorizedError();
  }

  return {params, session};
};

export default action;
