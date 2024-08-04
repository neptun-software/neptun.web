import type { LanguageRegistration, BundledLanguage } from 'shiki';
import { bundledLanguagesInfo } from 'shiki';

export function titleCase(text: string) {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/* Intl.<someFormatter> */

export const supportedShikiLanguages: (
  | BundledLanguage
  | LanguageRegistration
)[] = [
  'js',
  'jsx',
  'json',
  'toml',
  'ts',
  'tsx',
  'vue',
  'vue-html',
  'svelte',
  'css',
  'html',
  'xml',
  'bash',
  'shell',
  'shellscript',
  'bat',
  'batch',
  'cmd',
  'powershell',
  'md',
  'mdc',
  'yaml',
  'yml',
  'python',
  'py',
  'asciidoc',
  'c',
  'c#',
  'cs',
  'csharp',
  'c++',
  'dart',
  'objective-c',
  'objective-cpp',
  'swift',
  'docker',
  'dockerfile',
  'git-commit',
  'git-rebase',
  'go',
  'java',
  'kotlin',
  'gql',
  'http',
  'json',
  'latex',
  'lua',
  'sass',
  'less',
  'markdown',
  'makefile',
  'md',
  'mdx',
  'mdc',
  'nginx',
  'nix',
  'php',
  'scheme',
  'plsql',
  'sql',
  'postcss',
  'prisma',
  'rust',
  'rs',
  'csv',
] as const;

export const supportedFileExtensionsMap = {
  js: 'js',
  jsx: 'jsx',
  json: 'json',
  toml: 'toml',
  ts: 'ts',
  tsx: 'tsx',
  vue: 'vue',
  'vue-html': 'html',
  svelte: 'svelte',
  css: 'css',
  html: 'html',
  xml: 'xml',
  bash: 'sh',
  shell: 'sh',
  shellscript: 'sh',
  bat: 'bat',
  batch: 'bat',
  cmd: 'cmd',
  powershell: 'ps1',
  md: 'md',
  mdc: 'md',
  yaml: 'yaml',
  yml: 'yml',
  python: 'py',
  py: 'py',
  asciidoc: 'adoc',
  c: 'c',
  'c#': 'cs',
  cs: 'cs',
  csharp: 'cs',
  'c++': 'cpp',
  dart: 'dart',
  'objective-c': 'm',
  'objective-cpp': 'mm',
  swift: 'swift',
  docker: 'dockerfile',
  dockerfile: 'dockerfile',
  'git-commit': 'txt',
  'git-rebase': 'txt',
  go: 'go',
  java: 'java',
  kotlin: 'kt',
  gql: 'graphql',
  http: 'http',
  latex: 'tex',
  lua: 'lua',
  sass: 'sass',
  less: 'less',
  markdown: 'md',
  makefile: 'makefile',
  mdx: 'mdx',
  nginx: 'conf',
  nix: 'nix',
  php: 'php',
  scheme: 'scm',
  plsql: 'sql',
  sql: 'sql',
  postcss: 'css',
  prisma: 'prisma',
  rust: 'rs',
  rs: 'rs',
  csv: 'csv',
} as const;

export const supportedShikiLanguagesWithInfo = bundledLanguagesInfo.filter(
  (element) => supportedShikiLanguages.includes(element.id as BundledLanguage)
);