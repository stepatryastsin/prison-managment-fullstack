package com.example.PrisonManagement.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;


@Embeddable
public class BorrowedKey implements Serializable {

    @Column(name = "library_id", nullable = false)
    private Long libraryId;

    @Column(name = "prisoner_id", nullable = false)
    private Integer prisonerId;

    public BorrowedKey() {}

    public BorrowedKey(Long libraryId, Integer prisonerId) {
        this.libraryId = libraryId;
        this.prisonerId = prisonerId;
    }

    public Long getLibraryId() {
        return libraryId;
    }

    public void setLibraryId(Long libraryId) {
        this.libraryId = libraryId;
    }

    public Integer getPrisonerId() {
        return prisonerId;
    }

    public void setPrisonerId(Integer prisonerId) {
        this.prisonerId = prisonerId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof BorrowedKey)) return false;
        BorrowedKey that = (BorrowedKey) o;
        return Objects.equals(libraryId, that.libraryId) &&
                Objects.equals(prisonerId, that.prisonerId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(libraryId, prisonerId);
    }

    @Override
    public String toString() {
        return "BorrowedKey{" +
                "libraryId=" + libraryId +
                ", prisonerId=" + prisonerId +
                '}';
    }
}