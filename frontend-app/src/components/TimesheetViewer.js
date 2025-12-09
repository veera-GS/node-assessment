import React, { useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/timesheet', {
        params: filters,
      });
      setData(res.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load data');
    }
    setLoading(false);
  };

  // useEffect(() => {
  //   fetchData();
  // }, [filters]);

  const handleEdit = (record) => {
    setEditingId(record._id);
    setEditForm({
      name: record.name || '',
      companyName: record.companyName || '',
      punchIn: record.punchIn || '',
      punchOut: record.punchOut || '',
      totalHours: record.totalHours || '',
      date: record.date || '',
    });
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    try {
      await axios.post(`http://localhost:5000/api/timesheet/update`, {
        data: editForm,
        id: editingId,
      });

      setData((prev) =>
        prev.map((item) =>
          item._id === editingId ? { ...item, ...editForm } : item
        )
      );

      setEditingId(null);
      setEditForm({});
      alert('Updated successfully!');
    } catch (error) {
      alert('Update failed: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      handleConfirmDelete(id);
    }
  };

  const handleConfirmDelete = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/timesheet/delete`, { id });
      setData((prev) => prev.filter((item) => item._id !== id));
      alert('Deleted successfully!');
    } catch (error) {
      alert('Delete failed: ' + (error.response?.data?.error || error.message));
    }
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

  const clearFilters = () => {
    setFilters({ name: '', companyName: '', from: '', to: '' });
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

  const btnStyle = {
    padding: '8px 16px',
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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>
          Timesheet Management
        </h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={exportCSV} style={btnStyle}>
            Export CSV
          </button>
          <button onClick={exportExcel} style={btnStyle}>
            Export Excel
          </button>
        </div>
      </div>

      {/* Filters */}
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
          Filters
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '4px',
                fontSize: '14px',
              }}
            >
              Employee
            </label>
            <select
              value={filters.name}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, name: e.target.value }))
              }
              style={inputStyle}
            >
              <option value=''>All</option>
              <option value='John'>John</option>
              <option value='David'>David</option>
              <option value='Veera'>Veera</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '4px',
                fontSize: '14px',
              }}
            >
              Company
            </label>
            <select
              value={filters.companyName}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, companyName: e.target.value }))
              }
              style={inputStyle}
            >
              <option value=''>All</option>
              <option value='ABC Pvt Ltd'>ABC Pvt Ltd</option>
              <option value='XYZ Solutions'>XYZ Solutions</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '4px',
                fontSize: '14px',
              }}
            >
              From
            </label>
            <input
              type='date'
              value={filters.from}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, from: e.target.value }))
              }
              style={inputStyle}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '4px',
                fontSize: '14px',
              }}
            >
              To
            </label>
            <input
              type='date'
              value={filters.to}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, to: e.target.value }))
              }
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', gap: 20 }}>
          <button onClick={clearFilters} style={btnStyle}>
            Clear
          </button>
          <button onClick={fetchData} style={btnStyle}>
            Search
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ border: '1px solid #ddd' }}>
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid #ddd',
            backgroundColor: '#f9f9f9',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          Records ({data.length})
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
        ) : data.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            No records found
          </div>
        ) : (
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
                    Employee
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
                    In
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '1px solid #ddd',
                    }}
                  >
                    Out
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((r) => {
                  const isEditing = editingId === r._id;

                  return (
                    <tr
                      key={r._id}
                      style={{
                        borderBottom: '1px solid #eee',
                        backgroundColor: isEditing ? '#fffef0' : '#fff',
                      }}
                    >
                      <td style={{ padding: '12px' }}>
                        {isEditing ? (
                          <input
                            value={editForm.name || ''}
                            onChange={(e) =>
                              handleEditChange('name', e.target.value)
                            }
                            style={{ ...inputStyle, width: '120px' }}
                          />
                        ) : (
                          r.name
                        )}
                      </td>

                      <td style={{ padding: '12px' }}>
                        {isEditing ? (
                          <input
                            value={editForm.companyName || ''}
                            onChange={(e) =>
                              handleEditChange('companyName', e.target.value)
                            }
                            style={{ ...inputStyle, width: '120px' }}
                          />
                        ) : (
                          r.companyName
                        )}
                      </td>

                      <td style={{ padding: '12px' }}>
                        {isEditing ? (
                          <input
                            type='time'
                            value={editForm.punchIn || ''}
                            onChange={(e) =>
                              handleEditChange('punchIn', e.target.value)
                            }
                            style={{ ...inputStyle, width: '100px' }}
                          />
                        ) : (
                          r.punchIn
                        )}
                      </td>

                      <td style={{ padding: '12px' }}>
                        {isEditing ? (
                          <input
                            type='time'
                            value={editForm.punchOut || ''}
                            onChange={(e) =>
                              handleEditChange('punchOut', e.target.value)
                            }
                            style={{ ...inputStyle, width: '100px' }}
                          />
                        ) : (
                          r.punchOut
                        )}
                      </td>

                      <td style={{ padding: '12px' }}>{r.totalHours}h</td>

                      <td style={{ padding: '12px' }}>
                        {isEditing ? (
                          <input
                            type='date'
                            value={editForm.date || ''}
                            onChange={(e) =>
                              handleEditChange('date', e.target.value)
                            }
                            style={{ ...inputStyle, width: '130px' }}
                          />
                        ) : (
                          r.date
                        )}
                      </td>

                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {isEditing ? (
                          <div
                            style={{
                              display: 'flex',
                              gap: '6px',
                              justifyContent: 'center',
                            }}
                          >
                            <button onClick={handleSaveEdit} style={btnPrimary}>
                              Save
                            </button>
                            <button onClick={handleCancelEdit} style={btnStyle}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div
                            style={{
                              display: 'flex',
                              gap: '6px',
                              justifyContent: 'center',
                            }}
                          >
                            <button
                              onClick={() => handleEdit(r)}
                              style={btnStyle}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(r._id)}
                              style={btnDanger}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
