package com.example.PrisonManagement.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;


@Entity
@Table(name = "security_level")
//ready
public class SecurityLevel {
    @Id
    @Column(name = "security_level_no")
    private Integer securityLevelNo;

    @Column(name = "description", length = 10)
    @Size(min = 1, max = 5,message = "Слишком длинное или короткое название")
    private String description;

    public SecurityLevel(Integer securityLevelNo,
                         String description) {
        this.securityLevelNo = securityLevelNo;
        this.description = description;
    }

    public SecurityLevel() {
    }

    public Integer getSecurityLevelNo() {
        return securityLevelNo;
    }

    public void setSecurityLevelNo(Integer securityLevelNo) {
        this.securityLevelNo = securityLevelNo;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SecurityLevel that)) return false;

        return getSecurityLevelNo().equals(that.getSecurityLevelNo()) &&
                getDescription().equals(that.getDescription());
    }

    @Override
    public int hashCode() {
        int result = getSecurityLevelNo().hashCode();
        result = 31 * result + getDescription().hashCode();
        return result;
    }

    @Override
    public String toString() {
        return "SecurityLevel{" +
                "securityLevelNo=" + securityLevelNo +
                ", description='" + description + '\'' +
                '}';
    }
}