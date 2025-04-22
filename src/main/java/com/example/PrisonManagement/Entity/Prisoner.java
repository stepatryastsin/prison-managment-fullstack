package com.example.PrisonManagement.Entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Date;
import java.util.Set;
@Entity
@Table(name = "prisoner")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Prisoner {

    @Id
    @Column(name = "prisoner_id")
    private Integer prisonerId;

    @Column(name = "first_name", nullable = false, length = 15)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 15)
    private String lastName;

    @Column(name = "birth_place", length = 20)
    private String birthPlace;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "occupation", length = 20)
    private String occupation;

    @Column(name = "indictment", length = 50)
    private String indictment;

    @Column(name = "intake_date")
    private LocalDate intakeDate;

    @Column(name = "sentence_end_date")
    private LocalDate sentenceEndDate;

    @ManyToOne
    @JoinColumn(name = "cell_num")
    private Cell cell;

    @ManyToOne
    @JoinColumn(name = "security_level_id")
    private SecurityLevel securityLevel;
}