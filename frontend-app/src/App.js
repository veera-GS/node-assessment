import React, { Suspense, lazy } from 'react';

const TimesheetEntry = lazy(() => import('./components/TimesheetEntry'));
const TimesheetViewer = lazy(() => import('./components/TimesheetViewer'));

function Loading() {
  return (
    <div
      style={{
        padding: '40px',
        textAlign: 'center',
        color: '#666',
      }}
    >
      Loading...
    </div>
  );
}

export default function App() {
  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#fff',
        minHeight: '100vh',
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          borderBottom: '2px solid #333',
          paddingBottom: '16px',
          marginBottom: '24px',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>
          Timesheet Application
        </h1>
      </div>

      <Suspense fallback={<Loading />}>
        <TimesheetEntry />
      </Suspense>

      <hr
        style={{
          border: 'none',
          borderTop: '1px solid #ddd',
          margin: '30px 0',
        }}
      />

      <Suspense fallback={<Loading />}>
        <TimesheetViewer />
      </Suspense>
    </div>
  );
}
