package com.example.PrisonManagement.Model;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.Objects;


@Embeddable
public class PropertiesInCellsKey implements Serializable {

    @NotNull(message = "Prisoner ID is required")
    @Column(name = "prisoner_id", nullable = false)
    private Integer prisonerId;

    @NotBlank
    @Column(name = "name", length = 50, nullable = false)
    private String name;

    public PropertiesInCellsKey() {}

    public PropertiesInCellsKey(Integer prisonerId, String name) {
        this.prisonerId = prisonerId;
        this.name = name;
    }

    public Integer getPrisonerId() {
        return prisonerId;
    }

    public void setPrisonerId(Integer prisonerId) {
        this.prisonerId = prisonerId;
    }


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PropertiesInCellsKey)) return false;
        PropertiesInCellsKey that = (PropertiesInCellsKey) o;
        return Objects.equals(prisonerId, that.prisonerId) &&
                Objects.equals(name, that.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(prisonerId, name);
    }
}