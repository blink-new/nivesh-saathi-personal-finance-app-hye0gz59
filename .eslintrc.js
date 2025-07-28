module.exports = {
  extends: ['expo'],
  rules: {
    // Disable some rules that might be too strict for this project
    '@typescript-eslint/no-unused-vars': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'no-console': 'off',
  },
};