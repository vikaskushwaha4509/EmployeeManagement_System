package com.learn.EmployeeManagementSystem.DTOs.responseDTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PayrollResponse {

    private Long id;

    private String month;

    private Integer year;

    private BigDecimal basicSalary;

    private BigDecimal bonus;

    private BigDecimal deduction;

    private BigDecimal netSalary;

    private Long employeeId;

    private String employeeName;
}