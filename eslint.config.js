import js from '@eslint/js'
import globals from 'globals'
import reactX from 'eslint-plugin-react-x'
import reactDOM from 'eslint-plugin-react-dom'
import reactJSX from 'eslint-plugin-react-jsx'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxSyntax from './scripts/react-jsx-rules.mjs'

export default [
  { ignores: ['dist/**', 'output/**', '.playwright-cli/**'] },
  {
    files: ['**/*.{js,jsx,mjs}'],
    ...js.configs.recommended,
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', parserOptions: { ecmaFeatures: { jsx: true } } },
    linterOptions: { reportUnusedDisableDirectives: 'error' },
  },
  { files: ['scripts/**', '*.config.js'], languageOptions: { globals: globals.node } },
  {
    files: ['src/**/*.{js,jsx,mjs}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-x': reactX, 'react-dom': reactDOM, 'react-jsx': reactJSX, 'react-hooks': reactHooks, 'react-refresh': reactRefresh, 'jsx-syntax': jsxSyntax },
    settings: { 'react-x': { version: '18.3.1' } },
    rules: {
      'react-x/no-missing-component-display-name': 'error',
      'react-x/no-missing-key': 'error',
      'react-x/no-direct-mutation-state': 'error',
      'react-x/no-component-will-mount': 'error',
      'react-x/no-component-will-receive-props': 'error',
      'react-x/no-component-will-update': 'error',
      'react-dom/no-dangerously-set-innerhtml-with-children': 'error',
      'react-dom/no-find-dom-node': 'error',
      'react-dom/no-render-return-value': 'error',
      'react-dom/no-unknown-property': 'error',
      'react-dom/no-unsafe-target-blank': 'error',
      'react-jsx/no-children-prop': 'error',
      'react-jsx/no-comment-textnodes': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'jsx-syntax/valid-jsx': 'error',
    },
  },
  {
    files: ['src/**/*.{js,jsx,mjs}'],
    ignores: ['**/*.test.js'],
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
    ignores: ['**/*.test.js'],
    languageOptions: { globals: Object.fromEntries(Object.keys(globals.browser).map(name => [name, 'off'])) },
    rules: { 'no-restricted-globals': ['error', 'window', 'document', 'navigator', 'localStorage', 'sessionStorage', 'self', 'globalThis', 'fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource'] },
  },
]
