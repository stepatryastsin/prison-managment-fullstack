package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Model.Borrowed;
import com.example.PrisonManagement.Model.BorrowedKey;
import com.example.PrisonManagement.Model.Library;
import com.example.PrisonManagement.Model.Prisoner;
import com.example.PrisonManagement.Service.BorrowedService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/borrowed")
@CrossOrigin(origins = "http://localhost:3000")
public class BorrowedController {

    private final BorrowedService service;

    @Autowired
    public BorrowedController(BorrowedService service) {
        this.service = service;
    }

    @GetMapping
    public List<Borrowed> getAll() {
        return service.findAll();
    }

    @GetMapping("/{prisonerId}/{isbn}")
    public Borrowed getById(@PathVariable Integer prisonerId,
                            @PathVariable String isbn) {
        return service.findById(new BorrowedKey(prisonerId, isbn));
    }

    @GetMapping("/prisoner/{prisonerId}")
    public Prisoner getPrisoner(@PathVariable Integer prisonerId) {
        return service.findPrisonerByPrisonerId(prisonerId);
    }

    @GetMapping("/library/{isbn}")
    public Library getLibrary(@PathVariable String isbn) {
        return service.findLibraryByIsbn(isbn);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Borrowed create(@RequestBody @Valid Borrowed borrowed) {
        return service.create(borrowed);
    }

    @PutMapping("/{prisonerId}/{isbn}")
    public Borrowed update(@PathVariable Integer prisonerId,
                           @PathVariable String isbn,
                           @RequestBody @Valid Borrowed borrowed) {
        return service.update(new BorrowedKey(prisonerId, isbn), borrowed);
    }

    @DeleteMapping("/{prisonerId}/{isbn}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer prisonerId,
                       @PathVariable String isbn) {
        service.delete(new BorrowedKey(prisonerId, isbn));
    }
}