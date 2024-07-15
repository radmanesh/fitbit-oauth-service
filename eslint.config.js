module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2021,
  },
  rules: {
    // Add your custom rules here
    'no-console': 'on',
    'no-unused-vars': 'off',
    'no-undef': 'on',
    'no-unreachable': 'on',
    'no-empty': 'on',
    'no-constant-condition': 'off',
    'no-useless-escape': 'on',
    'no-case-declarations': 'off',
  },
  overrides: [
    {
      files: ['**/*.test.js'],
      env: {
        jest: true,
      },
    },
  ],
};
