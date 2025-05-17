
# Learning Tracker

A modern web application for tracking educational progress and managing online courses.

## Features

- User authentication (signup/login)
- Course enrollment and progress tracking
- Video lesson viewing
- Personal dashboard with progress statistics
- Profile and settings management

## Tech Stack

- Frontend: React + TypeScript + Tailwind CSS
- Backend: Express.js + TypeScript
- Database: SQLite with Drizzle ORM
- UI Components: Shadcn/ui

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Project Structure

- `/client` - React frontend application
- `/server` - Express.js backend
- `/shared` - Shared TypeScript types and schemas

## Environment Variables

Required environment variables:
- `JWT_SECRET` - Secret key for JWT authentication
- `DATABASE_URL` - SQLite database connection string

## API Routes

- `/api/auth` - Authentication endpoints
- `/api/courses` - Course management
- `/api/enrollments` - Course enrollments
- `/api/progress` - Learning progress tracking

## License

MIT
