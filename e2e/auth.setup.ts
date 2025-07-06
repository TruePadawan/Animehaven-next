import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { createTestUser } from "./utils";
import { STORAGE_STATE } from "../playwright.config";

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  const testUser = createTestUser();
  await page.goto("http://localhost:3000/signup");
  await page.getByLabel("email").fill(testUser.email);
  await page.getByLabel("password").fill(testUser.password);
  await page.getByRole("button", { name: "Sign up" }).click();
  await page.waitForURL("http://localhost:3000/authcomplete");
  await page.getByRole("button", { name: "Create Profile" }).click();

  await page.context().storageState({ path: STORAGE_STATE });
});