package com.learn.EmployeeManagementSystem.service.serviceImpl;

import com.learn.EmployeeManagementSystem.DTOs.requestDto.LeaveRequest;
import com.learn.EmployeeManagementSystem.DTOs.responseDTO.LeaveResponse;
import com.learn.EmployeeManagementSystem.entity.Employee;
import com.learn.EmployeeManagementSystem.entity.Leave;
import com.learn.EmployeeManagementSystem.entity.LeaveStatus;
import com.learn.EmployeeManagementSystem.repository.EmployeeRepository;
import com.learn.EmployeeManagementSystem.repository.LeaveRepository;
import com.learn.EmployeeManagementSystem.service.LeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveServiceImpl implements LeaveService {

    private final LeaveRepository leaveRepository;
    private final EmployeeRepository employeeRepository;


    // GET ALL LEAVES
    @Override
    public List<LeaveResponse> getAllLeaves() {

        return leaveRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // GET LEAVE BY ID
    @Override
    public LeaveResponse getLeaveById(Long id) {

        Leave leave = leaveRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Leave not found with id: " + id
                        ));

        return mapToResponse(leave);
    }


    // CREATE LEAVE
    @Override
    public LeaveResponse createLeave(LeaveRequest leaveRequest) {

        // Validate dates
        if (leaveRequest.getEndDate()
                .isBefore(leaveRequest.getStartDate())) {

            throw new RuntimeException(
                    "End date cannot be before start date"
            );
        }


        // Find employee
        Long employeeId = leaveRequest.getEmployeeId();

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employee not found with id: "
                                        + employeeId
                        ));


        // Create Leave entity
        Leave leave = new Leave();

        leave.setStartDate(leaveRequest.getStartDate());
        leave.setEndDate(leaveRequest.getEndDate());
        leave.setReason(leaveRequest.getReason());

        // New leave always starts as PENDING
        leave.setStatus(LeaveStatus.PENDING);

        // Set employee relationship
        leave.setEmployee(employee);


        // Save
        Leave savedLeave = leaveRepository.save(leave);


        // Convert entity to response DTO
        return mapToResponse(savedLeave);
    }


    // UPDATE LEAVE
    @Override
    public LeaveResponse updateLeave(
            Long id,
            LeaveRequest leaveRequest) {

        // Find existing leave
        Leave leave = leaveRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Leave not found with id: " + id
                        ));


        // Validate dates
        if (leaveRequest.getEndDate()
                .isBefore(leaveRequest.getStartDate())) {

            throw new RuntimeException(
                    "End date cannot be before start date"
            );
        }


        // Find employee
        Long employeeId = leaveRequest.getEmployeeId();

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employee not found with id: "
                                        + employeeId
                        ));


        // Update fields
        leave.setStartDate(leaveRequest.getStartDate());
        leave.setEndDate(leaveRequest.getEndDate());
        leave.setReason(leaveRequest.getReason());
        leave.setEmployee(employee);


        // Save
        Leave updatedLeave = leaveRepository.save(leave);


        return mapToResponse(updatedLeave);
    }


    // DELETE LEAVE
    @Override
    public void deleteLeave(Long id) {

        Leave leave = leaveRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Leave not found with id: " + id
                        ));

        leaveRepository.delete(leave);
    }


    // ENTITY → RESPONSE DTO
    private LeaveResponse mapToResponse(Leave leave) {

        LeaveResponse response = new LeaveResponse();

        response.setId(leave.getId());
        response.setStartDate(leave.getStartDate());
        response.setEndDate(leave.getEndDate());
        response.setReason(leave.getReason());
        response.setStatus(leave.getStatus());


        if (leave.getEmployee() != null) {

            response.setEmployeeId(
                    leave.getEmployee().getId()
            );

            response.setEmployeeName(
                    leave.getEmployee().getFirstName()
                            + " "
                            + leave.getEmployee().getLastName()
            );
        }

        return response;
    }
    @Override
    public LeaveResponse updateLeaveStatus(Long id, LeaveStatus status) {

        Leave leave = leaveRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Leave not found with id: " + id
                        ));

        leave.setStatus(status);

        Leave updatedLeave = leaveRepository.save(leave);

        return mapToResponse(updatedLeave);
    }
}
