package com.learn.EmployeeManagementSystem.DTOs.requestDto;

import com.learn.EmployeeManagementSystem.entity.AttendanceStatus;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRequest
{
    private LocalDate attendanceDate;
    private AttendanceStatus status;
    private String checkInTime;
    private String checkOutTime;
    private Long employeeId;
}
