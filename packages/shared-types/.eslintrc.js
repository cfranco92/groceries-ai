module.exports = {
  ...require('@groceries-ai/eslint-config'),
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
