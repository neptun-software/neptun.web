# Neptun Website

The website of the neptun-tool. View status [here](https://pfn4gnjb.status.cron-job.org).

## Info

Built with [Nuxt 3](https://nuxt.com/docs/getting-started/introduction), [Nitro](https://nitro.unjs.io), [Vite](https://vitejs.dev) and [Vue 3](https://vuejs.org).

## Setup

```bash
pnpm install
```

## Development

```bash
pnpm run dev
```

### Development Server

How the keys were generated:

```bash
openssl genrsa 2048 > server.key
chmod 400 server.key
openssl req -new -x509 -nodes -sha256 -days 365 -key server.key -out server.crt
```

```bash
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [AU]:AT
State or Province Name (full name) [Some-State]:Wien
Locality Name (eg, city) []:Wien
Organization Name (eg, company) [Internet Widgits Pty Ltd]:Neptun AI
Organizational Unit Name (eg, section) []:Development
Common Name (e.g. server FQDN or YOUR name) []:localhost
Email Address []:neptunai.contact@gmail.com
```

### Known Issues

- Doesn't work in `bun@1.1.30`.
- Extremely slow on `Windows11` (faster in WSL (might be better in nuxt@v4, which is currently in nightly-channel)).
- `srcDir` causes some imports and types to break... (could improve performance on windows theoretically tho).
- SSL needed for mobile, if `--https` is set. (else `ERR_SSL_PROTOCOL_ERROR`).
- Oauth doesn't work using https in development mode. (causes `ERR_EMPTY_RESPONSE`).

### Docker

```bash
docker build -t neptun -f ./configurations/development/Dockerfile.dev .
```

```bash
docker run --rm -it -p 42124:42124 --env-file .env --name neptun neptun
```

or

```bash
docker compose -f ./configurations/production/docker-compose.yml -f ./configurations/development/docker-compose.yml up --build
```

### Database Commands

> Those commands are postgres specific.

Get all enum values:

```bash
SELECT typname, enumlabel
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid;
```

Get specific enum values:

```sql
SELECT unnest(enum_range(NULL::<enum_name>));
```

Update enum values (if the migration get's messed up somehow):

```sql
ALTER TYPE <enum_name> RENAME TO <enum_name>_old;
CREATE TYPE <enum_name> AS ENUM (
    'Value1',
    'Value2',
);
ALTER TABLE <table_name>
  ALTER COLUMN <column_name> TYPE <enum_name>
  USING (
    CASE <column_name>::text
      WHEN 'removedValue' THEN 'existingValue'
      ELSE <column_name>::text
    END::<enum_name>
  );
DROP TYPE <enum_name>_old;
```

#### Overview

> These commands help manage your database schema and migrations using Drizzle ORM.

#### Commands in Order of Common Usage

```bash
# 1. Pull existing schema from database (if you have an existing database)
npm run db:pull        # Pulls current database schema into TypeScript files

# 2. Generate SQL migrations from schema changes
npm run db:generate    # Creates SQL migration files based on schema changes

# 3. Apply migrations to database
npm run db:migrate     # Executes pending SQL migrations on the database

# 4. (Alternative to 2+3) Push schema changes directly
npm run db:push        # Directly applies schema changes without migration files
                       # ⚠️ Use only in development! Not recommended for production

# Development Tools
npm run db:studio      # Opens Drizzle Studio for visual database management
```

#### When to Use Which Command

- **db:pull**

  - When starting work with an existing database
  - To sync your TypeScript schema with database changes made outside your codebase
  - For database-first development approach

- **db:generate**

  - After making changes to your schema TypeScript files
  - When you need SQL migration files for version control
  - Before deploying to production
  - For team collaboration

- **db:migrate**

  - After generating migration files
  - When deploying to production
  - To apply pending migrations in a controlled manner
  - For tracking migration history

- **db:push**

  - During local development for quick iterations
  - For prototyping
  - ⚠️ Never use in production - it can lead to data loss
  - When migration history is not important

- **db:studio**
  - For visual database inspection
  - To manage data during development
  - For debugging database state

#### Best Practices

1. **Development Workflow**

   ```bash
   # Make schema changes in TypeScript
   npm run db:generate  # Create migration files
   npm run db:migrate   # Apply migrations
   ```

2. **Production Workflow**

   ```bash
   # Never use db:push in production!
   npm run db:generate  # Create migration files
   # Review migrations
   npm run db:migrate   # Apply migrations
   ```

3. **Team Collaboration**
   - Always commit migration files to version control
   - Use `db:generate` and `db:migrate` instead of `db:push`
   - Pull latest migrations before making schema changes

### Schema

#### Exporting

```bash
bun run db:dump-schema
```

#### ERD

[drawio.com](https://www.drawio.com/blog/diagrams-from-code) allows you to import sql, but you have to connect the tables yourself, which is too much work imo.
That is why I wrote 3 scripts. One for generating a database schema sql-dump, one to generate a mermaid ERD from that SQL and one to generate a mermaid png-diagram from that ERD.

```bash
sudo apt-get update
sudo apt-get install -y postgresql-client-16 # needed for pg_dump
npx puppeteer browsers install chrome-headless-shell # needed for mermaid-to-png (doesn't work on wsl2)
```

```bash
bun run db:dump-schema
```

```bash
bun run db:mermaid
```

```bash
bun run db:png
```

```mermaid
erDiagram
    chat_conversation {
        integer_NOT_NULL id
        text_NOT_NULL name
        ai_model_enum_NOT_NULL model
        timestamp_without_time_zone created_at
        timestamp_without_time_zone updated_at
        integer_NOT_NULL neptun_user_id
    }
    chat_conversation_file {
        integer_NOT_NULL id
        timestamp_without_time_zone created_at
        timestamp_without_time_zone updated_at
        integer_NOT_NULL neptun_user_id
        integer_NOT_NULL chat_conversation_id
        integer_NOT_NULL chat_conversation_message_id
        integer_NOT_NULL neptun_user_file_id
    }
    chat_conversation_message {
        integer_NOT_NULL id
        text_NOT_NULL message
        chat_conversation_message_actor_enum actor
        timestamp_without_time_zone created_at
        timestamp_without_time_zone updated_at
        integer_NOT_NULL neptun_user_id
        integer_NOT_NULL chat_conversation_id
    }
    chat_conversation_share {
        integer_NOT_NULL id
        boolean_NOT_NULL is_shared
        uuid_NOT_NULL share_id
        boolean_NOT_NULL is_protected
        text hashed_password
        timestamp_without_time_zone created_at
        timestamp_without_time_zone updated_at
        integer_NOT_NULL chat_conversation_id
    }
    chat_conversation_share_whitelist_entry {
        integer_NOT_NULL id
        timestamp_without_time_zone created_at
        timestamp_without_time_zone updated_at
        integer_NOT_NULL whitelisted_neptun_user_id
        integer_NOT_NULL chat_conversation_share_id
    }
    github_app_installation {
        integer_NOT_NULL id
        text_NOT_NULL github_account_type
        text_NOT_NULL github_account_avatar_url
        integer_NOT_NULL github_account_id
        text github_account_name
        timestamp_without_time_zone created_at
        timestamp_without_time_zone updated_at
        integer_NOT_NULL neptun_user_id
    }
    github_app_installation_repository {
        integer_NOT_NULL id
        integer_NOT_NULL github_repository_id
        text_NOT_NULL github_repository_name
        text github_repository_description
        integer github_repository_size
        text github_repository_language
        text github_repository_license
        text_NOT_NULL github_repository_url
        text github_repository_website_url
        text github_repository_default_branch
        boolean_NOT_NULL github_repository_is_private
        boolean github_repository_is_fork
        boolean github_repository_is_template
        boolean_NOT_NULL github_repository_is_archived
        timestamp_without_time_zone created_at
        timestamp_without_time_zone updated_at
        integer_NOT_NULL github_app_installation_id
    }
    neptun_user {
        integer_NOT_NULL id
        text_NOT_NULL primary_email
        text hashed_password
        timestamp_without_time_zone created_at
        timestamp_without_time_zone updated_at
    }
    neptun_user_oauth_account {
        integer_NOT_NULL id
        oauth_provider_enum_NOT_NULL provider
        text_NOT_NULL oauth_user_id
        text_NOT_NULL oauth_email
        timestamp_without_time_zone created_at
        timestamp_without_time_zone updated_at
        integer_NOT_NULL neptun_user_id
    }
    neptun_user_file {
        integer_NOT_NULL id
        text title
        text_NOT_NULL text
        text language
        text file_extension
        timestamp_without_time_zone created_at
        timestamp_without_time_zone updated_at
        integer_NOT_NULL neptun_user_id
    }
    neptun_user_template {
        integer_NOT_NULL id
        text description
        text_NOT_NULL file_name
        timestamp_without_time_zone created_at
        timestamp_without_time_zone updated_at
        integer_NOT_NULL neptun_user_id
        integer template_collection_id
        integer user_file_id
    }
    neptun_user_template_collection {
        integer_NOT_NULL id
        text_NOT_NULL name
        text description
        boolean_NOT_NULL is_shared
        uuid_NOT_NULL share_id
        timestamp_without_time_zone created_at
        timestamp_without_time_zone updated_at
        integer_NOT_NULL neptun_user_id
    }

    chat_conversation_file }o--|| chat_conversation : "references"
    chat_conversation_file }o--|| chat_conversation_message : "references"
    chat_conversation_file }o--|| neptun_user_file : "references"
    chat_conversation_file }o--|| neptun_user : "references"
    chat_conversation_message }o--|| chat_conversation : "references"
    chat_conversation_message }o--|| neptun_user : "references"
    chat_conversation }o--|| neptun_user : "references"
    chat_conversation_share }o--|| chat_conversation : "references"
    chat_conversation_share_whitelist_entry }o--|| chat_conversation_share : "references"
    chat_conversation_share_whitelist_entry }o--|| neptun_user : "references"
    github_app_installation }o--|| neptun_user : "references"
    github_app_installation_repository }o--|| github_app_installation : "references"
    neptun_user_file }o--|| neptun_user : "references"
    neptun_user_oauth_account }o--|| neptun_user : "references"
    neptun_user_template_collection }o--|| neptun_user : "references"
    neptun_user_template }o--|| neptun_user : "references"
    neptun_user_template }o--|| neptun_user_template_collection : "references"
    neptun_user_template }o--|| neptun_user_file : "references"
```

## Production

```bash
pnpm run build
```

Locally preview production build:

```bash
pnpm run preview
```

### Docker

```bash
docker build -t neptun -f ./configurations/production/Dockerfile.prod .
```

```bash
docker run --rm -it -p 42124:42124 --env-file .env --name neptun neptun
```

or

```bash
docker compose up --build
```
