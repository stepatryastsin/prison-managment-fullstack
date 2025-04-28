package com.example.PrisonManagement.Model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

@Entity
@Table(name = "visitor")
//ready
public class Visitor {

    @Id
    @Column(name = "visitor_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer visitorId;

    @NotBlank(message = "First Name is required")
    @Size(min = 2,max = 20, message = "Должно быть больше чем 2 меньше чем 20 символов")
    @Column(name = "first_name", length = 20,nullable = false)
    private String firstName;

    @NotBlank(message = "Last Name is required")
    @Size(min = 2,max = 20, message = "Должно быть больше чем 2 меньше чем 20 символов")
    @Column(name = "last_name", length = 20,nullable = false)
    private String lastName;

    @NotBlank(message = "Phone Number is required")
    @Pattern(regexp = "^\\+?[0-9\\-\\s()]{7,16}$", message = "Invalid phone number")
    @Column(name = "phone_number", length = 16, unique = true, nullable = false)
    private String phoneNumber;

    @NotBlank(message = "Relation is required")
    @Size(max = 20, message = "Должно быть меньше чем 20 символов")
    @Column(name = "relation_to_prisoner", length = 20, nullable = false)
    private String relationToPrisoner;

    @Future
    @Column(name = "visit_date")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate visitDate;

    public Visitor(Integer visitorId,
                   String firstName,
                   String lastName,
                   String phoneNumber,
                   String relationToPrisoner,
                   LocalDate visitDate) {
        this.visitorId = visitorId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phoneNumber = phoneNumber;
        this.relationToPrisoner = relationToPrisoner;
        this.visitDate = visitDate;
    }

    public Visitor() {
    }

    public Integer getVisitorId() {
        return visitorId;
    }

    public void setVisitorId(Integer visitorId) {
        this.visitorId = visitorId;
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

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getRelationToPrisoner() {
        return relationToPrisoner;
    }

    public void setRelationToPrisoner(String relationToPrisoner) {
        this.relationToPrisoner = relationToPrisoner;
    }

    public LocalDate getVisitDate() {
        return visitDate;
    }

    public void setVisitDate(LocalDate visitDate) {
        this.visitDate = visitDate;
    }

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Visitor visitor)) return false;

        return getVisitorId().equals(visitor.getVisitorId()) &&
                getFirstName().equals(visitor.getFirstName()) &&
                getLastName().equals(visitor.getLastName()) &&
                getPhoneNumber().equals(visitor.getPhoneNumber()) &&
                getRelationToPrisoner().equals(visitor.getRelationToPrisoner()) &&
                getVisitDate().equals(visitor.getVisitDate());
    }

    @Override
    public int hashCode() {
        int result = getVisitorId().hashCode();
        result = 31 * result + getFirstName().hashCode();
        result = 31 * result + getLastName().hashCode();
        result = 31 * result + getPhoneNumber().hashCode();
        result = 31 * result + getRelationToPrisoner().hashCode();
        result = 31 * result + getVisitDate().hashCode();
        return result;
    }

    @Override
    public String toString() {
        return "Visitor{" +
                "visitorId=" + visitorId +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", phoneNumber='" + phoneNumber + '\'' +
                ", relationToPrisoner='" + relationToPrisoner + '\'' +
                ", visitDate=" + visitDate +
                '}';
    }
}