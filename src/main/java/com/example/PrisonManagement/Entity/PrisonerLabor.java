package com.example.PrisonManagement.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "prisoner_labor")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrisonerLabor {

    @EmbeddedId
    private PrisonerLaborKey id;

    @ManyToOne
    @MapsId("prisonerId")
    @JoinColumn(name = "prisoner_id")
    private Prisoner prisoner;

    @ManyToOne
    @MapsId("staffId")
    @JoinColumn(name = "staff_id")
    private Staff staff;
}