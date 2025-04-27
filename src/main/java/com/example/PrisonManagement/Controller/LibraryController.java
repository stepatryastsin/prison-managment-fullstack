package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Model.Library;
import com.example.PrisonManagement.Service.BorrowedService;
import com.example.PrisonManagement.Service.LibraryService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/libraries")
@CrossOrigin(origins = "http://localhost:3000")
public class LibraryController {

    private final Logger logger = LoggerFactory.getLogger(LibraryController.class);
    private final LibraryService libraryService;
    private final BorrowedService borrowedService;

    @Autowired
    public LibraryController(LibraryService libraryService, BorrowedService borrowedService) {
        this.libraryService = libraryService;
        this.borrowedService = borrowedService;
    }

    @GetMapping
    public List<Library> getAll() {
        List<Library> all = libraryService.findAll();
        logger.info("Получено {} книг", all.size());
        return all;
    }

    @GetMapping("/{isbn}")
    public Library getByIsbn(@PathVariable String isbn) {
        Library lib = libraryService.findByIsbn(isbn);
        logger.info("Найдена книга ISBN={}", isbn);
        return lib;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Library create(@RequestBody @Valid Library library) {
        Library created = libraryService.create(library);
        logger.info("Создана книга ISBN={}", created.getIsbn());
        return created;
    }

    @PutMapping("/{isbn}")
    public Library update(
            @PathVariable String isbn,
            @RequestBody @Valid Library library) {
        Library updated = libraryService.update(isbn, library);
        logger.info("Обновлена книга ISBN={}", isbn);
        return updated;
    }

    @DeleteMapping("/{isbn}")
    public ResponseEntity<Void> delete(@PathVariable String isbn) {
        if (borrowedService.existsByIsbn(isbn)) {
            logger.warn("Нельзя удалить ISBN={} — книга заимствована", isbn);
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        libraryService.delete(isbn);
        logger.info("Удалена книга ISBN={}", isbn);
        return ResponseEntity.noContent().build();
    }
}