package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Entity.Borrowed;
import com.example.PrisonManagement.Entity.BorrowedKey;
import com.example.PrisonManagement.Service.BorrowedService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/borrowed")
@CrossOrigin(origins = "http://localhost:3000")
public class BorrowedController {
    private final Logger logger = LoggerFactory.getLogger(BorrowedController.class);
    private final BorrowedService borrowedService;

    public BorrowedController(BorrowedService borrowedService) {
        this.borrowedService = borrowedService;
    }

    @GetMapping
    public ResponseEntity<List<Borrowed>> getAllBorrowed() {
        List<Borrowed> borrowedList = borrowedService.getAllBorrowed();
        return new ResponseEntity<>(borrowedList, HttpStatus.OK);
    }

    @GetMapping("/{prisonerId}/{isbn}")
    public ResponseEntity<Borrowed> getBorrowedById(@PathVariable Integer prisonerId,
                                                    @PathVariable BigDecimal isbn) {
        BorrowedKey key = new BorrowedKey(prisonerId, isbn);
        Optional<Borrowed> borrowed = borrowedService.getBorrowedById(key);
        return borrowed.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Borrowed> createBorrowed(@RequestBody Borrowed borrowed) {
        Borrowed created = borrowedService.createBorrowed(borrowed);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{prisonerId}/{isbn}")
    public ResponseEntity<Borrowed> updateBorrowed(@PathVariable Integer prisonerId,
                                                   @PathVariable BigDecimal isbn,
                                                   @RequestBody Borrowed borrowed) {
        BorrowedKey key = new BorrowedKey(prisonerId, isbn);
        Borrowed updated = borrowedService.updateBorrowed(key, borrowed);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{prisonerId}/{isbn}")
    public ResponseEntity<Void> deleteBorrowed(@PathVariable Integer prisonerId,
                                               @PathVariable BigDecimal isbn) {
        BorrowedKey key = new BorrowedKey(prisonerId, isbn);
        borrowedService.deleteBorrowed(key);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}