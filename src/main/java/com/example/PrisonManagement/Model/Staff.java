package com.example.PrisonManagement.Model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

@Entity
@Table(name = "staff")
//ready
public class Staff {

    @Id
    @Column(name = "staff_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer staffId;

    @NotBlank(message = "First Name for staff is required")
    @Size(min = 2, max = 20)
    @Column(name = "first_name", length = 20, nullable = false)
    private String firstName;

    @NotBlank(message = "Last Name for staff is required")
    @Size(min = 2, max = 20)
    @Column(name = "last_name", length = 20, nullable = false)
    private String lastName;

    @NotNull(message = "Job is required")
    @ManyToOne
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @NotNull(message = "Salary is required")
    @PositiveOrZero(message = "Salary must be positive or zero")
    @Digits(integer = 6, fraction = 2)
    @Column(
            name = "salary",
            precision = 8,
            scale = 2,
            nullable = false
    )
    private BigDecimal salary;

    public Staff(Integer staffId,
                 String firstName,
                 String lastName,
                 Job job,
                 BigDecimal salary) {
        this.staffId = staffId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.job = job;
        this.salary = salary;
    }

    public Staff() {
    }

    public Integer getStaffId() {
        return staffId;
    }

    public void setStaffId(Integer staffId) {
        this.staffId = staffId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }

    public BigDecimal getSalary() {
        return salary;
    }

    public void setSalary(BigDecimal salary) {
        this.salary = salary;
    }

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Staff staff)) return false;

        return getStaffId().equals(staff.getStaffId()) &&
                getFirstName().equals(staff.getFirstName()) &&
                getLastName().equals(staff.getLastName()) &&
                getJob().equals(staff.getJob()) &&
                getSalary().equals(staff.getSalary());
    }

    @Override
    public int hashCode() {
        int result = getStaffId().hashCode();
        result = 31 * result + getFirstName().hashCode();
        result = 31 * result + getLastName().hashCode();
        result = 31 * result + getJob().hashCode();
        result = 31 * result + getSalary().hashCode();
        return result;
    }

    @Override
    public String toString() {
        return "Staff{" +
                "staffId=" + staffId +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", job=" + job +
                ", salary=" + salary +
                '}';
    }
}