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
    public LeaveResponse updateLeaveStatus(
            @PathVariable Long id,
            @RequestParam LeaveStatus status) {

        return leaveService.updateLeaveStatus(id, status);
    }
}