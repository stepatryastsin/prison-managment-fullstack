package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Entity.Borrowed;
import com.example.PrisonManagement.Entity.BorrowedKey;
import com.example.PrisonManagement.Entity.Library;
import com.example.PrisonManagement.Entity.Prisoner;
import com.example.PrisonManagement.Repository.BorrowedRepository;
import com.example.PrisonManagement.Service.BorrowedService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;


@Service
public class BorrowedServiceImpl implements BorrowedService {
    private final Logger logger = LoggerFactory.getLogger(BorrowedServiceImpl.class);

    private final BorrowedRepository borrowedRepository;

    @Autowired
    public BorrowedServiceImpl(BorrowedRepository borrowedRepository) {
        this.borrowedRepository = borrowedRepository;
    }

    @Override
    public List<Borrowed> getAllBorrowed() {
        logger.info("Получение всех записей Borrowed");
        return borrowedRepository.findAll();
    }

    @Override
    public Optional<Borrowed> getBorrowedById(BorrowedKey id) {
        return borrowedRepository.findById(id)
                .map(borrowed -> {
                    logger.info("Найдено: {}", borrowed);
                    return borrowed;
                });
    }

    @Override
    @Transactional
    public Borrowed createBorrowed(Borrowed borrowed) {
        logger.info("Создание новой записи Borrowed: {}", borrowed);
        return borrowedRepository.save(borrowed);
    }

    @Override
    @Transactional
    public Borrowed updateBorrowed(BorrowedKey id, Borrowed updatedBorrowed) {
        logger.info("Обновление записи Borrowed с id: {}", id);
        return borrowedRepository.findById(id)
                .map(borrowed -> {
                    borrowed.setPrisoner(updatedBorrowed.getPrisoner());
                    borrowed.setLibrary(updatedBorrowed.getLibrary());
                    return borrowedRepository.save(borrowed);
                })
                .orElseThrow(() -> {
                    logger.error("Запись Borrowed не найдена с ключом {}", id);
                    return new EntityNotFoundException("Запись Borrowed не найдена с ключом " + id);
                });
    }

    @Override
    @Transactional
    public void deleteBorrowed(BorrowedKey id) {
        logger.info("Удаление записи Borrowed с id: {}", id);
        if (!borrowedRepository.existsById(id)) {
            logger.error("Запись Borrowed не найдена с ключом {}", id);
            throw new EntityNotFoundException("Запись Borrowed не найдена с ключом " + id);
        }
        borrowedRepository.deleteById(id);
    }

    @Override
    public boolean existsByIsbn(BigDecimal isbn) {
        logger.info("Проверка наличия записи Borrowed по ISBN: {}", isbn);
        return borrowedRepository.existsByIsbn(isbn);
    }

    @Override
    public Prisoner getPrisonerByIdFromBorrowed(Integer id) {
        return borrowedRepository.findPrisonerByPrisonerId(id)
                .orElseThrow(() -> {
                    logger.info("Заключенный с Id {} не найден", id);
                    return new EntityNotFoundException("Prisoner с id=" + id + " не найден");
                });
    }

    @Override
    public Library getLibraryByIdFromBorrowed(BigDecimal isbn) {
        return borrowedRepository.findLibraryByIsbn(isbn)
                .orElseThrow(() -> {
                    logger.info("Книга с ISBN {} не найден", isbn);
                    return new EntityNotFoundException("Prisoner с id=" + isbn + " не найден");
                });
    }
}