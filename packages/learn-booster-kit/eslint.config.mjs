import pluginJs from '@eslint/js';
import globals from 'globals';

export default [{
    // הגדרות גלובליות בסיסיות
    files: ['src/**/*.{js,mjs,cjs,jsx,svelte}'],
    ignores: [
        '**/node_modules/**',
        '**/dist/**',
        '**/documentation/**',
        'server/**',
        'public/**',
        'build/**',
        '*.config.*',
        'vite.config.*',
        'postcss.config.*',
        'tailwind.config.*'
    ],
    languageOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
        globals: {
            ...globals.browser,
            ...globals.es2021
        }
    }
},

pluginJs.configs.recommended,

{
    // כללי לינט בסיסיים
    files: ['src/**/*.{js,mjs,cjs,jsx,svelte}'],
    ignores: ['**/dist/**', '**/node_modules/**', '**/server/**', '**/documentation/**'],
    rules: {
        'indent': ['error', 4],
        'linebreak-style': ['error', 'windows'],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
        'no-unused-vars': ['warn'],
        'eqeqeq': ['error', 'always'],
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'max-len': ['warn', { code: 120 }]
    }
}];
