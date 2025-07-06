import { expect, test } from "@playwright/test";
import { createSupabaseClient, createTestUser } from "./utils";
import { ListGenres } from "../components/CreateList/CreateList.types";
import { LIST_GENRES } from "../utilities/global-constants";
import { TablesInsert } from "../database.types";

test.describe("Tests for authenticated users", () => {
  test("There is a profile menu button", async ({ page }) => {
    await page.goto("/search");
    await expect(
      page.getByRole("button", { name: "profile menu button" }),
    ).toBeVisible();
  });

  test("There is a recent items side section", async ({ page }) => {
    await page.goto("/search");
    await expect(page.getByRole("heading", { name: "Recent" })).toBeVisible();
  });

  test.describe("anime details page", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/anime/58514");
    });

    test("has Add To List button", async ({ page }) => {
      await expect(
        page.getByRole("button", { name: "Add to List" }),
      ).toBeVisible();
    });

    test("can set watch or recommendation status", async ({ page }) => {
      await expect
        .soft(page.getByRole("combobox", { name: "Watch status" }))
        .toBeVisible();

      await expect(
        page.getByRole("button", { name: "Recommend" }),
      ).toBeEnabled();
    });

    test("can write comments or reviews", async ({ page }) => {
      await expect
        .soft(page.getByRole("textbox", { name: "Comment" }))
        .toBeVisible();
      await page
        .getByRole("combobox", { name: "Show comments or reviews" })
        .selectOption("Reviews");
      await expect(page.getByRole("textbox", { name: "Review" })).toBeVisible();
    });
  });

  test.describe("discussions page", () => {
    test("has 'Your Discussions' filter and 'New Discussion' button", async ({
      page,
    }) => {
      await page.goto("/discussions");

      await page
        .getByRole("combobox", { name: "Filter discussions" })
        .selectOption("Your Discussions");

      await expect(
        page.getByRole("button", { name: "New Discussion" }),
      ).toBeVisible();
    });

    // TODO: should redirect to the discussion page after creation
    // test("can edit discussions or write comments", async ({ page }) => {
    //   await page.goto("/discussions");
    //   await page.getByRole("button", { name: "New Discussion" }).click();
    //
    //   await page
    //     .getByRole("textbox", { name: "Title" })
    //     .fill("test discussion title");
    //   await page
    //     .getByRole("textbox", { name: "Body" })
    //     .fill("test discussion body");
    //   await page.getByRole("button", { name: "Create" }).click();
    //
    //   await expect
    //     .soft(page.getByRole("heading", { name: "test discussion title" }))
    //     .toBeVisible();
    //   await expect
    //     .soft(page.getByRole("textbox", { name: "Comment" }))
    //     .toBeVisible();
    //   await expect(
    //     page.getByRole("button", { name: "Edit discussion" }),
    //   ).toBeEnabled();
    // });
  });

  test("has 'My Lists' option in the filters and 'New List' button", async ({
    page,
  }) => {
    await page.goto("/lists");

    await page
      .getByRole("combobox", { name: "Filter lists" })
      .selectOption("My Lists");
    await expect(page.getByRole("button", { name: "New List" })).toBeEnabled();
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

    test("can create and edit lists", async ({ page }) => {
      await page.goto("/lists");
      await page.getByRole("button", { name: "New List" }).click();
      await page.getByRole("textbox", { name: "Title" }).fill("test list");
      await page
        .getByRole("textbox", { name: "Description" })
        .fill("test description");
      await page.getByRole("checkbox", { name: "Action" }).click();
      await page.getByRole("button", { name: "Create" }).click();

      // TODO: should redirect to the list page
      await expect(page.getByText("List successfully created!")).toBeVisible();

      // await page.getByRole("button", { name: "Edit list" }).click();
      // await page.getByRole("button", { name: "Delete" }).click();
    });

    // test("can save lists", async ({ page }) => {
    //   await page.goto("/lists");
    //
    //   await expect
    //     .soft(page.getByRole("link", { name: testUser.id }))
    //     .toBeVisible();
    //   for (const btn of await page
    //     .getByRole("button", { name: "Save" })
    //     .all()) {
    //     await expect(btn).toBeEnabled();
    //   }
    // });

    test("can only write comments on other people's lists", async ({
      page,
    }) => {
      const { data } = await supabase
        .from("anime_lists")
        .select("id")
        .eq("creator_id", testUser.id)
        .single();
      const listId = data!.id;
      await page.goto(`/lists/${listId}`);

      await expect
        .soft(page.getByRole("textbox", { name: "Comment" }))
        .toBeVisible();
      await expect(
        page.getByRole("button", { name: "Edit list" }),
      ).toBeHidden();
    });
  });
});
