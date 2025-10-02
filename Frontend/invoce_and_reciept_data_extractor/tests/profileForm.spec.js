// tests/profileForm.spec.js
const { test, expect } = require('@playwright/test');

test('profile form page loads and fields are visible', async ({ page }) => {
  await page.goto('/register/form'); // Adjust path if needed

  // Check page header
  const header = page.locator('h1');
  await expect(header).toHaveText(/Complete Your Profile/);

  // Personal Information section
  const personalSection = page.locator('h3', { hasText: 'Personal Information' });
  await expect(personalSection).toBeVisible();

  const nameInput = page.locator('input[name="name"]');
  const genderSelect = page.locator('select[name="gender"]');
  const maritalSelect = page.locator('select[name="marital_status"]');
  const homeTownSelect = page.locator('select[name="home_town"]');
  const birthdayInput = page.locator('input[name="birthday"]');
  const educationSelect = page.locator('select[name="education_level"]');
  const carSelect = page.locator('select[name="car_ownership"]');
  const familyCountInput = page.locator('input[name="family_member_count"]');
  const exerciseSelect = page.locator('select[name="exercise_frequency"]');

  await expect(nameInput).toBeVisible();
  await expect(genderSelect).toBeVisible();
  await expect(maritalSelect).toBeVisible();
  await expect(homeTownSelect).toBeVisible();
  await expect(birthdayInput).toBeVisible();
  await expect(educationSelect).toBeVisible();
  await expect(carSelect).toBeVisible();
  await expect(familyCountInput).toBeVisible();
  await expect(exerciseSelect).toBeVisible();

  // Financial Information section
  const financialSection = page.locator('h3', { hasText: 'Financial Information' });
  await expect(financialSection).toBeVisible();

  const occupationSelect = page.locator('select[name="occupation"]');
  const salaryInput = page.locator('input[name="monthly_salary"]');
  const avgMonthlyInput = page.locator('input[name="average_expenses_per_month"]');
  const avgYearlyInput = page.locator('input[name="average_expenses_per_year"]');
  const emailInput = page.locator('input[name="email"]');

  await expect(occupationSelect).toBeVisible();
  await expect(salaryInput).toBeVisible();
  await expect(avgMonthlyInput).toBeVisible();
  await expect(avgYearlyInput).toBeVisible();
  await expect(emailInput).toBeVisible();

  // Check Save & Continue button
  const saveBtn = page.locator('button', { hasText: /Save & Continue/ });
  await expect(saveBtn).toBeVisible();
});
