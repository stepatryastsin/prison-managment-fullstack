package com.example.PrisonManagement.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.Type;


@Entity
@Table(name = "properties_in_cells")
public class PropertiesInCells {

    @EmbeddedId
    private PropertiesInCellsKey id;

    @NotBlank(message = "Description is required")
    @Column(name = "name", length = 50, insertable = false, updatable = false)
    private String name;

    @ManyToOne
    @MapsId("prisonerId")
    @JoinColumn(name = "prisoner_id", nullable = false)
    private Prisoner prisoner;

    @Column(name = "model_3d")
    private byte[] model3d;

    public PropertiesInCells(String name, Prisoner prisoner) {
        this.id = new PropertiesInCellsKey(prisoner.getPrisonerId(),name);
        this.name = name;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Prisoner getPrisoner() {
        return prisoner;
    }
    public byte[] getModel3d() {
        return model3d;
    }

    public void setModel3d(byte[] model3d) {
        this.model3d = model3d;
    }
    public void setPrisoner(Prisoner prisoner) {
        this.prisoner = prisoner;
    }

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PropertiesInCells that)) return false;

        return getId().equals(that.getId()) &&
               getName().equals(that.getName()) &&
               getPrisoner().equals(that.getPrisoner());
    }

    @Override
    public int hashCode() {
        int result = getId().hashCode();
        result = 31 * result + getName().hashCode();
        result = 31 * result + getPrisoner().hashCode();
        return result;
    }

    @Override
    public String toString() {
        return "PropertiesInCells{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", prisoner=" + prisoner +
                '}';
    }
}