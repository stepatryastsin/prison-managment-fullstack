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
    public Library getById(BigDecimal id) {
        logger.info("Поиск книги с ISBN {}", id);
        return libraryRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Книга с ISBN {} не найдена", id);
                    return new EntityNotFoundException("Книга с ISBN " + id + " не найдена");
                });
    }

    @Override
    public Library createLibrary(Library library) {
        logger.info("Создание новой книги: {}", library);
        return libraryRepository.save(library);
    }

    @Override
    @Transactional
    public Library updateLibrary(BigDecimal id, Library updatedLibrary) {
        logger.info("Обновление книги с ISBN {}", id);
        return libraryRepository.findById(id)
                .map(existingLibrary -> {
                    existingLibrary.setBookName(updatedLibrary.getBookName());
                    existingLibrary.setGenre(updatedLibrary.getGenre());
                    Library saved = libraryRepository.save(existingLibrary);
                    logger.info("Книга с ISBN {} успешно обновлена", id);
                    return saved;
                })
                .orElseThrow(() -> {
                    logger.error("Книга с ISBN {} не найдена для обновления", id);
                    return new EntityNotFoundException("Книга с ISBN " + id + " не найдена");
                });
    }

    @Override
    @Transactional
    public void deleteLibrary(BigDecimal id) {
        logger.info("Удаление книги с ISBN {}", id);
        if (!libraryRepository.existsById(id)) {
            logger.error("Книга с ISBN {} не найдена для удаления", id);
            throw new EntityNotFoundException("Книга с ISBN " + id + " не найдена");
        }
        libraryRepository.deleteById(id);
        logger.info("Книга с ISBN {} успешно удалена", id);
    }
}