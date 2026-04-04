module.exports = {
  ...require('@groceries-ai/eslint-config/nestjs'),
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
};
