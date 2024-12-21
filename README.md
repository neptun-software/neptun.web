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
sudo apt-get install -y postgresql-client-16
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

![ERD](backup/schema/2024-12-09T18-48-00-180Z.png)

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
