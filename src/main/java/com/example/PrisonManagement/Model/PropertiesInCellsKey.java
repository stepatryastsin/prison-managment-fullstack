package com.example.PrisonManagement.Model;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.Objects;


@Embeddable
//ready
public class PropertiesInCellsKey implements Serializable {

    @NotNull(message = "Prisoner ID is required")
    @Column(name = "prisoner_id", nullable = false)
    private Integer prisonerId;

    public PropertiesInCellsKey(Integer prisonerId) {
        this.prisonerId = prisonerId;
    }

    public PropertiesInCellsKey() {
    }

    public Integer getPrisonerId() {
        return prisonerId;
    }

    public void setPrisonerId(Integer prisonerId) {
        this.prisonerId = prisonerId;
    }

    @Override
    public final boolean equals(Object o) {
        if (!(o instanceof PropertiesInCellsKey that)) return false;

        return Objects.equals(getPrisonerId(), that.getPrisonerId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getPrisonerId());
    }
}