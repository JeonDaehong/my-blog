import { cookies } from "next/headers";

const SESSION_NAME = "admin_session";

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_NAME)?.value === "authenticated";
}
