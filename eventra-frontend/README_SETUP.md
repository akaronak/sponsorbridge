# Eventra Frontend

React + TypeScript + Vite + Tailwind CSS frontend for the Eventra platform.

## Prerequisites

- Node.js 18+
- npm or yarn

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```
VITE_API_BASE_URL=http://localhost:8080
```

### 3. Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

### 5. Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/            # Page components
├── services/         # API service layer
├── hooks/            # Custom React hooks
├── context/          # React context for state management
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── assets/           # Static assets
├── App.tsx           # Main app component
└── main.tsx          # Entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Technologies

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios

## Features to Implement

- Authentication (Login/Register)
- Organizer Dashboard
- Company Dashboard
- Admin Dashboard
- Company Search
- Sponsorship Requests
- Messaging
- Profile Management
- Export Functionality
