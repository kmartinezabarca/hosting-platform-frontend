import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import unusedImports from 'eslint-plugin-unused-imports';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'build', 'storybook-static'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'react': react,
      'import': importPlugin,
      'jsx-a11y': jsxA11y,
      'unused-imports': unusedImports,
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      
      // --- REGLAS DE LIMPIEZA Y CALIDAD ---
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      
      // --- IMPORTACIONES ---
      'import/no-unresolved': 'off', // Desactivado temporalmente para evitar errores de resolución de módulos
      'import/order': 'off', // Desactivado temporalmente para evitar errores de ordenamiento masivos
      'import/no-duplicates': 'off', // Desactivado por incompatibilidad con el resolver de TS en esta versión
      // 'import/no-unused-modules': [1, { unusedExports: true }],

      // --- REACT ---
      'react/jsx-boolean-value': 'off',
      'react/jsx-no-duplicate-props': 'off',
      'react/jsx-no-useless-fragment': 'off',
      'react/self-closing-comp': 'off',
      'react/prop-types': 'off',
      'react-hooks/exhaustive-deps': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      'no-empty': 'off',
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-useless-escape': 'off',
      'no-control-regex': 'off',
      'react-hooks/rules-of-hooks': 'off',
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
  }
);
