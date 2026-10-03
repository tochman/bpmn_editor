# BPMN Editor

BPMN Editor is a web application for creating, editing, and storing BPMN 2.0 process diagrams. Its modeling canvas is built on [bpmn-js](https://bpmn.io/toolkit/bpmn-js/), the open-source BPMN toolkit from the [bpmn.io project](https://bpmn.io/). This application extends that toolkit with an account-based dashboard, Supabase cloud storage, Swedish and English UI translations, color editing, and BPMN/SVG downloads.

This is an independent application built on bpmn.io technology; it is not the bpmn.io demo or a Camunda product.

## Features

- Visual BPMN diagram editor with drag-and-drop interface
- Properties panel for element configuration
- Color picker for diagram customization
- User authentication (sign up, sign in, sign out)
- Cloud storage for diagrams
- Export to BPMN and SVG formats

## Built on bpmn.io

[bpmn-js](https://github.com/bpmn-io/bpmn-js) provides the BPMN 2.0 modeler: diagram rendering and editing, the modeling palette and context pad, BPMN modeling rules, and BPMN XML import/export. The application adds the surrounding product experience and integrates additional bpmn-js modules:

- [bpmn-js-properties-panel](https://github.com/bpmn-io/bpmn-js-properties-panel) for editing element properties
- [bpmn-js-color-picker](https://github.com/bpmn-io/bpmn-js-color-picker) for BPMN element colors
- A project translation module for Swedish and English modeling UI
- Supabase authentication and per-user diagram storage
- Application controls for BPMN import, BPMN export, and SVG export

bpmn-js is distributed under the [bpmn.io License](https://bpmn.io/license/). Its rendered bpmn.io watermark must remain fully visible and must not be covered or removed. The application also provides a bpmn.io and license attribution in its UI.

## Extension Ideas

The bpmn.io ecosystem has many optional modules. These are candidates for future evaluation; they are **not currently installed**:

| Extension | What it could add | Notes |
| --- | --- | --- |
| [diagram-js-minimap](https://github.com/bpmn-io/diagram-js-minimap) | A small overview map for navigating large diagrams | Useful for complex processes. Check the extension release against the installed diagram-js version. |
| [bpmn-js-bpmnlint](https://github.com/bpmn-io/bpmn-js-bpmnlint) | Inline checks for common BPMN modeling issues | Strong next step for helping users catch incomplete or inconsistent diagrams; requires a lint rules configuration and bundling setup. |
| [bpmn-js-token-simulation](https://github.com/bpmn-io/bpmn-js-token-simulation) | Animate a token through a process to illustrate its flow | The current release requires diagram-js 15.27 or newer. This project currently uses diagram-js 14.11.3, so evaluate it together with a bpmn-js upgrade. |
| [bpmn-js-embedded-comments](https://github.com/bpmn-io/bpmn-js-embedded-comments) | Attach comments to diagram elements and store them in BPMN documentation | Could support diagram reviews; comments embedded in BPMN XML are not the same as live, multi-user collaboration. |

### Compatibility

The current modeler stack is `bpmn-js` 17.11.1 with `diagram-js` 14.11.3. Several actively maintained bpmn.io extensions are developed against newer bpmn-js/diagram-js versions. Before adding one, verify its peer requirements, CSS and bundling needs, BPMN import/export behavior, and compatibility with this Next.js client-side modeler. Upgrade the core and extension together when required; avoid forcing an incompatible extension into the existing stack.

For more options, see the [bpmn-js examples](https://github.com/bpmn-io/bpmn-js-examples) and the curated [Awesome bpmn.io list](https://github.com/bpmn-io/awesome-bpmn-io).

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

For Netlify, add the same variables in Site configuration → Environment variables. The app will not build until those values exist because the Supabase client is initialized during Next.js prerendering.

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