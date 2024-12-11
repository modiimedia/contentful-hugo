import eslint from '@eslint/js';
import tsEslint from 'typescript-eslint';
import nodePlugin from 'eslint-plugin-n';
import importPlugin from 'eslint-plugin-import';
import prettierConfig from 'eslint-config-prettier';

export default tsEslint.config(
    {
        ignores: [
            'node_modules',
            'dist',
            'examples',
            'images',
            'content',
            'dist',
            'coverage',
            'contentful-hugo.config.js',
            'contentful-hugo.config.ts',
        ],
    },
    eslint.configs.recommended,
    ...tsEslint.configs.recommended,
    nodePlugin.configs['flat/recommended-module'],
    {
        plugins: {
            import: importPlugin,
        },
        rules: {
            '@typescript-eslint/no-unused-vars': [
                1,
                { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
            ],
            'n/no-missing-import': 0,
            'n/hashbang': 0,
            'import/no-commonjs': 2,
            'import/consistent-type-specifier-style': 2,
            'import/imports-first': 2,
            'import/newline-after-import': 2,
            'import/no-duplicates': 2,
            'import/no-unassigned-import': 2,
            'import/order': 2,
        },
    },
    {
        files: ['**/*.test.ts', '**/*.spec.ts'],
        rules: {
            '@typescript-eslint/no-explicit-any': 0,
        },
    },
    prettierConfig
);
