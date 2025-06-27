import { expect, test } from "@playwright/test";
import { TablesInsert } from "../database.types";
import { ListGenres } from "../components/CreateList/CreateList.types";
import { LIST_GENRES } from "../utilities/global-constants";
import { createSupabaseClient, createTestUser } from "./utils";

test("has sign in button", async ({ page }) => {
  await page.goto("http://localhost:3000/search");

  await expect(
    page.getByRole("button", { name: "Sign in with Google" }),
  ).toBeVisible();
});

test("has no recent items side-section", async ({ page }) => {
  await page.goto("http://localhost:3000/search");

  await expect(
    page.getByRole("heading", { name: "Recent Items" }),
  ).toBeHidden();
});

test.describe("anime details page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/anime/58514");
  });

  test("has no Add To List button", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "Add to List" }),
    ).toBeHidden();
  });

  test("can't set watch or recommendation status", async ({ page }) => {
    await expect
      .soft(page.getByRole("combobox", { name: "Not watched" }))
      .toBeHidden();
    await expect
      .soft(page.getByRole("combobox", { name: "Watched" }))
      .toBeHidden();

    await expect(page.getByRole("button", { name: "Recommend" })).toBeHidden();
  });

  test("can't write comments or reviews", async ({ page }) => {
    await expect
      .soft(page.getByRole("textbox", { name: "Review" }))
      .toBeHidden();
    await expect(page.getByRole("textbox", { name: "Comment" })).toBeHidden();
  });
});

test.describe("discussions page", () => {
  test("has no 'Your Discussions' filter and 'New Discussions' button", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/discussions");

    await expect
      .soft(page.getByRole("button", { name: "New Discussions" }))
      .toBeHidden();

    await page.getByRole("combobox", { name: "Filter discussions" }).click();
    await expect(
      page.getByRole("option", { name: "Your Discussions" }),
    ).toBeHidden();
  });

  test("cannot visit the /create and /edit route", async ({ page }) => {
    await page.goto("http://localhost:3000/discussions/create");
    await expect.soft(page).toHaveURL("http://localhost:3000/discussions");

    await page.goto("http://localhost:3000/discussions/edit");
    await expect(page).toHaveURL("http://localhost:3000/discussions");
  });

  test("cannot edit discussions or write comments", async ({ page }) => {
    const testUser = createTestUser();
    const adminSupabase = createSupabaseClient(
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Create test user with unique IDs
    await adminSupabase.auth.admin.createUser({
      ...testUser,
      email_confirm: true,
    });
    // Create test user's profile
    await adminSupabase.from("profiles").insert({
      id: testUser.id,
      email: testUser.email,
      account_name: `testuser${testUser.id}`,
    });

    // create discussion
    const discussion = await adminSupabase
      .from("discussions")
      .insert({
        body: "test discussion",
        title: "test",
        tag: "chat",
        creator_id: testUser.id,
      })
      .select()
      .single()
      .throwOnError();
    const discussionId = discussion.data.id;

    await page.goto(`http://localhost:3000/discussions/${discussionId}`);

    await expect
      .soft(page.getByRole("textbox", { name: "Comment" }))
      .toBeHidden();
    await expect(
      page.getByRole("button", { name: "Edit discussion" }),
    ).toBeHidden();

    await adminSupabase.auth.admin.deleteUser(testUser.id);
  });
});

test("has no 'My Lists' option in the filters and 'New List' button", async ({
  page,
}) => {
  await page.goto("http://localhost:3000/lists");

  await page.getByRole("combobox", { name: "Filter lists" }).click();
  await expect
    .soft(page.getByRole("option", { name: "My Lists" }))
    .toBeHidden();
  await expect(page.getByRole("button", { name: "New List" })).toBeHidden();
});

test.describe("anime list page", () => {
  const testUser = createTestUser();
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  test.beforeAll("create test user and data", async () => {
    const adminSupabase = createSupabaseClient(
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    // Create test user with unique IDs
    await adminSupabase.auth.admin.createUser({
      ...testUser,
      email_confirm: true,
    });
    // Create test user's profile
    await adminSupabase.from("profiles").insert({
      id: testUser.id,
      email: testUser.email,
      account_name: `testuser${testUser.id}`,
    });

    const genres: ListGenres = {};
    LIST_GENRES.forEach((genre) => {
      genres[genre.toUpperCase()] = true;
    });

    // Create a test anime list
    const testAnimeList: TablesInsert<"anime_lists"> = {
      title: "my anime test list",
      creator_id: testUser.id,
      genres,
    };
    await adminSupabase.from("anime_lists").insert(testAnimeList);
  });

  test.afterAll("cleanup", async () => {
    const adminSupabase = createSupabaseClient(
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    await adminSupabase.auth.admin.deleteUser(testUser.id);
  });

  test("cannot save lists", async ({ page }) => {
    await page.goto("http://localhost:3000/lists");

    await expect
      .soft(page.getByRole("link", { name: testUser.id }))
      .toBeVisible();
    await expect(page.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  test("cannot write comments and edit lists", async ({ page }) => {
    const { data } = await supabase
      .from("anime_lists")
      .select("id")
      .eq("creator_id", testUser.id)
      .single();
    const listId = data!.id;
    await page.goto(`http://localhost:3000/lists/${listId}`);

    await expect
      .soft(page.getByRole("textbox", { name: "Comments" }))
      .toBeHidden();
    await expect(page.getByRole("button", { name: "Edit list" })).toBeHidden();
  });
});

test("cannot edit profiles", async ({ page }) => {
  const testUser = createTestUser();
  const adminSupabase = createSupabaseClient(
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  await adminSupabase.auth.admin.createUser({
    ...testUser,
    email_confirm: true,
  });

  const testUserProfile = {
    id: testUser.id,
    email: testUser.email,
    account_name: `testuser${testUser.id}`,
  };
  // Create test user's profile
  await adminSupabase.from("profiles").insert(testUserProfile);

  await page.goto(
    `http://localhost:3000/users/${testUserProfile.account_name}`,
  );

  await expect.soft(page.getByText("Default User")).toBeVisible();
  await expect(page.getByRole("button", { name: "Edit profile" })).toBeHidden();

  await adminSupabase.auth.admin.deleteUser(testUser.id);
});
