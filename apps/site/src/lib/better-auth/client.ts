import { organizationAc, organizationRoles } from "@repo/isomorphic/auth-roles";
import { adminClient, multiSessionClient, organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { clientEnv } from "../client-env";

const organizationClientPlugin = organizationClient({
  ac: organizationAc as never,
  roles: organizationRoles,
});

export const authClient = createAuthClient({
  baseURL: clientEnv.VITE_API_URL,
  plugins: [adminClient(), organizationClientPlugin, multiSessionClient()],
});

export type BetterAuthSession = typeof authClient.$Infer.Session;
export type BetterAuthUserRoles = keyof typeof organizationRoles;
export type BetterAuthOrgRoles = "owner" | "staff" | "member" | ("owner" | "staff" | "member")[];

export const userRoles = Object.keys(organizationRoles);
