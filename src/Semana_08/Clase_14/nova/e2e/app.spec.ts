import { expect, test } from '@playwright/test';

test('redirige a /auth sin sesión', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/auth$/);
  await expect(page.getByRole('heading', { name: 'novaSync' })).toBeVisible();
});
