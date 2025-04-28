package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.Library;
import com.example.PrisonManagement.Repository.BorrowedRepository;
import com.example.PrisonManagement.Repository.LibraryRepository;
import com.example.PrisonManagement.Service.LibraryService;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;


@Service
@Transactional
public class LibraryServiceImpl implements LibraryService {

    private final LibraryRepository libRepo;
    private final BorrowedRepository borrowedRepo;

    @Autowired
    public LibraryServiceImpl(LibraryRepository libRepo,
                              BorrowedRepository borrowedRepo) {
        this.libRepo      = libRepo;
        this.borrowedRepo = borrowedRepo;
    }

    @Override
    public List<Library> findAll() {
        return libRepo.findAll();
    }

    @Override
    public Library findByIsbn(String isbn) {
        return libRepo.findByIsbn(isbn)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Книга c ISBN=" + isbn + " не найдена"
                ));
    }

    @Override
    public Library create(Library library) {
        String isbn = library.getIsbn();
        if (libRepo.existsByIsbn(isbn)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Книга с ISBN=" + isbn + " уже существует"
            );
        }
        return libRepo.save(library);
    }

    @Override
    public Library update(String isbn, Library library) {
        Library existing = findByIsbn(isbn);
        existing.setBookName(library.getBookName());
        existing.setGenre(library.getGenre());
        return libRepo.save(existing);
    }

    @Override
    public void delete(String isbn) {
        if (borrowedRepo.existsByIsbn(isbn)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Нельзя удалить книгу ISBN=" + isbn + " — она сейчас заимствована"
            );
        }
        if (!libRepo.existsByIsbn(isbn)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Книга с ISBN=" + isbn + " не найдена"
            );
        }
        libRepo.deleteByIsbn(isbn);
    }
}