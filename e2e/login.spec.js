import { test, expect } from '@playwright/test';
import { TEST_USER } from './helpers/auth.js';

test.describe('Login — flujo de autenticación', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  });

  test('muestra el formulario de login correctamente', async ({ page }) => {
    await expect(page).toHaveTitle(/ROKE/i);
    await expect(page.getByLabel(/correo electrónico/i)).toBeVisible();
    await expect(page.getByLabel(/contraseña/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /registrarse|crear cuenta/i })).toBeVisible();
  });

  test('muestra error cuando los campos están vacíos', async ({ page }) => {
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await expect(page.getByText(/correo electrónico es obligatorio/i)).toBeVisible();
    await expect(page.getByText(/contraseña es obligatoria/i)).toBeVisible();
  });

  test('muestra error con formato de email inválido', async ({ page }) => {
    await page.getByLabel(/correo electrónico/i).fill('noesun-email');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await expect(page.getByText(/formato del correo no es válido/i)).toBeVisible();
  });

  test('muestra/oculta la contraseña al clickear el ícono', async ({ page }) => {
    const passwordInput = page.getByLabel(/contraseña/i);
    await passwordInput.fill('mipassword');

    await expect(passwordInput).toHaveAttribute('type', 'password');
    await page.getByRole('button', { name: /mostrar contraseña|ver contraseña/i }).click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('muestra error con credenciales inválidas', async ({ page }) => {
    await page.getByLabel(/correo electrónico/i).fill('incorrecto@test.com');
    await page.getByLabel(/contraseña/i).fill('contraseñamala');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await expect(
      page.getByText(/error al iniciar sesión|credenciales|inválid/i)
    ).toBeVisible({ timeout: 10_000 });
  });

  test('navega a /register al clickear "Crear cuenta"', async ({ page }) => {
    await page.getByRole('link', { name: /registrarse|crear cuenta/i }).click();
    await expect(page).toHaveURL(/\/register/);
  });

  test('el botón de Google está visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
  });
});

test.describe('Login — flujo exitoso', () => {
  // Este test requiere un backend real o un servidor mock
  // Marcado como skip en CI sin backend configurado
  test.skip(!process.env.E2E_EMAIL, 'Requiere E2E_EMAIL configurado');

  test('inicia sesión y redirige al dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/correo electrónico/i).fill(TEST_USER.email);
    await page.getByLabel(/contraseña/i).fill(TEST_USER.password);
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await expect(page).toHaveURL(/\/client\/dashboard/, { timeout: 15_000 });
    await expect(page.getByText(/panel de control|dashboard/i)).toBeVisible();
  });
});
