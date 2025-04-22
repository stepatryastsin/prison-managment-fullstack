package com.example.PrisonManagement.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "visitor")
@Data
@NoArgsConstructor
@AllArgsConstructor
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
}