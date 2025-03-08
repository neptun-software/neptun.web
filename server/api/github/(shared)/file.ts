import type { TreeEntry as GithubTreeEntry, Repository, Tree } from '@octokit/graphql-schema'

export const CONFIG_FILE_PATTERNS = {
  // Language-specific patterns
  javascript: {
    // Core JavaScript/TypeScript configuration
    core: [
      'package\\.json$',
      '\\.npmrc$',
      'tsconfig(\\..*?)?\\.json$',
      'jsconfig\\.json$',
      '\\.babelrc$',
      'deno\\.json$',
      'nx\\.json$',
      'lerna\\.json$',
      'pnpm-workspace\\.yaml$',
      'rush\\.json$',
    ],
    // JavaScript/TypeScript build tools & frameworks
    build: [
      '(webpack|rollup|babel|vite|esbuild|turbopack|parcel|snowpack)\\.config\\.(js|ts|cjs|mjs)$',
      '(next|nuxt|svelte|astro|remix|gatsby|angular|vue|qwik|solid)\\.config\\.(js|ts|cjs|mjs)$',
      'metro\\.config\\.js$',
    ],
    // JavaScript/TypeScript utility tools
    tools: [
      '(storybook|tailwind|postcss|grunt|gulp|pm2|nodemon)\\.config\\.(js|ts|cjs|mjs)$',
      'husky\\.config\\.js$',
      'lefthook\\.yml$',
    ],
    // JavaScript/TypeScript linting & formatting
    lint: [
      '\\.eslintrc(\\.js|\\.json)?$',
      '\\.prettierrc(\\.js|\\.json)?$',
      'commitlint\\.config\\.(js|ts)$',
      'lint-staged\\.config\\.(js|ts)$',
      'tslint\\.json$',
    ],
    // JavaScript/TypeScript testing
    test: [
      '(jest|vitest|karma|cypress|playwright|ava)\\.config\\.(js|ts|json)$',
      'mocha\\.(rc|opts)$',
      'wdio\\.conf\\.js$',
    ],
    // JavaScript/TypeScript cloud & deployment
    cloud: [
      'vercel\\.json$',
      'netlify\\.toml$',
      'firebase\\.json$',
      'now\\.json$',
      'serverless\\.(js|ts|ya?ml)$',
    ],
    // JavaScript/TypeScript database tools
    database: [
      'sequelize(?:\\..*?)?\\.js$',
      'knexfile\\.js$',
      'typeorm\\.config\\.(js|ts)$',
      'ormconfig\\.(json|js|ts)$',
      'drizzle\\.config\\.(ts|js)$',
      'prisma/schema\\.prisma$',
    ],
    // JavaScript/TypeScript API tools
    api: [
      'graphql\\.config\\.(js|ts|json)$',
      'apollo\\.config\\.(js|ts)$',
    ],
    // JavaScript/TypeScript blockchain tools
    blockchain: [
      'hardhat\\.config\\.(js|ts)$',
      'truffle-config\\.(js|ts)$',
      'web3\\.config\\.(js|ts)$',
      'ganache\\.config\\.json$',
    ],
    // JavaScript/TypeScript desktop tools
    desktop: [
      'electron\\.config\\.(js|json)$',
      'tauri\\.conf\\.json$',
    ],
    // JavaScript/TypeScript mobile tools
    mobile: [
      'capacitor\\.config\\.(json|ts)$',
      'expo\\.config\\.(js|ts)$',
      'app\\.json$',
      'react-native\\.config\\.js$',
    ],
  },

  python: {
    // Core Python configuration
    core: [
      'setup\\.py$',
      'pyproject\\.toml$',
      'requirements\\.txt$',
      'Pipfile$',
      'environment\\.ya?ml$',
      'conda.*\\.ya?ml$',
      'setup\\.cfg$',
    ],
    // Python linting & formatting
    lint: [
      '\\.pylintrc$',
      '\\.?pre-commit-config\\.yaml$',
      'pyrightconfig\\.json$',
      'mypy\\.ini$',
      'flake8$',
      'black$',
      'isort\\.cfg$',
    ],
    // Python testing
    test: [
      'pytest\\.ini$',
      'tox\\.ini$',
      'coverage\\.ini$',
    ],
    // Python web & API
    web: [
      'uwsgi\\.ini$',
      'gunicorn\\.conf\\.py$',
      'django.*\\.(properties|ya?ml)$',
      'flask.*\\.py$',
      'fastapi.*\\.py$',
    ],
    // Python data science
    data: [
      'jupyter.*\\.ya?ml$',
      'notebook.*\\.json$',
      'dvc\\.yaml$',
      'mlflow\\.yaml$',
    ],
    // Python embedded
    embedded: [
      'micropython\\.config\\.py$',
    ],
    // Python database
    database: [
      'alembic\\.ini$',
      'sqlalchemy\\.config\\.py$',
      'django/models\\.py$',
    ],
  },

  rust: {
    // Core Rust configuration
    core: [
      'Cargo\\.toml$',
      '\\.cargo/config(?:\\.toml)?$',
    ],
    // Rust tools
    tools: [
      'rustfmt\\.toml$',
      'clippy\\.toml$',
      'rust-toolchain\\.toml$',
    ],
  },

  go: {
    // Core Go configuration
    core: [
      'go\\.mod$',
      'go\\.work$',
    ],
    // Go tools
    tools: [
      '\\.golangci\\.ya?ml$',
      'goreleaser\\.ya?ml$',
      'air\\.toml$',
      'buffalo\\.go$',
      'govulncheck\\.config$',
    ],
    // Go build and dependency management
    build: [
      'Makefile\\.go$',
      'mage\\.go$',
      'gomock\\.go$',
    ],
    // Go testing
    test: [
      'mockgen\\.go$',
      'ginkgo\\.go$',
      'gomega\\.go$',
    ],
    // Go database
    database: [
      'gorm\\.config\\.go$',
      'sqlx\\.config\\.go$',
    ],
  },

  java: {
    // Core Java/JVM configuration
    core: [
      'pom\\.xml$',
      'build\\.gradle(\\.kts)?$',
      'settings\\.gradle(\\.kts)?$',
      '\\.mvn/.*\\.xml$',
      'gradle\\.properties$',
      'gradle-wrapper\\.properties$',
    ],
    // Java/JVM application config
    app: [
      'application\\.(properties|ya?ml)$',
      'spring.*\\.(properties|ya?ml)$',
    ],
    // Java/JVM tools
    tools: [
      'checkstyle\\.xml$',
      'pmd\\.xml$',
      'spotbugs\\.xml$',
      'lombok\\.config$',
      'gradlew$',
    ],
    // Java database
    database: [
      'hibernate\\.cfg\\.xml$',
      'jpa\\.properties$',
      'jdbc\\.properties$',
      'persistence\\.xml$',
    ],
  },

  kotlin: {
    // Core Kotlin configuration
    core: [
      'build\\.gradle\\.kts$',
      'settings\\.gradle\\.kts$',
      'kotlinc\\.xml$',
    ],
    // Kotlin frameworks
    frameworks: [
      'ktor\\.(conf|yaml)$',
      'detekt\\.yml$',
      'ktlint\\.gradle\\.kts$',
    ],
    // Kotlin multiplatform
    multiplatform: [
      'kotlin-js-store/.*\\.conf$',
      'compose-multiplatform\\.properties$',
    ],
  },

  ruby: {
    // Core Ruby configuration
    core: [
      'Gemfile$',
      '\\.ruby-version$',
      '\\.bundle/config$',
      'Rakefile$',
    ],
    // Ruby tools
    tools: [
      '\\.rubocop(\\..*?)?\\.ya?ml$',
      'erb_lint\\.yml$',
      'reek\\.yml$',
    ],
    // Ruby frameworks
    frameworks: [
      'config/routes\\.rb$',
      'config/application\\.rb$',
      'config/environments/.*\\.rb$',
      'config/initializers/.*\\.rb$',
    ],
    // Ruby database
    database: [
      'config/database\\.yml$',
      'db/schema\\.rb$',
      'config/storage\\.yml$',
    ],
  },

  php: {
    // Core PHP configuration
    core: [
      'composer\\.json$',
      '\\.php-version$',
      'php\\.ini$',
      '\\.htaccess$',
    ],
    // PHP tools
    tools: [
      'phpunit\\.xml$',
      'phpcs\\.xml$',
      'phpdoc\\.xml$',
      'psalm\\.xml$',
      'phpstan\\.neon$',
    ],
    // PHP frameworks
    frameworks: [
      'wp-config\\.php$',
      'config/app\\.php$',
      '\\.env\\.example$',
      'artisan$',
      'symfony\\.lock$',
    ],
    // PHP database
    database: [
      'doctrine\\.yaml$',
      'eloquent\\.php$',
      'migrations\\.php$',
    ],
  },

  elixir: {
    // Core Elixir configuration
    core: [
      'mix\\.exs$',
      'config/config\\.exs$',
      'rebar\\.config$',
    ],
    // Elixir tools
    tools: [
      '\\.formatter\\.exs$',
      'credo\\.exs$',
      'dialyzer\\.exs$',
    ],
    // Elixir frameworks
    frameworks: [
      'config/dev\\.exs$',
      'config/prod\\.exs$',
      'config/test\\.exs$',
      'config/runtime\\.exs$',
      'phoenix\\.json$',
    ],
    // Elixir database
    database: [
      'config/repo\\.ex$',
      'priv/repo/migrations/.*\\.exs$',
      'ecto\\.exs$',
    ],
  },

  shell: {
    // Bash/Shell configuration
    bash: [
      '\\.bashrc$',
      '\\.bash_profile$',
      '\\.zshrc$',
      '\\.profile$',
      '\\.zshenv$',
      '\\.zprofile$',
      'Brewfile$',
      '\\.env(\\..*?)?$',
    ],
    // PowerShell configuration
    powershell: [
      'profile\\.ps1$',
      'Microsoft\\.PowerShell_profile\\.ps1$',
      'PowerShellGet/\\.config$',
      '\\.psd1$',
      '\\.psm1$',
    ],
    // Windows batch configuration
    batch: [
      '\\.bat$',
      '\\.cmd$',
      'autoexec\\.bat$',
      'config\\.bat$',
    ],
  },

  // Cross-language categories
  docker: [
    '(?:^|/)Dockerfile(?:\\..*)?$',
    'docker-compose(?:\\.[^/]*?)?\\.ya?ml$',
    '\\.dockerignore$',
  ],

  kubernetes: [
    '^(?:k8s|kube|kubernetes)?/?(?:base|overlays)?/?(deployment|service|ingress|configmap|secret|statefulset|daemonset|job|cronjob|persistentvolume|persistentvolumeclaim|role|rolebinding|serviceaccount|namespace|networkpolicy|poddisruptionbudget|horizontalpodautoscaler)\\.ya?ml$',
    '^values(?:-.*?)?\\.yaml$',
    '^Chart\\.yaml$',
    'kustomization\\.ya?ml$',
    'skaffold\\.ya?ml$',
    'helmfile\\.ya?ml$',
    'kind\\.ya?ml$',
    'microk8s\\.ya?ml$',
    'k3s\\.ya?ml$',
    'rancher\\.ya?ml$',
    'openshift\\.ya?ml$',
  ],

  git: [
    '\\.git(ignore|attributes|config|modules)$',
  ],

  ci: [
    '\\.travis\\.yml$',
    '\\.gitlab-ci\\.yml$',
    'azure-pipelines\\.yml$',
    '^\\.github/workflows/.*\\.ya?ml$',
    'Jenkinsfile(?:\\..*)?$',
    'circle\\.yml$',
    'bitbucket-pipelines\\.yml$',
    'appveyor\\.yml$',
    '\\.drone\\.yml$',
    'cloudbuild\\.ya?ml$',
    'buildkite\\.ya?ml$',
    'codeship-.*\\.yml$',
    '\\.github/dependabot\\.yml$',
    '\\.codecov\\.yml$',
    'sonar-project\\.properties$',
  ],

  terraform: [
    '.*\\.tf$',
    '.*\\.tfvars$',
    'terragrunt\\.hcl$',
  ],

  database: [
    '(?:^|/)(?:my|pg|maria|mongo|redis)?\\.?conf$',
    'liquibase\\.properties$',
    'flyway\\.conf$',
  ],

  security: [
    '\\.?auth(?:\\..*?)?\\.ya?ml$',
    'oauth2?\\.ya?ml$',
    'cors\\.ya?ml$',
    'security\\.ya?ml$',
    'ssl\\.conf$',
    'keycloak\\.json$',
    'auth0\\.ya?ml$',
    'saml.*\\.xml$',
    'oidc.*\\.json$',
    'ldap.*\\.conf$',
  ],

  monitoring: [
    'prometheus\\.ya?ml$',
    'grafana\\.ini$',
    'logstash\\.conf$',
    'filebeat\\.ya?ml$',
    'fluentd?\\.conf$',
    'jaeger\\.ya?ml$',
    'elastic.*\\.ya?ml$',
  ],

  mobile: [
    'AndroidManifest\\.xml$',
    'Info\\.plist$',
    'config\\.xml$',
    'gradle\\.properties$',
    'build\\.gradle$',
  ],

  ide: [
    '\\.editorconfig$',
    '\\.sublime-project$',
    '\\.code-workspace$',
    'omnisharp\\.json$',
  ],

  cloud: [
    'template\\.ya?ml$',
    'cdk\\.json$',
    'pulumi\\.ya?ml$',
    'fly\\.toml$',
    'railway\\.toml$',
    'render\\.ya?ml$',
    'heroku\\.ya?ml$',
    'gcp-.*\\.ya?ml$',
    'azure-.*\\.json$',
    'cloudformation\\.ya?ml$',
    'sam\\.ya?ml$',
    'apprunner\\.ya?ml$',
  ],

  webserver: [
    'nginx\\.conf$',
    'apache2?\\.conf$',
    'httpd\\.conf$',
    'lighttpd\\.conf$',
    'caddy(file)?$',
    'traefik\\.ya?ml$',
    'haproxy\\.cfg$',
    'sites?-?(available|enabled)/.*\\.conf$',
  ],

  container: [
    'containerd\\.toml$',
    'buildah\\.ya?ml$',
    'podman.*\\.ya?ml$',
  ],

  messaging: [
    'rabbitmq\\.conf$',
    'kafka.*\\.properties$',
    'activemq\\.xml$',
    'mosquitto\\.conf$',
    'nats.*\\.conf$',
    'zeromq.*\\.conf$',
    'pulsar.*\\.conf$',
    'mqtt\\.conf$',
  ],

  search: [
    'elasticsearch\\.ya?ml$',
    'solr\\.xml$',
    'sphinx\\.conf$',
    'opensearch\\.ya?ml$',
    'meilisearch\\.ya?ml$',
    'typesense\\.ya?ml$',
  ],

  cms: [
    'drupal.*\\.ya?ml$',
    'ghost\\.config\\..*$',
    'strapi\\.config\\.js$',
    'contentful\\.config\\..*$',
    'sanity\\.config\\..*$',
  ],

  blockchain: [
    'foundry\\.toml$',
    'anchor\\.toml$',
    'substrate\\.config\\.json$',
  ],

  ai: [
    'model-?card\\.ya?ml$',
    'huggingface\\.ya?ml$',
    'transformers\\.config\\.json$',
    'pytorch\\.config\\.ya?ml$',
    'tensorflow\\.config\\.ya?ml$',
    'keras\\.config\\.ya?ml$',
    'mlflow\\.ya?ml$',
    'wandb\\.ya?ml$',
  ],

  game: [
    'unity\\.config\\.json$',
    'godot\\.config\\.tres$',
    'unreal\\.config\\.ini$',
    'game\\.config$',
    'ProjectSettings/.*\\.asset$',
  ],

  embedded: [
    'platformio\\.ini$',
    'arduino\\.json$',
    'esp.*\\.config\\.json$',
    'raspberry.*\\.conf$',
    'zephyr/.*\\.conf$',
    'stm32.*\\.ioc$',
  ],

  networking: [
    'hosts$',
    'resolv\\.conf$',
    'interfaces$',
    'dhcpd?\\.conf$',
    'named\\.conf$',
    'bind\\.conf$',
    'iptables\\.conf$',
    'wireguard/.*\\.conf$',
    'openvpn/.*\\.conf$',
    'dnsmasq\\.conf$',
  ],

  virtualization: [
    'vagrantfile$',
    'virtualbox\\.conf$',
    'vmware\\.conf$',
    'hyperv\\.conf$',
    'qemu\\.conf$',
    'libvirt\\.conf$',
    'proxmox\\.conf$',
    'xen\\.conf$',
  ],

  iot: [
    'home-?assistant\\.ya?ml$',
    'zigbee2mqtt\\.ya?ml$',
    'tasmota\\.config\\..*$',
    'esphome\\.ya?ml$',
    'node-red\\.config\\..*$',
    'openhab\\.config\\..*$',
  ],

  i18n: [
    'i18n\\.config\\.(js|ts|json)$',
    'translations/.*\\.(json|ya?ml)$',
    'locale/.*\\.(json|ya?ml)$',
    'intl/.*\\.messages\\.json$',
    '\\.linguirc$',
    'lingui\\.config\\.(js|ts)$',
    'react-intl\\.config\\.js$',
    'i18next\\.config\\.js$',
    'formatjs\\.config\\.js$',
    'rosetta\\.json$',
  ],

  documentation: [
    'mkdocs\\.ya?ml$',
    'docsify\\.js$',
    'vuepress\\.config\\.js$',
    'docusaurus\\.config\\.js$',
    'sphinx\\.conf$',
    'asciidoctor\\.conf$',
    'jsdoc\\.json$',
    'typedoc\\.json$',
    'swagger\\.ya?ml$',
    'openapi\\.ya?ml$',
    'redoc\\.yaml$',
    'readme\\.md$',
    'docs/.*\\.md$',
  ],

  featureFlags: [
    'feature-flags\\.ya?ml$',
    'launchdarkly\\.config\\.json$',
    'flagsmith\\.json$',
    'split\\.yaml$',
    'unleash\\.json$',
    'growthbook\\.json$',
    'flipper\\.rb$',
    'flopflip\\.config\\.js$',
  ],
}

