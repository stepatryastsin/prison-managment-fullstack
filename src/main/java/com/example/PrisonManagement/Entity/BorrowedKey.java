package com.example.PrisonManagement.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;
// ready
@Embeddable
public class BorrowedKey implements Serializable {

    @NotNull(message = "Prisoner is required")
    @Column(name = "prisoner_id", nullable = false)
    private Integer prisonerId;

    @NotBlank(message = "ISBN is required")
    @Pattern(
            regexp = "^(?:97[89])?\\d{9}[\\dX]$",
            message = "Invalid ISBN format"
    )
    @Column(name = "isbn",
            length = 17,
            nullable = false)
    private String isbn;

    public BorrowedKey(Integer prisonerId,
                       String isbn) {
        this.prisonerId = prisonerId;
        this.isbn = isbn;
    }

    public BorrowedKey() {
    }

    public Integer getPrisonerId() {
        return prisonerId;
    }

    public void setPrisonerId(Integer prisonerId) {
        this.prisonerId = prisonerId;
    }

    public String getIsbn() {
        return isbn;
    }

    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof BorrowedKey)) return false;
        BorrowedKey that = (BorrowedKey) o;
        return Objects.equals(prisonerId, that.prisonerId)
                && Objects.equals(isbn, that.isbn);
    }

    @Override
    public int hashCode() {
        return Objects.hash(prisonerId, isbn);
    }
    @Override
    public String toString() {
        return "BorrowedKey{" +
                "prisonerId=" + prisonerId +
                ", isbn=" + isbn +
                '}';
    }
}