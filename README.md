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
- BYU email-based authentication system
- Role-based access control:
  - Instructor role with full moderation capabilities
  - Student role with discussion participation access
- Secure session management

### 4. Data Persistence
- Persistent storage for:
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
└── utils/        # Utility functions and helpers
```

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Development

The application is built with:
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- ESLint for code quality

You can start editing the pages by modifying files in the `src/app` directory. The pages auto-update as you edit the files.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a custom font family.



## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
