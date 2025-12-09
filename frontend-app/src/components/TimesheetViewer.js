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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

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

  // Auto-fetch on mount and when filters change
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
      // fileUrl: record.fileUrl || null,
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

      // Update UI instantly
      setData((prev) =>
        prev.map((item) =>
          item._id === editingId ? { ...item, ...editForm } : item
        )
      );

      setEditingId(null);
      setEditForm({});
      alert('✅ Updated successfully!');
    } catch (error) {
      console.error('Update failed:', error);
      alert('Update failed: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.post(`http://localhost:5000/api/timesheet/delete`, {
        id: deleteId,
      });

      setData((prev) => prev.filter((item) => item._id !== deleteId));
      setShowDeleteModal(false);
      setDeleteId(null);
      alert('🗑️ Deleted successfully!');
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

  // Keep your beautiful styles (unchanged)
  const styles = {
    /* ... all your existing styles ... */
  };

  return (
    <div style={styles.container}>
      {/* Header */}
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

      {/* Filters */}
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

      {/* Table */}
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
                            {' '}
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
                            {' '}
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

      {/* Delete Modal */}
      {showDeleteModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>Warning</div>
            <h3 style={styles.modalTitle}>Confirm Delete</h3>
            <p style={styles.modalText}>This action cannot be undone.</p>
            <div style={styles.modalButtons}>
              <button
                style={{
                  ...styles.actionBtn,
                  ...styles.cancelBtn,
                  padding: '12px 25px',
                }}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                style={{
                  ...styles.actionBtn,
                  ...styles.deleteBtn,
                  padding: '12px 25px',
                }}
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
