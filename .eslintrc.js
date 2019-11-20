module.exports = {
	env: {
		commonjs: true,
		es6: true,
		node: true,
	},
	extends: ['standard', 'prettier'],
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly',
	},
	parserOptions: {
		ecmaVersion: 2018,
	},
	rules: {
		'no-console': 0,
		'prefer-destructuring': 0,
	},
};
