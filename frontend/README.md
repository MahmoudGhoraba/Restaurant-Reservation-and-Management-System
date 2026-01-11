# Restaurant Management System - Frontend

This is the frontend application for the Restaurant Management System, built with Next.js 16, React 19, TypeScript, and Tailwind CSS.

## Features

- 🎨 Modern UI with Tailwind CSS
- 🔐 Authentication system
- 📅 Reservation management
- 🍽️ Menu browsing and ordering
- 📊 Order tracking
- 💻 TypeScript for type safety
- ⚡ Server-side rendering with Next.js App Router

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running (see backend README)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and set your backend API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3001](http://localhost:3001) in your browser.

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── layout/           # Layout components (Header, Footer)
│   └── ui/              # Reusable UI components
├── lib/                  # Utility functions
│   ├── api.ts           # API client
│   └── auth.ts          # Authentication utilities
├── types/               # TypeScript type definitions
└── public/              # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## API Integration

The frontend communicates with the backend API through the `lib/api.ts` client. Make sure your backend is running and the `NEXT_PUBLIC_API_URL` environment variable is correctly set.

## Technologies Used

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **ESLint** - Code linting

## Development

The app uses the Next.js App Router, which means:
- Pages are defined in the `app/` directory
- Server and Client Components are supported
- File-based routing is automatic

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request
