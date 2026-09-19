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

    private BigDecimal allowance;

    private BigDecimal deductions;

    private Long employeeId;

    public BigDecimal getBonus() {
        if (bonus != null) {
            return bonus;
        }
        return allowance != null ? allowance : BigDecimal.ZERO;
    }

    public BigDecimal getDeduction() {
        if (deduction != null) {
            return deduction;
        }
        return deductions != null ? deductions : BigDecimal.ZERO;
    }

    public BigDecimal getBasicSalary() {
        return basicSalary != null ? basicSalary : BigDecimal.ZERO;
    }
}