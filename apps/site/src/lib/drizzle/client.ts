import { drizzle } from "drizzle-orm/libsql/node";
import { serverEnv } from "../server-env";
import * as authSchema from "./auth-schema";
import * as resumeSchema from "./resume-schema";

export const db = drizzle({
  connection: {
    url: serverEnv.DATABASE_URL,
    authToken: serverEnv.DATABASE_AUTH_TOKEN,
  },
  schema: { ...authSchema, ...resumeSchema },
});
