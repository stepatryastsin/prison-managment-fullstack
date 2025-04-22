package com.example.PrisonManagement.Service;

import com.example.PrisonManagement.Entity.Borrowed;
import com.example.PrisonManagement.Entity.BorrowedKey;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface BorrowedService {
    List<Borrowed> getAllBorrowed();
    Optional<Borrowed> getBorrowedById(BorrowedKey id);
    Borrowed createBorrowed(Borrowed borrowed);
    Borrowed updateBorrowed(BorrowedKey id, Borrowed updatedBorrowed);
    void deleteBorrowed(BorrowedKey id);
    boolean existsByIsbn(BigDecimal isbn);
}
