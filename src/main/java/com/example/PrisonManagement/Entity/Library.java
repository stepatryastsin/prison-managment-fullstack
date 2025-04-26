package com.example.PrisonManagement.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.NaturalId;

@Entity
@Table(name = "library")
public class Library {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long internalId;

    @NaturalId
    @NotBlank(message = "ISBN is required")
    @Pattern(regexp = "^(?:97[89])?\\d{9}[\\dX]$", message = "Invalid ISBN format")
    @Column(name = "ISBN", length = 13, nullable = false, unique = true)
    private String isbn;

    @NotBlank(message = "Book name is required")
    @Size(max = 30, message = "Book name must be up to 30 characters")
    @Column(name = "book_name", length = 30, nullable = false)
    private String bookName;

    @NotBlank(message = "Genre is required")
    @Size(max = 15, message = "Genre must be up to 15 characters")
    @Column(name = "genre", length = 15, nullable = false)
    private String genre;

    // 1. Пустой конструктор для JPA
    public Library() {}

    // 2. Конструктор без internalId (он генерируется БД)
    public Library(String isbn, String bookName, String genre) {
        this.isbn = isbn;
        this.bookName = bookName;
        this.genre = genre;
    }

    // 3. Геттеры/сеттеры
    public Long getInternalId() { return internalId; }
    public String getIsbn()        { return isbn;       }
    public void setIsbn(String isbn)               { this.isbn = isbn; }
    public String getBookName()   { return bookName;   }
    public void setBookName(String bookName)       { this.bookName = bookName; }
    public String getGenre()      { return genre;      }
    public void setGenre(String genre)             { this.genre = genre; }

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Library library)) return false;

        return getInternalId().equals(library.getInternalId()) &&
                getIsbn().equals(library.getIsbn()) &&
                getBookName().equals(library.getBookName()) &&
                getGenre().equals(library.getGenre());
    }

    @Override
    public int hashCode() {
        int result = getInternalId().hashCode();
        result = 31 * result + getIsbn().hashCode();
        result = 31 * result + getBookName().hashCode();
        result = 31 * result + getGenre().hashCode();
        return result;
    }

    // 5. toString
    @Override
    public String toString() {
        return "Library{" +
                "internalId=" + internalId +
                ", isbn='" + isbn + '\'' +
                ", bookName='" + bookName + '\'' +
                ", genre='" + genre + '\'' +
                '}';
    }
}