package com.example.PrisonManagement.Service;

import com.example.PrisonManagement.Model.*;

import java.util.List;
import java.util.Optional;

public interface BorrowedService {

    List<Borrowed> findAll();

    Borrowed findById(BorrowedKey id);

    Prisoner findPrisonerByPrisonerId(Integer prisonerId);

    Library findLibraryByIsbn(String isbn);

    Borrowed create(Borrowed borrowed);

    Borrowed update(BorrowedKey id, Borrowed borrowed);

    void delete(BorrowedKey id);
}