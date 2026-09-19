package com.learn.EmployeeManagementSystem.service.serviceImpl;

import com.learn.EmployeeManagementSystem.DTOs.responseDTO.DashboardResponse;
import com.learn.EmployeeManagementSystem.entity.AttendanceStatus;
import com.learn.EmployeeManagementSystem.entity.LeaveStatus;
import com.learn.EmployeeManagementSystem.repository.AttendanceRepository;
import com.learn.EmployeeManagementSystem.repository.DepartmentRepository;
import com.learn.EmployeeManagementSystem.repository.EmployeeRepository;
import com.learn.EmployeeManagementSystem.repository.LeaveRepository;
import com.learn.EmployeeManagementSystem.repository.PayrollRepository;
import com.learn.EmployeeManagementSystem.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl
        implements DashboardService {

    private final EmployeeRepository employeeRepository;

    private final DepartmentRepository departmentRepository;

    private final AttendanceRepository attendanceRepository;

    private final LeaveRepository leaveRepository;

    private final PayrollRepository payrollRepository;


    @Override
    public DashboardResponse getDashboardSummary(
            String month,
            Integer year) {

        long totalEmployees =
                employeeRepository.count();

        long totalDepartments =
                departmentRepository.count();

        long presentToday =
                attendanceRepository
                        .countByAttendanceDateAndStatus(
                                LocalDate.now(),
                                AttendanceStatus.PRESENT
                        );

        long pendingLeaveRequests =
                leaveRepository.countByStatus(
                        LeaveStatus.PENDING
                );

        BigDecimal totalPayroll =
                payrollRepository.getTotalPayroll(
                        month,
                        year
                );

        DashboardResponse response =
                new DashboardResponse();

        response.setTotalEmployees(totalEmployees);
        response.setTotalDepartments(totalDepartments);
        response.setPresentToday(presentToday);
        response.setPendingLeaveRequests(pendingLeaveRequests);
        response.setTotalPayroll(totalPayroll);

        return response;
    }
}
