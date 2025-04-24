package com.example.PrisonManagement.impl;


import com.example.PrisonManagement.Entity.Cell;
import com.example.PrisonManagement.Repository.CellRepository;
import com.example.PrisonManagement.Repository.PrisonerRepository;
import com.example.PrisonManagement.Service.CellService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


@Service
public class CellServiceImpl implements CellService {

    private final Logger logger =
            LoggerFactory.getLogger(CellServiceImpl.class);

    private final CellRepository cellRepository;
    private final PrisonerRepository prisonerRepository;
    @Autowired
    public CellServiceImpl(CellRepository cellRepository,PrisonerRepository prisonerRepository) {
        this.cellRepository = cellRepository;
        this.prisonerRepository = prisonerRepository;
    }

    @Override
    public List<Cell> getAllCells() {
        logger.info("Получение списка всех камер");
        return cellRepository.findAll();
    }

    @Override
    public Optional<Cell> getCellById(Integer id) {
        logger.info("Получение камеры с id {}", id);
        return Optional.ofNullable(cellRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Камера с id {} не найдена", id);
                    return new EntityNotFoundException("Камера с id " + id + " не найдена");
                }));
    }

    @Override
    @Transactional
    public Cell createCell(Cell cell) {
        logger.info("Создание новой камеры: {}", cell);
        return cellRepository.save(cell);
    }

    @Override
    @Transactional
    public Cell updateCell(Integer id, Cell cell) {
        logger.info("Обновление камеры с id {}", id);
        return cellRepository.findById(id)
                .map(existingCell -> {
                    existingCell.setLastShakedownDate(cell.getLastShakedownDate());
                    Cell updated = cellRepository.save(existingCell);
                    logger.info("Камера с id {} успешно обновлена", id);
                    return updated;
                })
                .orElseThrow(() -> {
                    logger.error("Камера с id {} не найдена для обновления", id);
                    return new EntityNotFoundException("Камера с id " + id + " не найдена");
                });
    }

    @Override
    @Transactional
    public void deleteCell(Integer id) {
        logger.info("Удаление камеры с id {}", id);
        if (!cellRepository.existsById(id)) {
            logger.error("Камера с id {} не найдена для удаления", id);
            throw new EntityNotFoundException("Камера с id " + id + " не найдена");
        }
        cellRepository.deleteById(id);
        logger.info("Камера с id {} успешно удалена", id);
    }

    @Override
    public boolean hasPrisoners(Integer id) {
        return prisonerRepository.existsByCell_CellNum(id);
    }

}
