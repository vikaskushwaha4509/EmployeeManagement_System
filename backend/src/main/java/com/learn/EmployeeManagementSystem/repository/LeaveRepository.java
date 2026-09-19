package com.learn.EmployeeManagementSystem.repository;

import com.learn.EmployeeManagementSystem.entity.Leave;
import com.learn.EmployeeManagementSystem.entity.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LeaveRepository extends JpaRepository<Leave,Long>
{
    long countByStatus(LeaveStatus status);
}
