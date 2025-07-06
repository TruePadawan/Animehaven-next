import { test as setup } from "@playwright/test";
import { createTestUser } from "./utils";
import { STORAGE_STATE } from "../playwright.config";

setup("authenticate", async ({ page }) => {
  const testUser = createTestUser();
  await page.goto("/signup");
  await page.getByLabel("email").fill(testUser.email);
  await page.getByLabel("password").fill(testUser.password);
  await page.getByRole("button", { name: "Sign up" }).click();
  await page.waitForURL("/authcomplete");
  await page.getByRole("button", { name: "Create Profile" }).click();

  await page.context().storageState({ path: STORAGE_STATE });
});
