# Analytics Class Discussion Platform

This is a [Next.js](https://nextjs.org) project that provides an interactive platform for BYU's analytics class, focusing on facilitating student discussions, administrative tools, and authentication.

## Project Overview

This platform serves as an interactive discussion board for BYU's analytics class, designed to enhance student learning and facilitate efficient problem-solving during lectures. The application is built with modern web technologies and follows best practices for security, scalability, and user experience.

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, and Tailwind CSS
- **Backend**: Serverless architecture with Next.js API routes
- **Database**: Supabase PostgreSQL for scalable data storage
- **Authentication**: Supabase Auth with BYU email verification
- **AI Integration**: Google's Gemini 2.5 Flash for intelligent responses
- **Deployment**: Vercel (Production URL: https://test-run-app.vercel.app/)

## Architecture Decisions

### 1. Discussion Board
- Students can submit code-related questions with error messages
- Integrated AI assistant that automatically provides solutions
- Response and upvoting system for student interaction
- Questions organized by lecture/topic
- Question resolution tracking system

### 2. Admin Tools
- Instructor moderation capabilities
- Post pinning functionality

### 3. Authentication and Roles
- Authentication implemented using Supabase Auth
- BYU email-based authentication system
- Role-based access control:
  - Instructor role with full moderation capabilities
  - Student role with discussion participation access
- Protected API routes and middleware validation

### 4. Data Persistence
- Persistent storage using Supabase PostgreSQL database for:
  - Student submissions
  - AI responses
  - Discussion board content
  - User data and roles

## Project Structure

```
src/
├── app/          # Next.js app router pages and layouts
├── components/   # Reusable React components
├── types/        # Database types
└── utils/        # Utility functions and helpers
```

## Development

The application is built with:
- Next.js 14 with App Router for server-side rendering and API routes
- TypeScript for type safety and better developer experience
- Tailwind CSS for responsive and maintainable styling
- Supabase for authentication and real-time database capabilities
- ESLint and Prettier for code quality and consistency

## Deployment

This project is deployed on [Vercel](https://vercel.com), the platform created by the makers of Next.js. The deployment process is automated through GitHub integration, with environment variables securely managed through the Vercel dashboard.

You can view the live deployment at: [https://test-run-app.vercel.app/]
