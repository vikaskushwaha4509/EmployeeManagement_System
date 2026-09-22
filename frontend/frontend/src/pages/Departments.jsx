import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react';
import departmentService from '../services/departmentService';
import employeeService from '../services/employeeService';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import SearchBar from '../components/common/SearchBar';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import ConfirmDialog from '../components/common/ConfirmDialog';

export const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [deptToDelete, setDeptToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { success, error: toastError } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [deptData, empData] = await Promise.all([
        departmentService.getAllDepartments(),
        employeeService.getAllEmployees().catch(() => []),
      ]);
      setDepartments(deptData || []);
      setEmployees(empData || []);
    } catch (err) {
      console.error('Error loading departments:', err);
      toastError('Failed to load departments from backend.');
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredDepartments = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return departments.filter(
      (d) =>
        (d.name || '').toLowerCase().includes(term) ||
        (d.description || '').toLowerCase().includes(term)
    );
  }, [departments, searchTerm]);

  const handleOpenAddModal = () => {
    setEditingDept(null);
    setFormData({ name: '', description: '' });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEditModal = (dept) => {
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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (editingDept) {
        await departmentService.updateDepartment(editingDept.id, {
          name: formData.name.trim(),
          description: formData.description.trim(),
        });
        success(`Department "${formData.name}" updated successfully.`);
      } else {
        await departmentService.createDepartment({
          name: formData.name.trim(),
          description: formData.description.trim(),
        });
        success(`Department "${formData.name}" created successfully.`);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      toastError(err.message || 'Failed to save department.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deptToDelete) return;
    setDeleting(true);
    try {
      await departmentService.deleteDepartment(deptToDelete.id);
      success(`Department "${deptToDelete.name}" was deleted.`);
      setDeptToDelete(null);
      loadData();
    } catch (err) {
      toastError(err.message || 'Failed to delete department. Please make sure no employees are assigned to it.');
    } finally {
      setDeleting(false);
    }
  };

  const getEmployeeCount = (dept) => {
    return employees.filter(
      (emp) => emp.departmentId === dept.id || emp.departmentName === dept.name
    ).length;
  };

  const columns = [
    {
      header: 'Department Name',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="font-semibold text-slate-800 text-sm">{row.name}</span>
        </div>
      ),
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (row) => (
        <span className="text-sm text-slate-600">{row.description || 'No description provided.'}</span>
      ),
    },
    {
      header: 'Members',
      accessor: 'members',
      render: (row) => {
        const count = getEmployeeCount(row);
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
            {count} {count === 1 ? 'employee' : 'employees'}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleOpenEditModal(row)}
            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeptToDelete(row)}
            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Departments</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Organize and manage company departments
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleOpenAddModal}
        >
          Add Department
        </Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="w-full sm:w-80">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search departments..."
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <Table
          columns={columns}
          data={filteredDepartments}
          loading={loading}
          emptyMessage="No departments found."
        />
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDept ? 'Edit Department' : 'Add New Department'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            label="Department Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Engineering, Sales, HR"
            error={formErrors.name}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of department scope..."
              rows={3}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
            >
              {editingDept ? 'Save Changes' : 'Create Department'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deptToDelete)}
        title="Delete Department"
        message={`Are you sure you want to delete "${deptToDelete?.name}"?`}
        confirmLabel="Delete"
        isDestructive={true}
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeptToDelete(null)}
      />
    </div>
  );
};

export default Departments;
