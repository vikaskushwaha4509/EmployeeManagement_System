package com.learn.EmployeeManagementSystem.DTOs.requestDto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LeaveRequest {

    private LocalDate startDate;

    private LocalDate endDate;

    private String reason;

    private Long employeeId;
}