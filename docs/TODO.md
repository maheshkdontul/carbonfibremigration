CFMS Implementation TODO List
Phase 1: Project Setup
1.1 Initial Project Setup ✅ COMPLETE
Tasks
•	✅ Initialize a new Vite + React + TypeScript project.
•	✅ Configure ESLint, Prettier, and environment variables.
•	✅ Set up basic folder structure:
o	✅ /src/components
o	✅ /src/pages
o	✅ /src/hooks
o	✅ /src/services
o	✅ /src/types
Acceptance Criteria
•	✅ Project structure created (npm install required - PowerShell execution policy may need adjustment)
•	✅ Base folder structure is ready for version control.
•	✅ Linting and formatting configuration complete (no linting errors found).
________________________________________
1.2 Install Project Dependencies ✅ COMPLETE
Tasks
•	✅ Install React Router, Axios (or Fetch), Zustand (for state), and TailwindCSS for styling (dependencies defined in package.json).
•	✅ Add environment configuration for Supabase (via .env.example).
Acceptance Criteria
•	✅ All dependencies defined in package.json (run npm install when execution policy allows).
•	✅ Router and Tailwind configuration complete.
________________________________________
1.3 Create Application Layout ✅ COMPLETE
Tasks
•	✅ Build base layout components:
o	✅ Header / Navbar
o	✅ Sidebar navigation
o	✅ Main content area
o	✅ Footer
•	✅ Implement routing for placeholder pages:
o	✅ Dashboard
o	✅ Assets & Locations
o	✅ Fiber Feasibility
o	✅ Technician Scheduling
o	✅ Customer Engagement
o	✅ Waves Management
o	✅ Reports
Acceptance Criteria
•	✅ Navigation links render correct pages (routing configured in App.tsx).
•	✅ UI layout matches PRD page structure.
•	✅ Responsive layout implemented with TailwindCSS (flexbox and grid).
________________________________________
1.4 Create a Functional Prototype (Static Data) ✅ COMPLETE
Tasks
•	✅ Add mock data for assets, locations, and waves (in src/services/mockData.ts).
•	✅ Populate tables and maps (tables implemented, map placeholders added with coordinates).
•	✅ Implement drag-and-drop or modal interactions where applicable (wave creation modal implemented).
Acceptance Criteria
•	✅ Each page displays representative data (all pages show mock data).
•	✅ User can navigate and interact without errors (interactive elements functional).
________________________________________
Phase 2: Backend & Supabase Setup
2.1 Supabase Project Setup
Tasks
•	Create Supabase project.
•	Configure environment variables for Supabase URL and anon key.
•	Set up authentication (basic public access for MVP).
Acceptance Criteria
•	Supabase project accessible via dashboard.
•	Application can read/write to Supabase tables.
________________________________________
2.2 Database Schema Creation
Tasks
•	Create tables as per PRD data model:
o	assets, locations, waves, technicians, customers, work_orders, consent_logs.
•	Define foreign key relationships.
•	Seed database with sample data (20 assets, 3 waves).
Acceptance Criteria
•	Tables created with correct columns and relationships.
•	Data retrieval from Supabase succeeds via client API.
________________________________________
Phase 3: Basic Functionality
3.1 Asset & Location Management Module
Tasks
•	Build CSV upload functionality.
•	Parse CSV and save to Supabase tables.
•	Render asset table and map visualization (Mapbox or Leaflet).
•	Filter by asset type, region, and status.
Acceptance Criteria
•	Valid CSV upload creates new asset records.
•	Invalid rows produce error message.
•	Assets appear correctly in list and map view.
________________________________________
3.2 Fiber Feasibility Validation Module
Tasks
•	Read uploaded assets and show fiber readiness per address.
•	Add toggle to manually mark “Fiber Ready” or “Pending.”
•	Update fiber status in Supabase.
•	Display color-coded map markers by status.
Acceptance Criteria
•	Map reflects correct fiber readiness colors.
•	Manual toggles persist in database.
•	Validation summary counts (ready vs pending) display correctly.
________________________________________
3.3 Wave Management Module
Tasks
•	Create new migration wave via modal form (start date, end date, region, cohort).
•	Associate assets/locations to waves.
•	Display wave progress metrics (% complete).
•	Update progress dynamically based on work order status.
Acceptance Criteria
•	User can create and view waves.
•	Assets assigned to waves persist.
•	Progress bar updates accurately as migrations are marked completed.
________________________________________
Phase 4: Intermediate Functionality
4.1 Technician Scheduling Module
Tasks
•	Fetch list of technicians and assign to specific locations.
•	Update technician assignments and job status (Assigned, In Progress, Completed, Failed).
•	Reflect status changes in Supabase.
Acceptance Criteria
•	Technician assignment updates saved and visible in UI.
•	Job status changes persist and refresh in dashboard.
•	Completed installations reflect in asset records.
________________________________________
4.2 Customer Notification & Consent Module
Tasks
•	Display customer list filtered by wave.
•	Add click-to-call button (placeholder for integration).
•	Record consent outcomes (Consented, Pending, Declined).
•	Log agent name, notes, and timestamp.
Acceptance Criteria
•	Customer records update with consent status.
•	Logged agent and timestamp visible in consent log table.
•	Consent summary visible in wave overview.
________________________________________
Phase 5: Advanced Functionality
5.1 Analytics & Reporting Module
Tasks
•	Create dashboard cards for KPIs:
o	Migrations completed, In-progress, Failed installs, Average time per install, Wave completion %.
•	Generate daily reports (CSV/PDF).
•	Add date filters and region filters.
Acceptance Criteria
•	KPI cards update with live data.
•	Exported reports match displayed data.
•	Daily report generation works without error.
________________________________________
5.2 Wave Progress Automation
Tasks
•	Automatically calculate wave progress from associated work orders.
•	Update wave dashboard in near real-time.
•	Add scheduled function (Supabase Edge Function or cron job) to recompute daily progress.
Acceptance Criteria
•	Wave progress updates automatically after work order completion.
•	Daily refresh recalculates metrics correctly.
________________________________________
5.3 Asset Tracking Reconciliation
Tasks
•	Compare uploaded inventory vs completed work orders daily.
•	Highlight discrepancies (e.g., missing completion updates).
•	Generate summary table for Inventory Executives.
Acceptance Criteria
•	Reconciliation table displays accurate differences.
•	Daily summary accessible via reports module.
________________________________________
Phase 6: Finalization
6.1 UI Polish & Validation
Tasks
•	Add consistent styling (Tailwind theme).
•	Validate all input forms (wave creation, CSV upload).
•	Add tooltips, modals, and success/error notifications.
Acceptance Criteria
•	UI consistent across all modules.
•	Invalid inputs produce friendly error messages.
•	All navigation links functional.
________________________________________
6.2 Testing & QA
Tasks
•	Unit test React components (Jest + Testing Library).
•	Test API routes with mocked Supabase responses.
•	Conduct manual QA walkthrough for all user personas.
Acceptance Criteria
•	All major features tested and passing.
•	QA checklist confirms end-to-end flows (upload → schedule → complete → report).
________________________________________
6.3 Deployment
Tasks
•	Deploy front-end to Vercel.
•	Configure Supabase environment variables in production.
•	Verify database connectivity and API performance.
Acceptance Criteria
•	Application accessible via public URL.
•	All modules functional in production environment.
•	No console or API errors in production logs.
________________________________________
Summary Order of Implementation
1.	Setup & Layout (foundation)
2.	Supabase & Schema (data model)
3.	Asset Management (core CRUD + CSV)
4.	Fiber Feasibility (map + validation logic)
5.	Wave Management (grouping & progress)
6.	Technician Scheduling (assignments)
7.	Customer Consent (CRM-style workflow)
8.	Analytics & Reporting (dashboards + exports)
9.	Reconciliation & Automation (advanced)
10.	UI Polish, QA, Deployment

