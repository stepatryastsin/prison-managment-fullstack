package com.example.PrisonManagement.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;


import java.io.Serializable;
import java.math.BigDecimal;

@Embeddable

public class BorrowedKey implements Serializable {

    @Column(name = "prisoner_id")
    private Integer prisonerId;

    @Column(name = "ISBN", precision = 13, scale = 0)
    private BigDecimal isbn;

    public BorrowedKey(Integer prisonerId, BigDecimal isbn) {
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

    public BigDecimal getIsbn() {
        return isbn;
    }

    public void setIsbn(BigDecimal isbn) {
        this.isbn = isbn;
    }

    @Override
    public String toString() {
        return "BorrowedKey{" +
                "prisonerId=" + prisonerId +
                ", isbn=" + isbn +
                '}';
    }
}