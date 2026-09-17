# Quiz Builder

A full-stack quiz authoring application for the DevelopsToday assessment, built
with Next.js, Tailwind CSS, Express, TypeScript, Prisma, and PostgreSQL.

## Requirements

- Node.js 22.12 or newer (Node.js 22 is recommended; use `nvm use` if available).
- npm 9 or newer.

## Local setup

Run from the repository root:

```sh
npm ci
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Start the local database in a terminal and leave it running:

```sh
npm run db:start
```

This uses [Prisma's local PostgreSQL-compatible server](https://www.prisma.io/docs/local-development/postgres),
powered by PGlite. It requires no Docker installation and preserves its data
between restarts. The connection URLs in `backend/.env.example` match this command.
Press `q` or `Ctrl+C` to stop the database.

In another terminal, generate the database client, apply the committed migrations,
and create the sample quiz:

```sh
npm run db:generate
npm run db:deploy
npm run db:seed
```

The seed adds a JavaScript quiz with all three question types. It can be run
repeatedly without duplicating the sample or overwriting existing quizzes.

Start the backend in one terminal:

```sh
npm run dev:backend
```

Start the frontend in another terminal:

```sh
npm run dev:frontend
```

- Frontend: <http://localhost:3000> (redirects to `/quizzes`).
- API health: <http://localhost:4000/health> (returns `{"status":"ok"}`).

### Environment variables

| File                  | Variable                   | Purpose                                                     |
| --------------------- | -------------------------- | ----------------------------------------------------------- |
| `backend/.env`        | `PORT`                     | API port; defaults to `4000`                                |
| `backend/.env`        | `FRONTEND_URL`             | Allowed browser origin; defaults to `http://localhost:3000` |
| `backend/.env`        | `DATABASE_URL`             | PostgreSQL connection URL                                   |
| `backend/.env`        | `SHADOW_DATABASE_URL`      | Separate development database used by `db:migrate`          |
| `frontend/.env.local` | `NEXT_PUBLIC_API_BASE_URL` | Public API base URL                                         |

Real environment files and local databases are ignored by Git. Commit only the
environment examples. Frontend variables prefixed with `NEXT_PUBLIC_` are public;
do not put secrets in them.

### Database changes and hosting

After changing `backend/prisma/schema.prisma`, create a migration and regenerate
the client:

```sh
npm run db:migrate -- --name describe_the_change
npm run db:generate
```

For a hosted PostgreSQL database, set `DATABASE_URL` to its connection URL and
apply committed migrations with `npm run db:deploy`. Preserve the provider's TLS
settings. `db:migrate` is for development only. `SHADOW_DATABASE_URL` is not needed
for the running application or deployment; if configured for development, it must
point to a separate database because migration tooling resets the shadow database.
Run the seed explicitly only when sample data is wanted.

## Quality checks

```sh
npm run check
npm run build
```

`check` runs linting, TypeScript checks, and formatting verification for both
applications. Use `npm run format` to apply formatting.

After building, production servers can be started in separate terminals:

```sh
npm run start --workspace backend
npm run start --workspace frontend
```

## Structure

```text
backend/
  src/                 Express app, configuration, and server entry point
  prisma/              Database schema, migrations, and sample quiz seed
  prisma.config.ts     Prisma CLI configuration
frontend/
  app/                 Next.js routes, layout, and Tailwind stylesheet
```

The root uses npm workspaces with one lockfile. Each application has its own
dependencies and commands.

## Assessment

The [assessment](https://develops.notion.site/Full-Stack-JS-engineer-test-assessment-the-Quiz-Builder-2160fe54b07b80cb9a5ec4cd6ab51957)
requires creating, listing, viewing, and deleting quizzes.
