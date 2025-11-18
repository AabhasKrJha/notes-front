# Notes Application - Frontend

A modern Notes Application frontend built with Next.js and shadcn/ui components.

## Features

- **User Authentication**

  - Sign-up page with name, email, password, and role selection
  - Sign-in page with email and password
  - Protected routes - only logged-in users can access the dashboard

- **Dashboard**

  - View all notes in a list/table format
  - Create new notes with title and description
  - Edit existing notes
  - Delete notes
  - Real-time updates

- **Role-Based Access**
  - **Admin users**: Can view and manage all notes from all users
  - **Regular users**: Can only view and manage their own notes

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Fetch API / Axios (to be configured)
- **State Management**: React Context / Zustand (to be configured)

## Prerequisites

- Node.js 18+ (or Node.js 20+ recommended)
- npm, yarn, pnpm, or bun

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 2. Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   ├── (auth)/
│   │   ├── signin/          # Sign-in page
│   │   └── signup/          # Sign-up page
│   ├── dashboard/           # Dashboard (protected)
│   │   └── page.tsx         # Notes list page
│   └── globals.css          # Global styles
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── auth/                # Authentication components
│   └── notes/               # Notes-related components
├── lib/
│   ├── utils.ts             # Utility functions
│   └── api.ts               # API client functions
├── hooks/                   # Custom React hooks
├── context/                 # React Context providers
├── types/                   # TypeScript type definitions
└── public/                  # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Adding shadcn/ui Components

This project uses shadcn/ui. To add new components:

```bash
npx shadcn@latest add [component-name]
```

For example:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add table
npx shadcn@latest add dialog
```

## Pages

- `/` - Landing page (redirects to sign-in if not authenticated)
- `/signin` - Sign-in page
- `/signup` - Sign-up page
- `/dashboard` - Notes dashboard (protected route)

## Development

### Authentication Flow

1. User signs up or signs in
2. JWT token is stored (localStorage or httpOnly cookie)
3. Token is sent with each API request
4. Protected routes check for valid token
5. On token expiration, user is redirected to sign-in

### API Integration

The frontend communicates with the FastAPI backend at `http://localhost:8000`. All API calls should include the authentication token in the headers.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Make sure to set the `NEXT_PUBLIC_API_URL` environment variable in your Vercel project settings.

## License

This project is part of the Notes Application.
