const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const pages = [
  ['/', 'I like learning, experimenting, and building as I go.'],
  ['/projects/', 'Projects'],
  ['/bytes/', 'Bytes'],
  ['/about/', 'About'],
  ['/misc/library/', 'My Library'],
  ['/misc/museum/', 'Museum'],
  ['/misc/3d-models/', '3D Models'],
];

test.beforeEach(async ({ page }) => {
  page.testErrors = [];
  page.on('pageerror', (error) => page.testErrors.push(`page error: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') page.testErrors.push(`console error: ${message.text()}`);
  });
  page.on('requestfailed', (request) => {
    const url = new URL(request.url());
    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') {
      page.testErrors.push(`failed request: ${request.url()} (${request.failure()?.errorText})`);
    }
  });
});

test.afterEach(async ({ page }) => {
  expect(page.testErrors).toEqual([]);
});

test('core pages load with their primary heading', async ({ page }) => {
  for (const [path, heading] of pages) {
    const response = await page.goto(path);
    expect(response?.ok()).toBeTruthy();
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
  }
});

test('featured projects use the responsive grid', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.locator('.home-stats').getByRole('link', { name: '3D models (7)' })).toHaveAttribute(
    'href',
    '/misc/3d-models'
  );
  await expect(page.locator('.featured-item')).toHaveCount(9);
  const columns = await page.locator('.featured-grid').evaluate((grid) =>
    getComputedStyle(grid).gridTemplateColumns.split(' ').length
  );
  expect(columns).toBe(testInfo.project.name === 'mobile-chromium' ? 1 : 3);

  const templeCard = page.locator('.featured-item', {
    has: page.getByRole('heading', { name: 'temple-os-mcp' }),
  });
  await expect(templeCard.locator('.featured-body > h3:first-child')).toBeVisible();
  const templeLink = templeCard.getByRole('heading').getByRole('link');
  await expect(templeLink).toHaveCSS('color', 'rgb(201, 202, 204)');
  await templeLink.hover();
  await expect(templeLink).toHaveCSS('color', 'rgb(43, 188, 138)');
  await expect(templeCard.locator('.featured-meta')).toContainText(
    '2026 · holy-c / python / shell'
  );
});

test('project history markers align with their year labels', async ({ page }) => {
  await page.goto('/');
  const offset = await page.locator('.timeline-year').first().evaluate((year) => {
    const row = year.getBoundingClientRect();
    const label = year.querySelector('.timeline-label').getBoundingClientRect();
    const marker = getComputedStyle(year, '::before');
    const markerCenter = row.top + Number.parseFloat(marker.top);
    const labelCenter = label.top + label.height / 2;
    return Math.abs(markerCenter - labelCenter);
  });

  expect(offset).toBeLessThanOrEqual(2);
});

test('pages expose basic metadata without social graph tags', async ({ page }) => {
  await page.goto('/projects/');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    'Software projects Barrett Otte has built or experimented with since 2011.'
  );
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#1d1f21');
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  expect(new URL(canonical).pathname).toBe('/projects/');
  await expect(page.locator('meta[property^="og:"]')).toHaveCount(0);
});

test('404 page offers useful routes back into the site', async ({ page }) => {
  const response = await page.goto('/404.html');
  expect(response?.ok()).toBeTruthy();
  await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
  const suggestions = page.getByRole('navigation', { name: 'Page not found suggestions' });
  await expect(suggestions).toBeVisible();
  await expect(suggestions.getByRole('link', { name: 'Projects', exact: true })).toHaveAttribute(
    'href',
    '/projects/'
  );
});

test('core pages do not expose broken internal links or images', async ({ page, request }) => {
  const targets = new Set();

  for (const [path] of pages) {
    await page.goto(path);
    const urls = await page.locator('a[href], img[src]').evaluateAll((elements) =>
      elements.map((element) => element.href || element.src)
    );

    for (const value of urls) {
      const url = new URL(value);
      if (url.origin === windowOrigin(page.url())) {
        url.hash = '';
        targets.add(url.href);
      }
    }
  }

  for (const target of targets) {
    const response = await request.get(target);
    expect(response.ok(), `${target} returned ${response.status()}`).toBeTruthy();
  }
});

test('skip link moves keyboard focus to the main content', async ({ page }) => {
  await page.goto('/projects/');
  await page.keyboard.press('Tab');
  const skipLink = page.getByRole('link', { name: 'Skip to main content' });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
});

test('local icon font subset covers every rendered icon', async ({ page }) => {
  for (const [path] of pages) {
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);

    const missing = await page.locator('i[class*="fa-"]').evaluateAll((icons) =>
      icons
        .filter((icon) => {
          const content = getComputedStyle(icon, '::before').content;
          return content === 'none' || content === 'normal' || content === '""';
        })
        .map((icon) => icon.className)
    );
    expect(missing, `${path} contains icons missing from the local subset`).toEqual([]);
  }

  expect(
    await page.evaluate(() => document.fonts.check('900 16px "Font Awesome 6 Free"'))
  ).toBeTruthy();
  expect(
    await page.evaluate(() => document.fonts.check('400 16px "Font Awesome 6 Brands"'))
  ).toBeTruthy();
});

test('navigation adapts between desktop links and the mobile Misc menu', async ({ page }, testInfo) => {
  await page.goto('/projects/');
  const desktopCollections = page.locator('.nav-group-desktop');
  const miscMenu = page.locator('.nav-misc');

  if (testInfo.project.name === 'mobile-chromium') {
    await expect(desktopCollections).toBeHidden();
    await expect(miscMenu).toBeVisible();
    await miscMenu.locator('summary').click();
    await expect(miscMenu.getByRole('link', { name: 'Museum' })).toBeVisible();
  } else {
    await expect(desktopCollections.getByRole('link', { name: 'Library' })).toBeVisible();
    await expect(miscMenu).toBeHidden();
  }
});

test('project search and description expansion work without hover disclosure', async ({ page }) => {
  await page.goto('/projects/');
  await page.getByRole('searchbox', { name: 'Search projects...' }).fill('fusion-box');
  await expect(page.locator('#project-list-default .project-item:visible')).toHaveCount(1);

  const row = page.locator('.project-item:visible');
  const toggle = row.getByRole('button', { name: /description for fusion-box/i });
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(row).toHaveClass(/is-desc-expanded/);
});

test('Bytes can filter to entries with interactive models', async ({ page }) => {
  await page.goto('/bytes/');
  await page.getByRole('button', { name: 'Show entries with 3D models only' }).click();
  await expect(page.locator('#byte-list-default .post-item:visible')).toHaveCount(7);
  await expect(page.locator('#filter-status')).toContainText('7 of 65 bytes');
});

test('Library search and sorting controls work', async ({ page }) => {
  await page.goto('/misc/library/');
  await expect(page.getByRole('combobox', { name: 'Add collection tag...' })).toContainText(
    'antiquarian (48)'
  );
  await page.getByRole('searchbox', { name: 'Search books...' }).fill('Apollo Guidance Computer');
  await expect(page.locator('.library-item:visible')).toHaveCount(1);
  await page.getByRole('combobox', { name: 'Sort items' }).selectOption('oldest');
  await expect(page).toHaveURL(/sort=oldest/);
});

test('Library collection tags work across subject categories', async ({ page }) => {
  await page.goto('/misc/library/');
  await page.getByRole('combobox', { name: 'Add collection tag...' }).selectOption('antiquarian');
  await expect(page.locator('.library-item:visible')).toHaveCount(48);
  await expect(page.locator('#filter-status')).toContainText('48 of 780 books');
  await expect(page).toHaveURL(/tag=antiquarian/);
});

test('Museum timeline links directly to collection items', async ({ page }) => {
  await page.goto('/misc/museum/');
  await page.locator('.museum-timeline a').first().click();
  await expect(page).toHaveURL(/#trs-80-model-i$/);
  await expect(page.locator('#trs-80-model-i')).toBeVisible();
});

test('3D viewer bundle remains unloaded until requested', async ({ page }) => {
  const viewerRequests = [];
  page.on('request', (request) => {
    if (request.url().includes('three-viewer.js')) viewerRequests.push(request.url());
  });
  await page.goto('/misc/3d-models/');
  await expect(page.locator('.model-card')).toHaveCount(7);
  await expect(page.getByRole('button', { name: 'View CNC Controller Holder in 3D' })).toBeVisible();
  expect(viewerRequests).toEqual([]);
});

test('key pages have no serious automated accessibility violations', async ({ page }) => {
  for (const path of ['/404.html', '/projects/', '/bytes/', '/misc/library/', '/misc/museum/', '/misc/3d-models/']) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');
    expect(serious, `${path}: ${serious.map(({ id }) => id).join(', ')}`).toEqual([]);
  }
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('primary archives retain their content and navigation', async ({ page }) => {
    for (const [path, heading] of pages) {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
      await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
    }

    await page.goto('/projects/');
    await expect(page.locator('.project-item')).toHaveCount(161);

    await page.goto('/bytes/');
    await expect(page.locator('.post-item')).toHaveCount(65);

    await page.goto('/misc/3d-models/');
    await expect(page.locator('.model-card')).toHaveCount(7);
    await expect(page.locator('.model-card').first().getByRole('link', { name: 'Source' })).toBeVisible();
  });
});

function windowOrigin(url) {
  return new URL(url).origin;
}
