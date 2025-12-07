# BPMN Editor

A Next.js application for creating and editing BPMN (Business Process Model and Notation) diagrams with user authentication and cloud storage powered by Supabase.

## Features

- Visual BPMN diagram editor with drag-and-drop interface
- Properties panel for element configuration
- Color picker for diagram customization
- User authentication (sign up, sign in, sign out)
- Cloud storage for diagrams
- Export to BPMN and SVG formats

## Setup

### 1. Install Dependencies

```bash
yarn install
```

### 2. Configure Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up Database

Run the SQL schema in your Supabase SQL Editor (found in `supabase/schema.sql`):

This creates the `diagrams` table with Row Level Security policies.

### 4. Run the Application

```bash
# Development
yarn dev

# Production build
yarn build
yarn start
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Auth callback
│   ├── dashboard/         # User dashboard
│   ├── editor/            # BPMN editor pages
│   ├── login/             # Login page
│   └── signup/            # Signup page
├── components/            # React components
│   ├── auth/              # Authentication components
│   └── editor/            # BPMN editor component
├── lib/                   # Utility libraries
│   ├── supabase/          # Supabase client configuration
│   └── types/             # TypeScript type definitions
├── supabase/              # Supabase configuration
│   └── schema.sql         # Database schema
└── diagrams/              # Sample BPMN diagrams
```

## Technologies

- [Next.js 15](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Authentication and database
- [bpmn-js](https://bpmn.io/toolkit/bpmn-js/) - BPMN diagram editor
- [TypeScript](https://www.typescriptlang.org/) - Type safety 