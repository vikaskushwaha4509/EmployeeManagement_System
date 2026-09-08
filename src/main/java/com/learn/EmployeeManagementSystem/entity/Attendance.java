package com.learn.EmployeeManagementSystem.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
public class Attendance
{
    @Id
    @GeneratedValue(strategy =GenerationType.IDENTITY)
    private long id;

    private LocalDate attendanceDate;
    private String checkInTime;
    private String checkOutTime;

    @Enumerated(EnumType.STRING)
    private AttendanceStatus status;

    @ManyToOne()
    private Employee employee;
}
