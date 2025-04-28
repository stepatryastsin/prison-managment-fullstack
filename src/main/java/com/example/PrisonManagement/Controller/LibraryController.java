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

    private final LibraryService service;

    @Autowired
    public LibraryController(LibraryService service) {
        this.service = service;
    }

    @GetMapping
    public List<Library> getAll() {
        return service.findAll();
    }

    @GetMapping("/{isbn}")
    public Library getByIsbn(@PathVariable String isbn) {
        return service.findByIsbn(isbn);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Library create(@RequestBody @Valid Library library) {
        return service.create(library);
    }

    @PutMapping("/{isbn}")
    public Library update(@PathVariable String isbn,
                          @RequestBody @Valid Library library) {
        return service.update(isbn, library);
    }

    @DeleteMapping("/{isbn}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String isbn) {
        service.delete(isbn);
    }
}