/* eslint-env node */

const createAlias = require('@leonzalion/eslint-config/alias');

module.exports = {
	extends: ['@leonzalion/eslint-config'],
	parserOptions: { tsconfigRootDir: __dirname },
	settings: createAlias({ '~': './src', '~test': './test' }),
};
