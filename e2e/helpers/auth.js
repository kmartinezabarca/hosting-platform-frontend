/**
 * Helpers de autenticación para E2E tests.
 * Reutilizables entre flujos críticos.
 */

/** Datos de prueba — sobreescribir con E2E_EMAIL/E2E_PASSWORD en CI */
export const TEST_USER = {
  email: process.env.E2E_EMAIL || 'test@rokeindustries.com',
  password: process.env.E2E_PASSWORD || 'TestPassword123!',
};

/**
 * Realiza login programático llenando el formulario.
 * @param {import('@playwright/test').Page} page
 * @param {{ email?: string, password?: string }} credentials
 */
export async function loginViaForm(page, credentials = {}) {
  const { email, password } = { ...TEST_USER, ...credentials };

  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  await page.getByLabel(/correo electrónico/i).fill(email);
  await page.getByLabel(/contraseña/i).fill(password);
  await page.getByRole('button', { name: /iniciar sesión/i }).click();

  // Esperar a que redirija al dashboard
  await page.waitForURL('**/client/dashboard', { timeout: 15_000 });
}

/**
 * Guarda el estado de sesión en un archivo para reusar entre tests.
 * Ejecutar una sola vez con `pnpm e2e:setup`.
 * @param {import('@playwright/test').Page} page
 * @param {string} storageStatePath
 */
export async function saveAuthState(page, storageStatePath = 'e2e/.auth/user.json') {
  await loginViaForm(page);
  await page.context().storageState({ path: storageStatePath });
}
