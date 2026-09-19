package com.learn.EmployeeManagementSystem.repository;

import com.learn.EmployeeManagementSystem.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;

public interface PayrollRepository extends JpaRepository<Payroll,Long>
{
//    Optional<BigDecimal> findSumOfNetSalaryByMonthAndYear(
//            String month,
//            Integer year
//    );
@Query("""
            SELECT COALESCE(SUM(p.netSalary), 0)
            FROM Payroll p
            WHERE p.month = :month
            AND p.year = :year
            """)
BigDecimal getTotalPayroll(
        @Param("month") String month,
        @Param("year") Integer year
);
}
