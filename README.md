# Quiz Builder

A full-stack quiz authoring application for the DevelopsToday assessment, built
with Next.js, Tailwind CSS, Express, TypeScript, Prisma, and PostgreSQL.

## Using the app

Open `/quizzes` to view your library. Choose **Create a quiz**, enter a title,
and add questions. Each question supports one of these answer formats:

- **True / False:** explicitly select the correct Boolean answer.
- **Short answer:** enter the expected text answer.
- **Multiple choice:** add two or more options and check every correct option.

Saving opens a read-only answer key. Use the delete button in the library to
remove a quiz after confirming. This is an authoring app; taking quizzes, scoring,
editing saved quizzes, and user accounts are outside the assessment scope.

Titles allow up to 120 characters; quizzes contain 1–50 questions. Question text
allows 1,000 characters, short answers 500, and option labels 300. Multiple-choice
questions accept 2–20 options with unique labels and at least one correct answer.
Text is trimmed before saving, and both the form and API validate the data.

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

### Production services

Deploy the frontend and backend as separate Node.js services with a managed
PostgreSQL database. Run commands from the repository root so npm can resolve the
workspace lockfile. Install development dependencies during the build: Prisma CLI,
TypeScript, and Tailwind are needed to compile the applications.

| Service  | Build command                                  | Start command                        |
| -------- | ---------------------------------------------- | ------------------------------------ |
| API      | `npm ci && npm run build --workspace backend`  | `npm run start --workspace backend`  |
| Frontend | `npm ci && npm run build --workspace frontend` | `npm run start --workspace frontend` |

Set `NODE_ENV=production` for both services. The API needs `DATABASE_URL`,
`FRONTEND_URL` (the frontend's HTTPS origin, without a trailing slash), and the
host-provided `PORT`. Its health check path is `/health`. Run `npm run db:deploy`
as a release step before starting a new API version.

Set `NEXT_PUBLIC_API_BASE_URL` to the API's public HTTPS URL, without a trailing
slash, **before building the frontend**. Next.js includes this value in browser
JavaScript; changing it requires rebuilding. The frontend Node.js server and the
user's browser must both be able to reach this URL. Next.js also respects `PORT`.

The application follows the assessment's shared-library model: there is no
login, and any visitor can create or delete quizzes. Hosted sample data should
therefore be disposable. CORS selects allowed browser origins; it does not add
authentication.

## API

| Method   | Path           | Result                                                      |
| -------- | -------------- | ----------------------------------------------------------- |
| `POST`   | `/quizzes`     | `201`, created quiz with ordered questions and answers      |
| `GET`    | `/quizzes`     | `200`, newest-first array of `{ id, title, questionCount }` |
| `GET`    | `/quizzes/:id` | `200`, full quiz and answer key                             |
| `DELETE` | `/quizzes/:id` | `204`, empty response; deletes questions and options too    |

Example create request body:

```json
{
  "title": "JavaScript basics",
  "questions": [
    {
      "type": "BOOLEAN",
      "text": "Arrays are primitive values.",
      "correctAnswer": false
    },
    {
      "type": "INPUT",
      "text": "Which keyword declares a constant?",
      "correctAnswer": "const"
    },
    {
      "type": "CHECKBOX",
      "text": "Which are primitive types?",
      "options": [
        { "text": "string", "isCorrect": true },
        { "text": "boolean", "isCorrect": true },
        { "text": "array", "isCorrect": false }
      ]
    }
  ]
}
```

Quiz and question IDs are UUIDs. Missing quizzes return `404`; invalid IDs or
payloads return `400`. Errors use `{ "error": { "code": "...", "message": "..." } }`.
Validation errors also include `fields`, an array of `{ path, message }` entries
such as `questions.0.text`. Request bodies larger than 1 MB return `413`.

## Quality checks

```sh
npm run check
npm run build
```

`check` runs linting, TypeScript checks, and formatting verification for both
applications. Use `npm run format` to apply formatting.

Run validation and error-handling tests without a database:

```sh
npm test
```

For HTTP/database integration tests, copy the test environment example and start
the separate local test database:

```sh
cp backend/.env.test.example backend/.env.test
npm run db:test:start
```

In another terminal:

```sh
npm run test:integration
```

The integration suite applies migrations to the database configured in
`backend/.env.test`, starts the API on an available port, and cleans up its own
quiz records afterward. Keep this configuration separate from development and
production databases. Stop the test database with `q` or `Ctrl+C` when finished.

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
  components/          Quiz library, confirmation dialog, and creation form
  lib/                 Typed API client and response types
```

The root uses npm workspaces with one lockfile. Each application has its own
dependencies and commands.

## Assessment

The [assessment](https://develops.notion.site/Full-Stack-JS-engineer-test-assessment-the-Quiz-Builder-2160fe54b07b80cb9a5ec4cd6ab51957)
requires creating, listing, viewing, and deleting quizzes.
