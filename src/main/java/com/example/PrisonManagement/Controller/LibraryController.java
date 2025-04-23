package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Entity.Library;
import com.example.PrisonManagement.Service.BorrowedService;
import com.example.PrisonManagement.Service.LibraryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/libraries")
@CrossOrigin(origins = "http://localhost:3000")

@Slf4j
public class LibraryController {

    private final LibraryService libraryService;
    private final BorrowedService borrowedService;

    public LibraryController(LibraryService libraryService, BorrowedService borrowedService) {
        this.libraryService = libraryService;
        this.borrowedService = borrowedService;
    }

    @GetMapping
    public ResponseEntity<List<Library>> getAllLibraries() {
        List<Library> libraries = libraryService.getAllLibrary();
        log.info("Получено {} записей библиотеки", libraries.size());
        return ResponseEntity.ok(libraries);
    }

    @GetMapping("/{isbn}")
    public ResponseEntity<Library> getLibraryByIsbn(@PathVariable("isbn") BigDecimal isbn) {
        Library library = libraryService.getById(isbn);
        log.info("Найдена книга с ISBN {}", isbn);
        return ResponseEntity.ok(library);
    }

    @PostMapping
    public ResponseEntity<Library> createLibrary( @RequestBody Library library) {
        Library createdLibrary = libraryService.createLibrary(library);
        log.info("Создана новая книга с ISBN {}", createdLibrary.getIsbn());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdLibrary);
    }

    @PutMapping("/{isbn}")
    public ResponseEntity<Library> updateLibrary(@PathVariable("isbn") BigDecimal isbn,
                                                 @RequestBody Library library) {
        Library updatedLibrary = libraryService.updateLibrary(isbn, library);
        log.info("Книга с ISBN {} успешно обновлена", isbn);
        return ResponseEntity.ok(updatedLibrary);
    }

    // Новый метод удаления: сначала проверяем, не заимствована ли книга
    @DeleteMapping("/{isbn}")
    public ResponseEntity<Void> deleteLibrary(@PathVariable("isbn") BigDecimal isbn) {
        if (borrowedService.existsByIsbn(isbn)) {
            log.warn("Невозможно удалить книгу с ISBN {}: книга заимствована", isbn);
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        libraryService.deleteLibrary(isbn);
        log.info("Книга с ISBN {} успешно удалена", isbn);
        return ResponseEntity.noContent().build();
    }
}