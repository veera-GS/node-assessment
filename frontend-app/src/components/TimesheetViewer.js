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
  // Removed: showDeleteModal & deleteId

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

  useEffect(() => {
    fetchData();
  }, [filters]);

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
      console.error('Update failed:', error);
      alert('Update failed: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  // New: Simple confirm alert on delete
  const handleDeleteClick = (id) => {
    if (
      window.confirm(
        'Are you sure you want to delete this timesheet record? This action cannot be undone.'
      )
    ) {
      handleConfirmDelete(id);
    }
  };

  const handleConfirmDelete = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/timesheet/delete`, { id });
      setData((prev) => prev.filter((item) => item._id !== id));
      alert('Deleted successfully!');
    } catch (error) {
      console.error('Delete failed:', error);
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

  // Your beautiful styles (exactly the same)
  const styles = {
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '30px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: '#f5f7fa',
      minHeight: '100vh',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
      padding: '20px 30px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '15px',
      boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)',
    },
    title: {
      color: 'white',
      margin: 0,
      fontSize: '28px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    filterCard: {
      backgroundColor: 'white',
      borderRadius: '15px',
      padding: '25px',
      marginBottom: '25px',
      boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
    },
    filterTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    filterGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '20px',
    },
    filterGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: {
      fontSize: '13px',
      fontWeight: '500',
      color: '#666',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    select: {
      padding: '12px 15px',
      borderRadius: '10px',
      border: '2px solid #e1e5eb',
      fontSize: '14px',
      color: '#333',
      backgroundColor: 'white',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      outline: 'none',
    },
    input: {
      padding: '12px 15px',
      borderRadius: '10px',
      border: '2px solid #e1e5eb',
      fontSize: '14px',
      color: '#333',
      transition: 'all 0.3s ease',
      outline: 'none',
    },
    buttonGroup: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
    btnPrimary: {
      padding: '12px 25px',
      borderRadius: '10px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
    },
    btnSecondary: {
      padding: '12px 25px',
      borderRadius: '10px',
      border: '2px solid #e1e5eb',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: 'white',
      color: '#666',
    },
    btnExport: {
      padding: '12px 25px',
      borderRadius: '10px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: '#059669',
      color: 'white',
    },
    tableCard: {
      backgroundColor: 'white',
      borderRadius: '15px',
      overflow: 'hidden',
      boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
    },
    tableHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 25px',
      borderBottom: '1px solid #e1e5eb',
    },
    tableTitle: { fontSize: '18px', fontWeight: '600', color: '#333' },
    recordCount: {
      backgroundColor: '#667eea',
      color: 'white',
      padding: '5px 15px',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: '500',
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: {
      padding: '15px 20px',
      textAlign: 'left',
      backgroundColor: '#f8fafc',
      color: '#666',
      fontWeight: '600',
      fontSize: '13px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      borderBottom: '2px solid #e1e5eb',
    },
    td: {
      padding: '18px 20px',
      borderBottom: '1px solid #f1f5f9',
      color: '#333',
      fontSize: '14px',
    },
    tr: { transition: 'background-color 0.2s ease' },
    editInput: {
      padding: '8px 12px',
      borderRadius: '6px',
      border: '2px solid #667eea',
      fontSize: '14px',
      width: '100%',
      minWidth: '80px',
      outline: 'none',
    },
    actionBtn: {
      padding: '8px 12px',
      borderRadius: '6px',
      border: 'none',
      fontSize: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      marginRight: '8px',
    },
    editBtn: { backgroundColor: '#3b82f6', color: 'white' },
    deleteBtn: { backgroundColor: '#ef4444', color: 'white' },
    saveBtn: { backgroundColor: '#10b981', color: 'white' },
    cancelBtn: { backgroundColor: '#6b7280', color: 'white' },
    emptyState: { textAlign: 'center', padding: '60px 20px', color: '#999' },
    emptyIcon: { fontSize: '60px', marginBottom: '20px' },
    loadingSpinner: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px',
    },
    badge: {
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '500',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Timesheet Management</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={styles.btnExport} onClick={exportCSV}>
            Export CSV
          </button>
          <button style={styles.btnExport} onClick={exportExcel}>
            Export Excel
          </button>
        </div>
      </div>

      <div style={styles.filterCard}>
        <div style={styles.filterTitle}>Filter Records</div>
        <div style={styles.filterGrid}>
          <div style={styles.filterGroup}>
            <label style={styles.label}>Employee Name</label>
            <select
              style={styles.select}
              value={filters.name}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, name: e.target.value }))
              }
            >
              <option value=''>All Employees</option>
              <option value='John'>John</option>
              <option value='David'>David</option>
              <option value='Veera'>Veera</option>
            </select>
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.label}>Company</label>
            <select
              style={styles.select}
              value={filters.companyName}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, companyName: e.target.value }))
              }
            >
              <option value=''>All Companies</option>
              <option value='ABC Pvt Ltd'>ABC Pvt Ltd</option>
              <option value='XYZ Solutions'>XYZ Solutions</option>
            </select>
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.label}>From Date</label>
            <input
              type='date'
              style={styles.input}
              value={filters.from}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, from: e.target.value }))
              }
            />
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.label}>To Date</label>
            <input
              type='date'
              style={styles.input}
              value={filters.to}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, to: e.target.value }))
              }
            />
          </div>
        </div>
        <div style={styles.buttonGroup}>
          <button style={styles.btnSecondary} onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      </div>

      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <span style={styles.tableTitle}>Timesheet Records</span>
          <span style={styles.recordCount}>{data.length} Records</span>
        </div>

        {loading ? (
          <div style={styles.loadingSpinner}>Loading...</div>
        ) : data.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}></div>
            <h3>No Records Found</h3>
            <p>Try adjusting filters</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Employee</th>
                  <th style={styles.th}>Company</th>
                  <th style={styles.th}>Punch In</th>
                  <th style={styles.th}>Punch Out</th>
                  <th style={styles.th}>Total Hours</th>
                  <th style={styles.th}>Date</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r) => {
                  const isEditing = editingId === r._id;

                  return (
                    <tr
                      key={r._id}
                      style={{
                        backgroundColor: isEditing ? '#fef3c7' : 'inherit',
                      }}
                    >
                      <td style={styles.td}>
                        {isEditing ? (
                          <input
                            style={styles.editInput}
                            value={editForm.name || ''}
                            onChange={(e) =>
                              handleEditChange('name', e.target.value)
                            }
                          />
                        ) : (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                            }}
                          >
                            <div
                              style={{
                                width: '35px',
                                height: '35px',
                                borderRadius: '50%',
                                background:
                                  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {r.name?.[0]?.toUpperCase()}
                            </div>
                            {r.name}
                          </div>
                        )}
                      </td>
                      <td style={styles.td}>
                        {isEditing ? (
                          <input
                            style={styles.editInput}
                            value={editForm.companyName || ''}
                            onChange={(e) =>
                              handleEditChange('companyName', e.target.value)
                            }
                          />
                        ) : (
                          <span
                            style={{
                              ...styles.badge,
                              backgroundColor: '#e0e7ff',
                              color: '#4338ca',
                            }}
                          >
                            {r.companyName}
                          </span>
                        )}
                      </td>
                      <td style={styles.td}>
                        {isEditing ? (
                          <input
                            type='time'
                            style={styles.editInput}
                            value={editForm.punchIn || ''}
                            onChange={(e) =>
                              handleEditChange('punchIn', e.target.value)
                            }
                          />
                        ) : (
                          <span style={{ color: '#10b981', fontWeight: '500' }}>
                            {r.punchIn}
                          </span>
                        )}
                      </td>
                      <td style={styles.td}>
                        {isEditing ? (
                          <input
                            type='time'
                            style={styles.editInput}
                            value={editForm.punchOut || ''}
                            onChange={(e) =>
                              handleEditChange('punchOut', e.target.value)
                            }
                          />
                        ) : (
                          <span style={{ color: '#ef4444', fontWeight: '500' }}>
                            {r.punchOut}
                          </span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.badge,
                            backgroundColor:
                              parseFloat(r.totalHours) >= 8
                                ? '#d1fae5'
                                : '#fef3c7',
                            color:
                              parseFloat(r.totalHours) >= 8
                                ? '#065f46'
                                : '#92400e',
                          }}
                        >
                          {r.totalHours}h
                        </span>
                      </td>
                      <td style={styles.td}>
                        {isEditing ? (
                          <input
                            type='date'
                            style={styles.editInput}
                            value={editForm.date || ''}
                            onChange={(e) =>
                              handleEditChange('date', e.target.value)
                            }
                          />
                        ) : (
                          <span>{r.date}</span>
                        )}
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        {isEditing ? (
                          <>
                            <button
                              style={{ ...styles.actionBtn, ...styles.saveBtn }}
                              onClick={handleSaveEdit}
                            >
                              Save
                            </button>
                            <button
                              style={{
                                ...styles.actionBtn,
                                ...styles.cancelBtn,
                              }}
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              style={{ ...styles.actionBtn, ...styles.editBtn }}
                              onClick={() => handleEdit(r)}
                            >
                              Edit
                            </button>
                            <button
                              style={{
                                ...styles.actionBtn,
                                ...styles.deleteBtn,
                              }}
                              onClick={() => handleDeleteClick(r._id)}
                            >
                              Delete
                            </button>
                          </>
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

      {/* DELETE MODAL REMOVED - NOW USING window.confirm() */}
    </div>
  );
}
