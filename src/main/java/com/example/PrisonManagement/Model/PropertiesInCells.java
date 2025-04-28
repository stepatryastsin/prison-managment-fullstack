package com.example.PrisonManagement.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;


@Entity
@Table(name = "properties_in_cells")
//ready
public class PropertiesInCells {

    @EmbeddedId
    private PropertiesInCellsKey id;

    @NotBlank(message = "Description is required")
    @Column(name = "description", length = 50, nullable = false)
    private String description;

    @ManyToOne
    @MapsId("prisonerId")
    @JoinColumn(name = "prisoner_id", nullable = false)
    private Prisoner prisoner;

    public PropertiesInCells(String description, Prisoner prisoner) {
        this.id = new PropertiesInCellsKey(prisoner.getPrisonerId());
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

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PropertiesInCells that)) return false;

        return getId().equals(that.getId()) &&
               getDescription().equals(that.getDescription()) &&
               getPrisoner().equals(that.getPrisoner());
    }

    @Override
    public int hashCode() {
        int result = getId().hashCode();
        result = 31 * result + getDescription().hashCode();
        result = 31 * result + getPrisoner().hashCode();
        return result;
    }

    @Override
    public String toString() {
        return "PropertiesInCells{" +
                "id=" + id +
                ", description='" + description + '\'' +
                ", prisoner=" + prisoner +
                '}';
    }
}