# Murang'a County Service Request System

A web-based service request management system developed for Murang'a County.

The application allows citizens to submit service requests and track their progress, while administrators can view, manage, filter, and update submitted requests.

## Features

### Citizen Features

- User registration and authentication
- Secure login and logout
- Citizen profile information
- Submit new service requests
- Select a request category
- Add a description of the issue
- Provide the service location
- Attach a photo to a request
- View submitted service requests
- Search submitted requests
- Filter requests by category and status
- Track request status

### Administrator Features

- Administrator authentication
- View submitted service requests
- View citizen information
- Search requests
- Filter requests by category
- Filter requests by status
- View request statistics
- Update service request status
- Track pending, in-progress, and resolved requests

## Request Statuses

Service requests are managed using the following statuses:

- Pending
- In Progress
- Resolved
- Rejected

## User Roles

### Citizen

Citizens can:

1. Sign in to the system.
2. Submit service requests.
3. Select a service category.
4. Provide a description and location.
5. Attach a supporting photo.
6. View their submitted requests.
7. Search and filter their requests.
8. Track request progress.

### Administrator

Administrators can:

1. Sign in to the system.
2. View service requests submitted by citizens.
3. Search and filter requests.
4. View citizen information.
5. Update request statuses.
6. Monitor request statistics.

## Technology Stack

### Frontend

- React 19.3.1
- TypeScript 6
- Vite 8
- Tailwind CSS 4
- Lucide React

### Backend and Services

- Supabase
- Supabase Authentication
- Supabase PostgreSQL database
- Supabase Storage

### Development Tools

- ESLint
- TypeScript ESLint
- React Hooks ESLint
- React Refresh ESLint
- PostCSS
- Autoprefixer

## Project Structure

```text
muranga-service-request/
├── public/
├── src/
│   ├── components/
│   │   └── SubmitRequestModal.tsx
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   ├── AuthContextValue.ts
│   │   └── useAuth.ts
│   ├── pages/
│   │   └── AuthPage.tsx
│   ├── services/
│   │   └── supabase.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── types.ts
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── postcss.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
