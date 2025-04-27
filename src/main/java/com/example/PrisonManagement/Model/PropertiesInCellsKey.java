package com.example.PrisonManagement.Model;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;


@Embeddable
//ready
public class PropertiesInCellsKey implements Serializable {

    @NotNull(message = "Property name is required")
    @Column(name = "property_name", length = 25, nullable = false)
    private String propertyName;

    @NotNull(message = "Prisoner ID is required")
    @Column(name = "prisoner_id", nullable = false)
    private Integer prisonerId;

    public PropertiesInCellsKey(String propertyName, Integer prisonerId) {
        this.propertyName = propertyName;
        this.prisonerId = prisonerId;
    }

    public PropertiesInCellsKey() {
    }

    public String getPropertyName() {
        return propertyName;
    }

    public void setPropertyName(String propertyName) {
        this.propertyName = propertyName;
    }

    public Integer getPrisonerId() {
        return prisonerId;
    }

    public void setPrisonerId(Integer prisonerId) {
        this.prisonerId = prisonerId;
    }

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PropertiesInCellsKey that)) return false;

        return getPropertyName().equals(that.getPropertyName()) &&
                getPrisonerId().equals(that.getPrisonerId());
    }

    @Override
    public int hashCode() {
        int result = getPropertyName().hashCode();
        result = 31 * result + getPrisonerId().hashCode();
        return result;
    }

    @Override
    public String toString() {
        return "PropertiesInCellsKey{" +
                "propertyName='" + propertyName + '\'' +
                ", prisonerId=" + prisonerId +
                '}';
    }
}