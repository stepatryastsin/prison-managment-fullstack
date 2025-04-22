package com.example.PrisonManagement.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "properties_in_cells")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertiesInCells {

    @EmbeddedId
    private PropertiesInCellsKey id;

    @Column(name = "description", length = 50)
    private String description;

    @ManyToOne
    @MapsId("prisonerId")
    @JoinColumn(name = "prisoner_id")
    private Prisoner prisoner;
}