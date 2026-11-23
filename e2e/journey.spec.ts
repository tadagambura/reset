import { expect, test, type Page } from '@playwright/test';

async function setup(page: Page) {
  await page.goto('/');
  await expect(page.getByTestId('intro')).toBeVisible();
  for (let i = 0; i < 3; i++) await page.getByTestId('intro-next').click();
  await page.getByTestId('member-name').fill('Sam');
  await page.getByTestId('member-save').click();
  await expect(page.getByText('Today at home')).toBeVisible();
}

async function addMember(page: Page, name: string, kid = false) {
  await page.goto('/settings');
  await page.getByTestId('settings-add-member').click();
  await page.getByTestId('member-name').fill(name);
  if (kid) await page.getByRole('radio', { name: 'Child' }).click();
  await page.getByTestId('member-save').click();
}

async function addChore(page: Page, name: string, reward?: string) {
  await page.goto('/chores');
  await page.getByTestId('chore-add').click();
  await page.getByTestId('chore-name').fill(name);
  if (reward) await page.getByTestId('chore-reward').fill(reward);
  await page.getByTestId('chore-save').click();
}

test('set up home → chores → who did it → fairness view, and it persists', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await setup(page);
  await addMember(page, 'Alex');
  await addChore(page, 'Dishes');
  await addChore(page, 'Laundry');
  await page.goto('/');
  await page.getByTestId('done-Dishes').click();
  await page.getByTestId('who-Sam').click();
  await page.getByTestId('done-Laundry').click();
  await page.getByTestId('who-Sam').click();
  await expect(page.getByTestId('chore-Dishes')).toContainText('Done by Sam');
  await page.goto('/chores');
  await expect(page.getByTestId('fairness')).toContainText('4 pts · 100%');
  await expect(page.getByTestId('fairness-note')).toHaveText('Sam is carrying 100% this week. Could anything move next week?');
  await page.reload();
  await expect(page.getByTestId('fairness')).toContainText('4 pts');
  expect(errors).toEqual([]);
});

test('check-in shared with the household shows on Home', async ({ page }) => {
  await setup(page);
  await page.getByTestId('checkin-open').click();
  await page.getByTestId('mood-2').click();
  await page.getByTestId('battery-20').click();
  await page.getByTestId('checkin-share').click();
  await page.getByTestId('checkin-save').click();
  await expect(page.getByTestId('checkin-card')).toContainText("Sam's social battery is at 20% today. Tea and quiet, maybe?");
});

test('Family Bank: a child does a chore and earns virtual pocket money, then spends it', async ({ page }) => {
  await setup(page);
  await addMember(page, 'Mo', true);
  await addChore(page, 'Tidy room', '0.50');
  await page.goto('/');
  await page.getByTestId('done-Tidy room').click();
  await page.getByTestId('who-Mo').click();
  await expect(page.getByTestId('celebrate')).toContainText('Pay day!');
  await page.goto('/settings');
  await page.getByTestId('settings-premium').click();
  await page.getByTestId('paywall-buy').click();
  await page.goto('/bank');
  await expect(page.getByTestId('balance-Mo')).toHaveText('£0.50');
  await page.getByTestId('spend-Mo').click();
  await page.getByTestId('bank-amount').fill('1');
  await expect(page.getByTestId('bank-save')).toBeDisabled();
  await page.getByTestId('bank-amount').fill('0.20');
  await page.getByTestId('bank-note').fill('Sticker');
  await page.getByTestId('bank-save').click();
  await expect(page.getByTestId('balance-Mo')).toHaveText('£0.30');
});

test('admin calendar: add MOT, mark renewed, it moves a year on', async ({ page }) => {
  await setup(page);
  await page.goto('/admin');
  await page.getByTestId('admin-premium').click();
  await page.getByTestId('paywall-buy').click();
  await page.getByTestId('preset-MOT').click();
  await page.getByTestId('renewal-save').click();
  await expect(page.getByTestId('renewal-MOT')).toContainText('in 30 days');
  await page.getByTestId('renewed-MOT').click();
  await expect(page.getByTestId('renewal-MOT')).toContainText('in 395 days');
});
