# Backend App - Node Assessment

This is the backend service for the Node.js assessment project. It provides API endpoints to interact with the database and handles all the server-side logic.

## Simple Overview

- **Built with Node.js and Express:** The backend runs an Express server to handle HTTP requests.
- **Database:** Uses MongoDB for storing and retrieving data (see `mongodb.js` for connection logic).
- **Main files:**
  - `server.js`: Starts your backend server and sets up API routes.
  - `mongodb.js`: Connects your app to a MongoDB instance.
  - `package.json`: Lists dependencies and scripts.
- **Typical functionality:**
  - Receives API calls (e.g., from a frontend app)
  - Processes requests and talks to MongoDB
  - Sends JSON responses

## Environment Configuration

Backend configuration values (like database URIs and port number) are usually stored in environment variables for security and flexibility.

### Example `.env` file

Create a file named `.env` in the `backend-app` directory. Here’s a sample format:

```env

SUPABASE_URL=https://gxwjbhizckezfhufblsj.supabase.co
SUPABASE_SERVICE_ROLE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4d2piaGl6Y2tlemZodWZibHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTI2NTQsImV4cCI6MjA4MDc4ODY1NH0.p8YNez4z3-okIRM9KpjcdEIVPISqMTPcgKHaxXEyLxY
MONGO_URI= mongodb+srv://guneshraj:guneshraj123@cluster0.urp8aid.mongodb.net/?appName=Cluster0

```

its free source configration urls (temp mail)

## Getting Started

1. **Install dependencies:**

   ```
   npm install
   ```

2. **Set up environment variables:**

   - Copy the example above into a `.env` file in `backend-app`.

3. **Start the server:**

   ```
   npm start
   ```

4. **Test the API:**
   - Use tools like Postman or curl or client side to make requests to your endpoints.

## Folder Structure

```
backend-app/
├── mongodb.js
├── server.js
├── package.json
├── package-lock.json
└── .env           # You create this file for your configuration
```

# Frontend App - Timesheet Application

This is the frontend service for the Timesheet Management application. Built with React.js, it provides a clean and simple user interface for managing employee timesheets.

## Simple Overview

- **Built with React.js:** Modern React with functional components and hooks
- **Lazy Loading:** Components load only when needed for better performance
- **Responsive Design:** Works on desktop, tablet, and mobile devices
- **Simple UI:** Clean black/white/gray design with minimal colors

## Features

### 1. Timesheet Entry

| Feature               | Description                                                |
| --------------------- | ---------------------------------------------------------- |
| Manual Entry Form     | Add timesheet entries with dropdowns and date/time pickers |
| Employee Selection    | Dropdown to select employee name                           |
| Company Selection     | Dropdown to select company                                 |
| Punch In/Out          | DateTime picker for clock in and clock out times           |
| Date Selection        | Date picker (cannot select future dates)                   |
| Auto Hour Calculation | Automatically calculates total hours worked                |
| Hour Validation       | Validates hours are between 5-8 hours                      |
| Add to Grid           | Adds entry to editable grid before saving                  |
| File Upload           | Upload CSV or Excel files (.csv, .xlsx, .xls)              |
| Editable Grid         | Edit any field in the grid before saving                   |
| Remove Row            | Remove entries from grid before saving                     |
| Save All              | Save all entries in one API call                           |

### 2. Timesheet Viewer

| Feature              | Description                              |
| -------------------- | ---------------------------------------- |
| View All Records     | Display all timesheet records in a table |
| Filter by Employee   | Dropdown filter for employee name        |
| Filter by Company    | Dropdown filter for company name         |
| Filter by Date Range | From and To date filters                 |
| Clear Filters        | Reset all filters with one click         |
| Inline Editing       | Edit records directly in the table       |
| Delete Records       | Delete with confirmation dialog          |
| Export CSV           | Download data as CSV file                |
| Export Excel         | Download data as Excel file              |
| Record Count         | Shows total number of records            |
| Loading State        | Shows loading indicator while fetching   |
| Empty State          | Shows message when no records found      |

### 3. App Features

| Feature           | Description                            |
| ----------------- | -------------------------------------- |
| Lazy Loading      | Components load only when needed       |
| Tab Navigation    | Switch between Entry and Viewer        |
| Code Splitting    | Separate JS bundles for each component |
| Responsive Layout | Adapts to all screen sizes             |

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start:**

   ```bash
   npm run start
   ```
