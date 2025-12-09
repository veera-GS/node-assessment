import React, { useState } from 'react';
import axios from 'axios';

export default function TimesheetEntry() {
  const names = ['Veera', 'John', 'David', 'Michael'];
  const companies = ['ABC Pvt Ltd', 'XYZ Solutions', 'TechSoft', 'InnoWorks'];

  const [rows, setRows] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

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

  const removeRow = (i) => {
    setRows(rows.filter((_, index) => index !== i));
  };

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
      await axios.post('http://localhost:5000/api/timesheet/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Saved Successfully!');
      setRows([]);
      setSelectedFile(null);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Simple styles
  const inputStyle = {
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box',
  };

  const selectStyle = {
    ...inputStyle,
    backgroundColor: '#fff',
    cursor: 'pointer',
  };

  const btnStyle = {
    padding: '10px 20px',
    border: '1px solid #333',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    backgroundColor: '#fff',
    color: '#333',
  };

  const btnPrimary = {
    ...btnStyle,
    backgroundColor: '#333',
    color: '#fff',
    border: '1px solid #333',
  };

  const btnDanger = {
    ...btnStyle,
    backgroundColor: '#fff',
    color: '#c00',
    border: '1px solid #c00',
    padding: '6px 12px',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  };

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
      {/* Header */}
      <div
        style={{
          borderBottom: '2px solid #333',
          paddingBottom: '16px',
          marginBottom: '24px',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>
          Timesheet Entry
        </h1>
      </div>

      {/* Manual Entry Section */}
      <div
        style={{
          border: '1px solid #ddd',
          padding: '20px',
          marginBottom: '24px',
        }}
      >
        <h3
          style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600' }}
        >
          Manual Entry
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '16px',
          }}
        >
          <div>
            <label style={labelStyle}>Employee Name</label>
            <select
              name='name'
              value={entry.name}
              onChange={handleEntryChange}
              style={selectStyle}
            >
              <option value=''>Select Name</option>
              {names.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Company</label>
            <select
              name='companyName'
              value={entry.companyName}
              onChange={handleEntryChange}
              style={selectStyle}
            >
              <option value=''>Select Company</option>
              {companies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Punch In</label>
            <input
              type='datetime-local'
              name='punchIn'
              value={entry.punchIn}
              onChange={handleEntryChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Punch Out</label>
            <input
              type='datetime-local'
              name='punchOut'
              value={entry.punchOut}
              onChange={handleEntryChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Date</label>
            <input
              type='date'
              name='date'
              max={new Date().toISOString().split('T')[0]}
              value={entry.date}
              onChange={handleEntryChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Total Hours</label>
            <div
              style={{
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: '#f9f9f9',
                fontWeight: '600',
              }}
            >
              {entryHours.toFixed(2)} hrs
            </div>
          </div>
        </div>

        <button onClick={addToGrid} style={btnPrimary}>
          Add to Grid
        </button>
      </div>

      {/* File Upload Section */}
      <div
        style={{
          border: '1px solid #ddd',
          padding: '20px',
          marginBottom: '24px',
        }}
      >
        <h3
          style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}
        >
          Upload File (CSV/Excel)
        </h3>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <input
            type='file'
            accept='.csv,.xlsx,.xls'
            onChange={handleUploadFile}
            style={{
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
          {selectedFile && (
            <span
              style={{
                padding: '6px 12px',
                backgroundColor: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '13px',
              }}
            >
              Selected: {selectedFile.name}
            </span>
          )}
        </div>
      </div>

      {/* Editable Grid */}
      {rows.length > 0 && (
        <div style={{ border: '1px solid #ddd' }}>
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #ddd',
              backgroundColor: '#f9f9f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: '600' }}>
              Entries ({rows.length})
            </span>
            <button onClick={saveAllInOneAPI} style={btnPrimary}>
              Save All
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '1px solid #ddd',
                    }}
                  >
                    #
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '1px solid #ddd',
                    }}
                  >
                    Name
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '1px solid #ddd',
                    }}
                  >
                    Company
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '1px solid #ddd',
                    }}
                  >
                    Punch In
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '1px solid #ddd',
                    }}
                  >
                    Punch Out
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '1px solid #ddd',
                    }}
                  >
                    Hours
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '1px solid #ddd',
                    }}
                  >
                    Date
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'center',
                      borderBottom: '1px solid #ddd',
                    }}
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{i + 1}</td>

                    <td style={{ padding: '12px' }}>
                      <select
                        value={r.name}
                        onChange={(e) =>
                          handleRowChange(i, 'name', e.target.value)
                        }
                        style={{ ...selectStyle, width: '120px' }}
                      >
                        {names.map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td style={{ padding: '12px' }}>
                      <select
                        value={r.companyName}
                        onChange={(e) =>
                          handleRowChange(i, 'companyName', e.target.value)
                        }
                        style={{ ...selectStyle, width: '130px' }}
                      >
                        {companies.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td style={{ padding: '12px' }}>
                      <input
                        type='datetime-local'
                        value={r.punchIn}
                        onChange={(e) =>
                          handleRowChange(i, 'punchIn', e.target.value)
                        }
                        style={{ ...inputStyle, width: '180px' }}
                      />
                    </td>

                    <td style={{ padding: '12px' }}>
                      <input
                        type='datetime-local'
                        value={r.punchOut}
                        onChange={(e) =>
                          handleRowChange(i, 'punchOut', e.target.value)
                        }
                        style={{ ...inputStyle, width: '180px' }}
                      />
                    </td>

                    <td style={{ padding: '12px', fontWeight: '500' }}>
                      {r.totalHours?.toFixed(2)}h
                    </td>

                    <td style={{ padding: '12px' }}>
                      <input
                        type='date'
                        value={r.date}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={(e) =>
                          handleRowChange(i, 'date', e.target.value)
                        }
                        style={{ ...inputStyle, width: '140px' }}
                      />
                    </td>

                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button onClick={() => removeRow(i)} style={btnDanger}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {rows.length === 0 && (
        <div
          style={{
            border: '1px solid #ddd',
            padding: '40px',
            textAlign: 'center',
            color: '#666',
          }}
        >
          No entries yet. Add manual entries above.
        </div>
      )}
    </div>
  );
}
