package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Entity.Library;
import com.example.PrisonManagement.Repository.LibraryRepository;
import com.example.PrisonManagement.Service.LibraryService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class LibraryServiceImpl implements LibraryService {

    private final LibraryRepository libraryRepository;

    @Override
    public List<Library> getAllLibrary() {
        log.info("Получение списка всех книг из библиотеки");
        return libraryRepository.findAll();
    }

    @Override
    public Library getById(BigDecimal id) {
        log.info("Поиск книги с ISBN {}", id);
        return libraryRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Книга с ISBN {} не найдена", id);
                    return new EntityNotFoundException("Книга с ISBN " + id + " не найдена");
                });
    }

    @Override
    public Library createLibrary(Library library) {
        log.info("Создание новой книги: {}", library);
        return libraryRepository.save(library);
    }

    @Override
    @Transactional
    public Library updateLibrary(BigDecimal id, Library updatedLibrary) {
        log.info("Обновление книги с ISBN {}", id);
        return libraryRepository.findById(id)
                .map(existingLibrary -> {
                    existingLibrary.setBookName(updatedLibrary.getBookName());
                    existingLibrary.setGenre(updatedLibrary.getGenre());
                    Library saved = libraryRepository.save(existingLibrary);
                    log.info("Книга с ISBN {} успешно обновлена", id);
                    return saved;
                })
                .orElseThrow(() -> {
                    log.error("Книга с ISBN {} не найдена для обновления", id);
                    return new EntityNotFoundException("Книга с ISBN " + id + " не найдена");
                });
    }

    @Override
    @Transactional
    public void deleteLibrary(BigDecimal id) {
        log.info("Удаление книги с ISBN {}", id);
        if (!libraryRepository.existsById(id)) {
            log.error("Книга с ISBN {} не найдена для удаления", id);
            throw new EntityNotFoundException("Книга с ISBN " + id + " не найдена");
        }
        libraryRepository.deleteById(id);
        log.info("Книга с ISBN {} успешно удалена", id);
    }
}