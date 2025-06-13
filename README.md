# Analytics Class Discussion Platform

This is a [Next.js](https://nextjs.org) project that provides an interactive platform for BYU's analytics class, focusing on facilitating student discussions, administrative tools, and authentication.

## Project Overview

This platform serves as an interactive discussion board for BYU's analytics class, designed to enhance student learning and facilitate efficient problem-solving during lectures. The application is built with modern web technologies and follows best practices for security, scalability, and user experience.

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, and Tailwind CSS
- **Backend**: Serverless architecture with Next.js API routes
- **Database**: Supabase PostgreSQL for scalable data storage
- **Authentication**: Supabase Auth with BYU email verification
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
├── lib/          # Supabase client and database types
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

## Video Walkthrough Guide (5-15 minutes)

### 1. Introduction (1-2 minutes)
- Brief introduction of the project goals
- Overview of the tech stack (Next.js, Supabase, Vercel)
- Highlight the main features to be demonstrated

### 2. Authentication Flow (2-3 minutes)
- Demonstrate BYU email-based authentication
- Show different user roles (Student vs Instructor)
- Explain the security measures in place

### 3. Student Features (3-4 minutes)
- Create a new question post with code snippets
- Show how to format code and error messages
- Demonstrate the AI assistant's automatic response
- Show interaction with other posts (upvoting, commenting)
- Display how questions are organized by lecture/topic
- Demonstrate the question resolution process

### 4. Instructor Features (2-3 minutes)
- Show the instructor dashboard
- Demonstrate moderation capabilities
- Show how to pin important posts
- Display any analytics or oversight features

### 5. Technical Deep-Dive (2-3 minutes)
- Brief overview of the Supabase integration
- Show real-time updates in action
- Demonstrate responsive design
- Highlight any performance optimizations

### 6. Conclusion (1 minute)
- Recap of main features
- Future improvements planned
- Contact information for questions

Recording Tips:
1. Use a tool like OBS Studio or Loom for screen recording
2. Prepare test accounts for both student and instructor roles
3. Have example code snippets ready to paste
4. Ensure good audio quality and clear speaking pace
5. Consider adding chapters/timestamps to the video
