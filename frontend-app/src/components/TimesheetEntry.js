import React, { useState } from 'react';
import axios from 'axios';

export default function TimesheetEntry() {
  /* -------------------------------------------------------
      DROPDOWN DATA
  ------------------------------------------------------- */
  const names = ['Veera', 'John', 'David', 'Michael'];
  const companies = ['ABC Pvt Ltd', 'XYZ Solutions', 'TechSoft', 'InnoWorks'];

  /* -------------------------------------------------------
      GRID DATA (ONLY manual rows)
  ------------------------------------------------------- */
  const [rows, setRows] = useState([]);

  /* -------------------------------------------------------
      FILE UPLOAD (CSV/XLSX) - file is NOT parsed
  ------------------------------------------------------- */
  const [selectedFile, setSelectedFile] = useState(null);

  /* -------------------------------------------------------
      MANUAL ENTRY FORM
  ------------------------------------------------------- */
  const [entry, setEntry] = useState({
    name: '',
    companyName: '',
    punchIn: '',
    punchOut: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleEntryChange = (e) => {
    setEntry({ ...entry, [e.target.name]: e.target.value });
  };

  const calcHours = (pIn, pOut) => {
    if (!pIn || !pOut) return 0;
    return (new Date(pOut) - new Date(pIn)) / (1000 * 60 * 60);
  };

  const entryHours = calcHours(entry.punchIn, entry.punchOut);

  /* -------------------------------------------------------
      ADD MANUAL ENTRY TO GRID
  ------------------------------------------------------- */
  const addToGrid = () => {
    if (entryHours < 5 || entryHours > 8) {
      alert('Total hours must be between 5 and 8 hours');
      return;
    }

    setRows([...rows, { ...entry, totalHours: entryHours }]);

    setEntry({
      name: '',
      companyName: '',
      punchIn: '',
      punchOut: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  /* -------------------------------------------------------
      FILE SELECT ONLY — NO PARSE, NO GRID UPDATE
  ------------------------------------------------------- */
  const handleUploadFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
      alert('Only CSV or Excel files allowed');
      return;
    }

    setSelectedFile(file);
    alert('File selected. It will be uploaded when saving.');
  };

  /* -------------------------------------------------------
      INLINE GRID EDITING (manual rows only)
  ------------------------------------------------------- */
  const handleRowChange = (i, key, value) => {
    const updated = [...rows];
    updated[i][key] = value;

    if (key === 'punchIn' || key === 'punchOut') {
      updated[i].totalHours = calcHours(
        updated[i].punchIn,
        updated[i].punchOut
      );
    }

    setRows(updated);
  };

  /* -------------------------------------------------------
      SAVE ALL (manual rows + uploaded file)
  ------------------------------------------------------- */
  const saveAllInOneAPI = async () => {
    if (rows.length === 0) {
      alert('No manual rows to save');
      return;
    }

    if (rows.some((r) => r.totalHours < 5 || r.totalHours > 8)) {
      alert('Each row must have 5–8 hours!');
      return;
    }

    const formData = new FormData();
    formData.append('rows', JSON.stringify(rows));

    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    try {
      await axios.post(
        'http://192.168.1.18:5000/api/timesheet/create',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      alert('Saved Successfully!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  /* -------------------------------------------------------
      UI BELOW
  ------------------------------------------------------- */

  return (
    <div style={{ padding: 20 }}>
      <h2>Timesheet Entry (Manual + File Upload)</h2>

      {/* -------------------------------------------
            MANUAL ENTRY
      -------------------------------------------- */}
      <h3>Manual Entry</h3>

      <select name='name' value={entry.name} onChange={handleEntryChange}>
        <option value=''>Select Name</option>
        {names.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>

      <select
        name='companyName'
        value={entry.companyName}
        onChange={handleEntryChange}
      >
        <option value=''>Select Company</option>
        {companies.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <br />
      <br />

      <label>Punch In:</label>
      <input
        type='datetime-local'
        name='punchIn'
        value={entry.punchIn}
        onChange={handleEntryChange}
      />

      <label>Punch Out:</label>
      <input
        type='datetime-local'
        name='punchOut'
        value={entry.punchOut}
        onChange={handleEntryChange}
      />

      <br />
      <br />

      <label>Date:</label>
      <input
        type='date'
        name='date'
        max={new Date().toISOString().split('T')[0]}
        value={entry.date}
        onChange={handleEntryChange}
      />

      <p>
        <b>Total Hours:</b> {entryHours.toFixed(2)}
      </p>

      <button onClick={addToGrid}>Add to Grid</button>

      <hr />

      {/* -------------------------------------------
            FILE UPLOAD ONLY (NO PARSING)
      -------------------------------------------- */}
      <h3>Upload Timesheet File (CSV/XLSX)</h3>
      <input type='file' accept='.csv,.xlsx,.xls' onChange={handleUploadFile} />

      {/* -------------------------------------------
            EDITABLE GRID (Manual rows only)
      -------------------------------------------- */}
      {rows.length > 0 && (
        <>
          <h3>Editable Manual Entry Grid</h3>

          <table border='1' width='100%'>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Company</th>
                <th>Punch In</th>
                <th>Punch Out</th>
                <th>Total Hours</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>

                  <td>
                    <select
                      value={r.name}
                      onChange={(e) =>
                        handleRowChange(i, 'name', e.target.value)
                      }
                    >
                      {names.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <select
                      value={r.companyName}
                      onChange={(e) =>
                        handleRowChange(i, 'companyName', e.target.value)
                      }
                    >
                      {companies.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <input
                      type='datetime-local'
                      value={r.punchIn}
                      onChange={(e) =>
                        handleRowChange(i, 'punchIn', e.target.value)
                      }
                    />
                  </td>

                  <td>
                    <input
                      type='datetime-local'
                      value={r.punchOut}
                      onChange={(e) =>
                        handleRowChange(i, 'punchOut', e.target.value)
                      }
                    />
                  </td>

                  <td>{r.totalHours?.toFixed(2)}</td>

                  <td>
                    <input
                      type='date'
                      value={r.date}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) =>
                        handleRowChange(i, 'date', e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button style={{ marginTop: 20 }} onClick={saveAllInOneAPI}>
            Save All Entries (One API)
          </button>
        </>
      )}
    </div>
  );
}
