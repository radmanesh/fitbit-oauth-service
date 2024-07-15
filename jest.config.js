module.exports = {
  preset: 'jest',
  testEnvironment: 'node',
  testMatch: ['**/+(*.)+(spec|test).+(js)?(x)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'jest',
  },
};
