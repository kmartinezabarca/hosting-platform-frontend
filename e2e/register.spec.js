import { test, expect } from '@playwright/test';

test.describe('Registro — crear cuenta nueva', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
  });

  test('muestra el formulario de registro correctamente', async ({ page }) => {
    await expect(page.getByLabel(/nombre/i).first()).toBeVisible();
    await expect(page.getByLabel(/apellido/i)).toBeVisible();
    await expect(page.getByLabel(/correo electrónico/i)).toBeVisible();
    await expect(page.getByLabel(/^contraseña/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /crear cuenta|registrarse/i })).toBeVisible();
  });

  test('valida campos obligatorios al intentar enviar', async ({ page }) => {
    await page.getByRole('button', { name: /crear cuenta|registrarse/i }).click();

    await expect(page.getByText(/nombre es obligatorio/i)).toBeVisible();
    await expect(page.getByText(/correo electrónico es obligatorio/i)).toBeVisible();
    await expect(page.getByText(/contraseña es obligatoria/i)).toBeVisible();
  });

  test('muestra indicador de fortaleza de contraseña', async ({ page }) => {
    const passwordInput = page.getByLabel(/^contraseña/i);
    await passwordInput.fill('abc');
    // Contraseña débil: debe mostrar indicador rojo o "débil"
    await expect(page.getByText(/débil|muy débil|weak/i)).toBeVisible();

    await passwordInput.fill('MiContraseña123!');
    // Contraseña fuerte: debe mostrar indicador verde o "fuerte"
    await expect(page.getByText(/fuerte|strong/i)).toBeVisible();
  });

  test('valida que las contraseñas coincidan', async ({ page }) => {
    await page.getByLabel(/^contraseña/i).fill('Password123!');
    await page.getByLabel(/confirmar contraseña/i).fill('DiferentePasword!');
    await page.getByRole('button', { name: /crear cuenta|registrarse/i }).click();

    await expect(page.getByText(/contraseñas no coinciden/i)).toBeVisible();
  });

  test('navega a /login al clickear "Iniciar sesión"', async ({ page }) => {
    await page.getByRole('link', { name: /iniciar sesión|ya tienes cuenta/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('el botón de Google está visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
  });
});
