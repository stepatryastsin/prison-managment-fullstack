package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Model.Borrowed;
import com.example.PrisonManagement.Model.BorrowedKey;
import com.example.PrisonManagement.Model.Library;
import com.example.PrisonManagement.Model.Prisoner;
import com.example.PrisonManagement.Service.BorrowedService;
import jakarta.validation.Valid;
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

    private final BorrowedService service;
    private final Logger logger = LoggerFactory.getLogger(BorrowedController.class);

    @Autowired
    public BorrowedController(BorrowedService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Borrowed>> getAll() {
        List<Borrowed> borrowedList = service.findAll();
        logger.info("Получен список всех заимствованных книг. Количество записей: {}", borrowedList.size());
        return ResponseEntity.ok(borrowedList);
    }

    @GetMapping("/{prisonerId}/{isbn}")
    public ResponseEntity<Borrowed> getById(@PathVariable Integer prisonerId,
                                            @PathVariable String isbn) {
        BorrowedKey key = new BorrowedKey(prisonerId, isbn);
        Borrowed borrowed = service.findById(key);
        logger.info("Найдена запись: заключённый ID={} взял книгу ISBN={}", prisonerId, isbn);
        return ResponseEntity.ok(borrowed);
    }

    @GetMapping("/prisoner/{prisonerId}")
    public Prisoner getPrisoner(@PathVariable Integer prisonerId) {
        Prisoner prisoner = service.findPrisonerByPrisonerId(prisonerId);
        if (prisoner != null) {
            logger.info("Найден заключённый с ID={}", prisoner.getPrisonerId());
        } else {
            logger.warn("Заключённый с ID={} не найден", prisonerId);
        }
        return prisoner;
    }

    @GetMapping("/library/{isbn}")
    public Library getLibrary(@PathVariable String isbn) {
        Library library = service.findLibraryByIsbn(isbn);
        if (library != null) {
            logger.info("Найдена книга с ISBN={}", library.getIsbn());
        } else {
            logger.warn("Книга с ISBN={} не найдена", isbn);
        }
        return library;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Borrowed create(@RequestBody @Valid Borrowed borrowed) {
        Integer prisonerId = borrowed.getPrisoner().getPrisonerId();
        String isbn = borrowed.getLibrary().getIsbn();
        logger.info("Создана запись: заключённый ID={} взял книгу ISBN={}", prisonerId, isbn);
        return service.create(borrowed);
    }

    @PutMapping("/{prisonerId}/{isbn}")
    public Borrowed update(@PathVariable Integer prisonerId,
                           @PathVariable String isbn,
                           @RequestBody @Valid Borrowed borrowed) {
        logger.info("Обновление записи: заключённый ID={} и книга ISBN={}", prisonerId, isbn);
        return service.update(new BorrowedKey(prisonerId, isbn), borrowed);
    }

    @DeleteMapping("/{prisonerId}/{isbn}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer prisonerId,
                       @PathVariable String isbn) {
        logger.info("Удаление записи: заключённый ID={} вернул книгу ISBN={}", prisonerId, isbn);
        service.delete(new BorrowedKey(prisonerId, isbn));
    }
}