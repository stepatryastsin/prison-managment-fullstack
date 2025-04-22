package com.example.PrisonManagement.impl;


import com.example.PrisonManagement.Entity.Cell;
import com.example.PrisonManagement.Repository.CellRepository;
import com.example.PrisonManagement.Service.CellService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CellServiceImpl implements CellService {

    private final CellRepository cellRepository;

    @Override
    public List<Cell> getAllCells() {
        log.info("Получение списка всех камер");
        return cellRepository.findAll();
    }

    @Override
    public Cell getById(Integer id) {
        log.info("Получение камеры с id {}", id);
        return cellRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Камера с id {} не найдена", id);
                    return new EntityNotFoundException("Камера с id " + id + " не найдена");
                });
    }

    @Override
    @Transactional
    public Cell createCell(Cell cell) {
        log.info("Создание новой камеры: {}", cell);
        return cellRepository.save(cell);
    }

    @Override
    @Transactional
    public Cell updateCell(Integer id, Cell cell) {
        log.info("Обновление камеры с id {}", id);
        return cellRepository.findById(id)
                .map(existingCell -> {
                    existingCell.setLastShakedownDate(cell.getLastShakedownDate());
                    Cell updated = cellRepository.save(existingCell);
                    log.info("Камера с id {} успешно обновлена", id);
                    return updated;
                })
                .orElseThrow(() -> {
                    log.error("Камера с id {} не найдена для обновления", id);
                    return new EntityNotFoundException("Камера с id " + id + " не найдена");
                });
    }

    @Override
    @Transactional
    public void deleteCell(Integer id) {
        log.info("Удаление камеры с id {}", id);
        if (!cellRepository.existsById(id)) {
            log.error("Камера с id {} не найдена для удаления", id);
            throw new EntityNotFoundException("Камера с id " + id + " не найдена");
        }
        cellRepository.deleteById(id);
        log.info("Камера с id {} успешно удалена", id);
    }
}
