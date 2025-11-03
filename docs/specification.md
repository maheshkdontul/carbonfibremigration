Product Requirements Document (PRD)
Telecom Copper-to-Fiber Migration Management System (CFMS)
________________________________________
1. Executive Summary
The Copper-to-Fiber Migration Management System (CFMS) is a web-based platform developed to support a telecom service provider’s copper retirement initiative across British Columbia (BC).
It enables modernization from copper to fiber and wireless infrastructure for complex business clients such as hospitals, government agencies, and large enterprises.
CFMS streamlines planning, feasibility validation, technician coordination, customer engagement, and migration tracking through an integrated digital workflow.
The MVP focuses on:
•	Asset and location management
•	Fiber feasibility validation
•	Service management (technician assignment and ONT installation tracking)
•	Customer notification and consent capture
•	Wave-based migration tracking
•	Analytics and reporting
________________________________________
2. User Personas
Persona	Description	Primary Tasks
Migration Project Manager	Oversees end-to-end migration execution	Create migration waves, assign technicians, monitor KPIs
Network Planner	Validates fiber readiness and plans migration feasibility	Check fiber availability, update readiness status
Field Technician	Performs ONT installation and reports completion	View assignments, mark jobs completed or failed
Customer Executive	Engages customers to schedule migrations and obtain consent	Call customers, record consent outcomes
Inventory Executive	Manages inventory data for copper and fiber assets	Upload CSV data, reconcile daily work order updates
________________________________________
3. User Journeys
A. Migration Project Manager
1.	Logs in to CFMS dashboard.
2.	Uploads inventory of copper/fiber assets and locations.
3.	Creates migration waves by region and customer cohort.
4.	Assigns technicians to migration jobs.
5.	Tracks progress and reviews KPIs on dashboards.
B. Network Planner
1.	Reviews uploaded asset inventory.
2.	Checks fiber availability for each address.
3.	Marks locations as “Fiber Ready” or “Pending Feasibility.”
4.	Updates records for migration readiness tracking.
C. Field Technician
1.	Views assigned migration sites in the technician module.
2.	Completes ONT installations.
3.	Updates work order status (“Completed” or “Failed”).
4.	Submission updates inventory status automatically.
D. Customer Executive
1.	Accesses customer list for active migration waves.
2.	Uses click-to-call to contact customers.
3.	Records consent or deferral outcome.
4.	Updates consent status in system for downstream scheduling.
E. Inventory Executive
1.	Uploads daily copper and fiber asset data via CSV.
2.	Tracks completion and reconciles updated statuses from field reports.
3.	Generates end-of-day summaries for migration project managers.
________________________________________
4. Functional Requirements
4.1 Asset & Location Management
•	Upload copper and fiber asset inventory via CSV.
•	Display assets in a searchable table with filters (region, asset type, status).
•	Map visualization of asset locations in BC.
•	Update asset statuses daily based on completed work orders.
•	Export updated asset data.
4.2 Fiber Feasibility Validation
•	Validate fiber availability for uploaded locations.
•	Each location marked as:
o	Fiber Ready
o	Pending Feasibility
o	Copper Only
•	Allow manual overrides by Network Planner.
•	Show color-coded map for fiber availability status.
4.3 Service Management (Technician Scheduling & ONT Installation)
•	Assign single technician per site or address.
•	Manage installation jobs via list view.
•	Update work order statuses (“Assigned”, “In Progress”, “Completed”, “Failed”).
•	Track ONT installation completion and technician comments.
•	System notifies project managers when installations complete.
4.4 Customer Notification & Consent
•	Customer Executive accesses customer list by wave.
•	Integrated click-to-call feature for agent-assisted communication.
•	Record outcomes:
o	Consented
o	Pending
o	Declined
•	Store agent name, timestamp, and notes for audit trail.
•	Trigger technician scheduling only after consent is captured.
4.5 Waves & Migration Tracking
•	Create and manage migration waves with fields:
o	Start Date
o	End Date
o	Region (BC sub-regions: Vancouver Island, Lower Mainland, Interior, North)
o	Customer Cohort (Hospitals, Government, Enterprise)
•	Assign assets and customers to waves.
•	Track progress metrics: completed %, in-progress %, failed %.
•	View progress summary by wave.
4.6 Analytics & Reporting
•	Built-in dashboard shows KPIs:
o	Total migrations completed
o	Migrations in progress
o	Failed installs
o	Average time per install
o	Wave completion % over time
•	Generate daily reports exportable to CSV or PDF.
•	Filter reports by wave, region, and date.
________________________________________
5. Wireframes (High-Level Layout Descriptions)
Page	Description	Key UI Elements
Dashboard	Overview of migrations and KPIs	KPI cards, regional heatmap, wave completion chart, navigation bar
Assets & Locations	Manage copper and fiber assets	CSV upload control, asset table (filter by region/type/status), interactive BC map, asset detail drawer
Fiber Feasibility	Validate and visualize fiber readiness	Map with status color codes, toggle for manual validation, summary counts per region
Technician Scheduling	Assign and track technician jobs	Table with technician dropdown, job status column, ONT installation checkbox, progress tracker
Customer Engagement	Manage customer calls and consents	Customer list, click-to-call button, consent status dropdown, notes field, timestamp record
Wave Management	Create and monitor migration waves	Wave list with filters, wave creation modal, progress bar per wave, detail side panel
Reports & Analytics	View migration KPIs and export data	Line/bar charts, filters (region/wave/date), export CSV/PDF buttons
________________________________________
6. Non-Functional Requirements
Category	Requirement
Performance	Support up to 100 active locations with sub-second UI response.
Scalability	Design architecture to scale to 10,000+ locations without major redesign.
Hosting	Frontend hosted on Vercel, backend and database on Supabase.
Security	HTTPS required for all data transmission.
Availability	99% uptime during migration window.
Usability	Intuitive navigation for both technical and non-technical users.
Data Backup	Daily Supabase backups retained for 30 days.
Localization	English-only (BC operations).
________________________________________
7. Data Model (Simplified)
Entities & Attributes
Entity	Attributes
Asset	id, type (copper/fiber/ONT), location_id, status, installation_date, technician_id
Location	id, address, region (BC subregion), coordinates, wave_id, fiber_status
Wave	id, name, start_date, end_date, region, customer_cohort, progress_status
Technician	id, name, phone, assigned_jobs
Customer	id, name, phone, address, consent_status
WorkOrder	id, location_id, technician_id, status, start_time, end_time
ConsentLog	id, customer_id, agent_name, status, timestamp, notes
________________________________________
8. API Specification (REST Example)
Endpoint	Method	Description
/api/assets/upload	POST	Upload asset CSV file
/api/assets	GET	Retrieve all assets
/api/assets/:id	PUT	Update asset or status
/api/waves	POST	Create a migration wave
/api/waves/:id	GET	Retrieve wave details
/api/workorders	GET	Fetch technician work orders
/api/workorders/:id	PATCH	Update work order status
/api/customers/consent	POST	Capture customer consent
/api/reports/daily	GET	Generate daily performance report
________________________________________
9. Acceptance Criteria & Test Cases
Feature	Acceptance Criteria	Test Cases
Asset & Location Management	CSV uploads successfully; assets visible in table/map; invalid data flagged	Upload valid CSV → see assets; upload invalid → error alert
Fiber Feasibility Validation	Locations correctly display fiber status; manual update works	Mark one location “Fiber Ready” → reflects on map
Service Management	Technician assigned correctly; job status updates flow through	Assign technician → mark job completed → reflected in dashboard
Customer Notification & Consent	Consent recorded and stored; status visible to project manager	Agent clicks call → records “Consented” → verify in dashboard
Wave Management	Waves created with region and cohort; progress updates automatically	Create wave “Vancouver – Hospitals” → see progress bar change as jobs complete
Analytics & Reporting	KPIs and charts match underlying data; daily report export works	Complete 10 migrations → verify “10 completed” KPI and CSV export content
________________________________________
10. Appendix: Migration Operating Model & Wave Map
Operating Model
1.	Inventory Load – Upload copper and fiber data via CSV.
2.	Feasibility Check – Validate fiber readiness per BC region.
3.	Wave Planning – Group locations by region and customer cohort.
4.	Customer Engagement – Contact customers, capture consent.
5.	Field Execution – Assign technicians for ONT installations.
6.	Daily Reconciliation – Update asset status and migration progress.
BC Migration Wave Map
Wave	Region	Customer Cohort	Dates	Description
Wave 1	Lower Mainland	Hospitals	Jan 5 – Jan 20	Initial hospital migrations
Wave 2	Vancouver Island	Government	Jan 21 – Feb 10	Core agency migrations
Wave 3	BC Interior	Enterprises	Feb 11 – Mar 1	Large enterprise transitions

