package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Model.Library;
import com.example.PrisonManagement.Service.LibraryService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/libraries")
@CrossOrigin(origins = "http://localhost:3000")
@Validated
public class LibraryController {

    private static final Logger logger = LoggerFactory.getLogger(LibraryController.class);
    private final LibraryService service;

    @Autowired
    public LibraryController(LibraryService service) {
        this.service = service;
        logger.info("LibraryController инициализирован");
    }

    @GetMapping
    public List<Library> getAll() {
        logger.info("Получен запрос GET /api/libraries - получить все библиотеки");
        List<Library> libraries = service.findAll();
        logger.info("Найдено {} библиотек", libraries.size());
        return libraries;
    }

    @GetMapping("/{isbn}")
    public Library getByIsbn(@PathVariable String isbn) {
        logger.info("Получен запрос GET /api/libraries/{} - получить библиотеку по ISBN", isbn);
        Library library = service.findByIsbn(isbn);
        if (library != null) {
            logger.info("Библиотека с ISBN {} найдена", isbn);
        } else {
            logger.warn("Библиотека с ISBN {} не найдена", isbn);
        }
        return library;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Library create(@RequestBody @Valid Library library) {
        logger.info("Получен запрос POST /api/libraries - создать новую библиотеку с данными: {}", library);
        Library created = service.create(library);
        logger.info("Библиотека создана с ISBN {}", created.getIsbn());
        return created;
    }

    @PutMapping("/{isbn}")
    public Library update(@PathVariable String isbn,
                          @RequestBody @Valid Library library) {
        logger.info("Получен запрос PUT /api/libraries/{} - обновить библиотеку", isbn);
        Library updated = service.update(isbn, library);
        logger.info("Библиотека с ISBN {} обновлена", isbn);
        return updated;
    }

    @DeleteMapping("/{isbn}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String isbn) {
        logger.info("Получен запрос DELETE /api/libraries/{} - удалить библиотеку", isbn);
        service.delete(isbn);
        logger.info("Библиотека с ISBN {} удалена", isbn);
    }

    @PostMapping("/{isbn}/pdf")
    public ResponseEntity<Void> uploadPdf(
            @PathVariable String isbn,
            @RequestParam("file") MultipartFile file) throws IOException {

        logger.info("POST /api/libraries/{}/pdf — загрузка PDF", isbn);
        service.storePdf(isbn, file);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    /** Скачивает ранее загруженный PDF */
    @GetMapping("/{isbn}/pdf")
    public ResponseEntity<ByteArrayResource> downloadPdf(@PathVariable String isbn) {
        logger.info("GET /api/libraries/{}/pdf — скачивание PDF", isbn);
        ByteArrayResource resource = service.loadPdf(isbn);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + isbn + ".pdf\"")
                .body(resource);
    }
}
