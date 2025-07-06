import { test as teardown } from "@playwright/test";
import { createSupabaseClient } from "./utils";

teardown("delete all test accounts", async () => {
  const adminSupabase = createSupabaseClient(
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  await adminSupabase.auth.signOut();
  const { data } = await adminSupabase
    .from("profiles")
    .select("*")
    .ilike("account_name", "testuser%");

  if (data !== null) {
    for (const user of data) {
      await adminSupabase.auth.admin.deleteUser(user.id);
    }
  }
});
