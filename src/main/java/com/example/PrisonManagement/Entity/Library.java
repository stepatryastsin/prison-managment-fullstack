package com.example.PrisonManagement.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Set;
@Entity
@Table(name = "library")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Library {

    @Id
    @Column(name = "ISBN", precision = 13, scale = 0)
    private BigDecimal isbn;

    @Column(name = "book_name", length = 30, nullable = false)
    private String bookName;

    @Column(name = "genre", length = 15, nullable = false)
    private String genre;
}