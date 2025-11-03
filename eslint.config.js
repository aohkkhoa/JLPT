import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-parameter-properties': 'error',
      '@typescript-eslint/no-namespace': 'error',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration',
          message: 'enum is not allowed — use union types or const objects instead',
        },
        {
          selector: 'TSImportEqualsDeclaration',
          message: 'Use ES module imports (import ... from ...) instead of `import =`',
        },
        {
          selector: 'TSExportAssignment',
          message: 'Avoid `export =`; use `export default` or named exports instead',
        },
      ],
    },
  },
])
