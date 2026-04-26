// Файл eslint.config.js

import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import cssModulesPlugin from 'eslint-plugin-css-modules';
import importPlugin from 'eslint-plugin-import';
import perfectionist from 'eslint-plugin-perfectionist';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: [
      '*.config.*',
      '**/*.d.ts',
      'dist',
      'node_modules',
      'package*.json',
      'public',
      'storybook-static',
      '.storybook/**/*',
      'vitest-setup.ts',
      'test-bad.tsx',
      'src/stories_old/**/*',
      '**/*.module.css',
    ],
  },
  js.configs.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  tseslint.configs.recommendedTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  reactHooks.configs['recommended-latest'],
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        projectService: true,
        sourceType: 'module',
        tsconfigRootDir: import.meta.dirname,
        warnOnUnsupportedTypeScriptVersion: false,
      },
      globals: globals.browser,
    },
    plugins: {
      'css-modules': cssModulesPlugin,
      perfectionist,
      react,
      'react-refresh': reactRefresh,
      '@typescript-eslint': tseslint.plugin,
      'unused-imports': unusedImports,
    },
    rules: {
      // ========== ЗАПРЕТ ANY ==========
      '@typescript-eslint/no-explicit-any': [
        'error',
        {
          fixToUnknown: false,
          ignoreRestArgs: false,
        },
      ],
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-empty-object-type': 'error',

      // ========== ЗАЩИТА ОТ ОБХОДА ТИПИЗАЦИИ ==========
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': true,
          'ts-nocheck': true,
          'ts-check': false,
          minimumDescriptionLength: 3,
        },
      ],
      '@typescript-eslint/ban-tslint-comment': 'error',
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'never',
        },
      ],

      // ========== ДОПОЛНИТЕЛЬНЫЕ ПРАВИЛА БЕЗОПАСНОСТИ ==========
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',

      // ========== ПРАВИЛА ДЛЯ ФУНКЦИЙ ==========
      // Вместо двух правил - оставляем одно, более подходящее для React
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
          allowDirectConstAssertionInArrowFunctions: true,
          allowConciseArrowFunctionExpressionsStartingWithVoid: false,
        },
      ],
      // Отключаем explicit-module-boundary-types, так как explicit-function-return-type уже покрывает этот случай
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // ========== ОСТАЛЬНЫЕ ПРАВИЛА ==========
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          disallowTypeAnnotations: true,
          fixStyle: 'separate-type-imports',
          prefer: 'type-imports',
        },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTernary: true,
        },
      ],
      '@typescript-eslint/no-unused-imports': 'off',
      'unused-imports/no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          vars: 'all',
          varsIgnorePattern: '^_',
        },
      ],

      // CSS Modules
      'css-modules/no-undef-class': 'error',
      'css-modules/no-unused-class': 'warn',

      // Import
      'import/no-unresolved': 'error',
      'import/no-unused-modules': 'error',
      'import/order': 'off',

      // Perfectionist
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'alphabetical',
          order: 'asc',
          groups: [
            'value-builtin',
            'value-external',
            'value-internal',
            ['value-parent', 'value-sibling'],
            [
              'type-import',
              'type-internal',
              'type-parent',
              'type-sibling',
              'type-index',
            ],
            'ts-equals-import',
            'side-effect-style',
            'style',
          ],
          internalPattern: [
            '^/',
            '@/',
            '^@components/',
            '^@contexts/',
            '^@hocs/',
            '^@hooks/',
            '^@pages/',
            '^@services/',
            '^@utils/',
          ],
          customGroups: {
            value: {
              'base-components': ['/*/*/[!-]*/*.*'],
              'compound-components': ['/*/*/*-*/*.*'],
            },
          },
          newlinesBetween: 'always',
        },
      ],

      // React
      'react/jsx-uses-react': 'off',
      'react/prop-types': 'off',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'react-hooks/exhaustive-deps': 'off',

      // Unused imports
      'unused-imports/no-unused-imports': 'error',
    },
    settings: {
      'css-modules': {
        camelCase: 'true',
        filetypes: {
          '.css': 'postcss',
          '.module.css': 'postcss',
        },
      },
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
  },
  eslintPluginPrettierRecommended
);
