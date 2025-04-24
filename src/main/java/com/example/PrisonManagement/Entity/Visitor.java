package com.example.PrisonManagement.Entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

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
    @Size(min = 2,max = 20)
    @Column(name = "first_name", length = 20,nullable = false)
    private String firstName;

    @NotBlank(message = "Last Name is required")
    @Size(min = 2,max = 20)
    @Column(name = "first_name", length = 20,nullable = false)
    private String lastName;

    @NotBlank(message = "Phone Number is required")
    @Pattern(regexp = "^\\+?[0-9\\-\\s()]{7,16}$", message = "Invalid phone number")
    @Column(name = "phone_number", length = 16, unique = true, nullable = false)
    private String phoneNumber;

    @NotBlank(message = "Relation is required")
    @Size(max = 20)
    @Column(name = "relation_to_prisoner", length = 20, nullable = false)
    private String relationToPrisoner;

    @PastOrPresent
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
}