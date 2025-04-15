import { bundledLanguagesInfo, type BundledLanguage, type LanguageRegistration } from 'shiki'

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
] as const

export const supportedFileExtensionsMap = {
    'js': 'js',
    'jsx': 'jsx',
    'json': 'json',
    'toml': 'toml',
    'ts': 'ts',
    'tsx': 'tsx',
    'vue': 'vue',
    'vue-html': 'html',
    'svelte': 'svelte',
    'css': 'css',
    'html': 'html',
    'xml': 'xml',
    'bash': 'sh',
    'shell': 'sh',
    'shellscript': 'sh',
    'bat': 'bat',
    'batch': 'bat',
    'cmd': 'cmd',
    'powershell': 'ps1',
    'md': 'md',
    'mdx': 'mdx',
    'mdc': 'mdc',
    'yaml': 'yaml',
    'yml': 'yml',
    'python': 'py',
    'py': 'py',
    'asciidoc': 'adoc',
    'c': 'c',
    'c#': 'cs',
    'cs': 'cs',
    'csharp': 'cs',
    'c++': 'cpp',
    'dart': 'dart',
    'objective-c': 'm',
    'objective-cpp': 'mm',
    'swift': 'swift',
    'docker': 'dockerfile',
    'dockerfile': 'dockerfile',
    'git-commit': 'txt',
    'git-rebase': 'txt',
    'go': 'go',
    'java': 'java',
    'kotlin': 'kt',
    'gql': 'graphql',
    'http': 'http',
    'latex': 'tex',
    'lua': 'lua',
    'sass': 'sass',
    'less': 'less',
    'markdown': 'md',
    'makefile': 'makefile',
    'nginx': 'conf',
    'nix': 'nix',
    'php': 'php',
    'scheme': 'scm',
    'plsql': 'sql',
    'sql': 'sql',
    'postcss': 'css',
    'prisma': 'prisma',
    'rust': 'rs',
    'rs': 'rs',
    'csv': 'csv',
} as const

export const languageColors = {
    'js': '#f1e05a',
    'jsx': '#f1e05a',
    'json': '#292929',
    'toml': '#9c4221',
    'ts': '#3178c6',
    'tsx': '#3178c6',
    'vue': '#41b883',
    'vue-html': '#e34c26',
    'svelte': '#ff3e00',
    'css': '#663399',
    'html': '#e34c26',
    'xml': '#0060ac',
    'bash': '#89e051',
    'shell': '#89e051',
    'shellscript': '#89e051',
    'bat': '#C1F12E',
    'batch': '#C1F12E',
    'cmd': '#C1F12E',
    'powershell': '#012456',
    'md': '#083fa1',
    'mdx': '#083fa1',
    'mdc': '#083fa1',
    'yaml': '#cb171e',
    'yml': '#cb171e',
    'python': '#3572A5',
    'py': '#3572A5',
    'asciidoc': '#73a0c5',
    'c': '#555555',
    'c#': '#178600',
    'cs': '#178600',
    'csharp': '#178600',
    'c++': '#f34b7d',
    'dart': '#00B4AB',
    'objective-c': '#438eff',
    'objective-cpp': '#6866fb',
    'swift': '#F05138',
    'docker': '#384d54',
    'dockerfile': '#384d54',
    'go': '#00ADD8',
    'java': '#b07219',
    'kotlin': '#A97BFF',
    'gql': '#e10098',
    'http': '#005C9C',
    'latex': '#3D6117',
    'lua': '#000080',
    'sass': '#a53b70',
    'less': '#1d365d',
    'markdown': '#083fa1',
    'makefile': '#427819',
    'nginx': '#009639',
    'nix': '#7e7eff',
    'php': '#4F5D95',
    'scheme': '#1e4aec',
    'plsql': '#dad8d8',
    'sql': '#e38c00',
    'postcss': '#dc3a0c',
    'prisma': '#0c344b',
    'rust': '#dea584',
    'rs': '#dea584',
    'csv': '#237346',
    'text': '#bdbdbd'
} as const

export const supportedShikiLanguagesWithInfo = bundledLanguagesInfo.filter(
    element => supportedShikiLanguages.includes(element.id as BundledLanguage),
)
