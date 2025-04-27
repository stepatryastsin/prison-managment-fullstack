package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.Library;
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

    private final LibraryRepository repo;

    @Autowired
    public LibraryServiceImpl(LibraryRepository repo) {
        this.repo = repo;
    }

    @Override
    public List<Library> findAll() {
        return repo.findAll();
    }

    @Override
    public Library findByIsbn(String isbn) {
        return repo.findByIsbn(isbn)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Книга с ISBN " + isbn + " не найдена"));
    }

    @Override
    public Library create(Library library) {
        if (repo.existsByIsbn(library.getIsbn())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Книга с таким ISBN уже существует");
        }
        return repo.save(library);
    }

    @Override
    public Library update(String isbn, Library library) {
        Library existing = findByIsbn(isbn);
        existing.setBookName(library.getBookName());
        existing.setGenre(library.getGenre());
        return repo.save(existing);
    }

    @Override
    public void delete(String isbn) {
        if (!repo.existsByIsbn(isbn)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Книга с ISBN " + isbn + " не найдена");
        }
        repo.deleteByIsbn(isbn);
    }
}