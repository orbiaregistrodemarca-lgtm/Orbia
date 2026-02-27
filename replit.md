# ORBIA - Trademark Registration Platform

## Overview

ORBIA is a web platform for trademark registration in Mexico with IMPI (Mexican Institute of Industrial Property). The application uses AI to classify trademarks according to the Nice Classification System and guides users through the registration process. The platform is powered by NOMINUS, a trademark law firm.

The application follows a multi-module workflow:
- **Module 1**: Brand classification using Nice Classification system
- **Module 1.5**: IMPI trademark search
- **Module 2**: Logo analysis and generation
- **Module 3**: Trademark holder data collection
- **Module 4**: Document (PDF) generation

### Authentication
- **Supabase Auth**: Email/password login and registration
- **Pages**: `/login` (sign in) and `/registro` (sign up)
- **Route Guards**: All flow pages (`/clasificar`, `/resultados`, `/busqueda-impi`, `/logo`, `/titular`, `/solicitud`, `/dashboard`) are protected with `ProtectedRoute` component
- **Session**: Managed by Supabase Auth client-side; config fetched from `/api/auth/config` endpoint
- **Header**: Shows user email and logout button when authenticated
- **Dashboard** (`/dashboard`): Shows user's estudios_marca as cards; superadmin (role in `profiles` table) sees all studies with extra 'Usuario' column
- **API Endpoints**: `/api/dashboard/profile` (get user role), `/api/dashboard/estudios` (get filtered studies)
- **Login redirect**: After login, user is sent to `/dashboard`
- **CRITICAL**: `SUPABASE_URL` and `SUPABASE_ANON_KEY` env vars are swapped in Replit. The `getSupabaseKey()` helper detects which starts with 'eyJ' (JWT). Hardcoded Supabase URL: `https://zxlzcbohvjqlwmojejee.supabase.co`

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight router)
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Animations**: Framer Motion for UI transitions
- **State Management**: TanStack React Query for server state, localStorage for persisting workflow data between pages
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Server**: Express.js with TypeScript
- **API Pattern**: RESTful endpoints that proxy to external n8n webhooks
- **Build**: Custom build script using esbuild for server and Vite for client

### Data Flow
1. Frontend collects user input (brand name, description, logo)
2. Server forwards requests to n8n webhooks for AI processing
3. Results are stored in Supabase and returned to frontend
4. Data persists in localStorage between workflow steps

### Key Design Decisions

**Webhook-First Architecture**: The backend primarily acts as a proxy to n8n webhooks that handle AI classification logic. This separates business logic from the web application and allows the AI workflows to be managed independently.

**Module-Based User Flow**: Each registration step (classification, logo analysis, holder data) is a separate page/module. Data flows between modules via localStorage, allowing users to resume their progress.

**Supabase for Persistence**: Brand studies are stored in Supabase rather than a local database. The server connects via the Supabase JavaScript client using environment variables.

## External Dependencies

### Third-Party Services
- **Supabase**: Database for storing trademark studies (`estudios_marca` table)
  - Requires `SUPABASE_URL` and `SUPABASE_ANON_KEY` environment variables
- **n8n Webhooks**: AI-powered classification and analysis
  - Classification: `https://orbia.app.n8n.cloud/webhook/clasificar-marca`
  - Logo Analysis: `https://orbia.app.n8n.cloud/webhook/analizar-logo-v2`
  - Holder Data: `https://orbia.app.n8n.cloud/webhook/datos-titular`

### Database Schema
The primary table is `estudios_marca` with fields for:
- Brand information (name, description, URL)
- Nice Classification data (class number, name, justification)
- Risk analysis (viability level, famous name flag, legal description)
- Secondary classes (up to 5 additional classes)
- Suggestions and recommendations

### Key NPM Packages
- `@supabase/supabase-js` - Supabase client
- `drizzle-orm` / `drizzle-zod` - ORM and validation (configured for PostgreSQL)
- `@tanstack/react-query` - Data fetching
- `@radix-ui/*` - Accessible UI primitives
- `framer-motion` - Animations