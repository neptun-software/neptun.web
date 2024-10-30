// https://nuxt.com/docs/api/configuration/nuxt-config

import type { HTTPMethod } from 'nuxt-security';
import removeConsole from 'vite-plugin-remove-console';
import { protectedRoutes } from './utils/pages';
import { supportedShikiLanguages } from './utils/formatters';
// import wasm from "vite-plugin-wasm";
// import topLevelAwait from "vite-plugin-top-level-await";

const productionURL = 'https://neptun-webui.vercel.app';
const corsHandler = {
  origin: '*',
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'] as HTTPMethod[],
  preflight: {
    statusCode: 204,
  },
};

const NODE_ENV = process.env.NODE_ENV;
console.info(`NODE_ENV: ${NODE_ENV}`);

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxtjs/tailwindcss',
    'shadcn-nuxt',
    '@nuxtjs/color-mode',
    'nuxt-posthog',
    'nuxt-auth-utils',
    '@nuxtjs/mdc',
    '@nuxt/image',
    '@vueuse/nuxt',
    'nuxt-time',
    'nuxt-security',
    '@nuxtjs/robots',
    'nuxt-monaco-editor',
    '@formkit/auto-animate/nuxt',
    /* 'nuxt-og-image', */
  ],

  components: [
    {
      path: '~/components',
      pathPrefix: false, // disables components/base/Button.vue => <BaseButton /> for auto imports
    },
    // prefix needed, because pathPrefix: true doesn't work, when files are called `Index.vue` (the keyword index is thrown away completely, also for the component name)
    {
      path: '~/components/ai/chat',
      prefix: 'AiChat',
    },
    {
      path: '~/components/ai/chats',
      prefix: 'AiChats',
    },
  ],
  devtools: {
    enabled: false,
    componentInspector: false, // https://github.com/nuxt/devtools/issues/722
    timeline: {
      enabled: false,
    },
    vscode: {
      reuseExistingServer: true,
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [{ name: 'description', content: '%s - Nuxt Chat App' }],
    },
    pageTransition: {
      name: 'page',
      mode: 'out-in', // default
    },
    layoutTransition: {
      name: 'layout',
      mode: 'out-in', // default
    },
  },

  /* vite: {
    logLevel: 'warn', // 'info' | 'warn' | 'error' | 'silent'
    plugins: [
      wasm(),
      topLevelAwait(),
      removeConsole()
    ],
    css: {
      preprocessorOptions: {
        sass: {
          api: 'modern-compiler'
        }
      }
    },
    build: {
      rollupOptions: {
        external: ['env', 'wasi_snapshot_preview1'],
      },
    },
    optimizeDeps: {
      exclude: ['shiki'],
    },
  }, */
  // external: [/.*shiki.*/],
  // assetsInclude: ['**/*.wasm'],

  css: ['~/assets/css/app.css'],

  router: {
    options: {
      scrollBehaviorType: 'smooth',
    },
  },

  /* vue: {
    // https://github.com/nuxt/nuxt/issues/28829
    propsDestructure: true
  }, */

  site: {
    url: productionURL,
  },
  colorMode: {
    classSuffix: '',
  },

  mdc: {
    remarkPlugins: {
      'remark-flexible-code-titles': {},
    },
    /* rehypePlugins: {
      options: {
        // Configure rehype options to extend the parser
      },
      plugins: {
        // Register/Configure rehype plugin to extend the parser
      }
    }, */
    highlight: {
      highlighter: 'shiki',
      theme: {
        dark: 'github-dark',
        default: 'github-light',
      },
      langs: supportedShikiLanguages,
    },
  },

  runtimeConfig: {
    huggingfaceApiKey: process.env.HUGGING_FACE_API_KEY,
    posthog: {
      apiKey: process.env.POSTHOG_API_KEY,
      apiHost: process.env.POSTHOG_API_HOST,
      isActive: process.env.POSTHOG_ACTIVE,
    },
    sessionPassword: process.env.NUXT_SESSION_PASSWORD,
    cryptoSecret: process.env.CRYPTO_SECRET,
    databaseConnectionString: process.env.DATABASE_CONNECTION_STRING,
    oauth: {
      github: {
        clientId: process.env.NUXT_OAUTH_GITHUB_CLIENT_ID,
        clientSecret: process.env.NUXT_OAUTH_GITHUB_CLIENT_SECRET,
      },
      google: {
        clientId: process.env.NUXT_OAUTH_GOOGLE_CLIENT_ID,
        clientSecret: process.env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET,
      },
    },
    github: {
      app: {
        webhookSecret: process.env.NEPTUN_GITHUB_APP_WEBHOOK_SECRET,
        appId: process.env.NEPTUN_GITHUB_APP_ID,
        clientId: process.env.NEPTUN_GITHUB_APP_GITHUB_CLIENT_ID,
        clientSecret: process.env.NEPTUN_GITHUB_APP_GITHUB_CLIENT_SECRET,
        // Do not ask me why...
        privateKey:
          NODE_ENV === 'development'
            ? process.env.NEPTUN_GITHUB_APP_PRIVATE_KEY
            : Buffer.from(
                String(
                  process.env.NEPTUN_GITHUB_APP_PRIVATE_KEY?.replace(
                    /\\n/g,
                    '\n'
                  ).trim()
                ),
                'base64'
              ).toString('utf-8'),
      },
    },
    /* session persists for 7 days */
    session: {
      name: 'neptun-session',
      password: process.env.NUXT_SESSION_PASSWORD,
      cookie: {
        sameSite: 'lax',
      },
    },
    public: {
      IS_SERVERLESS: process.env.IS_SERVERLESS,
      LOG_SQL_QUERIES: process.env.LOG_SQL_QUERIES,
      LOG_BACKEND: process.env.LOG_BACKEND,
    },
  },

  build: {
    // https://github.com/nuxt-modules/og-image/issues/249#issuecomment-2324007569
    transpile: ['gsap', 'shiki'],
  },

  routeRules: {
    '/api/**': {
      security: {
        corsHandler,
      },
    },
    '/auth/**': {
      security: {
        corsHandler,
      },
    },
  },

  devServer: {
    port: 42124,
  },
  compatibilityDate: '2024-04-03',

  nitro: {
    imports: {
      dirs: ['./server/utils'],
    },
    experimental: {
      // Scalar support is currently available in nightly channel. (https://nitro.unjs.io/config#experimental, https://nuxt.com/modules/scalar)
      openAPI:
        true /* { // enables /_nitro/scalar and /_nitro/swagger and /_nitro/openapi.json (currently only in dev mode)
        meta: {
          title: 'Nuxai API Documentation',
          description: 'Chat with different AI models using this REST-API.',
          version: '0.0.0',
        }
      }, */,
    },
    /* storage: {
      redis: {
        driver: 'redis',
        url: process.env.KV_CONNECTION_STRING
      }
    } */
  },

  vite: {
    logLevel: 'warn', // 'info' | 'warn' | 'error' | 'silent'
    plugins: [removeConsole()],
    css: {
      preprocessorOptions: {
        sass: {
          api: 'modern-compiler',
        },
      },
    },
  },

  typescript: {
    typeCheck: false, // unable to fix typeerror. see https://github.com/atinux/nuxt-auth-utils/issues/191
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  eslint: {
    config: {
      stylistic: {
        quotes: 'single',
        commaDangle: 'never',
      },
    },
  },

  posthog: {
    /* https://nuxt-posthog.cmitjans.dev/configuration */
    publicKey: process.env.POSTHOG_API_KEY,
    host: process.env.POSTHOG_HOST,
    capturePageViews: true,
    disabled:
      process.env.POSTHOG_ACTIVE ===
      'false' /* process.dev (deprecated), import.meta.dev (unusable in config file) (https://nuxt.com/docs/api/advanced/import-meta#runtime-app-properties) */,
  },

  robots: {
    enabled: true,
    metaTag: true,
    blockNonSeoBots: true,
    allow: ['/home', '/templates', '/sign-up', '/sign-in'],
    disallow: protectedRoutes.filter((route) => !(route === '/')), // replace with https://nuxtseo.com/robots/guides/route-rules#inline-route-rules in the future
  },

  // Posthog adds an inline script, which causes `Failed to load resource: net::ERR_BLOCKED_BY_RESPONSE.NotSameOriginAfterDefaultedToSameOriginByCoep`, using the recommended security configuration.
  // Docs, to allow it: https://nuxt-security.vercel.app/documentation/advanced/strict-csp#whitelisting-external-resources.
  // Keep in mind: Although valid from a CSP syntax perspective, allowing 'unsafe-inline' on script-src is unsafe. This setup is not a Script CSP
  security: {
    rateLimiter: false,
    headers: {
      crossOriginEmbedderPolicy:
        NODE_ENV === 'development' ? 'unsafe-none' : 'require-corp', // to allow devtools
      contentSecurityPolicy: {
        'img-src': [
          'http://localhost:42124',
          'https://avatars.githubusercontent.com',
          'https://eu.i.posthog.com',
          productionURL,
        ],
      },
    },
  },

  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: 'shadcn',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './components/ui',
  },
});
