package com.learn.EmployeeManagementSystem.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@Table(name = "payrolls")
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String  month;

    private Integer year;

    private BigDecimal basicSalary;

    private BigDecimal bonus;

    private BigDecimal deduction;

    private BigDecimal netSalary;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;
}
