import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
import Loader from '../components/common/Loader';

export const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [notFound, setNotFound] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'Male',
    designation: '',
    joiningDate: '',
    salary: '',
    departmentId: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadEmployeeAndDepartments = async () => {
      setLoading(true);
      try {
        const [emp, depts] = await Promise.all([
          employeeService.getEmployeeById(id),
          departmentService.getAllDepartments().catch(() => []),
        ]);

        setDepartments(depts || []);

        if (emp) {
          setFormData({
            firstName: emp.firstName || '',
            lastName: emp.lastName || '',
            email: emp.email || '',
            phone: emp.phone || '',
            gender: emp.gender || 'Male',
            designation: emp.designation || '',
            joiningDate: emp.joiningDate || '',
            salary: emp.salary !== undefined ? String(emp.salary) : '',
            departmentId: emp.departmentId ? String(emp.departmentId) : (depts[0]?.id ? String(depts[0].id) : ''),
          });
        }
      } catch (err) {
        console.error('Failed to load employee:', err);
        if (err.status === 404 || err.message?.includes('not found')) {
          setNotFound(true);
        } else {
          toastError(err.message || 'Failed to load employee details.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadEmployeeAndDepartments();
  }, [id, toastError]);

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

      const updated = await employeeService.updateEmployee(id, payload);
      success(`Employee ${updated.firstName} ${updated.lastName} updated successfully!`);
      navigate('/employees');
    } catch (err) {
      toastError(err.message || 'Failed to update employee.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader message="Loading employee information..." />;
  }

  if (notFound) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Employee Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">
          The employee with ID #{id} does not exist or has been removed.
        </p>
        <Button variant="primary" onClick={() => navigate('/employees')}>
          Return to Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          to="/employees"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Employee List</span>
        </Link>
      </div>

      <PageHeader
        title={`Edit Employee #${id}`}
        description={`Update employee profile for ${formData.firstName} ${formData.lastName}`}
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <Input
              label="First Name"
              required
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              error={errors.firstName}
            />

            {/* Last Name */}
            <Input
              label="Last Name"
              required
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              error={errors.lastName}
            />

            {/* Email */}
            <Input
              label="Email Address"
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
            />

            {/* Phone */}
            <Input
              label="Phone Number"
              required
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
              value={formData.designation}
              onChange={(e) => handleChange('designation', e.target.value)}
              error={errors.designation}
            />

            {/* Department */}
            <Select
              label="Department"
              required
              value={formData.departmentId}
              onChange={(e) => handleChange('departmentId', e.target.value)}
              options={departments.map((d) => ({ value: String(d.id), label: d.name }))}
              error={errors.departmentId}
            />

            {/* Salary */}
            <Input
              label="Salary (₹/month)"
              type="number"
              step="0.01"
              required
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
            >
              Update Employee
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditEmployee;
