module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'chore', 'docs', 'test', 'refactor', 'style', 'ci', 'perf', 'revert'],
    ],
    'scope-enum': [
      1,
      'always',
      ['web', 'api', 'shared-types', 'utils', 'eslint-config', 'deps', 'ci'],
    ],
    'subject-max-length': [2, 'always', 100],
  },
};
