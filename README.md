# ⚽ Football Geek — Fantasy Football League Companion

A web-based football league management platform designed to make organizing tournaments, managing teams, tracking match results, and monitoring player performance easier.

🌐 **Live Demo:** https://footballgeek.lovable.app/

## 📌 Overview

Football Geek is an interactive web application built for football enthusiasts who want to manage their own leagues and tournaments in one place.

The application brings together team and player management, match tracking, league standings, player statistics, and tournament fixtures in a unified interface. It also integrates Google authentication and Supabase for backend services.

## ✨ Features

- **Team Management** — Manage football teams and their details.
- **Player Management** — Maintain player information and statistics.
- **Match Management** — Log match results and record goals and assists.
- **League Standings** — Track team performance through league tables and goal statistics.
- **Player Leaderboards** — View top scorers and assist leaders.
- **Tournament Management** — Organize group stages, fixtures, and playoff rounds.
- **Authentication** — Sign in using Google and maintain authenticated sessions.
- **Persistent Data** — Use Supabase-backed services to store and retrieve application data.

*Features listed above describe the intended and tested functionality of the current project. Availability may depend on the deployed version and configuration.*

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Type-safe application development |
| Vite | Development server and build tooling |
| Tailwind CSS | Styling and responsive layouts |
| shadcn/ui | UI components |
| Supabase | Backend services, database, and authentication |
| Lovable | AI-assisted development and deployment |

## 🚀 Getting Started

### Prerequisites

Install the following before running the project locally:

- [Node.js](https://nodejs.org/) — preferably a version compatible with the project
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/SanskarGupta2709/gridiron-glory-companion.git
cd gridiron-glory-companion
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Check the project's source code and existing environment example files to determine which variables are required.

If the application uses Vite environment variables, create a local `.env` file with the required values. For example:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

**Important:** These variable names are examples. Use the exact names expected by the current codebase. Never put Supabase service-role keys, private API keys, or other secrets in frontend environment variables or commit them to GitHub.

### 4. Start the development server

```bash
npm run dev
```

Vite will display a local development URL in the terminal, typically `http://localhost:5173`.

### 5. Create a production build

```bash
npm run build
```

To preview the production build locally, if supported by the project scripts:

```bash
npm run preview
```

## 🔐 Authentication and Configuration

The application uses Supabase for authentication and backend integration.

For local development or a new deployment:

1. Configure the appropriate Supabase project URL and publishable key.
2. Enable the required authentication provider in Supabase.
3. Configure the appropriate redirect URLs for your environment.
4. Review Row Level Security (RLS) policies for database tables.
5. Ensure private credentials are never exposed in client-side code.

The existing hosted application uses its configured Supabase backend. Local development may require access to the same backend or a separately configured development project.

## 🌍 Deployment

The current application is published through Lovable.

**Live application:** https://footballgeek.lovable.app/

To deploy updates through Lovable:

1. Open the project in Lovable.
2. Make and review the required changes.
3. Use the Publish workflow to deploy the latest version.
4. Test the published application, including authentication and core functionality.

For a custom domain, configure it through the project's domain settings in Lovable.

## 🔄 Development Workflow

This project is connected to GitHub for source control.

- Changes made through Lovable can sync to the connected GitHub repository.
- Changes pushed from a local development environment can sync back to Lovable.
- Local development can be performed using any compatible IDE.

Always review changes before committing, and keep credentials and local environment files out of version control.

## 🔮 Future Improvements

Potential areas for further development include:

- Enhanced player and team analytics
- Improved mobile responsiveness
- More detailed tournament statistics
- Expanded league customization
- Additional testing and performance improvements

## 👨‍💻 Author

**Sanskar Gupta**

Computer Engineering Student | Web Development | Football & Technology

## 📄 License

No license has been specified yet. Unless a license is added to this repository, the source code remains under the default copyright rules. Contact the author for permission to reuse or redistribute it.
