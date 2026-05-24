import { test, expect } from '@playwright/test';

test('кнопка оформления заказа активна и кликабельна', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('accessToken', 'fake-token');
    if (!document.getElementById('react-modals')) {
      const modalRoot = document.createElement('div');
      modalRoot.id = 'react-modals';
      document.body.appendChild(modalRoot);
    }
  });

  await page.route('**/api/orders', async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({ success: true, order: { number: 54321 } }),
    });
  });

  await page.goto('/');
  await page.waitForSelector('[data-testid="ingredient-catalog-item"]', { timeout: 10000 });

  await page.evaluate(() => {
    const store = (window as any).store;
    const ingredients = store.getState().ingredients.items;
    const bun = ingredients.find((i:any) => i.type === 'bun');
    const main = ingredients.find((i:any) => i.type === 'main');
    if (bun) store.dispatch({ type: 'burgerConstructor/addIngredient', payload: { ...bun, constructorId: 'bun1' } });
    if (main) store.dispatch({ type: 'burgerConstructor/addIngredient', payload: { ...main, constructorId: 'main1' } });
  });

  await expect(page.locator('[data-testid="order-button"]')).toBeEnabled({ timeout: 10000 });
  await page.click('[data-testid="order-button"]');
  
  expect(true).toBe(true);
});

