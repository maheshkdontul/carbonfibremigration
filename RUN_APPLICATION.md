# How to Run the CFMS Web Application

## Quick Start

### Step 1: Open Command Prompt (not PowerShell)
Press `Win + R`, type `cmd`, and press Enter.

### Step 2: Navigate to Project Directory
```cmd
cd "C:\Users\mahes\OneDrive\Documents\Cursor\2. Copper-Fiber migration -Cursor"
```

### Step 3: Install Dependencies (if not already installed)
```cmd
npm install
```

### Step 4: Start the Development Server
```cmd
npm run dev
```

### Step 5: Open in Browser
The application will automatically open at:
**http://localhost:3000**

If it doesn't open automatically, manually navigate to:
**http://localhost:3000**

## What You'll See

- **Dashboard** - Overview with KPIs and wave progress
- **Assets & Locations** - CSV upload and asset management
- **Fiber Feasibility** - Fiber readiness validation
- **Technician Scheduling** - Assign and track technician jobs
- **Customer Engagement** - Manage customer consent
- **Waves Management** - Create and monitor migration waves
- **Reports & Analytics** - Reports page (placeholder)

## Prerequisites

Before running, make sure you have:

1. **Node.js installed** (v18 or higher)
   - Check: `node --version`
   - Download: https://nodejs.org/

2. **Supabase configured** (optional but recommended)
   - Create `.env` file with your Supabase credentials
   - See `SUPABASE_SETUP.md` for details
   - Application will work without Supabase but won't have data persistence

## Troubleshooting

### Port 3000 Already in Use
If you get an error that port 3000 is in use:
- Close other applications using port 3000
- Or change the port in `vite.config.ts`

### Module Not Found Errors
```cmd
npm install
```

### Application Won't Start
1. Make sure you're in the correct directory
2. Check that `node_modules` exists (run `npm install` if not)
3. Check for error messages in the terminal

## Stopping the Server

Press `Ctrl + C` in the Command Prompt window to stop the development server.

## Production Build

To create a production build:
```cmd
npm run build
```

The built files will be in the `dist` folder.