function flattenFilePatterns() {
  return Object.fromEntries(
    Object.entries(CONFIG_FILE_PATTERNS).map(([category, patterns]) => [
      category,
      Array.isArray(patterns)
        ? patterns
        : Object.values(patterns).flat(),
    ]),
  )
}

const FLATTENED_PATTERNS = flattenFilePatterns()

export interface ConfigFile {
  path: string
  content: string
  category?: string
}

export interface TreeEntryWithPath extends Pick<GithubTreeEntry, 'name' | 'type' | 'path'> {
  object?: {
    text?: string
    entries?: TreeEntryWithPath[]
  }
}

export interface GitHubResponse {
  repository: Pick<Repository, 'defaultBranchRef'> & {
    defaultBranchRef?: {
      target?: {
        tree?: Pick<Tree, 'entries'> & {
          entries?: TreeEntryWithPath[]
        }
      }
    }
  }
}

export const CONFIG_FILES_QUERY = `
  query findConfigFiles($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      defaultBranchRef {
        target {
          ... on Commit {
            tree {
              entries {
                name
                type
                path
                object {
                  ... on Blob {
                    text
                  }
                  ... on Tree {
                    entries {
                      name
                      type
                      path
                      object {
                        ... on Blob {
                          text
                        }
                        ... on Tree {
                          entries {
                            name
                            type
                            path
                            object {
                              ... on Blob {
                                text
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

export function processEntries(entries: TreeEntryWithPath[], parentPath = ''): ConfigFile[] {
  const foundFiles: ConfigFile[] = []
  const patterns = Object.values(FLATTENED_PATTERNS).flat()

  for (const entry of entries) {
    if (!entry.name) {
      continue
    }
    const fullPath = parentPath ? `${parentPath}/${entry.name}` : entry.name

    if (entry.type === 'tree' && entry.object?.entries) {
      // Recursively process subdirectory
      foundFiles.push(...processEntries(entry.object.entries, fullPath))
    } else if (entry.type === 'blob' && entry.object?.text) {
      // Check if file matches any pattern
      for (const pattern of patterns) {
        const regexPattern = new RegExp(pattern)
        if (regexPattern.test(fullPath)) {
          // Determine which category this file belongs to
          let fileCategory: string | undefined
          for (const [cat, categoryPatterns] of Object.entries(FLATTENED_PATTERNS)) {
            if (categoryPatterns.some(p => new RegExp(p).test(fullPath))) {
              fileCategory = cat
              break
            }
          }

          foundFiles.push({
            path: fullPath,
            content: entry.object.text,
            category: fileCategory,
          })
          break // Found a match, no need to check other patterns
        }
      }
    }
  }

  return foundFiles
}

export function handleGitHubError(error: unknown) {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    if (message.includes('bad credentials')) {
      return createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired credentials. Please check your authentication.',
      })
    }

    if (message.includes('rate limit exceeded')) {
      return createError({
        statusCode: 429,
        statusMessage: 'GitHub API rate limit exceeded. Please try again later.',
      })
    }

    if (message.includes('not found')) {
      return createError({
        statusCode: 404,
        statusMessage: 'Repository not found or not accessible.',
      })
    }

    return createError({
      statusCode: 500,
      statusMessage: 'Error fetching GitHub config files',
      data: error.message,
    })
  }

  return createError({
    statusCode: 500,
    statusMessage: 'Error fetching GitHub config files',
    data: 'Unknown error occurred',
  })
}
