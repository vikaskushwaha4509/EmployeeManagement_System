package com.learn.EmployeeManagementSystem.service;

import com.learn.EmployeeManagementSystem.DTOs.requestDto.PayrollRequest;
import com.learn.EmployeeManagementSystem.DTOs.responseDTO.PayrollResponse;

import java.util.List;

public interface PayrollService {

    List<PayrollResponse> getAllPayrolls();

    PayrollResponse getPayrollById(Long id);

    PayrollResponse createPayroll(PayrollRequest payrollRequest);

    PayrollResponse updatePayroll(Long id, PayrollRequest payrollRequest);

    void deletePayroll(Long id);
}