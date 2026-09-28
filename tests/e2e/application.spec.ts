import { expect, test, type Page } from '@playwright/test';
import { catalog } from '../../src/core/catalog';
import { defaultInput } from '../../src/core/simulation/schema';

async function select(page: Page, title: string, value: string, search = false) {
  await page.getByRole('button', { name: title, exact: true }).click();
  const dialog = page.getByRole('dialog', { name: title, exact: true });

  if (search) await dialog.getByRole('textbox').fill(value);

  await dialog
    .getByRole('button', { name: new RegExp('^' + value) })
    .first()
    .click();
  await expect(dialog).toHaveCount(0);
}

async function configure(page: Page, type = 4) {
  await page.goto('/settings');
  await select(page, 'Вид бедствия', catalog.disastertype[type - 1].name_ru);
  if (type === 1) await select(page, 'Тип атомной бомбы', 'Малыш', true);

  if (type === 2) {
    await select(page, 'Класс вируса', 'Ортомиксовирус');
    await page.getByRole('textbox', { name: 'Введите название вируса' }).fill('Test virus');
  }

  if (type === 5) {
    await select(page, 'Тип небесного тела', 'Метеорит');
    await select(page, 'Материал', 'Неметалл');
  }

  await select(page, 'Сила', 'Низкий уровень');
  await select(page, 'Продолжительность', 'Постепенно');
  await select(page, 'Масштаб', 'Небольшая площадь');
  await select(page, 'Страна', 'Андорра', true);
}

test('original home composition, language, themes and about', async ({ page }) => {
  const errors: string[] = [];

  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Emergency Analyzer' })).toBeVisible();
  await expect(page.locator('nav a')).toHaveCount(4);
  await expect(page.locator('nav a').first()).toHaveAttribute('aria-disabled', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  const menu = await page.locator('nav').boundingBox();
  const size = page.viewportSize()!;

  expect(Math.abs(menu!.x + menu!.width / 2 - size.width / 2)).toBeLessThan(1);
  expect(
    Math.abs(menu!.y + menu!.height / 2 - size.height * (size.width <= 520 ? 0.55 : 0.5)),
  ).toBeLessThan(1);
  await expect(page.locator('footer')).toHaveCSS('height', '30px');
  await page.screenshot({ path: `test-results/home-light-${test.info().project.name}.png` });
  await page.getByRole('switch').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.screenshot({ path: `test-results/home-dark-${test.info().project.name}.png` });
  await page.getByRole('button', { name: 'Английский', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.getByRole('button', { name: 'About', exact: false }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog')).not.toContainText(/obergodmar|glush|artem|vitaly/i);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(errors).toEqual([]);
});
test('progressive settings, playback, reload, reports and CSV', async ({ page }) => {
  await page.goto('/settings');
  await expect(page.getByRole('button', { name: 'Сила', exact: true })).toHaveCount(0);
  await page.screenshot({ path: `test-results/settings-empty-${test.info().project.name}.png` });
  await page.getByRole('button', { name: 'Вид бедствия', exact: true }).click();
  await page.screenshot({ path: `test-results/settings-dialog-${test.info().project.name}.png` });
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await configure(page);
  await page.screenshot({ path: `test-results/settings-filled-${test.info().project.name}.png` });
  await page.getByRole('button', { name: /^Применить/ }).click();
  await expect(page).toHaveURL(/\/start\?id=/);
  await page.getByRole('button', { name: 'Воспроизвести', exact: true }).click();
  await page.getByRole('button', { name: 'Пауза', exact: true }).click();
  await page.getByRole('button', { name: 'К результату', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Воспроизвести', exact: true })).toBeDisabled();
  await page.screenshot({ path: `test-results/simulation-${test.info().project.name}.png` });
  await page.getByRole('button', { name: 'Сбросить', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Воспроизвести', exact: true })).toBeEnabled();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Воспроизвести', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Назад', exact: true }).click();
  await page.getByRole('link', { name: /Отчёты/ }).click();
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await page.screenshot({ path: `test-results/reports-${test.info().project.name}.png` });
  const download = page.waitForEvent('download');

  await page.getByRole('button', { name: 'Скачать отчёты', exact: true }).click();
  expect((await download).suggestedFilename()).toBe('emergency-analyzer.csv');
  await page.getByRole('button', { name: 'Запустить', exact: true }).click();
  await expect(page).toHaveURL(/\/start\?id=/);
});
test('all six scenarios work through original menus', async ({ page }) => {
  test.setTimeout(90000);
  for (let type = 1; type <= 6; type++) {
    await configure(page, type);
    await page.getByRole('button', { name: /^Применить/ }).click();
    await expect(page).toHaveURL(/\/start\?id=/);
    await expect(page.getByRole('button', { name: 'Воспроизвести', exact: true })).toBeVisible();
  }
});
test('local PDF guide renders in both languages', async ({ page }) => {
  const errors: string[] = [];

  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/references');
  await expect(page.locator('.react-pdf__Page canvas')).toHaveCount(7, { timeout: 30000 });
  await expect(page.locator('.react-pdf__Page canvas').first()).toBeVisible();
  await page.screenshot({ path: `test-results/references-${test.info().project.name}.png` });
  await page.getByRole('button', { name: 'Английский', exact: true }).click();
  await expect(page.locator('.react-pdf__Page canvas')).toHaveCount(7);
  expect(errors).toEqual([]);
});
test('API validates malformed bodies, foreign origins and unknown references', async ({
  request,
}) => {
  expect(
    (await request.post('/api/simulations', { data: { ...defaultInput, strength: 4 } })).status(),
  ).toBe(400);
  expect(
    (
      await request.post('/api/simulations', {
        data: defaultInput,
        headers: { Origin: 'https://untrusted.invalid' },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.post('/api/simulations', {
        data: '{',
        headers: { 'Content-Type': 'application/json' },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.post('/api/simulations', {
        data: 'x'.repeat(40000),
        headers: { 'Content-Type': 'application/json' },
      })
    ).status(),
  ).toBe(413);
  const result = await request.post('/api/simulations', { data: defaultInput });

  expect(result.status()).toBe(201);
  expect((await result.json()).persistent).toBe(false);
  expect((await request.get('/api/simulations/invalid')).status()).toBe(400);
  expect((await request.get('/api/catalog/__proto__')).status()).toBe(404);
  const regions = await (await request.get('/api/catalog/regions?countryId=185')).json();

  expect(regions.items.every((r: { country: number }) => r.country === 185)).toBe(true);
});
