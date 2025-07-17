# replit.md

## Overview

This is a full-stack online learning platform called "LearnHub" built with React, Express.js, TypeScript, and PostgreSQL. The application allows users to browse courses, enroll in them, take quizzes, and receive certificates upon completion. It features payment processing through Stripe and supports both student and instructor roles.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack Query (React Query) for server state
- **Styling**: Tailwind CSS with shadcn/ui components
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **File Uploads**: Multer for handling course thumbnails and video uploads
- **Development**: Hot reloading with Vite integration

### Key Design Decisions
1. **Monolithic Structure**: Single repository with client/server/shared folders for simplified development
2. **Type Safety**: Full TypeScript implementation across frontend and backend
3. **Component Library**: shadcn/ui for consistent, accessible UI components
4. **Database Schema**: Normalized design with proper relationships between users, courses, lessons, quizzes, and enrollments

## Key Components

### Database Schema (shared/schema.ts)
- **Users**: Authentication, roles (student/instructor/admin), Stripe integration
- **Courses**: Title, description, pricing, categories, instructor relationship
- **Lessons**: Video content, ordering, course association
- **Quizzes**: Questions, answers, scoring, course/lesson association
- **Enrollments**: User-course relationships, progress tracking
- **Certificates**: Completion records with issuance dates
- **Payments**: Stripe payment tracking and history

### Authentication System
- Simple email/password authentication (production would use proper auth)
- Role-based access control (student, instructor, admin)
- Session-based authentication with mock user IDs

### Course Management
- Course creation form with validation (Zod schemas)
- Video upload and storage capabilities
- Quiz creation and management
- Progress tracking per user enrollment

### Payment Integration
- Stripe payment processing for course purchases
- Customer creation and payment intent handling
- Checkout flow with payment confirmation

## Data Flow

1. **User Registration/Login**: Simple credential validation with user creation
2. **Course Browsing**: Fetch courses with filtering by category, level, and search
3. **Course Enrollment**: Payment processing followed by enrollment record creation
4. **Learning Progress**: Video completion tracking and quiz attempt recording
5. **Certificate Generation**: Automatic certificate issuance upon course completion

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Database ORM and query builder
- **@stripe/stripe-js & @stripe/react-stripe-js**: Payment processing
- **@tanstack/react-query**: Server state management
- **wouter**: Client-side routing
- **zod**: Runtime type validation
- **react-hook-form**: Form handling and validation

### Development Dependencies
- **vite**: Build tool and development server
- **tailwindcss**: Utility-first CSS framework
- **typescript**: Type checking and compilation
- **@types/multer**: File upload type definitions

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: ESBuild bundles server code to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push` script

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `STRIPE_SECRET_KEY`: Stripe API secret key
- `VITE_STRIPE_PUBLIC_KEY`: Stripe public key for frontend

### Production Deployment
- Express server serves both API routes and static React build
- Database schema managed through Drizzle migrations
- File uploads stored in local `uploads/` directory (would need cloud storage in production)

### Development Workflow
- `npm run dev`: Starts development server with hot reloading
- `npm run build`: Creates production build
- `npm run start`: Runs production server
- `npm run check`: TypeScript type checking
- `npm run db:push`: Apply database schema changes

## Architecture Considerations

### Scalability
- Current architecture suitable for small to medium applications
- Would need microservices architecture for larger scale
- File storage should be moved to cloud providers (AWS S3, Cloudinary)

### Security
- Authentication system is simplified for demo purposes
- Production would require proper JWT tokens, password hashing, and rate limiting
- File upload validation and security measures needed

### Performance
- React Query provides efficient caching and background updates
- Vite ensures fast development builds
- Database queries could be optimized with proper indexing

### Extensibility
- Modular component structure allows easy feature additions
- Type-safe API contracts through shared schemas
- Plugin-based architecture potential through the existing structure