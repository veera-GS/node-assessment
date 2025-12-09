import TimesheetEntry from './components/TimesheetEntry';
import TimesheetViewer from './components/TimesheetViewer';

export default function App() {
  return (
    <div style={{ padding: 30 }}>
      <h2>Timesheet Application</h2>
      <TimesheetEntry />
      <hr />
      <TimesheetViewer />
    </div>
  );
}
