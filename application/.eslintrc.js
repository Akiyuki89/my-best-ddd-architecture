export default {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'prettier', 'import'],
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended', 'plugin:import/errors', 'plugin:import/warnings', 'plugin:import/typescript'],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    // Regras do TypeScript
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    '@typescript-eslint/no-empty-function': 'warn',

    // Regras de importação
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'object', 'type'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'import/no-unresolved': 'error',
    'import/newline-after-import': 'error',

    // Regras de código e estilo
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-empty': 'warn',
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0, maxBOF: 0 }],
    'prefer-const': 'error',

    // Adicionando quebras de linhas entre blocos de código
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: '*', next: 'return' },
      { blankLine: 'always', prev: '*', next: 'if' },
      { blankLine: 'always', prev: '*', next: 'try' },
      { blankLine: 'always', prev: '*', next: 'function' },
      { blankLine: 'always', prev: '*', next: 'class' },
      { blankLine: 'always', prev: 'directive', next: '*' }, // Ex.: "use strict"; (quebra após diretivas)
      { blankLine: 'always', prev: 'block', next: 'block' }, // Quebra entre blocos de código consecutivos
      { blankLine: 'always', prev: 'multiline-block-like', next: '*' }, // Quebra após blocos multi-linha
      { blankLine: 'any', prev: 'singleline-block-like', next: '*' }, // Nenhuma quebra adicional para blocos de linha única
    ],
  },
};
