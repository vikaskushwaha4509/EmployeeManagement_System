package com.learn.EmployeeManagementSystem.service;

import com.learn.EmployeeManagementSystem.DTOs.responseDTO.DashboardResponse;

public interface DashboardService {

    DashboardResponse getDashboardSummary(  String month,
                                            Integer year);
}