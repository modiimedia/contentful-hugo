module.exports = {
    env: {
        commonjs: true,
        es6: true,
        node: true,
    },
    extends: [
        'standard',
        'prettier',
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2018,
    },
    plugins: ['@typescript-eslint'],
    rules: {
        'no-console': 0,
        semi: [2, 'always'],
        '@typescript-eslint/no-explicit-any': 1,
    },
};
