const base = {
  'no-undef': 'off',
  'semi': ['error', 'never'],
  'no-use-before-define': 'off',
  'no-unused-vars': 'warn',
  'comma-dangle': ['error', 'always-multiline'],
  'jsx-quotes': ['error', 'prefer-double'],
  'no-useless-return': 'off',
  'no-redeclare': 'error',
  'no-trailing-spaces': 2,
  'quotes': ['error', 'single'],
  'eol-last': 'error',
  'no-multiple-empty-lines': ['error', { 'max': 1, 'maxEOF': 0 }],
  'newline-before-return': 'error',
  'newline-after-var': ['error', 'always'],
  'keyword-spacing': ['error', { 'before': true }],
  'space-before-blocks': 'error',
  'space-infix-ops': 'error',
  'space-unary-ops': 'error',
  'brace-style': 'error',
  'curly': 'off',
  'eqeqeq': ['error', 'always', { null: 'ignore' }],
  'react-hooks/exhaustive-deps': 'off',
  'block-spacing': 'error',
  'object-curly-spacing': [1, 'always'],
  'indent': [1, 2, {
    SwitchCase: 1,
  }],
}

const typescript = {
  '@typescript-eslint/explicit-module-boundary-types': 'off',
  '@typescript-eslint/no-namespace': 'off',
  '@typescript-eslint/ban-ts-comment': 'off',
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-var-requires': 'off',
  '@typescript-eslint/no-unused-vars': 'warn',
  '@typescript-eslint/no-require-imports': 'off',
  // '@typescript-eslint/object-curly-spacing': [1, 'always'],
  // '@typescript-eslint/semi': ['error', 'never'],
  // '@typescript-eslint/indent': [1, 2, {
  //   SwitchCase: 1,
  // }],
  // '@typescript-eslint/member-delimiter-style': ['warn', {
  //   multiline: {
  //     delimiter: 'none',
  //     requireLast: true,
  //   },
  //   singleline: {
  //     delimiter: 'comma',
  //     requireLast: false,
  //   },
  // }],
  // '@typescript-eslint/type-annotation-spacing': [1, { after: true }],
  '@typescript-eslint/no-redeclare': ['warn'],
}

// const imports = {
//   'import/order': [
//     'error',
//     {
//       groups: ['builtin', 'external', 'internal', 'parent', 'index', 'sibling', 'object', 'type'],
//       'newlines-between': 'always',
//       pathGroups: [
//         {
//           pattern: '^react',
//           group: 'external',
//           position: 'before',
//         },
//         {
//           pattern: '^(next/(.*)$)|^(next$)',
//           group: 'external',
//         },
//         {
//           pattern: '^ant',
//           group: 'external',
//         },
//         {
//           pattern: '<THIRD_PARTY_MODULES>',
//           group: 'external',
//         },
//         {
//           pattern: '^base/(.*)$',
//           group: 'internal',
//         },
//         {
//           pattern: '^actions/(.*)$',
//           group: 'internal',
//         },
//         {
//           pattern: '^api/(.*)$',
//           group: 'internal',
//         },
//         {
//           pattern: '^components/(.*)$',
//           group: 'internal',
//         },
//         {
//           pattern: '^shapers/(.*)$',
//           group: 'internal',
//         },
//         {
//           pattern: '^utils/(.*)$',
//           group: 'internal',
//         },
//         {
//           pattern: '^types(.*)$',
//           group: 'internal',
//         },
//         {
//           pattern: '^interfaces(.*)$',
//           group: 'internal',
//         },
//         {
//           pattern: '^enums(.*)$',
//           group: 'internal',
//         },
//         {
//           pattern: '^[./].*(?<!\\.(c|le|sc)ss)$',
//           group: 'sibling',
//         },
//         {
//           pattern: '\\.(c|le|sc)ss$',
//           group: 'index',
//         },
//       ],
//       alphabetize: {
//         order: 'asc',
//         caseInsensitive: true,
//       },
//       pathGroupsExcludedImportTypes: ['react'],
//     },
//   ],
// }

const imports = {
  'import/order': [
    'error',
    {
      groups: ['builtin', 'external', 'internal', 'parent', 'index', 'sibling', 'object', 'type'],

      'newlines-between': 'always',

      pathGroups: [
        {
          pattern: 'react**',
          group: 'external',
          position: 'before',
        },
        {
          pattern: '@/**',
          group: 'internal',
        },
        {
          pattern: '@**/**',
          group: 'external',
        },
      ],
      alphabetize: {
        order: 'asc',
        caseInsensitive: true,
      },

      pathGroupsExcludedImportTypes: ['react'],
    },
  ],
}

const react = {
  'react/no-array-index-key': 'off',
  'react/self-closing-comp': 'error',
  'react/react-in-jsx-scope': 'off',
  'react/prop-types': 'off',
  'react/display-name': 'off',
  'react/jsx-closing-bracket-location': 1,
  'react/jsx-curly-newline': 1,
  'react/jsx-indent': ['error', 2, {
    indentLogicalExpressions: true,
  }],
  'react/jsx-indent-props': ['warn', 2],
  'react/jsx-wrap-multilines': ['warn', {
    arrow: 'parens-new-line',
    condition: 'parens-new-line',
    logical: 'parens-new-line',
    prop: 'parens-new-line',
  }],
  'react/jsx-curly-spacing': [1, {
    when: 'never',
    children: {
      when: 'never',
    },
  }],
}

/**
     * @type { import('eslint').ESLint.Options['baseConfig'] }
     */
const config = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'next/typescript',
    'next/core-web-vitals',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },

  plugins: [
    'react',
    '@typescript-eslint',
  ],

  settings: {
    react: {
      pragma: 'React',
      version: 'detect',
    },
  },

  rules: {
    ...base,
    ...typescript,
    ...react,
    ...imports,
  },
}

module.exports = config
