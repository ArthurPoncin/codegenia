import { test, expect } from "@playwright/test";

test("homepage renders hero content", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Bienvenue sur PokéForge/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Générer/i })).toBeVisible();
});
