package com.learn.EmployeeManagementSystem.controller;

import com.learn.EmployeeManagementSystem.DTOs.requestDto.LeaveRequest;
import com.learn.EmployeeManagementSystem.DTOs.responseDTO.LeaveResponse;
import com.learn.EmployeeManagementSystem.entity.LeaveStatus;
import com.learn.EmployeeManagementSystem.service.LeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;


    // GET /leaves
    @GetMapping
    public List<LeaveResponse> getAllLeaves() {

        return leaveService.getAllLeaves();
    }


    // GET /leaves/{id}
    @GetMapping("/{id}")
    public LeaveResponse getLeaveById(
            @PathVariable Long id) {

        return leaveService.getLeaveById(id);
    }


    // POST /leaves
    @PostMapping
    public LeaveResponse createLeave(
            @RequestBody LeaveRequest leaveRequest) {

        return leaveService.createLeave(leaveRequest);
    }


    // PUT /leaves/{id}
    @PutMapping("/{id}")
    public LeaveResponse updateLeave(
            @PathVariable Long id,
            @RequestBody LeaveRequest leaveRequest) {

        return leaveService.updateLeave(id, leaveRequest);
    }


    // DELETE /leaves/{id}
    @DeleteMapping("/{id}")
    public void deleteLeave(
            @PathVariable Long id) {

        leaveService.deleteLeave(id);
    }
    @PatchMapping("/{id}/status")
    public LeaveResponse updateLeaveStatusPatch(
            @PathVariable Long id,
            @RequestParam(required = false) String status,
            @RequestBody(required = false) LeaveRequest body) {

        String statusStr = status;
        if ((statusStr == null || statusStr.isBlank()) && body != null && body.getStatus() != null) {
            statusStr = body.getStatus().name();
        }

        if (statusStr == null || statusStr.isBlank()) {
            throw new IllegalArgumentException("Status parameter is required");
        }

        LeaveStatus parsedStatus = LeaveStatus.valueOf(statusStr.trim().toUpperCase());
        return leaveService.updateLeaveStatus(id, parsedStatus);
    }

    @PutMapping("/{id}/status")
    public LeaveResponse updateLeaveStatusPut(
            @PathVariable Long id,
            @RequestParam(required = false) String status,
            @RequestBody(required = false) LeaveRequest body) {

        return updateLeaveStatusPatch(id, status, body);
    }
}