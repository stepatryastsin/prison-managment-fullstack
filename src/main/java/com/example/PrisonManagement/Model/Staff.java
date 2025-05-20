package com.example.PrisonManagement.Model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.math.BigDecimal;
import java.util.Objects;

@Entity
@Table(name = "staff")
public class Staff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "staff_id")
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
    @Column(name = "salary", precision = 8, scale = 2, nullable = false)
    private BigDecimal salary;

    @NotBlank(message = "Username is required")
    @Size(max = 50)
    @Column(name = "username", length = 50, nullable = false, unique = true)
    private String username;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @NotBlank(message = "Password is required")
    @Size(min = 60, max = 100)
    @Column(name = "password", length = 100, nullable = false)
    private String password;

    @Column(name = "enabled", nullable = false)
    private boolean enabled = true;

    public Staff() {
        // Default constructor
    }

    public Staff(Integer staffId,
                 String firstName,
                 String lastName,
                 Job job,
                 BigDecimal salary,
                 String username,
                 String password,
                 boolean enabled) {
        this.staffId = staffId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.job = job;
        this.salary = salary;
        this.username = username;
        this.password = password;
        this.enabled = enabled;
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

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String rawPassword) {
        if (!rawPassword.startsWith("$2a$")) {
            this.password = new BCryptPasswordEncoder().encode(rawPassword);
        } else {
            this.password = rawPassword;
        }
    }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Staff)) return false;
        Staff staff = (Staff) o;
        return enabled == staff.enabled &&
                Objects.equals(staffId, staff.staffId) &&
                Objects.equals(username, staff.username);
    }

    @Override
    public int hashCode() {
        return Objects.hash(staffId, username, enabled);
    }

    @Override
    public String toString() {
        return "Staff{" +
                "staffId=" + staffId +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", job=" + (job != null ? job.getJobDescription() : null) +
                ", salary=" + salary +
                ", username='" + username + '\'' +
                ", enabled=" + enabled +
                '}';
    }
}