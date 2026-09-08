package com.learn.EmployeeManagementSystem.controller;

import com.learn.EmployeeManagementSystem.DTOs.responseDTO.DashboardResponse;
import com.learn.EmployeeManagementSystem.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/summary")
@RequiredArgsConstructor
public class DashboardController {

//    GET http://localhost:8080/summary?month=August&year=2026
    private final DashboardService dashboardService;


    @GetMapping
    public DashboardResponse getDashboardSummary(
            @RequestParam String month,
            @RequestParam Integer year) {

        return dashboardService.getDashboardSummary(
                month,
                year
        );
    }
}