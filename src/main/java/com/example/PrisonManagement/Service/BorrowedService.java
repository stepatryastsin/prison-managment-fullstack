package com.example.PrisonManagement.Service;

import com.example.PrisonManagement.Model.Borrowed;
import com.example.PrisonManagement.Model.BorrowedKey;
import com.example.PrisonManagement.Model.Library;
import com.example.PrisonManagement.Model.Prisoner;

import java.util.List;
import java.util.Optional;

public interface BorrowedService {
    List<Borrowed> getAllBorrowed();

    Optional<Borrowed> getBorrowedById(BorrowedKey id);


    Borrowed createBorrowed(Borrowed borrowed);

    Borrowed updateBorrowed(BorrowedKey id, Borrowed updatedBorrowed);

    void deleteBorrowed(BorrowedKey id);

    boolean existsByIsbn(String isbn);

    Prisoner getPrisonerByIdFromBorrowed(Integer id);

    Library  getLibraryByIdFromBorrowed(String isbn);
}
