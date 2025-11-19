import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      
      // // Enforce unidirectional codebase architecture
      // // Prevent features from importing from app layer
      // 'no-restricted-imports': [
      //   'error',
      //   {
      //     patterns: [
      //       {
      //         group: ['**/app/**'],
      //         message: 'Features should not import from the app layer. Move shared code to lib, components, hooks, or utils.',
      //       },
      //     ],
      //   },
      // ],
    },
  },
  // {
  //   // Prevent cross-feature imports - features should not import from other features
  //   files: ['src/features/movies/**/*.js'],
  //   rules: {
  //     'no-restricted-imports': [
  //       'error',
  //       {
  //         patterns: [
  //           {
  //             group: ['**/features/!(movies)/**'],
  //             message: 'Cross-feature imports are not allowed. Compose features at the app level instead.',
  //           },
  //           {
  //             group: ['**/app/**'],
  //             message: 'Features should not import from the app layer.',
  //           },
  //         ],
  //       },
  //     ],
  //   },
  // },
  // Add more feature-specific rules as you add more features
  // {
  //   files: ['src/features/users/**/*.js'],
  //   rules: {
  //     'no-restricted-imports': [
  //       'error',
  //       {
  //         patterns: [
  //           {
  //             group: ['**/features/!(users)/**'],
  //             message: 'Cross-feature imports are not allowed.',
  //           },
  //         ],
  //       },
  //     ],
  //   },
  // },
])

