export const AttendanceStatus = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  HALF_DAY: 'HALF_DAY',
  LEAVE: 'LEAVE',
};

export const LeaveStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const ATTENDANCE_STATUS_OPTIONS = [
  { value: 'PRESENT', label: 'Present', color: 'emerald' },
  { value: 'ABSENT', label: 'Absent', color: 'rose' },
  { value: 'HALF_DAY', label: 'Half Day', color: 'amber' },
  { value: 'LEAVE', label: 'Leave', color: 'blue' },
];

export const LEAVE_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending', color: 'amber' },
  { value: 'APPROVED', label: 'Approved', color: 'emerald' },
  { value: 'REJECTED', label: 'Rejected', color: 'rose' },
];

export const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
