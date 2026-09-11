import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import employeeService from '../services/employeeService';
import departmentService from '../services/departmentService';
import { useToast } from '../context/ToastContext';
import { GENDER_OPTIONS } from '../constants/enums';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';

export const AddEmployee = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'Male',
    designation: '',
    joiningDate: new Date().toISOString().split('T')[0],
    salary: '',
    departmentId: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadDepartments = async () => {
      setLoadingDepts(true);
      try {
        const data = await departmentService.getAllDepartments();
        setDepartments(data || []);
        if (data && data.length > 0) {
          setFormData((prev) => ({ ...prev, departmentId: String(data[0].id) }));
        }
      } catch (err) {
        console.error('Failed to load departments:', err);
        toastError('Failed to load departments list. Please verify backend is running.');
      } finally {
        setLoadingDepts(false);
      }
    };
    loadDepartments();
  }, [toastError]);

  const validate = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required.';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required.';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!formData.phone.trim()) errs.phone = 'Phone number is required.';
    if (!formData.designation.trim()) errs.designation = 'Designation is required.';
    if (!formData.joiningDate) errs.joiningDate = 'Joining date is required.';
    if (formData.salary === '' || formData.salary === null) {
      errs.salary = 'Salary is required.';
    } else if (isNaN(Number(formData.salary)) || Number(formData.salary) < 0) {
      errs.salary = 'Salary must be a positive number.';
    }
    if (!formData.departmentId) errs.departmentId = 'Department selection is required.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        designation: formData.designation.trim(),
        joiningDate: formData.joiningDate,
        salary: Number(formData.salary),
        departmentId: Number(formData.departmentId),
      };

      const response = await employeeService.createEmployee(payload);
      success(`Employee ${response.firstName} ${response.lastName} created successfully!`);
      navigate('/employees');
    } catch (err) {
      toastError(err.message || 'Failed to create employee. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          to="/employees"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Employee List</span>
        </Link>
      </div>

      <PageHeader
        title="Add New Employee"
        description="Register a new employee into the system and assign them to a department"
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <Input
              label="First Name"
              required
              placeholder="e.g. Jane"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              error={errors.firstName}
            />

            {/* Last Name */}
            <Input
              label="Last Name"
              required
              placeholder="e.g. Doe"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              error={errors.lastName}
            />

            {/* Email */}
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="e.g. jane.doe@company.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
            />

            {/* Phone */}
            <Input
              label="Phone Number"
              required
              placeholder="e.g. +1 555-0199"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              error={errors.phone}
            />

            {/* Gender */}
            <Select
              label="Gender"
              required
              value={formData.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              options={GENDER_OPTIONS}
              error={errors.gender}
            />

            {/* Designation */}
            <Input
              label="Designation"
              required
              placeholder="e.g. Senior Software Engineer"
              value={formData.designation}
              onChange={(e) => handleChange('designation', e.target.value)}
              error={errors.designation}
            />

            {/* Department */}
            <div>
              <Select
                label="Department"
                required
                value={formData.departmentId}
                onChange={(e) => handleChange('departmentId', e.target.value)}
                options={departments.map((d) => ({ value: String(d.id), label: d.name }))}
                placeholder={loadingDepts ? 'Loading departments...' : 'Select Department'}
                error={errors.departmentId}
                disabled={loadingDepts || departments.length === 0}
              />
              {departments.length === 0 && !loadingDepts && (
                <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>No departments found. Please create a department first.</span>
                </p>
              )}
            </div>

            {/* Salary */}
            <Input
              label="Salary ($/year)"
              type="number"
              step="0.01"
              required
              placeholder="e.g. 75000"
              value={formData.salary}
              onChange={(e) => handleChange('salary', e.target.value)}
              error={errors.salary}
            />

            {/* Joining Date */}
            <Input
              label="Joining Date"
              type="date"
              required
              value={formData.joiningDate}
              onChange={(e) => handleChange('joiningDate', e.target.value)}
              error={errors.joiningDate}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => navigate('/employees')}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={Save}
              isLoading={submitting}
              disabled={submitting || departments.length === 0}
            >
              Save Employee
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddEmployee;
