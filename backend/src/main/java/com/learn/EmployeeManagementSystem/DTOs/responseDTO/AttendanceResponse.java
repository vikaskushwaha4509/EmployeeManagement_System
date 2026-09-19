package com.learn.EmployeeManagementSystem.DTOs.responseDTO;

import com.learn.EmployeeManagementSystem.entity.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AttendanceResponse
{
    private long id;
    private LocalDate attendanceDate;
    private AttendanceStatus status;
    private String checkInTime;
    private String checkOutTime;
    private Long employeeId;
    private String employeeName;
}
