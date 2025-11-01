# SpotterAI Frontend

React + TypeScript frontend application for truck route planning and ELD log visualization.

## Features

- Trip planning with route visualization on interactive map
- Real-time route calculation between current location, pickup, and dropoff points
- ELD log generation and visualization with expandable daily logs
- Modern UI with shadcn/ui components and Tailwind CSS
- Responsive design for desktop and mobile devices

## Prerequisites

- Node.js 20 or higher
- npm (comes with Node.js)
- Backend API running (see TruckerBackend[https://github.com/Jordan-Rob/TruckerBackend/blob/main/README.md] README)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

Create a `.env` file in the `frontend` directory:

```bash
# Backend API base URL (without trailing slash)
VITE_API_URL= "your backend url"
```


### 3. Start development server

```bash
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend API Docs: `backendUrl/api/docs/` (requires backend to be running)

## Available Scripts

### Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Run tests in watch mode
npm test

# Run tests once
npm test -- --run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Code Quality

```bash
# Run ESLint
npm run lint
```

## Running Tests

### Run all tests

```bash
npm test -- --run
```

### Run specific test file

```bash
npm test -- --run src/components/features/__tests__/TripForm.test.tsx
```

### Run tests in UI mode

```bash
npm run test:ui
```

### Run tests with coverage

```bash
npm run test:coverage
```

### Watch mode (default)

```bash
npm test
```

## Code Quality Checks

### Linting

```bash
# Check for linting errors
npm run lint
```

### Type Checking

Type checking is performed automatically during build:

```bash
npm run build
```

TypeScript will report any type errors during the build process.

## Project Structure

```
frontend/
├── src/
│   ├── components/        # React components
│   │   ├── features/     # Feature components (TripForm, RouteMap, ELDLogCard, etc.)
│   │   ├── layout/       # Layout components (Header, Footer, Shell)
│   │   └── pages/        # Page components (Landing, PlanTripPage, LogsPage)
│   ├── lib/              # Utilities and helpers
│   │   ├── api.ts        # Axios API client
│   │   ├── geocoding.ts  # Reverse geocoding utilities
│   │   └── routeUtils.ts # Route geometry utilities
│   ├── types/            # TypeScript type definitions
│   ├── test/             # Test setup files
│   ├── App.tsx            # Main app component
│   └── main.tsx           # Entry point
├── public/                # Static assets
├── .env                   # Environment variables (create this)
├── .env.example           # Environment variables template
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── tailwind.config.cjs    # Tailwind CSS configuration
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API base URL (without trailing slash) | No | `http://127.0.0.1:8000` |

**Note:** All environment variables must be prefixed with `VITE_` to be accessible in the frontend code.

## API Integration

The frontend communicates with the backend API using Axios. The API client is configured in `src/lib/api.ts` and automatically uses the `VITE_API_URL` environment variable.

### Available API Endpoints

- `GET /api/health/` - Health check
- `POST /api/plan_trip/` - Plan a trip route
- `GET /api/eld_logs/?trip_id=<id>` - Get ELD logs for a saved trip
- `GET /api/eld_logs/?duration_s=<seconds>` - Get ELD logs for a duration

## Technologies

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components (via Tailwind)
- **React Router** - Routing
- **TanStack Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **MapLibre GL** - Map visualization
- **Vitest** - Testing framework
- **React Testing Library** - Component testing

## Troubleshooting

### Module not found errors

Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

### API connection errors

1. Ensure the backend server is running
2. Check that `VITE_API_URL` in `.env` matches your backend URL
3. Check browser console for CORS errors (may need to configure backend CORS)

### Build errors

Check for TypeScript errors:
```bash
npm run build
```

### Port already in use

Vite will automatically try the next available port. You can also specify a port:
```bash
npm run dev -- --port 3000
```

### Type errors

Ensure TypeScript is properly configured:
```bash
npx tsc --noEmit
```

## Development Tips

### Hot Module Replacement (HMR)

Vite provides instant HMR. Changes to files are reflected immediately without page refresh.

### Testing Components

Tests are located alongside components in `__tests__` directories. Use React Testing Library for component tests:
- `@testing-library/react` - Render and query components
- `@testing-library/user-event` - Simulate user interactions
- `@testing-library/jest-dom` - Additional matchers

### Styling

- Use Tailwind utility classes for styling
- Custom colors and theme are defined in `tailwind.config.cjs`
- CSS variables are defined in `src/index.css`

## Production Build

### Build for production

```bash
npm run build
```

The production build will be in the `dist/` directory.

### Preview production build

```bash
npm run preview
```

### Deployment

The `dist/` folder contains the production-ready static files. You can deploy this to:
- Static hosting (Vercel, Netlify, GitHub Pages)
- CDN (CloudFront, Cloudflare)
- Web server (Nginx, Apache)

