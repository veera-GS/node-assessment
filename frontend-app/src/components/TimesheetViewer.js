import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

export default function TimesheetViewer() {
  const [filters, setFilters] = useState({
    name: '',
    companyName: '',
    from: '',
    to: '',
  });
  const [data, setData] = useState([]);

  const fetchData = async () => {
    const res = await axios.get('http://localhost:5000/api/timesheet', {
      params: filters,
    });
    setData(res.data);
  };

  const exportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Timesheet');
    XLSX.writeFile(wb, 'timesheet.csv');
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Timesheet');
    XLSX.writeFile(wb, 'timesheet.xlsx');
  };

  return (
    <div>
      <h3>Timesheet Viewer</h3>

      <select
        name='name'
        onChange={(e) => setFilters({ ...filters, name: e.target.value })}
      >
        <option>All Names</option>
        <option>John</option>
        <option>David</option>
        <option>Veera</option>
      </select>

      <select
        name='companyName'
        onChange={(e) =>
          setFilters({ ...filters, companyName: e.target.value })
        }
      >
        <option>Select Company</option>
        <option>ABC Pvt Ltd</option>
        <option>XYZ Solutions</option>
      </select>

      <br />
      <br />

      <label>From:</label>
      <input
        type='date'
        name='from'
        max={new Date().toISOString().split('T')[0]}
        onChange={(e) => setFilters({ ...filters, from: e.target.value })}
      />

      <label>To:</label>
      <input
        type='date'
        name='to'
        max={new Date().toISOString().split('T')[0]}
        onChange={(e) => setFilters({ ...filters, to: e.target.value })}
      />

      <br />
      <br />

      <button onClick={fetchData}>Search</button>
      <button onClick={exportCSV}>Download CSV</button>
      <button onClick={exportExcel}>Download Excel</button>

      <table border='1' style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Company</th>
            <th>Punch In</th>
            <th>Punch Out</th>
            <th>Total Hours</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {data.map((r, i) => (
            <tr key={i}>
              <td>{r.name}</td>
              <td>{r.companyName}</td>
              <td>{r.punchIn}</td>
              <td>{r.punchOut}</td>
              <td>{r.totalHours}</td>
              <td>{r.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
