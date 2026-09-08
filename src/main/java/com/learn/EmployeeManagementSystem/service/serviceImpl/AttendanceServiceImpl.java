package com.learn.EmployeeManagementSystem.service.serviceImpl;

import com.learn.EmployeeManagementSystem.DTOs.requestDto.AttendanceRequest;
import com.learn.EmployeeManagementSystem.DTOs.responseDTO.AttendanceResponse;
import com.learn.EmployeeManagementSystem.entity.Attendance;
import com.learn.EmployeeManagementSystem.entity.Employee;
import com.learn.EmployeeManagementSystem.repository.AttendanceRepository;
import com.learn.EmployeeManagementSystem.repository.EmployeeRepository;
import com.learn.EmployeeManagementSystem.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    public List<AttendanceResponse> getAllAttendance() {
       return attendanceRepository.findAll()
               .stream().map(this::response)
               .toList();
    }


    @Override
    public AttendanceResponse getAttendanceById(Long id) {
        Attendance attendance=attendanceRepository.findById(id)
                .orElseThrow
                        (()->new RuntimeException("Attendance not found with id "+id));
        return response(attendance);
    }

    @Override
    public AttendanceResponse createAttendance(AttendanceRequest attendanceRequest)
    {
        Long employeeId=attendanceRequest.getEmployeeId();

        Employee employee=employeeRepository.findById(employeeId)
                .orElseThrow
                        (()->new RuntimeException("Employee not found with id "+employeeId));

        Attendance attendance=new Attendance();
        attendance.setAttendanceDate(attendanceRequest.getAttendanceDate());
        attendance.setStatus(attendanceRequest.getStatus());
        attendance.setCheckInTime(attendanceRequest.getCheckInTime());
        attendance.setCheckOutTime(attendanceRequest.getCheckOutTime());

        attendance.setEmployee(employee);
        Attendance saveAttendance=attendanceRepository.save(attendance);

        return response(saveAttendance);
    }

    @Override
    public AttendanceResponse updateAttendance(Long id, AttendanceRequest attendanceRequest) {
        Attendance attendance=attendanceRepository.findById(id).orElseThrow(()->new RuntimeException("attendance not found with id"+id));
        Long employeeId=attendanceRequest.getEmployeeId();
        Employee employee=employeeRepository.findById(employeeId).orElseThrow(()->new RuntimeException("employee not found with id"+employeeId));
        attendance.setAttendanceDate(attendanceRequest.getAttendanceDate());
        attendance.setStatus(attendanceRequest.getStatus());
        attendance.setCheckInTime(attendanceRequest.getCheckInTime());
        attendance.setCheckOutTime(attendanceRequest.getCheckOutTime());
        attendance.setEmployee(employee);
        Attendance updateAttendance=attendanceRepository.save(attendance);
        return response(updateAttendance);
    }

    @Override
    public void deleteAttendance(Long id)
    {
        Attendance attendance=attendanceRepository.findById(id).orElseThrow(()->new RuntimeException("attendance not found with id"+id));
    attendanceRepository.deleteById(id);
    }


    private AttendanceResponse response(Attendance attendance)
    {
        AttendanceResponse response = new AttendanceResponse();

        response.setId(attendance.getId());
        response.setAttendanceDate(attendance.getAttendanceDate());
        response.setStatus(attendance.getStatus());
        response.setCheckInTime(attendance.getCheckInTime());
        response.setCheckOutTime(attendance.getCheckOutTime());

        if (attendance.getEmployee() != null)
        {
            response.setEmployeeId(attendance.getEmployee().getId());
            response.setEmployeeName(attendance.getEmployee().getFirstName() + " " + attendance.getEmployee().getLastName());
        }
        return response;
    }
}
