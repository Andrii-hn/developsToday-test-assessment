# Quiz Builder

Create, browse, and delete quizzes with True/False, short-answer, and
multiple-choice questions. Built with Next.js, Tailwind CSS, Express,
TypeScript, Prisma, and PostgreSQL.

[Live demo](https://quiz-builder-andrii-hn.vercel.app)

## Local setup

Requires Node.js 22.12+ (22.x) and npm 9+. Run commands from the repository root.

### 1. Install and configure

```sh
npm ci
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

The examples include local database and API URLs. Environment files are ignored
by Git.

### 2. Set up the database

Start Prisma's local PostgreSQL-compatible database (no Docker needed) and leave
it running:

```sh
npm run db:start
```

In another terminal, generate the client and apply migrations:

```sh
npm run db:generate
npm run db:deploy
```

### 3. Start the apps

Run each command in a separate terminal:

```sh
npm run dev:backend
```

```sh
npm run dev:frontend
```

Open [localhost:3000](http://localhost:3000). The backend runs on port 4000.

## Create a sample quiz

With the database running and migrations applied, run:

```sh
npm run db:seed
```

This creates **JavaScript basics** with all three question types. Running it again
does not duplicate the quiz. Open `/quizzes` and click its card to view it.

To create one through the app, choose **Create quiz**, enter a title, add questions
and their correct answers, then click **Save quiz**.

## Checks

```sh
npm run check   # ESLint, TypeScript, and Prettier
npm test       # Backend and frontend unit tests
npm run build  # Production builds
```

For database integration tests, start a separate test database:

```sh
cp backend/.env.test.example backend/.env.test
npm run db:test:start
```

Then run `npm run test:integration` in another terminal. Use only the test database
in `backend/.env.test`; the suite applies migrations and creates/deletes test data.
