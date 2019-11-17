module.exports = {
	env: {
		commonjs: true,
		es6: true,
		node: true,
	},
	extends: ['standard', 'prettier', 'plugin:prettier/recommended'],
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly',
	},
	parserOptions: {
		ecmaVersion: 2018,
	},
	rules: {},
};
