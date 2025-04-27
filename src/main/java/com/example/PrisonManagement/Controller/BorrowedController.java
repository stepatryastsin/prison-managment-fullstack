package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Model.Borrowed;
import com.example.PrisonManagement.Model.BorrowedKey;
import com.example.PrisonManagement.Model.Library;
import com.example.PrisonManagement.Model.Prisoner;
import com.example.PrisonManagement.Service.BorrowedService;
import com.example.PrisonManagement.Service.PrisonerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/borrowed")
@CrossOrigin(origins = "http://localhost:3000")
public class BorrowedController {

    private final Logger logger = LoggerFactory.getLogger(BorrowedController.class);
    private final BorrowedService borrowedService;


    @Autowired
    public BorrowedController(BorrowedService borrowedService,PrisonerService prisonerService) {
        this.borrowedService = borrowedService;
    }

    @GetMapping
    public ResponseEntity<List<Borrowed>> getAllBorrowed() {
        final List<Borrowed> getAll = borrowedService.getAllBorrowed();

        logger.info("Получено {} книг заключенным ",getAll.size());

        return  ResponseEntity.ok(getAll);
    }

    @GetMapping("/{prisonerId}/{isbn}")
    public ResponseEntity<Borrowed> getBorrowedById(@PathVariable Integer prisonerId,
                                                    @PathVariable String isbn) {
        BorrowedKey key = new BorrowedKey(prisonerId, isbn);

        return borrowedService
                .getBorrowedById(key)
                .map(ResponseEntity::ok)
                .orElseGet(() -> {
                    logger.warn("Книга с ISBN {} у Заключенного с  id {} не найдена", isbn,prisonerId);
                    return ResponseEntity.notFound().build();
                });

    }

    @PostMapping
    public ResponseEntity<Borrowed> createBorrowed(@RequestBody Borrowed borrowed) {
        final Borrowed tempBorrowed =  borrowedService.createBorrowed(borrowed);
        final Prisoner prevPrisoner = borrowedService.getPrisonerByIdFromBorrowed(tempBorrowed.getPrisoner().getPrisonerId());
        final Library prevLibrary  = borrowedService.getLibraryByIdFromBorrowed(tempBorrowed.getLibrary().getIsbn());
        logger.info("Книга c ISBN {} была взята заключенным с id {}",
                prevLibrary, prevPrisoner);

        return new ResponseEntity<>(tempBorrowed,
                             HttpStatus.CREATED);
    }

    @PutMapping("/{prisonerId}/{isbn}")
    public ResponseEntity<Borrowed> updateBorrowed(@PathVariable Integer prisonerId,
                                                   @PathVariable String isbn,
                                                   @RequestBody Borrowed borrowed) {
        BorrowedKey key = new BorrowedKey(prisonerId, isbn);

        final Prisoner prevPrisoner = borrowedService.getPrisonerByIdFromBorrowed(prisonerId);
        final Library prevLibrary  = borrowedService.getLibraryByIdFromBorrowed(isbn);

        Borrowed updated = borrowedService.updateBorrowed(key, borrowed);

        logger.info("Книга c ISBN {} у заключенного с id {} изменилась на ISBN {} и id {} ",
                     prevLibrary,
                     prevPrisoner,
                     updated.getLibrary().getIsbn(),
                     updated.getPrisoner().getPrisonerId());

        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{prisonerId}/{isbn}")
    public ResponseEntity<Void> deleteBorrowed(@PathVariable Integer prisonerId,
                                               @PathVariable String isbn) {
        BorrowedKey key = new BorrowedKey(prisonerId, isbn);

        final Prisoner prevPrisoner = borrowedService.getPrisonerByIdFromBorrowed(prisonerId);
        final Library prevLibrary  = borrowedService.getLibraryByIdFromBorrowed(isbn);

        borrowedService.deleteBorrowed(key);

        logger.info("Книга c {} у заключенного {} была удалена",
                prevPrisoner, prevLibrary);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}