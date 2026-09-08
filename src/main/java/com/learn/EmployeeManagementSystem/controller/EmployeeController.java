package com.learn.EmployeeManagementSystem.controller;

import com.learn.EmployeeManagementSystem.DTOs.requestDto.EmployeeRequest;
import com.learn.EmployeeManagementSystem.DTOs.responseDTO.EmployeeResponse;
import com.learn.EmployeeManagementSystem.service.EmployeeService;
import com.learn.EmployeeManagementSystem.service.serviceImpl.EmployeeServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/employees")
@RequiredArgsConstructor
public class EmployeeController
{
    private final EmployeeService employeeService;

    @GetMapping
    public List<EmployeeResponse> getallEmployees()
    {
        List<EmployeeResponse> employees=employeeService.getAllEmployees();
        return employees;
    }

    @GetMapping("{id}")
    public EmployeeResponse getEmployeeById( @PathVariable Long id)
    {
        return employeeService.getEmployeeById(id);
    }

    @PostMapping
    public EmployeeResponse createEmployee(@RequestBody EmployeeRequest employeeRequest)
    {
         return employeeService.createEmployee(employeeRequest);
    }

    @PutMapping("/{id}")
    public EmployeeResponse updateEmployee(@PathVariable Long id, @RequestBody EmployeeRequest employeeRequest)
    {
          return employeeService.updateEmployee(employeeRequest,id);
    }

    @DeleteMapping("/{id}")
    public void deleteEmployee(@PathVariable Long id )
    {
        employeeService.deleteEmployee(id);
    }
}
