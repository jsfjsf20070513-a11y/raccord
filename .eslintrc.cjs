module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:react/jsx-runtime', 'plugin:react-hooks/recommended'],
  ignorePatterns: ['dist', 'output', '.playwright-cli', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react/prop-types': 'off',
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  },
  overrides: [
    { files: ['scripts/**', 'vite.config.js'], env: { node: true } },
    {
      files: ['src/**/*.{js,jsx,mjs}'],
      excludedFiles: ['**/*.test.js'],
      rules: {
        'no-restricted-globals': ['error', 'fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource'],
        'no-restricted-syntax': [
          'error',
          { selector: 'MemberExpression[property.name=/^(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)$/], MemberExpression[property.value=/^(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)$/]', message: '作品运行不依赖网络服务。需要新服务时，先明确边界。' },
        ],
      },
    },
    {
      files: ['src/chapters/*/domain/**/*.{js,jsx,mjs}'],
      excludedFiles: ['**/*.test.js'],
      env: { browser: false },
      rules: { 'no-restricted-globals': ['error', 'window', 'document', 'navigator', 'localStorage', 'sessionStorage', 'self', 'globalThis', 'fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource'] },
    },
  ],
}
