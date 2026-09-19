package com.learn.EmployeeManagementSystem.DTOs.requestDto;

import com.learn.EmployeeManagementSystem.entity.Department;
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
public class EmployeeRequest
{
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String gender;
    private String designation;
    private LocalDate joiningDate;
    private double salary;
    private Long departmentId;

}
