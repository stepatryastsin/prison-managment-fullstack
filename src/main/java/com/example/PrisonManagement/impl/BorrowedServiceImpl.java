package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.Borrowed;
import com.example.PrisonManagement.Model.BorrowedKey;
import com.example.PrisonManagement.Model.Library;
import com.example.PrisonManagement.Model.Prisoner;
import com.example.PrisonManagement.Repository.BorrowedRepository;
import com.example.PrisonManagement.Service.BorrowedService;
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
public class BorrowedServiceImpl implements BorrowedService {

    private static final Logger logger = LoggerFactory.getLogger(BorrowedServiceImpl.class);
    private final BorrowedRepository repo;

    @Autowired
    public BorrowedServiceImpl(BorrowedRepository repo) {
        this.repo = repo;
        logger.info("BorrowedServiceImpl инициализирован");
    }

    @Override
    public List<Borrowed> findAll() {
        logger.info("Запрошен список всех записей Borrowed");
        List<Borrowed> list = repo.findAll();
        logger.info("Найдено {} записей Borrowed", list.size());
        return list;
    }

    @Override
    public Borrowed findById(BorrowedKey id) {
        logger.info("Запрошена запись Borrowed с ключом={}", id);
        return repo.findById(id)
                .map(b -> {
                    logger.info("Запись Borrowed с ключом={} найдена", id);
                    return b;
                })
                .orElseThrow(() -> {
                    logger.warn("Запись Borrowed с ключом={} не найдена", id);
                    return new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Запись Borrowed с ключом=" + id + " не найдена");
                });
    }

    @Override
    public Prisoner findPrisonerByPrisonerId(Integer prisonerId) {
        logger.info("Запрошен Prisoner с id={}", prisonerId);
        return repo.findPrisonerByPrisonerId(prisonerId)
                .map(p -> {
                    logger.info("Prisoner с id={} найден", prisonerId);
                    return p;
                })
                .orElseThrow(() -> {
                    logger.warn("Prisoner с id={} не найден", prisonerId);
                    return new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Prisoner с id=" + prisonerId + " не найден");
                });
    }

    @Override
    public Library findLibraryByIsbn(String isbn) {
        logger.info("Запрошена Library с ISBN={}", isbn);
        return repo.findLibraryByIsbn(isbn)
                .map(l -> {
                    logger.info("Library с ISBN={} найдена", isbn);
                    return l;
                })
                .orElseThrow(() -> {
                    logger.warn("Library с ISBN={} не найдена", isbn);
                    return new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Library с ISBN=" + isbn + " не найдена");
                });
    }

    @Override
    public Borrowed create(Borrowed borrowed) {
        BorrowedKey id = borrowed.getId();
        logger.info("Попытка создать запись Borrowed с ключом={}", id);
        if (repo.existsById(id)) {
            logger.warn("Невозможно создать: запись Borrowed с ключом={} уже существует", id);
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Запись Borrowed с ключом=" + id + " уже существует");
        }
        Borrowed saved = repo.save(borrowed);
        logger.info("Запись Borrowed с ключом={} успешно создана", saved.getId());
        return saved;
    }

    @Override
    public Borrowed update(BorrowedKey id, Borrowed borrowed) {
        logger.info("Попытка обновить запись Borrowed с ключом={}", id);
        Borrowed existing = findById(id);
        existing.setPrisoner(borrowed.getPrisoner());
        existing.setLibrary(borrowed.getLibrary());
        Borrowed updated = repo.save(existing);
        logger.info("Запись Borrowed с ключом={} успешно обновлена", id);
        return updated;
    }

    @Override
    public void delete(BorrowedKey id) {
        logger.info("Попытка удалить запись Borrowed с ключом={}", id);
        if (!repo.existsById(id)) {
            logger.warn("Невозможно удалить: запись Borrowed с ключом={} не найдена", id);
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Запись Borrowed с ключом=" + id + " не найдена");
        }
        repo.deleteById(id);
        logger.info("Запись Borrowed с ключом={} успешно удалена", id);
    }
}
