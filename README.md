# Weekly Report App

A web application for collecting and managing weekly reports from team leads, built with React, Vite, Tailwind CSS, and Supabase.

## Features
- **Role-based Access**: Separate views for Admins (Management) and Leads (Engineering, Marketing, etc.).
- **Weekly Reports**: Leads can submit structured weekly reports.
- **Admin Dashboard**: Admins can view, review, and manage submitted reports.
- **Database Persistence**: Data is securely stored in Supabase.
- **Responsive UI**: Clean, modern interface optimized for desktop and mobile.

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- A Supabase account

## Setup Instructions

### 1. clone the repository
```bash
git clone <repository-url>
cd webapp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Supabase Configuration
1.  Create a new project in [Supabase](https://supabase.com/).
2.  Copy your **Project URL** and **Anon / Public Key** from `Project Settings > API`.
3.  Create a `.env` file in the root directory:
    ```bash
    cp .env.example .env
    # Or just create a new file named .env
    ```
4.  Add your credentials to `.env`:
    ```env
    VITE_SUPABASE_URL=your_project_url_here
    VITE_SUPABASE_ANON_KEY=your_anon_key_here
    ```

### 4. Database Setup
You need to create the database tables. Run the following SQL scripts in your **Supabase SQL Editor**:

1.  **Create Tables**:
    Copy the contents of `supabase_schema.sql` and `supabase_leads.sql`.

    *Or run this combined script:*
    ```sql
    -- 1. Create Weekly Reports Table
    CREATE TABLE weekly_reports (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      committee TEXT NOT NULL,
      week_start_date DATE NOT NULL,
      summary TEXT NOT NULL,
      challenges TEXT,
      plans_for_next_week TEXT,
      remarks TEXT,
      status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed'))
    );
    ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow public access" ON weekly_reports FOR ALL USING (true);

    -- 2. Create Leads (Users) Table
    CREATE TABLE leads (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'lead', 'member')),
      committee TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow public read" ON leads FOR SELECT USING (true);

    -- 3. Seed Initial Users
    INSERT INTO leads (username, password, full_name, role, committee)
    VALUES 
      ('admin', 'admin123', 'Admin User', 'admin', 'Management'),
      ('lead01', 'password123', 'John Doe', 'lead', 'Engineering'),
      ('lead02', 'securepass', 'Jane Smith', 'lead', 'Marketing');
    ```

## Usage

### Run the Application
Start the development server:
```bash
npm run dev
```
Access the app at `http://localhost:5173`.

### Login Credentials
Use the following demo accounts to test the app:

| Role | Login ID | Password | Committee |
|------|----------|----------|------------|
| **Lead** | `lead01` | `password123` | Engineering |
| **Admin** | `admin` | `admin123` | Management |

## Project Structure
- `src/pages`: Main application views (Login, Dashboard, SubmitReport, Admin).
- `src/lib`: Utilities, stores, and types.
    - `store.ts`: Handles data logic andSupabase interaction.
    - `supabase.ts`: Supabase client configuration.
- `src/components`: Reusable UI components.
