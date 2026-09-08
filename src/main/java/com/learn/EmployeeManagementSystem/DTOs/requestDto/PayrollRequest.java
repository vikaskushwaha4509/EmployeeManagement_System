package com.learn.EmployeeManagementSystem.DTOs.requestDto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PayrollRequest {

    private String month;

    private Integer year;

    private BigDecimal basicSalary;

    private BigDecimal bonus;

    private BigDecimal deduction;

    private Long employeeId;
}