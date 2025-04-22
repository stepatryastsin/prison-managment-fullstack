package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Entity.Prisoner;
import com.example.PrisonManagement.Repository.BorrowedRepository;
import com.example.PrisonManagement.Repository.PrisonerRepository;
import com.example.PrisonManagement.Service.PrisonerService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PrisonerServiceImpl implements PrisonerService {

    private final PrisonerRepository prisonerRepository;
    private final BorrowedRepository borrowedRepository;

    @Override
    public List<Prisoner> getAllPrisoners() {
        log.info("Получение списка всех заключённых");
        return prisonerRepository.findAll();
    }

    @Override
    public Prisoner findById(Integer id) {
        log.info("Поиск заключённого по id: {}", id);
        return prisonerRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Заключённый с id {} не найден", id);
                    return new EntityNotFoundException("Заключённый с id " + id + " не найден");
                });
    }

    @Override
    public Prisoner createPrisoner(Prisoner prisoner) {
        log.info("Создание заключённого: {}", prisoner);
        return prisonerRepository.save(prisoner);
    }

    @Override
    @Transactional
    public Prisoner updatePrisoner(Integer id, Prisoner prisoner) {
        log.info("Обновление заключённого с id: {}", id);
        return prisonerRepository.findById(id)
                .map(existing -> {
                    existing.setFirstName(prisoner.getFirstName());
                    existing.setLastName(prisoner.getLastName());
                    existing.setBirthPlace(prisoner.getBirthPlace());
                    existing.setDateOfBirth(prisoner.getDateOfBirth());
                    existing.setOccupation(prisoner.getOccupation());
                    existing.setIndictment(prisoner.getIndictment());
                    existing.setIntakeDate(prisoner.getIntakeDate());
                    existing.setSentenceEndDate(prisoner.getSentenceEndDate());
                    existing.setCell(prisoner.getCell());
                    existing.setSecurityLevel(prisoner.getSecurityLevel());
                    Prisoner updated = prisonerRepository.save(existing);
                    log.info("Заключённый с id {} успешно обновлён", id);
                    return updated;
                })
                .orElseThrow(() -> {
                    log.error("Заключённый с id {} не найден для обновления", id);
                    return new EntityNotFoundException("Заключённый с id " + id + " не найден");
                });
    }

    @Override
    @Transactional
    public void deletePrisoner(Integer id) {
        log.info("Удаление заключённого с id: {}", id);
        Prisoner prisoner = prisonerRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Заключённый с id {} не найден для удаления", id);
                    return new EntityNotFoundException("Заключённый с id " + id + " не найден");
                });
        if (borrowedRepository.existsByPrisoner_PrisonerId(prisoner.getPrisonerId())) {
            log.info("Заключённый с id {} имеет связанную книгу(и).", id);
        }

        prisonerRepository.delete(prisoner);
        log.info("Заключённый с id {} успешно удалён", id);
    }

    @Override
    public boolean existsPrisonerInCell(Integer cellId) {
        log.info("Проверка наличия заключённых в камере с номером {}", cellId);
        return prisonerRepository.existsByCell_CellNum(cellId);
    }
}