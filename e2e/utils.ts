// import { execSync } from "node:child_process";
// import detect from "detect-port";
//
// const SUPABASE_PORT = 54321;
//
// export async function setupE2eTest() {
//   await startSupabase();
//   reseedDb();
// }
//
// async function startSupabase() {
//   const port = await detect(SUPABASE_PORT);
//   if (port !== SUPABASE_PORT) {
//     return;
//   }
//   console.warn("Supabase not detected - Starting it now!");
//   execSync("npx supabase start");
// }
//
// function reseedDb() {
//   execSync(
//     "PGPASSWORD=postgres psql -U postgres -h 127.0.0.1 -p 54322 -f supabase/clear-db-data.sql",
//     // for Windows:
//     // "SET PGPASSWORD=postgres&&psql -U postgres -h 127.0.0.1 -p 54322 -f supabase/clear-db-data.sql"
//     { stdio: "ignore" },
//   );
// }

import { createClient } from "@supabase/supabase-js";
import { Database } from "../database.types";

export function createTestUser() {
  const USER_ID = crypto.randomUUID();
  return {
    id: USER_ID,
    email: `user-${USER_ID}@test.com`,
    password: "password123",
  };
}

export function createSupabaseClient(supabaseKey: string) {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey,
  );
}
