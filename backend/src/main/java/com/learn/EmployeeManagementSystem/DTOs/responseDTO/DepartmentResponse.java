package com.learn.EmployeeManagementSystem.DTOs.responseDTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Component;

@Component
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DepartmentResponse
{
    private long id;
    private String name;
    private String description;
}
