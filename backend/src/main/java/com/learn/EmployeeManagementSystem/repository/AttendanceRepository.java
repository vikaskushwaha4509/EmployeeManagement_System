package com.learn.EmployeeManagementSystem.repository;

import com.learn.EmployeeManagementSystem.entity.Attendance;
import com.learn.EmployeeManagementSystem.entity.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;

public interface AttendanceRepository extends JpaRepository<Attendance,Long>
{
    long countByAttendanceDateAndStatus(
            LocalDate attendanceDate,
            AttendanceStatus status
    );
}
