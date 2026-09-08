package com.learn.EmployeeManagementSystem.service;

import com.learn.EmployeeManagementSystem.DTOs.requestDto.LeaveRequest;
import com.learn.EmployeeManagementSystem.DTOs.responseDTO.LeaveResponse;
import com.learn.EmployeeManagementSystem.entity.LeaveStatus;

import java.util.List;

public interface LeaveService
{
    List<LeaveResponse> getAllLeaves();

    LeaveResponse getLeaveById(Long id);

    LeaveResponse createLeave(LeaveRequest leaveRequest);

    LeaveResponse updateLeave(Long id, LeaveRequest leaveRequest);

    void deleteLeave(Long id);
    LeaveResponse updateLeaveStatus(Long id, LeaveStatus status);
}
