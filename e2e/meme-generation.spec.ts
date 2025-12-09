import { test, expect } from '@playwright/test';

test.describe('Meme Generation Flow', () => {
    test('should generate a meme successfully', async ({ page }) => {
        // Navigate to generator page
        await page.goto('/generate');

        // Fill in prompt
        await page.fill('input[placeholder*="prompt"]', 'Monday morning');

        // Select tone
        await page.selectOption('select', 'funny');

        // Click generate button
        await page.click('button:has-text("Generate")');

        // Wait for meme to be generated
        await page.waitForSelector('img[alt*="Generated meme"]', { timeout: 30000 });

        // Verify meme is displayed
        const memeImage = await page.locator('img[alt*="Generated meme"]');
        await expect(memeImage).toBeVisible();

        // Verify caption is displayed
        const caption = await page.locator('text=/.*Monday.*/i');
        await expect(caption).toBeVisible();
    });

    test('should evolve a meme', async ({ page }) => {
        // Navigate to generator page
        await page.goto('/generate');

        // Generate initial meme
        await page.fill('input[placeholder*="prompt"]', 'Test meme');
        await page.click('button:has-text("Generate")');
        await page.waitForSelector('img[alt*="Generated meme"]', { timeout: 30000 });

        // Click evolve button
        await page.click('button:has-text("Evolve")');

        // Wait for mutations
        await page.waitForSelector('[data-testid="mutation"]', { timeout: 30000 });

        // Verify mutations are displayed
        const mutations = await page.locator('[data-testid="mutation"]');
        await expect(mutations).toHaveCount(3);
    });

    test('should handle text-only mode', async ({ page }) => {
        // Navigate to generator page
        await page.goto('/generate');

        // Uncheck generate image checkbox
        await page.uncheck('input[type="checkbox"]');

        // Fill in prompt
        await page.fill('input[placeholder*="prompt"]', 'Test prompt');

        // Click generate button
        await page.click('button:has-text("Generate")');

        // Wait for meme ideas
        await page.waitForSelector('text=/Template Suggestion/i', { timeout: 30000 });

        // Verify meme ideas are displayed
        const ideas = await page.locator('text=/Template Suggestion/i');
        await expect(ideas).toBeVisible();
    });
});

test.describe('Admin Dashboard', () => {
    test('should require password to access admin', async ({ page }) => {
        // Navigate to admin page
        await page.goto('/admin');

        // Should redirect to login
        await expect(page).toHaveURL('/admin/login');

        // Verify login form is displayed
        const passwordInput = await page.locator('input[type="password"]');
        await expect(passwordInput).toBeVisible();
    });

    test('should login with correct password', async ({ page }) => {
        // Navigate to admin login
        await page.goto('/admin/login');

        // Fill in password
        await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD || 'admin123');

        // Click login button
        await page.click('button:has-text("Login")');

        // Should redirect to admin dashboard
        await expect(page).toHaveURL('/admin');

        // Verify dashboard is displayed
        const dashboard = await page.locator('text=/Admin Dashboard/i');
        await expect(dashboard).toBeVisible();
    });
});
