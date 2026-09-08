package com.learn.EmployeeManagementSystem.controller;

import com.learn.EmployeeManagementSystem.DTOs.requestDto.DepartmentRequest;
import com.learn.EmployeeManagementSystem.DTOs.responseDTO.DepartmentResponse;
import com.learn.EmployeeManagementSystem.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/departments")
@RequiredArgsConstructor
public class DepartmentController
{
    private  final DepartmentService departmentService;

    // Get all departments
    @GetMapping()
    public ResponseEntity<List<DepartmentResponse>> getAllDepartments()
    {
        List<DepartmentResponse> departments=departmentService.getAllDeparments();
        return ResponseEntity.ok(departments);
    }

    // Get department by Id
    @GetMapping("/{id}")
    public ResponseEntity<DepartmentResponse> getDepartmentById(@PathVariable Long id)
    {
        DepartmentResponse department=departmentService.getDepartmentById(id);
        return ResponseEntity.ok(department);
    }

    // Create department
    @PostMapping()
    public ResponseEntity<DepartmentResponse> createDepartment(@RequestBody DepartmentRequest request)
    {
       DepartmentResponse department= departmentService.createDepartment(request);
         return ResponseEntity.status(HttpStatus.CREATED).body(department);
    }

    // Update department
    @PutMapping("/{id}")
    public ResponseEntity<DepartmentResponse> updateDepartment(@PathVariable Long id , @RequestBody DepartmentRequest request)
    {
       DepartmentResponse department=departmentService.updateDepartment(id,request);
       return ResponseEntity.ok(department);
    }

    // delete department
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id )
    {
        departmentService.deletedepartment(id);
        return ResponseEntity.noContent().build();
    }
}
