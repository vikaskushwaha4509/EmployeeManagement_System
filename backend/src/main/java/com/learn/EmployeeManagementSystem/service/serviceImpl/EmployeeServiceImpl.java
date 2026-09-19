package com.learn.EmployeeManagementSystem.service.serviceImpl;

import com.learn.EmployeeManagementSystem.DTOs.requestDto.EmployeeRequest;
import com.learn.EmployeeManagementSystem.DTOs.responseDTO.EmployeeResponse;
import com.learn.EmployeeManagementSystem.entity.Department;
import com.learn.EmployeeManagementSystem.entity.Employee;
import com.learn.EmployeeManagementSystem.repository.DepartmentRepository;
import com.learn.EmployeeManagementSystem.repository.EmployeeRepository;
import com.learn.EmployeeManagementSystem.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService
{

    private  final EmployeeRepository employeeRepository;
    private final ModelMapper modelMapper;
    private final DepartmentRepository departmentRepository;


    // GetAllEmployees
    @Override
    public List<EmployeeResponse> getAllEmployees()
    {
        return employeeRepository.findAll().stream().
                map(emp->modelMapper.map(emp,EmployeeResponse.class)).toList();
    }


    //GetEmployeeById
    @Override
    public EmployeeResponse getEmployeeById(Long id)
    {
        Employee employee=employeeRepository.findById(id)
                .orElseThrow(()->new RuntimeException("Employee not found with id "));
        //Convert employee entity to EmployeeResponseDTO
        return modelMapper.map(employee,EmployeeResponse.class);
    }


    //CreateNewEmployee
    @Override
    public EmployeeResponse createEmployee(EmployeeRequest employeeRequest)
    {
        //Get department Id from employeeRequestDTO
        Long departmentId=employeeRequest.getDepartmentId();

        // Here find the department with that ID.
        Department department=departmentRepository.
                findById(departmentId)
                .orElseThrow(
                        ()->new RuntimeException
                                ("Department not found with id:"+departmentId));

        //CreateNewEmployee object of employee Entity class.
        Employee employee=new Employee();

        //Set the data in the employee object.
        employee.setFirstName(employeeRequest.getFirstName());
        employee.setLastName(employeeRequest.getLastName());
        employee.setEmail(employeeRequest.getEmail());
        employee.setPhone(employeeRequest.getPhone());
        employee.setGender(employeeRequest.getGender());
        employee.setDesignation(employeeRequest.getDesignation());
        employee.setJoiningDate(employeeRequest.getJoiningDate());
        employee.setSalary(employeeRequest.getSalary());

        //Set the department_entity into the employee_entity.
        employee.setDepartment(department);

        //Here save the employee_entity
       Employee createEmployee=employeeRepository.save(employee);

       //Convert the employee_Entity into the EmployeeResponseDTo and return it .
        return modelMapper.map(createEmployee,EmployeeResponse.class);
    }

    // Update Employee
    @Override
    public EmployeeResponse updateEmployee(EmployeeRequest employeeRequest, Long id)
    {
        // Find the employee with that id .
        Employee employee=employeeRepository
                .findById(id)
                .orElseThrow(()->new RuntimeException
                        ("Employee not found with id :"+id));

        //Find the department with that id .
        Department department=departmentRepository.
                findById(employeeRequest.getDepartmentId())
                .orElseThrow(()->new RuntimeException
                        ("Department not found with this id:"
                                +employeeRequest.getDepartmentId()));


        // Set the updated data into Employee_Entity object.
        employee.setFirstName(employeeRequest.getFirstName());
        employee.setLastName(employeeRequest.getLastName());
        employee.setEmail(employeeRequest.getEmail());
        employee.setPhone(employeeRequest.getPhone());
        employee.setGender(employeeRequest.getGender());
        employee.setDesignation(employeeRequest.getDesignation());
        employee.setJoiningDate(employeeRequest.getJoiningDate());
        employee.setSalary(employeeRequest.getSalary());

        //Set the department_entity into the Employee_entity.
        employee.setDepartment(department);

        //Save the employee_entity.
        Employee updateEmployee=employeeRepository.save(employee);

        //Convert the employee_entity into the EmployeeResponseDTO and return it.
        return modelMapper.map(updateEmployee,EmployeeResponse.class);
    }


    //Delete employee
    @Override
    public void deleteEmployee(Long id)
    {
        //Find employee with that id and when find then delete it .
        Employee employee=employeeRepository
                .findById(id)
                .orElseThrow(()->new RuntimeException
                        ("Employee not found with id :"+id));
        employeeRepository.delete(employee);
    }

    private EmployeeResponse mapToResponse(Employee employee)
    {
        EmployeeResponse response = modelMapper.map(employee, EmployeeResponse.class);
        if (employee.getDepartment() != null)
        {
            response.setDepartmentId(employee.getDepartment().getId());
            response.setDepartmentName(employee.getDepartment().getName());
        }
        return response;
    }
}
