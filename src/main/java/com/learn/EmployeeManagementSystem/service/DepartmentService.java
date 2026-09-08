package com.learn.EmployeeManagementSystem.service;

import com.learn.EmployeeManagementSystem.DTOs.requestDto.DepartmentRequest;
import com.learn.EmployeeManagementSystem.DTOs.responseDTO.DepartmentResponse;

import java.util.List;

public interface DepartmentService
{
    // Get all Departments.
    List<DepartmentResponse> getAllDeparments();

    //Get department by Id
    DepartmentResponse getDepartmentById(Long id);

    // Create department
    DepartmentResponse createDepartment(DepartmentRequest departmentRequest);

    // Update department
    DepartmentResponse updateDepartment(Long id, DepartmentRequest departmentRequest);

    // Delete department
    void deletedepartment(Long id);
}
