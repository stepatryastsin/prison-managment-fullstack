package com.example.PrisonManagement.impl;


import com.example.PrisonManagement.Model.Cell;
import com.example.PrisonManagement.Repository.CellRepository;
import com.example.PrisonManagement.Repository.PrisonerRepository;
import com.example.PrisonManagement.Service.CellService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;


@Service
@Transactional
public class CellServiceImpl implements CellService {

    private static final Logger logger = LoggerFactory.getLogger(CellServiceImpl.class);
    private final CellRepository repo;
    private final PrisonerRepository prisonerRepo;

    @Autowired
    public CellServiceImpl(CellRepository repo, PrisonerRepository prisonerRepo) {
        this.repo = repo;
        this.prisonerRepo = prisonerRepo;
        logger.info("CellServiceImpl инициализирован");
    }

    @Override
    public List<Cell> findAll() {
        logger.info("Запрошен список всех камер");
        List<Cell> cells = repo.findAll();
        logger.info("Найдено {} камер", cells.size());
        return cells;
    }

    @Override
    public Cell findById(Integer id) {
        logger.info("Запрошена камера с id={}", id);
        return repo.findById(id)
                .map(cell -> {
                    logger.info("Камера с id={} найдена", id);
                    return cell;
                })
                .orElseThrow(() -> {
                    logger.warn("Камера с id={} не найдена", id);
                    return new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Камера с id=" + id + " не найдена");
                });
    }

    @Override
    public Cell create(Cell cell) {
        Integer id = cell.getCellNum();
        logger.info("Попытка создать камеру с id={}", id);
        if (repo.existsById(id)) {
            logger.warn("Не удалось создать: камера с id={} уже существует", id);
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Камера с id=" + id + " уже существует");
        }
        Cell saved = repo.save(cell);
        logger.info("Камера с id={} успешно создана", saved.getCellNum());
        return saved;
    }

    @Override
    public Cell update(Integer id, Cell cell) {
        logger.info("Попытка обновить камеру с id={}", id);
        Cell existing = findById(id);
        existing.setLastShakedownDate(cell.getLastShakedownDate());
        Cell updated = repo.save(existing);
        logger.info("Камера с id={} успешно обновлена", id);
        return updated;
    }

    @Override
    public void delete(Integer id) {
        logger.info("Попытка удалить камеру с id={}", id);
        if (!repo.existsById(id)) {
            logger.warn("Не удалось удалить: камера с id={} не найдена", id);
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Камера с id=" + id + " не найдена");
        }
        repo.deleteById(id);
        logger.info("Камера с id={} успешно удалена", id);
    }

    @Override
    public boolean hasPrisoners(Integer id) {
        logger.info("Проверка наличия заключённых в камере id={}", id);
        boolean result = prisonerRepo.existsByCell_CellNum(id);
        logger.info("В камере id={} {} заключённых", id, result ? "есть" : "нет");
        return result;
    }
}
