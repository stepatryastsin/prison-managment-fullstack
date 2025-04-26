package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Entity.Library;
import com.example.PrisonManagement.Service.BorrowedService;
import com.example.PrisonManagement.Service.LibraryService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
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
    public ResponseEntity<List<Library>> getAllLibraries() {
        List<Library> libraries = libraryService.getAllLibrary();
        logger.info("Получено {} записей библиотеки", libraries.size());
        return ResponseEntity.ok(libraries);
    }

    @GetMapping("/{isbn}")
    public ResponseEntity<Library> getLibraryByIsbn(@PathVariable String isbn) {
        Library library = libraryService.getByIsbn(isbn);
        logger.info("Найдена книга с ISBN {}", isbn);
        return ResponseEntity.ok(library);
    }

    @PostMapping
    public ResponseEntity<Library> createLibrary(@RequestBody @Valid Library library) {
        Library createdLibrary = libraryService.createLibrary(library);
        logger.info("Создана новая книга с ISBN {}", createdLibrary.getIsbn());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdLibrary);
    }

    @PutMapping("/{isbn}")
    public ResponseEntity<Library> updateLibrary(
            @PathVariable String isbn,
            @RequestBody @Valid Library library) {
        Library updatedLibrary = libraryService.updateLibrary(isbn, library);
        logger.info("Книга с ISBN {} успешно обновлена", isbn);
        return ResponseEntity.ok(updatedLibrary);
    }

    @DeleteMapping("/{isbn}")
    public ResponseEntity<Void> deleteLibrary(@PathVariable String isbn) {
        if (borrowedService.existsByIsbn(isbn)) {
            logger.warn("Невозможно удалить книгу с ISBN {}: книга заимствована", isbn);
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        libraryService.deleteLibrary(isbn);
        logger.info("Книга с ISBN {} успешно удалена", isbn);
        return ResponseEntity.noContent().build();
    }
}