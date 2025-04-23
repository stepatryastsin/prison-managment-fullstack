package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Entity.Borrowed;
import com.example.PrisonManagement.Entity.BorrowedKey;
import com.example.PrisonManagement.Repository.BorrowedRepository;
import com.example.PrisonManagement.Service.BorrowedService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;


@Service
public class BorrowedServiceImpl implements BorrowedService {
    private final Logger logger = LoggerFactory.getLogger(BorrowedServiceImpl.class);
    private final BorrowedRepository borrowedRepository;

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
        logger.info("Получение записи Borrowed по id: {}", id);
        return borrowedRepository.findById(id);
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
}