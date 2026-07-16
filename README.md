# AI-Powered Employee Management System

A modern, full-stack, dark-mode glassmorphic Employee Management System powered by **Google Gemini AI**. Built with React (Vite) on the frontend, Node.js & Express on the backend, and SQLite as a zero-configuration local database.

## Key Features

1. **Intelligent Dashboard**: Real-time stats on headcount, task progress, department allocation (animated custom SVG charts), and AI-generated management insights.
2. **Employee Console**: Full CRUD operations for employee records including role, department, salary, skill tags, and performance rating.
3. **AI Performance Review Generator**: Generate rich, structured performance reviews based on metrics, achievements, and development areas using Gemini.
4. **Smart Task Planner & AI Allocator**: Assign tasks dynamically with an AI engine that maps skills requirements against workloads to pick the optimal candidate.
5. **AI Resume Parser & Matcher**: Copy-paste resume text to extract key skills, predict department alignment, and score role fit.

## Installation & Launch

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)

### Quick Setup

1. **Clone/extract the project** to your working directory.
2. **Set up environment configurations**:
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *Note: If no Gemini API key is provided, the application will automatically fall back to its internal AI simulation engine, meaning the app remains 100% functional out of the box!*

3. **Install all dependencies** (from the root directory):
   ```bash
   npm run install-all
   ```

4. **Run the application**:
   ```bash
   npm run dev
   ```
   This will boot the Express server (port `5000`) and the Vite React client concurrently.

## Project Structure
- `client/`: React + Vite application (Vanilla CSS custom UI)
- `server/`: Express backend, database schemas, and AI integration code
- `package.json`: Multi-service concurrent scripts
