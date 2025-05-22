package com.example.PrisonManagement.Controller;


import com.example.PrisonManagement.Model.Borrowed;
import com.example.PrisonManagement.Model.BorrowedKey;
import com.example.PrisonManagement.Model.Library;
import com.example.PrisonManagement.Service.BorrowedService;
import com.example.PrisonManagement.Service.LibraryService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/borrowed")
@CrossOrigin(origins = "http://localhost:3000")
public class BorrowedController {

    private final BorrowedService borrowedService;
    private final LibraryService libraryService;
    private final Logger logger = LoggerFactory.getLogger(BorrowedController.class);

    @Autowired
    public BorrowedController(BorrowedService borrowedService, LibraryService libraryService) {
        this.borrowedService = borrowedService;
        this.libraryService = libraryService;
        logger.info("BorrowedController initialized");
    }

    @GetMapping
    public ResponseEntity<List<Borrowed>> getAll() {
        List<Borrowed> list = borrowedService.findAll();
        return ResponseEntity.ok(list);
    }

    /** GET /api/borrowed/{prisonerId}/{isbn} — одна запись */
    @GetMapping("/{prisonerId}/{isbn}")
    public ResponseEntity<Borrowed> getById(
            @PathVariable Integer prisonerId,
            @PathVariable String isbn) {
        Library library = libraryService.findByIsbn(isbn);
        if (library == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Library not found");
        }
        BorrowedKey key = new BorrowedKey(library.getInternalId(), prisonerId);
        Borrowed borrowed = borrowedService.findById(key);
        logger.info("Found borrowed record for key={}", key);
        return ResponseEntity.ok(borrowed);
    }

    /** POST /api/borrowed */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Borrowed create(@RequestBody @Valid Map<String, Object> payload) {
        Integer prisonerId;
        String isbn;
        try {
            prisonerId = (Integer) payload.get("prisonerId");
            isbn = (String) payload.get("isbn");
        } catch (ClassCastException | NullPointerException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Request body must contain integer prisonerId and string isbn"
            );
        }

        logger.info("Creating borrowed: prisonerId={} isbn={}", prisonerId, isbn);
        return borrowedService.create(prisonerId, isbn);
    }

    /** PUT /api/borrowed/{prisonerId}/{isbn} */
    @PutMapping("/{prisonerId}/{isbn}")
    public Borrowed update(
            @PathVariable Integer prisonerId,
            @PathVariable String isbn,
            @RequestBody @Valid Map<String, Object> payload) {
        Integer newPrisonerId;
        String newIsbn;
        try {
            newPrisonerId = (Integer) payload.get("prisonerId");
            newIsbn = (String) payload.get("isbn");
        } catch (ClassCastException | NullPointerException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Request body must contain integer prisonerId and string isbn"
            );
        }

        Library library = libraryService.findByIsbn(isbn);
        if (library == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Library not found");
        }

        BorrowedKey key = new BorrowedKey(library.getInternalId(), prisonerId);
        Borrowed updated = borrowedService.update(key, newPrisonerId, newIsbn);
        logger.info("Updated borrowed record: {} -> prisonerId={}, isbn={}", key, newPrisonerId, newIsbn);
        return updated;
    }

    /** DELETE /api/borrowed/{prisonerId}/{isbn} */
    @DeleteMapping("/{prisonerId}/{isbn}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Integer prisonerId,
            @PathVariable String isbn) {
        Library library = libraryService.findByIsbn(isbn);
        if (library == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Library not found");
        }
        BorrowedKey key = new BorrowedKey(library.getInternalId(), prisonerId);
        borrowedService.delete(key);
        logger.info("Deleted borrowed record for key={}", key);
    }
}
