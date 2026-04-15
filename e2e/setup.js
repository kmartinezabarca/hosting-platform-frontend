/**
 * Setup global de Playwright: guarda el estado de autenticación.
 * Se ejecuta UNA sola vez antes de todos los tests con sesión.
 *
 * Uso: pnpm e2e:setup
 * Requiere: E2E_EMAIL + E2E_PASSWORD en variables de entorno.
 */
import { test as setup, expect } from '@playwright/test';
import { saveAuthState } from './helpers/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_FILE = path.join(__dirname, '.auth/user.json');

setup('autenticar usuario de prueba', async ({ page }) => {
  if (!process.env.E2E_EMAIL) {
    console.warn('⚠️  E2E_EMAIL no configurado — saltando setup de auth');
    return;
  }

  await saveAuthState(page, AUTH_FILE);
  await expect(page).toHaveURL(/\/client\/dashboard/);
  console.log('✅ Estado de auth guardado en', AUTH_FILE);
});
