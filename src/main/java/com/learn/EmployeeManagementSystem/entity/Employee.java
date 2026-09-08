package com.learn.EmployeeManagementSystem.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "employees")
public class Employee
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    long id;
    String firstName;
    String lastName;
    String email;
    String phone;
    String gender;
    String designation;
    LocalDate joiningDate;
    double salary;
    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    @OneToMany(mappedBy = "employee")
    private List<Attendance> attendance;

    @OneToMany(mappedBy = "employee")
    private List<Leave> leaves;

    @OneToMany(mappedBy = "employee")
    private List<Payroll> payrolls;

}
