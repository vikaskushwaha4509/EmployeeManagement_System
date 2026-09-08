package com.learn.EmployeeManagementSystem.service.serviceImpl;

import com.learn.EmployeeManagementSystem.DTOs.requestDto.PayrollRequest;
import com.learn.EmployeeManagementSystem.DTOs.responseDTO.PayrollResponse;
import com.learn.EmployeeManagementSystem.entity.Employee;
import com.learn.EmployeeManagementSystem.entity.Payroll;
import com.learn.EmployeeManagementSystem.repository.EmployeeRepository;
import com.learn.EmployeeManagementSystem.repository.PayrollRepository;
import com.learn.EmployeeManagementSystem.service.PayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PayrollServiceImpl implements PayrollService {

    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;


    // GET ALL PAYROLLS
    @Override
    public List<PayrollResponse> getAllPayrolls() {

        return payrollRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // GET PAYROLL BY ID
    @Override
    public PayrollResponse getPayrollById(Long id) {

        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Payroll not found with id: " + id
                        ));

        return mapToResponse(payroll);
    }


    // CREATE PAYROLL
    @Override
    public PayrollResponse createPayroll(
            PayrollRequest payrollRequest) {

        // Find Employee
        Long employeeId = payrollRequest.getEmployeeId();

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employee not found with id: "
                                        + employeeId
                        ));


        // Create Payroll entity
        Payroll payroll = new Payroll();

        payroll.setMonth(payrollRequest.getMonth());

        payroll.setYear(payrollRequest.getYear());

        payroll.setBasicSalary(
                payrollRequest.getBasicSalary()
        );

        payroll.setBonus(
                payrollRequest.getBonus()
        );

        payroll.setDeduction(
                payrollRequest.getDeduction()
        );

        payroll.setEmployee(employee);


        // Calculate Net Salary
        BigDecimal netSalary =
                payrollRequest.getBasicSalary()
                        .add(payrollRequest.getBonus())
                        .subtract(payrollRequest.getDeduction());

        payroll.setNetSalary(netSalary);


        // Save Payroll
        Payroll savedPayroll =
                payrollRepository.save(payroll);


        // Convert Entity to Response DTO
        return mapToResponse(savedPayroll);
    }


    // UPDATE PAYROLL
    @Override
    public PayrollResponse updatePayroll(
            Long id,
            PayrollRequest payrollRequest) {

        // Find existing Payroll
        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Payroll not found with id: " + id
                        ));


        // Find Employee
        Long employeeId = payrollRequest.getEmployeeId();

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employee not found with id: "
                                        + employeeId
                        ));


        // Update fields
        payroll.setMonth(
                payrollRequest.getMonth()
        );

        payroll.setYear(
                payrollRequest.getYear()
        );

        payroll.setBasicSalary(
                payrollRequest.getBasicSalary()
        );

        payroll.setBonus(
                payrollRequest.getBonus()
        );

        payroll.setDeduction(
                payrollRequest.getDeduction()
        );

        payroll.setEmployee(employee);


        // Recalculate Net Salary
        BigDecimal netSalary =
                payrollRequest.getBasicSalary()
                        .add(payrollRequest.getBonus())
                        .subtract(payrollRequest.getDeduction());

        payroll.setNetSalary(netSalary);


        // Save
        Payroll updatedPayroll =
                payrollRepository.save(payroll);


        return mapToResponse(updatedPayroll);
    }


    // DELETE PAYROLL
    @Override
    public void deletePayroll(Long id) {

        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Payroll not found with id: " + id
                        ));

        payrollRepository.delete(payroll);
    }


    // ENTITY → RESPONSE DTO
    private PayrollResponse mapToResponse(
            Payroll payroll) {

        PayrollResponse response =
                new PayrollResponse();

        response.setId(
                payroll.getId()
        );

        response.setMonth(
                payroll.getMonth()
        );

        response.setYear(
                payroll.getYear()
        );

        response.setBasicSalary(
                payroll.getBasicSalary()
        );

        response.setBonus(
                payroll.getBonus()
        );

        response.setDeduction(
                payroll.getDeduction()
        );

        response.setNetSalary(
                payroll.getNetSalary()
        );


        if (payroll.getEmployee() != null) {

            response.setEmployeeId(
                    payroll.getEmployee().getId()
            );

            response.setEmployeeName(
                    payroll.getEmployee().getFirstName()
                            + " "
                            + payroll.getEmployee().getLastName()
            );
        }

        return response;
    }
}
