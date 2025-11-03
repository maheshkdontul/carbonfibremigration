# CFMS - Copper-to-Fiber Migration System

A web-based platform for managing telecom service provider's copper retirement initiative across British Columbia (BC).

## Phase 1 Status: ✅ Complete

This project has completed Phase 1 setup including:
- Vite + React + TypeScript configuration
- ESLint and Prettier setup
- TailwindCSS styling
- Application layout (Header, Sidebar, Footer)
- Routing for all pages
- Mock data and functional prototype

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file from the example:
```bash
cp .env.example .env
```

3. Update `.env` with your Supabase credentials (Phase 2):
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Version Control

This project uses Git for version control. The repository has been initialized with:
- Initial commit containing all Phase 1 files
- `.gitignore` configured to exclude `node_modules`, `.env`, and build files

**Git Commands:**
```bash
# Check status
git status

# Stage all changes
git add .

# Commit changes
git commit -m "Your commit message"

# View commit history
git log
```

### Development

**IMPORTANT: If you get a PowerShell execution policy error**, see the [PowerShell Fix Guide](#powershell-issue) below.

Start the development server:
```bash
npm run dev
```

The app will open at `http://localhost:3000`

#### PowerShell Execution Policy Issue {#powershell-issue}

If you see this error:
```
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled
```

**Quick Fix (Choose one):**

1. **Fix Execution Policy** (Run in PowerShell):
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
   Type `Y` when prompted.

2. **Use Command Prompt instead** (No policy issues - Recommended):
   - Press `Windows Key + R`, type `cmd`, and press Enter
   - Navigate to your project folder:
     ```cmd
     cd "C:\Users\mahes\OneDrive\Documents\Cursor\2. Copper-Fiber migration -Cursor"
     ```
   - Run `npm run dev`
   - **Note:** Command Prompt doesn't have execution policy restrictions, so npm works immediately

3. **Bypass for one command**:
   ```powershell
   powershell -ExecutionPolicy Bypass -Command "npm run dev"
   ```

See `FIX_POWERSHELL_ISSUE.md` for detailed instructions.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
src/
├── components/      # Reusable UI components
│   ├── Layout.tsx
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── Footer.tsx
├── pages/          # Page components
│   ├── Dashboard.tsx
│   ├── AssetsLocations.tsx
│   ├── FiberFeasibility.tsx
│   ├── TechnicianScheduling.tsx
│   ├── CustomerEngagement.tsx
│   ├── WavesManagement.tsx
│   └── Reports.tsx
├── services/       # API services and data
│   └── mockData.ts
├── types/          # TypeScript type definitions
│   └── index.ts
├── hooks/          # Custom React hooks (for future use)
└── main.tsx        # Application entry point
```

## Features Implemented (Phase 1)

- ✅ Project setup with Vite + React + TypeScript
- ✅ ESLint and Prettier configuration
- ✅ TailwindCSS styling
- ✅ Application layout with navigation
- ✅ All page routes configured
- ✅ Mock data for prototyping
- ✅ Functional prototype with static data

## Next Steps (Phase 2)

- Supabase project setup
- Database schema creation
- Replace mock data with Supabase API calls

## License

Internal project for BC Telecom Service Provider

