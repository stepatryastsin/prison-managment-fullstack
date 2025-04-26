package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Entity.Library;
import com.example.PrisonManagement.Repository.LibraryRepository;
import com.example.PrisonManagement.Service.LibraryService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;


@Service
public class LibraryServiceImpl implements LibraryService {

    private final LibraryRepository libraryRepository;
    private final Logger logger = LoggerFactory.getLogger(LibraryServiceImpl.class);

    @Autowired
    public LibraryServiceImpl(LibraryRepository libraryRepository) {
        this.libraryRepository = libraryRepository;
    }

    @Override
    public List<Library> getAllLibrary() {
        logger.info("Получение списка всех книг из библиотеки");
        return libraryRepository.findAll();
    }

    @Override
    public Library getByIsbn(String isbn) {
        logger.info("Поиск книги с ISBN {}", isbn);
        return libraryRepository.findByIsbn(isbn)
                .orElseThrow(() -> {
                    logger.error("Книга с ISBN {} не найдена", isbn);
                    return new EntityNotFoundException("Книга с ISBN " + isbn + " не найдена");
                });
    }

    @Override
    public Library createLibrary(Library library) {
        logger.info("Создание новой книги: {}", library);
        return libraryRepository.save(library);
    }

    @Override
    @Transactional
    public Library updateLibrary(String isbn, Library updatedLibrary) {
        logger.info("Обновление книги с ISBN {}", isbn);
        Library existing = libraryRepository.findByIsbn(isbn)
                .orElseThrow(() -> {
                    logger.error("Книга с ISBN {} не найдена для обновления", isbn);
                    return new EntityNotFoundException("Книга с ISBN " + isbn + " не найдена");
                });
        existing.setBookName(updatedLibrary.getBookName());
        existing.setGenre(updatedLibrary.getGenre());
        Library saved = libraryRepository.save(existing);
        logger.info("Книга с ISBN {} успешно обновлена", isbn);
        return saved;
    }

    @Override
    @Transactional
    public void deleteLibrary(String isbn) {
        logger.info("Удаление книги с ISBN {}", isbn);
        if (!libraryRepository.existsByIsbn(isbn)) {
            logger.error("Книга с ISBN {} не найдена для удаления", isbn);
            throw new EntityNotFoundException("Книга с ISBN " + isbn + " не найдена");
        }
        libraryRepository.deleteByIsbn(isbn);
        logger.info("Книга с ISBN {} успешно удалена", isbn);
    }
}
