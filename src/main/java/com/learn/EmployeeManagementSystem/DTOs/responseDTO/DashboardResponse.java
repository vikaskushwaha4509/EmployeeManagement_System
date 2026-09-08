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
public class DashboardResponse {

    private long totalEmployees;

    private long totalDepartments;

    private long presentToday;

    private long pendingLeaveRequests;

    private BigDecimal totalPayroll;
}