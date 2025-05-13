package com.example.PrisonManagement.Service;

import com.example.PrisonManagement.Model.*;

import java.util.List;
import java.util.Optional;

public interface BorrowedService {
    List<Borrowed> findAll();
    Borrowed findById(BorrowedKey id);
    Borrowed create(Integer prisonerId, String isbn);
    Borrowed update(BorrowedKey id, Integer prisonerId, String isbn);
    void delete(BorrowedKey id);
}