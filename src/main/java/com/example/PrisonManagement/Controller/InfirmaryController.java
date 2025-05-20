package com.example.PrisonManagement.Controller;
import com.example.PrisonManagement.Model.Infirmary;
import com.example.PrisonManagement.Model.Prisoner;
import com.example.PrisonManagement.Service.InfirmaryService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/api/infirmary")
@CrossOrigin(origins = "http://localhost:3000")
@Validated
public class InfirmaryController {

    private final InfirmaryService service;
    private final Logger logger = LoggerFactory.getLogger(InfirmaryController.class);

    @Autowired
    public InfirmaryController(InfirmaryService service) {
        this.service = service;
    }

    @GetMapping
    public List<Infirmary> getAll() {
        List<Infirmary> list = service.findAll();
        logger.info("Получен список всех записей медчасти. Количество: {}", list.size());
        return list;
    }

    @GetMapping("/{prescriptionNum}")
    public Infirmary getById(@PathVariable Integer prescriptionNum) {
        logger.info("Запрошена запись медчасти по номеру назначения: {}", prescriptionNum);
        return service.findById(prescriptionNum);
    }

    @GetMapping("/prisoner/{prisonerId}")
    public Prisoner getPrisoner(@PathVariable Integer prisonerId) {
        logger.info("Получена информация о заключённом ID={} из записи медчасти", prisonerId);
        return service.findByPrisonerId(prisonerId).getPrisoner();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.OK)
    public Infirmary createOrUpdate(@RequestBody @Valid Infirmary infirmary) {
        logger.info("Создание или обновление записи медчасти для заключённого ID={}",
                infirmary.getPrisoner().getPrisonerId());
        return service.createOrUpdate(infirmary);
    }

    @PutMapping("/{prescriptionNum}")
    public Infirmary update(@PathVariable Integer prescriptionNum,
                            @RequestBody @Valid Infirmary infirmary) {
        logger.info("Обновление записи медчасти с номером назначения {}", prescriptionNum);
        return service.update(prescriptionNum, infirmary);
    }

    @DeleteMapping("/{prescriptionNum}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteByPrescriptionNum(@PathVariable Integer prescriptionNum) {
        logger.info("Удаление записи медчасти с номером назначения {}", prescriptionNum);
        service.deleteByPrescriptionNum(prescriptionNum);
    }

    @DeleteMapping("/prisoner/{prisonerId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteByPrisoner(@PathVariable Integer prisonerId) {
        logger.info("Удаление всех записей медчасти, связанных с заключённым ID={}", prisonerId);
        service.deleteByPrisonerId(prisonerId);
    }
}
