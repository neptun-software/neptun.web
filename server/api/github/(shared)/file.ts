import type { TreeEntry as GithubTreeEntry, Repository, Tree } from '@octokit/graphql-schema'

export const CONFIG_FILE_PATTERNS = {
    javascript: [
        'package\\.json$',
        '\\.npmrc$',
        '\\.eslintrc(\\.js|\\.json)?$',
        '\\.prettierrc(\\.js|\\.json)?$',
        'tsconfig(\\..*?)?\\.json$',
        '(webpack|rollup|babel|jest|vite|next|nuxt|svelte|astro|remix|gatsby|angular|vue|qwik|solid|parcel|snowpack|esbuild|turbopack|storybook|tailwind|postcss|vitest|cypress|playwright|commitlint|stylelint|prisma|nodemon|pm2|grunt|gulp)\\.config\\.(js|ts|cjs|mjs)$',
        '\\.babelrc$',
        'vercel\\.json$',
        'netlify\\.toml$',
        'firebase\\.json$',
        'now\\.json$',
        'deno\\.json$',
        'nx\\.json$',
        'lerna\\.json$',
        'pnpm-workspace\\.yaml$'
    ],
    python: [
        'setup\\.py$',
        'pyproject\\.toml$',
        '\\.pylintrc$',
        '(pytest|tox|mypy|flake8|black|isort|coverage|sphinx|uvicorn|gunicorn)\\.ini$',
        '\\.?pre-commit-config\\.yaml$',
        'pyrightconfig\\.json$'
    ],
    docker: [
        '(?:^|/)Dockerfile(?:\\..*)?$',
        'docker-compose(?:\\.[^/]*?)?\\.ya?ml$',
        '\\.dockerignore$'
    ],
    kubernetes: [
        '^(?:k8s|kube|kubernetes)?/?(?:base|overlays)?/?(deployment|service|ingress|configmap|secret|statefulset|daemonset|job|cronjob|persistentvolume|persistentvolumeclaim|role|rolebinding|serviceaccount|namespace|networkpolicy|poddisruptionbudget|horizontalpodautoscaler)\\.ya?ml$',
        '^values(?:-.*?)?\\.yaml$',
        '^Chart\\.yaml$',
        'kustomization\\.ya?ml$',
        'skaffold\\.ya?ml$',
        'helmfile\\.ya?ml$'
    ],
    git: [
        '\\.git(ignore|attributes|config|modules)$'
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
        'codeship-.*\\.yml$'
    ],
    terraform: [
        '.*\\.tf$',
        '.*\\.tfvars$',
        'terragrunt\\.hcl$'
    ],
    rust: [
        'Cargo\\.toml$',
        '\\.cargo/config(?:\\.toml)?$',
        'rustfmt\\.toml$',
        'clippy\\.toml$'
    ],
    go: [
        'go\\.mod$',
        '\\.golangci\\.ya?ml$',
        'goreleaser\\.ya?ml$'
    ],
    ruby: [
        'Gemfile$',
        '\\.rubocop(\\..*?)?\\.ya?ml$',
        'config/.*\\.(rb|ya?ml)$',
        '\\.ruby-version$'
    ],
    java: [
        'pom\\.xml$',
        'build\\.gradle(\\.kts)?$',
        'settings\\.gradle(\\.kts)?$',
        'application\\.(properties|ya?ml)$',
        '\\.mvn/.*\\.xml$'
    ],
    php: [
        'composer\\.json$',
        '\\.php-version$',
        'phpunit\\.xml$',
        'wp-config\\.php$',
        '\\.htaccess$',
        'php\\.ini$'
    ],
    database: [
        '(?:^|/)(?:my|pg|maria|mongo|redis)?\\.?conf$',
        'sequelize(?:\\..*?)?\\.js$',
        'knexfile\\.js$',
        'schema\\.prisma$',
        'typeorm\\.config\\.(js|ts)$',
        'liquibase\\.properties$',
        'flyway\\.conf$'
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
        'ldap.*\\.conf$'
    ],
    monitoring: [
        'prometheus\\.ya?ml$',
        'grafana\\.ini$',
        'logstash\\.conf$',
        'filebeat\\.ya?ml$',
        'fluentd?\\.conf$',
        'jaeger\\.ya?ml$',
        'elastic.*\\.ya?ml$'
    ],
    mobile: [
        'AndroidManifest\\.xml$',
        'Info\\.plist$',
        'capacitor\\.config\\.(json|ts)$',
        'config\\.xml$',
        'expo\\.config\\.(js|ts)$'
    ],
    ide: [
        '\\.editorconfig$',
        '\\.sublime-project$',
        '\\.code-workspace$',
        'omnisharp\\.json$',
        'jsconfig\\.json$'
    ],
    cloud: [
        'serverless\\.ya?ml$',
        'template\\.ya?ml$',
        'cdk\\.json$',
        'pulumi\\.ya?ml$',
        'fly\\.toml$',
        'railway\\.toml$',
        'render\\.ya?ml$',
        'heroku\\.ya?ml$',
        'gcp-.*\\.ya?ml$',
        'azure-.*\\.json$'
    ],
    lint: [
        '\\.eslint.*$',
        '\\.prettier.*$',
        '\\.stylelint.*$',
        '\\.markdownlint.*$',
        '\\.yamllint.*$',
        '\\.hadolint.*$',
        '\\.shellcheck.*$',
        '\\.commitlint.*$',
        'tslint\\.json$',
        'lint-staged\\..*$'
    ],
    test: [
        'jest\\.config\\.(js|ts|json)$',
        'vitest\\.config\\.(js|ts)$',
        'karma\\.conf\\.js$',
        'cypress\\.config\\.(js|ts)$',
        'playwright\\.config\\.(js|ts)$',
        'ava\\.config\\.(js|ts)$',
        'mocha\\.(rc|opts)$',
        'wdio\\.conf\\.js$'
    ],
    api: [
        'swagger\\.ya?ml$',
        'openapi\\.ya?ml$',
        'api-.*\\.ya?ml$',
        'graphql\\.config\\.(js|ts|json)$',
        'apollo\\.config\\.(js|ts)$'
    ],
    webserver: [
        'nginx\\.conf$',
        'apache2?\\.conf$',
        'httpd\\.conf$',
        'lighttpd\\.conf$',
        'caddy(file)?$',
        'traefik\\.ya?ml$',
        'haproxy\\.cfg$',
        'sites?-?(available|enabled)/.*\\.conf$'
    ],
    container: [
        'containerd\\.toml$',
        'buildah\\.ya?ml$',
        'podman.*\\.ya?ml$',
        'kind\\.ya?ml$',
        'microk8s\\.ya?ml$',
        'k3s\\.ya?ml$',
        'rancher\\.ya?ml$',
        'openshift\\.ya?ml$'
    ],
    messaging: [
        'rabbitmq\\.conf$',
        'kafka.*\\.properties$',
        'activemq\\.xml$',
        'mosquitto\\.conf$',
        'nats.*\\.conf$',
        'zeromq.*\\.conf$',
        'pulsar.*\\.conf$'
    ],
    search: [
        'elasticsearch\\.ya?ml$',
        'solr\\.xml$',
        'sphinx\\.conf$',
        'opensearch\\.ya?ml$',
        'meilisearch\\.ya?ml$',
        'typesense\\.ya?ml$'
    ],
    cdn: [
        'cloudfront.*\\.ya?ml$',
        'fastly\\.toml$',
        'akamai\\.ya?ml$',
        'cloudflare.*\\.ya?ml$',
        'cdn.*\\.conf$'
    ],
    analytics: [
        'ga4?\\.json$',
        'matomo\\.config\\..*$',
        'plausible\\.config\\..*$',
        'umami\\.config\\..*$',
        'analytics\\.ya?ml$'
    ],
    cms: [
        'wp-config\\.php$',
        'drupal.*\\.ya?ml$',
        'ghost\\.config\\..*$',
        'strapi\\.config\\.js$',
        'contentful\\.config\\..*$',
        'sanity\\.config\\..*$'
    ],
    backup: [
        'restic\\.ya?ml$',
        'duplicity\\.conf$',
        'borgmatic\\.ya?ml$',
        'rclone\\.conf$',
        'rsnapshot\\.conf$'
    ],
    ai: [
        'model-?card\\.ya?ml$',
        'huggingface\\.ya?ml$',
        'transformers\\.config\\.json$',
        'pytorch\\.config\\.ya?ml$',
        'tensorflow\\.config\\.ya?ml$',
        'keras\\.config\\.ya?ml$',
        'mlflow\\.ya?ml$',
        'wandb\\.ya?ml$'
    ],
    game: [
        'unity\\.config\\.json$',
        'godot\\.config\\.tres$',
        'unreal\\.config\\.ini$',
        'game\\.config$',
        'ProjectSettings/.*\\.asset$'
    ],
    embedded: [
        'platformio\\.ini$',
        'arduino\\.json$',
        'esp.*\\.config\\.json$',
        'raspberry.*\\.conf$',
        'micropython\\.config\\.py$',
        'zephyr/.*\\.conf$',
        'stm32.*\\.ioc$'
    ],
    blockchain: [
        'hardhat\\.config\\.(js|ts)$',
        'truffle-config\\.(js|ts)$',
        'foundry\\.toml$',
        'anchor\\.toml$',
        'substrate\\.config\\.json$',
        'web3\\.config\\.(js|ts)$',
        'ganache\\.config\\.json$'
    ],
    desktop: [
        'electron\\.config\\.(js|json)$',
        'tauri\\.conf\\.json$',
        'wails\\.json$',
        'neutralino\\.config\\.json$',
        'gtk.*\\.ini$',
        'qt.*\\.conf$',
        'wxwidgets\\.config\\.xml$'
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
        'dnsmasq\\.conf$'
    ],
    virtualization: [
        'vagrantfile$',
        'virtualbox\\.conf$',
        'vmware\\.conf$',
        'hyperv\\.conf$',
        'qemu\\.conf$',
        'libvirt\\.conf$',
        'proxmox\\.conf$',
        'xen\\.conf$'
    ],
    iot: [
        'home-?assistant\\.ya?ml$',
        'zigbee2mqtt\\.ya?ml$',
        'tasmota\\.config\\..*$',
        'esphome\\.ya?ml$',
        'node-red\\.config\\..*$',
        'openhab\\.config\\..*$',
        'mqtt\\.conf$'
    ]
}

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
    const patterns = Object.values(CONFIG_FILE_PATTERNS).flat()

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
                    for (const [cat, categoryPatterns] of Object.entries(CONFIG_FILE_PATTERNS)) {
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
