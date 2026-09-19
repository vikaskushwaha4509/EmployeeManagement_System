package com.learn.EmployeeManagementSystem.DTOs.responseDTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeResponse
{
    private long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String gender;
    private String designation;
    private LocalDate joiningDate;
    private double salary;
//    private DepartmentResponse departmentResponse;
    private long departmentId;
    private String departmentName;

}
