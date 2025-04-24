package com.example.PrisonManagement.Entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "library")

public class Library {

    @Id
    @Column(name = "ISBN", precision = 13, scale = 0)
    private BigDecimal isbn;

    @Column(name = "book_name", length = 30, nullable = false)
    private String bookName;

    @Column(name = "genre", length = 15, nullable = false)
    private String genre;

    public Library(BigDecimal isbn, String bookName, String genre) {
        this.isbn = isbn;
        this.bookName = bookName;
        this.genre = genre;
    }

    public Library() {
    }

    public BigDecimal getIsbn() {
        return isbn;
    }

    public void setIsbn(BigDecimal isbn) {
        this.isbn = isbn;
    }

    public String getBookName() {
        return bookName;
    }

    public void setBookName(String bookName) {
        this.bookName = bookName;
    }

    public String getGenre() {
        return genre;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    @Override
    public String toString() {
        return "Library{" +
                "isbn=" + isbn +
                ", bookName='" + bookName + '\'' +
                ", genre='" + genre + '\'' +
                '}';
    }
}