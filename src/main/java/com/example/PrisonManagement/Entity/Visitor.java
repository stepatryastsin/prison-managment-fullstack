package com.example.PrisonManagement.Entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "visitor")

public class Visitor {

    @Id
    @Column(name = "visitor_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer visitorId;

    @Column(name = "first_name", length = 20)
    private String firstName;

    @Column(name = "last_name", length = 20)
    private String lastName;

    @Column(name = "phone_number")
    private Long phoneNumber;

    @Column(name = "relation_to_prisoner", length = 20)
    private String relationToPrisoner;

    @Column(name = "visit_date")
    private LocalDate visitDate;

    public Visitor(Integer visitorId,
                   String firstName,
                   String lastName,
                   Long phoneNumber,
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

    public Long getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(Long phoneNumber) {
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