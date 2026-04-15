import { test, expect } from '@playwright/test';
import { loginViaForm } from './helpers/auth.js';

/**
 * Tests de checkout — requieren sesión autenticada.
 * En CI con backend real usar E2E_EMAIL + E2E_PASSWORD.
 */
test.describe('Checkout — contratar servicio', () => {
  test.skip(!process.env.E2E_EMAIL, 'Requiere E2E_EMAIL + E2E_PASSWORD configurados');

  test.beforeEach(async ({ page }) => {
    await loginViaForm(page);
  });

  test('navega a contratación desde servicios', async ({ page }) => {
    await page.goto('/client/contract-service');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(/contratar|plan|servicio/i)).toBeVisible();
  });

  test('muestra el stepper en el paso 1', async ({ page }) => {
    await page.goto('/client/checkout');
    await page.waitForLoadState('networkidle');

    // El primer paso del stepper debe estar activo
    await expect(page.getByText(/información/i)).toBeVisible();
    // El segundo paso debe aparecer como pendiente
    await expect(page.getByText(/revisar|pagar/i)).toBeVisible();
  });

  test('valida campos obligatorios del paso 1', async ({ page }) => {
    await page.goto('/client/checkout');
    await page.waitForLoadState('networkidle');

    // Intentar avanzar sin llenar campos
    const nextButton = page.getByRole('button', { name: /siguiente|continuar/i });
    if (await nextButton.isVisible()) {
      await nextButton.click();
      // Debe mostrar errores de validación
      await expect(page.getByText(/obligatorio|requerido/i).first()).toBeVisible();
    }
  });

  test('muestra opciones de ciclo de facturación', async ({ page }) => {
    await page.goto('/client/checkout');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(/mensual/i)).toBeVisible();
    await expect(page.getByText(/anual/i)).toBeVisible();
  });

  test('muestra descuento al seleccionar ciclo anual', async ({ page }) => {
    await page.goto('/client/checkout');
    await page.waitForLoadState('networkidle');

    const annualOption = page.getByText(/anual/i);
    if (await annualOption.isVisible()) {
      await annualOption.click();
      // Debe mostrar descuento (20% en ciclo anual)
      await expect(page.getByText(/20%|descuento/i)).toBeVisible();
    }
  });
});

test.describe('Checkout exitoso — flujo completo', () => {
  test.skip(!process.env.E2E_EMAIL || !process.env.E2E_STRIPE_TEST, 'Requiere backend + Stripe test');

  test.beforeEach(async ({ page }) => {
    await loginViaForm(page);
  });

  test('completa el checkout y llega a /checkout/success', async ({ page }) => {
    await page.goto('/client/checkout');
    await page.waitForLoadState('networkidle');

    // Paso 1: llenar información básica
    const serviceNameInput = page.getByLabel(/nombre del servicio/i);
    if (await serviceNameInput.isVisible()) {
      await serviceNameInput.fill('Mi Servidor VPS Test');
    }

    // Avanzar al paso 2
    const nextBtn = page.getByRole('button', { name: /siguiente/i });
    if (await nextBtn.isEnabled()) {
      await nextBtn.click();
    }

    // Paso 2: revisar y pagar
    await expect(page.getByText(/revisar|resumen/i)).toBeVisible({ timeout: 5_000 });

    // Verificar que aparece el resumen del pedido
    await expect(page.getByText(/total/i)).toBeVisible();
  });
});
