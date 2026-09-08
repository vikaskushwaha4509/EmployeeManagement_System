package com.learn.EmployeeManagementSystem.service.serviceImpl;

import com.learn.EmployeeManagementSystem.DTOs.requestDto.DepartmentRequest;
import com.learn.EmployeeManagementSystem.DTOs.responseDTO.DepartmentResponse;
import com.learn.EmployeeManagementSystem.entity.Department;
import com.learn.EmployeeManagementSystem.repository.DepartmentRepository;
import com.learn.EmployeeManagementSystem.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService
{
    private final DepartmentRepository departmentRepository;
    private  final ModelMapper modelMapper;

    // Get all Departments
    @Override
    public List<DepartmentResponse> getAllDeparments() {
        return departmentRepository.findAll().stream().
                map(dept-> modelMapper.map(dept,DepartmentResponse.class)).toList();
    }

    //get department By Id
    @Override
    public DepartmentResponse getDepartmentById(Long id) {
        Department department= departmentRepository.findById(id)
                .orElseThrow(()->new RuntimeException("Department not found with this Id"));
        return modelMapper.map(department,DepartmentResponse.class);
    }

    // Create department
    @Override
    public DepartmentResponse createDepartment(DepartmentRequest departmentRequest)
    {
        Department department=modelMapper.map(departmentRequest,Department.class);
        Department saveDepartment=departmentRepository.save(department);
        return modelMapper.map(saveDepartment,DepartmentResponse.class);

    }

    // Update Department
    @Override
    public DepartmentResponse updateDepartment(Long id, DepartmentRequest departmentRequest) {
        Department department=departmentRepository.
                findById(id).orElseThrow(()->new RuntimeException("Department not found with Id"));
    modelMapper.map(departmentRequest,department);
        Department updatedepartment=departmentRepository.save(department);
        return modelMapper.map(updatedepartment,DepartmentResponse.class);
    }

    @Override
    public void deletedepartment(Long id)
    {
        Department department=departmentRepository.
                findById(id).orElseThrow(()->new RuntimeException("Department not found with Id"));
    departmentRepository.delete(department);
    }
}
