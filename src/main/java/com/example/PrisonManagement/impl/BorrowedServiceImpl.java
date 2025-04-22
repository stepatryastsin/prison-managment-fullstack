package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Entity.Borrowed;
import com.example.PrisonManagement.Entity.BorrowedKey;
import com.example.PrisonManagement.Repository.BorrowedRepository;
import com.example.PrisonManagement.Service.BorrowedService;
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
public class BorrowedServiceImpl implements BorrowedService {

    private final BorrowedRepository borrowedRepository;

    @Override
    public List<Borrowed> getAllBorrowed() {
        log.info("Получение всех записей Borrowed");
        return borrowedRepository.findAll();
    }

    @Override
    public Optional<Borrowed> getBorrowedById(BorrowedKey id) {
        log.info("Получение записи Borrowed по id: {}", id);
        return borrowedRepository.findById(id);
    }

    @Override
    @Transactional
    public Borrowed createBorrowed(Borrowed borrowed) {
        log.info("Создание новой записи Borrowed: {}", borrowed);
        return borrowedRepository.save(borrowed);
    }

    @Override
    @Transactional
    public Borrowed updateBorrowed(BorrowedKey id, Borrowed updatedBorrowed) {
        log.info("Обновление записи Borrowed с id: {}", id);
        return borrowedRepository.findById(id)
                .map(borrowed -> {
                    borrowed.setPrisoner(updatedBorrowed.getPrisoner());
                    borrowed.setLibrary(updatedBorrowed.getLibrary());
                    return borrowedRepository.save(borrowed);
                })
                .orElseThrow(() -> {
                    log.error("Запись Borrowed не найдена с ключом {}", id);
                    return new EntityNotFoundException("Запись Borrowed не найдена с ключом " + id);
                });
    }

    @Override
    @Transactional
    public void deleteBorrowed(BorrowedKey id) {
        log.info("Удаление записи Borrowed с id: {}", id);
        if (!borrowedRepository.existsById(id)) {
            log.error("Запись Borrowed не найдена с ключом {}", id);
            throw new EntityNotFoundException("Запись Borrowed не найдена с ключом " + id);
        }
        borrowedRepository.deleteById(id);
    }

    @Override
    public boolean existsByIsbn(BigDecimal isbn) {
        log.info("Проверка наличия записи Borrowed по ISBN: {}", isbn);
        return borrowedRepository.existsByIsbn(isbn);
    }
}