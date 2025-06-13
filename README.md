# Analytics Class Discussion Platform

This is a [Next.js](https://nextjs.org) project that provides an interactive platform for BYU's analytics class, focusing on facilitating student discussions, administrative tools, and authentication.

## Implemented Features

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
- Secure session management

### 4. Data Persistence
- Persistent storage using Supabase PostgreSQL database for:
  - Student submissions
  - AI responses
  - Discussion board content
  - User data and roles

## Project Structure

The project follows a clean architecture with the following main directories:

```
src/
├── app/          # Next.js app router pages and layouts
├── components/   # Reusable React components
├── lib/          # Supabase client and database types
└── utils/        # Utility functions and helpers
```



## Development

The application is built with:
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Supabase for authentication and database
- ESLint for code quality

You can start editing the pages by modifying files in the `src/app` directory. The pages auto-update as you edit the files.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a custom font family.

## Deployment

This project is deployed on [Vercel](https://vercel.com), the platform created by the makers of Next.js. The deployment process is automated through GitHub integration, with environment variables securely managed through the Vercel dashboard.

You can view the live deployment at: [https://test-run-app.vercel.app/]
