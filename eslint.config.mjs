import antfu from '@antfu/eslint-config'
import withNuxt from './.nuxt/eslint.config.mjs'

// https://antfu.me/posts/why-not-prettier
export default withNuxt(
  antfu({
    stylistic: {
      semi: false,
    },
    formatters: {
      /**
       * Format CSS, LESS, SCSS files, also the `<style>` blocks in Vue
       * By default uses Prettier
       */
      css: true,
      /**
       * Format HTML files
       * By default uses Prettier
       */
      html: true,
      /**
       * Format Markdown files
       * Supports Prettier and dprint
       * By default uses Prettier
       */
      markdown: 'prettier',
    },
    typescript: {
      tsconfigPath: 'tsconfig.json',
    },
    vue: true,
  }),
  {
    rules: {
      'no-console': 'off',
      'vue/no-v-html': 'off',
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      // https://typescript-eslint.io/rules/ban-ts-comment
      'ts/no-unsafe-assignment': 'off', // temporarily disabled
      'unused-imports/no-unused-vars': 'off', // some are used in template tags, which causes false positives
      /* 'ts/no-use-before-define': 'off', */
      '@typescript-eslint/ban-ts-comment': 'off',
      'ts/ban-ts-comment': 'off',
      'node/prefer-global/process': 'off',
      'node/prefer-global/buffer': 'off',
      // https://typescript-eslint.io/rules/strict-boolean-expressions
      'ts/strict-boolean-expressions': 'off',
      'no-cond-assign': ['error', 'except-parens'],
      'curly': ['error', 'all'],
      'brace-style': ['error', '1tbs', { allowSingleLine: false }],
      'max-statements-per-line': ['error', { max: 1 }],
      'style/indent': ['error', 2],
      'style/brace-style': ['error', '1tbs', { allowSingleLine: false }],
      'antfu/consistent-list-newline': 'off',
    },
  },
  {
    files: ['**/*.md'],
    rules: {
      'no-irregular-whitespace': 'off',
    },
  },
)
