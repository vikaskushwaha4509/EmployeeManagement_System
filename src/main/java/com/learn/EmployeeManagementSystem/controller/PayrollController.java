package com.learn.EmployeeManagementSystem.controller;

import com.learn.EmployeeManagementSystem.DTOs.requestDto.PayrollRequest;
import com.learn.EmployeeManagementSystem.DTOs.responseDTO.PayrollResponse;
import com.learn.EmployeeManagementSystem.service.PayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payrolls")
@RequiredArgsConstructor
public class PayrollController {


   //PATCH    http://localhost:8080/leaves/1/status?status=APPROVED


    private final PayrollService payrollService;


    // GET /payrolls
    @GetMapping
    public List<PayrollResponse> getAllPayrolls() {

        return payrollService.getAllPayrolls();
    }


    // GET /payrolls/{id}
    @GetMapping("/{id}")
    public PayrollResponse getPayrollById(
            @PathVariable Long id) {

        return payrollService.getPayrollById(id);
    }


    // POST /payrolls
    @PostMapping
    public PayrollResponse createPayroll(
            @RequestBody PayrollRequest payrollRequest) {

        return payrollService.createPayroll(
                payrollRequest
        );
    }


    // PUT /payrolls/{id}
    @PutMapping("/{id}")
    public PayrollResponse updatePayroll(
            @PathVariable Long id,
            @RequestBody PayrollRequest payrollRequest) {

        return payrollService.updatePayroll(
                id,
                payrollRequest
        );
    }


    // DELETE /payrolls/{id}
    @DeleteMapping("/{id}")
    public void deletePayroll(
            @PathVariable Long id) {

        payrollService.deletePayroll(id);
    }
}