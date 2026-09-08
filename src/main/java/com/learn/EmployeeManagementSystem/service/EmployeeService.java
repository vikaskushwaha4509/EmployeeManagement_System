package com.learn.EmployeeManagementSystem.service;

import com.learn.EmployeeManagementSystem.DTOs.requestDto.EmployeeRequest;
import com.learn.EmployeeManagementSystem.DTOs.responseDTO.EmployeeResponse;

import java.util.List;

public interface EmployeeService
{
    List<EmployeeResponse> getAllEmployees();

    EmployeeResponse getEmployeeById(Long id);

    EmployeeResponse createEmployee(EmployeeRequest employeeRequest);

    EmployeeResponse updateEmployee(EmployeeRequest employeeRequest,Long id);

    void deleteEmployee(Long id );

}
