package com.learn.EmployeeManagementSystem.repository;

import com.learn.EmployeeManagementSystem.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeRepository extends JpaRepository<Employee,Long>
{
}
