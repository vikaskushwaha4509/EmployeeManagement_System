package com.learn.EmployeeManagementSystem.controller;

import com.learn.EmployeeManagementSystem.DTOs.requestDto.AttendanceRequest;
import com.learn.EmployeeManagementSystem.DTOs.responseDTO.AttendanceResponse;
import com.learn.EmployeeManagementSystem.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/attendance")
public class AttendanceController
{
    private final AttendanceService attendanceService;

    // Get all attendance
    @GetMapping
    List<AttendanceResponse> getAllAttendance()
    {
        return attendanceService.getAllAttendance();
    }

    //Get attendance by Id
    @GetMapping("/{id}")
    AttendanceResponse getAttendanceById(@PathVariable Long id)
    {
        return attendanceService.getAttendanceById(id);
    }

    // Create attendance
    @PostMapping
    public AttendanceResponse createAttendance(@RequestBody AttendanceRequest attendanceRequest)
    {
        return  attendanceService.createAttendance(attendanceRequest);
    }

    //Update attendance
    @PutMapping("/{id}")
    public  AttendanceResponse updateAttendance(@PathVariable Long id,@RequestBody AttendanceRequest attendanceRequest)
    {
        return attendanceService.updateAttendance(id,attendanceRequest);
    }

    @DeleteMapping("/{id}")
    public void deleteAttendance(@PathVariable Long id)
    {
        attendanceService.deleteAttendance(id);
    }
}
