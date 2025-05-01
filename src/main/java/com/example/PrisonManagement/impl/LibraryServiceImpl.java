package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.Library;
import com.example.PrisonManagement.Repository.BorrowedRepository;
import com.example.PrisonManagement.Repository.LibraryRepository;
import com.example.PrisonManagement.Service.LibraryService;

import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;


@Service
@Transactional
public class LibraryServiceImpl implements LibraryService {

    private static final Logger logger = LoggerFactory.getLogger(LibraryServiceImpl.class);
    private final LibraryRepository libRepo;
    private final BorrowedRepository borrowedRepo;

    @Autowired
    public LibraryServiceImpl(LibraryRepository libRepo,
                              BorrowedRepository borrowedRepo) {
        this.libRepo = libRepo;
        this.borrowedRepo = borrowedRepo;
        logger.info("LibraryServiceImpl инициализирован");
    }

    @Override
    public List<Library> findAll() {
        logger.info("Запрошен список всех книг");
        List<Library> list = libRepo.findAll();
        logger.info("Найдено {} книг", list.size());
        return list;
    }

    @Override
    public Library findByIsbn(String isbn) {
        logger.info("Запрошена книга с ISBN={}", isbn);
        return libRepo.findByIsbn(isbn)
                .map(library -> {
                    logger.info("Книга с ISBN={} найдена: '{}'", isbn, library.getBookName());
                    return library;
                })
                .orElseThrow(() -> {
                    logger.warn("Книга с ISBN={} не найдена", isbn);
                    return new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Книга c ISBN=" + isbn + " не найдена");
                });
    }

    @Override
    public Library create(Library library) {
        String isbn = library.getIsbn();
        logger.info("Попытка создать книгу с ISBN={}", isbn);
        if (libRepo.existsByIsbn(isbn)) {
            logger.warn("Не удалось создать: книга с ISBN={} уже существует", isbn);
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Книга с ISBN=" + isbn + " уже существует");
        }
        Library saved = libRepo.save(library);
        logger.info("Книга с ISBN={} успешно создана: '{}'", isbn, saved.getBookName());
        return saved;
    }

    @Override
    public Library update(String isbn, Library library) {
        logger.info("Попытка обновить книгу с ISBN={}", isbn);
        Library existing = findByIsbn(isbn);
        existing.setBookName(library.getBookName());
        existing.setGenre(library.getGenre());
        Library updated = libRepo.save(existing);
        logger.info("Книга с ISBN={} успешно обновлена: '{}'", isbn, updated.getBookName());
        return updated;
    }

    @Override
    public void delete(String isbn) {
        logger.info("Попытка удалить книгу с ISBN={}", isbn);
        if (borrowedRepo.existsByIsbn(isbn)) {
            logger.warn("Невозможно удалить книгу с ISBN={}: она сейчас заимствована", isbn);
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Нельзя удалить книгу ISBN=" + isbn + " — она сейчас заимствована");
        }
        if (!libRepo.existsByIsbn(isbn)) {
            logger.warn("Невозможно удалить: книга с ISBN={} не найдена", isbn);
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Книга с ISBN=" + isbn + " не найдена");
        }
        libRepo.deleteByIsbn(isbn);
        logger.info("Книга с ISBN={} успешно удалена", isbn);
    }
}
