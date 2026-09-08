package com.learn.EmployeeManagementSystem.repository;

import com.learn.EmployeeManagementSystem.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department,Long>
{

}
