package com.learn.EmployeeManagementSystem.service;

import com.learn.EmployeeManagementSystem.DTOs.requestDto.AttendanceRequest;
import com.learn.EmployeeManagementSystem.DTOs.responseDTO.AttendanceResponse;

import java.util.List;

public interface AttendanceService
{
    // Get all attendances
    List<AttendanceResponse> getAllAttendance();

    //Get attendance by Id
    AttendanceResponse getAttendanceById(Long id);

    //Create attendance
    AttendanceResponse createAttendance(AttendanceRequest attendanceRequest);

    //update attendance
    AttendanceResponse updateAttendance(Long id,AttendanceRequest attendanceRequest);

    //Delete attendance
    void deleteAttendance(Long id);

}
