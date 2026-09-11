import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Users,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import departmentService from '../services/departmentService';
import employeeService from '../services/employeeService';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import SearchBar from '../components/common/SearchBar';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Badge from '../components/common/Badge';

export const Departments = () => {
  const { isAdmin } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Delete dialog state
  const [deptToDelete, setDeptToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { success, error: toastError } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [deptData, empData] = await Promise.all([
        departmentService.getAllDepartments(),
        employeeService.getAllEmployees().catch(() => []),
      ]);
      setDepartments(deptData || []);
      setEmployees(empData || []);
    } catch (err) {
      console.error('Error loading departments:', err);
      setError(err.message || 'Failed to load departments from backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute employee count per department
  const employeeCountMap = useMemo(() => {
    const counts = {};
    employees.forEach((emp) => {
      const dId = emp.departmentId;
      if (dId) {
        counts[dId] = (counts[dId] || 0) + 1;
      }
    });
    return counts;
  }, [employees]);

  // Search filter
  const filteredDepartments = useMemo(() => {
    return departments.filter((d) => {
      const term = searchTerm.toLowerCase();
      return (
        (d.name || '').toLowerCase().includes(term) ||
        (d.description || '').toLowerCase().includes(term)
      );
    });
  }, [departments, searchTerm]);

  const handleOpenAddModal = () => {
    if (!isAdmin) {
      toastError('Only administrators can add departments.');
      return;
    }
    setEditingDept(null);
    setFormData({ name: '', description: '' });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEditModal = (dept) => {
    if (!isAdmin) {
      toastError('Only administrators can modify departments.');
      return;
    }
    setEditingDept(dept);
    setFormData({ name: dept.name || '', description: dept.description || '' });
    setFormErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Department name is required.';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (editingDept) {
        await departmentService.updateDepartment(editingDept.id, formData);
        success(`Department '${formData.name}' updated successfully.`);
      } else {
        await departmentService.createDepartment(formData);
        success(`Department '${formData.name}' created successfully.`);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      toastError(err.message || 'Operation failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deptToDelete) return;
    if (!isAdmin) {
      toastError('Only administrators can delete departments.');
      setDeptToDelete(null);
      return;
    }

    setDeleting(true);
    try {
      await departmentService.deleteDepartment(deptToDelete.id);
      success(`Department '${deptToDelete.name}' deleted successfully.`);
      setDeptToDelete(null);
      loadData();
    } catch (err) {
      toastError(err.message || 'Failed to delete department. Remove assigned employees first.');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Department',
      key: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold text-sm shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white text-xs sm:text-sm">{row.name}</div>
            <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
              {row.description || 'No description provided'}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Headcount',
      key: 'headcount',
      render: (row) => {
        const count = employeeCountMap[row.id] || 0;
        return (
          <Badge variant={count > 0 ? 'emerald' : 'slate'} dot size="sm">
            {count} {count === 1 ? 'Staff Member' : 'Staff Members'}
          </Badge>
        );
      },
    },
    {
      header: 'Actions',
      key: 'actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {isAdmin ? (
            <>
              <button
                onClick={() => handleOpenEditModal(row)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/15 transition-all"
                title="Edit Department (Admin)"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeptToDelete(row)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-all"
                title="Delete Department (Admin)"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <span className="text-[11px] text-slate-500 italic">Admin Protected</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 select-none font-sans">
      <PageHeader
        title="Departments"
        description="Organize company structural units, assign teams, and maintain department metadata"
        action={
          isAdmin && (
            <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
              New Department
            </Button>
          )
        }
      />

      {/* Search Bar */}
      <div className="bg-slate-900/60 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-white/10 shadow-xl max-w-md">
        <SearchBar
          value={searchTerm}
          onChange={(val) => setSearchTerm(val)}
          placeholder="Search departments..."
        />
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-between text-rose-300 text-xs sm:text-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
          <Button variant="danger" size="sm" onClick={loadData}>
            Retry
          </Button>
        </div>
      )}

      {/* Departments Table */}
      <Table
        columns={columns}
        data={filteredDepartments}
        isLoading={loading}
        emptyMessage="No departments found"
        emptyDescription={
          searchTerm
            ? 'No departments match your search term.'
            : 'No departments have been added yet. Create one to start assigning employees.'
        }
        emptyActionLabel={!searchTerm && isAdmin ? 'Add First Department' : undefined}
        onEmptyAction={handleOpenAddModal}
      />

      {/* Add / Edit Department Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDept ? `Modify Department: ${editingDept.name}` : 'Provision New Department'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Department Name"
            required
            placeholder="e.g. Engineering, Marketing, Operations"
            value={formData.name}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, name: e.target.value }));
              if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: null }));
            }}
            error={formErrors.name}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Provide a functional description of this organizational division..."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm text-white bg-slate-950/80 border border-white/10 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder-slate-500"
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              {editingDept ? 'Update Department' : 'Create Department'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deptToDelete)}
        onClose={() => setDeptToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Organizational Department"
        message={`Are you sure you want to delete '${deptToDelete?.name}'? Employees assigned to this department must be reassigned.`}
        confirmText="Confirm Deletion"
        isLoading={deleting}
      />
    </div>
  );
};

export default Departments;
