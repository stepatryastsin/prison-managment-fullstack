package com.example.PrisonManagement.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "properties_in_cells")
public class PropertiesInCells {

    @EmbeddedId
    private PropertiesInCellsKey id;

    @Column(name = "description", length = 50)
    private String description;

    @ManyToOne
    @MapsId("prisonerId")
    @JoinColumn(name = "prisoner_id")
    private Prisoner prisoner;

    public PropertiesInCells(PropertiesInCellsKey id, String description, Prisoner prisoner) {
        this.id = id;
        this.description = description;
        this.prisoner = prisoner;
    }

    public PropertiesInCells() {
    }

    public PropertiesInCellsKey getId() {
        return id;
    }

    public void setId(PropertiesInCellsKey id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Prisoner getPrisoner() {
        return prisoner;
    }

    public void setPrisoner(Prisoner prisoner) {
        this.prisoner = prisoner;
    }
}