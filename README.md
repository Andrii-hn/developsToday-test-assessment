# Quiz Builder

A full-stack quiz authoring application for the DevelopsToday assessment, built
with Next.js, Tailwind CSS, Express, and TypeScript.

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
| `frontend/.env.local` | `NEXT_PUBLIC_API_BASE_URL` | Public API base URL                                         |

Real environment files and local databases are ignored by Git. Commit only the
environment examples. Frontend variables prefixed with `NEXT_PUBLIC_` are public;
do not put secrets in them.

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
frontend/
  app/                 Next.js routes, layout, and Tailwind stylesheet
```

The root uses npm workspaces with one lockfile. Each application has its own
dependencies and commands.

## Assessment

The [assessment](https://develops.notion.site/Full-Stack-JS-engineer-test-assessment-the-Quiz-Builder-2160fe54b07b80cb9a5ec4cd6ab51957)
requires creating, listing, viewing, and deleting quizzes.
