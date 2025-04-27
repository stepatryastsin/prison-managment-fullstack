package com.example.PrisonManagement.Controller;
import com.example.PrisonManagement.Model.Infirmary;
import com.example.PrisonManagement.Model.Prisoner;
import com.example.PrisonManagement.Service.InfirmaryService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/api/infirmary")
@CrossOrigin(origins = "http://localhost:3000")
public class InfirmaryController {

    private final InfirmaryService service;
    private final Logger logger = LoggerFactory.getLogger(InfirmaryController.class);

    @Autowired
    public InfirmaryController(InfirmaryService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Infirmary>> getAll() {
        List<Infirmary> list = service.findAll();
        logger.info("Найдено {} записей", list.size());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{prescriptionNum}")
    public ResponseEntity<Infirmary> getById(@PathVariable Integer prescriptionNum) {
        Infirmary inf = service.findById(prescriptionNum);
        return ResponseEntity.ok(inf);
    }

    @GetMapping("/prisoner/{prisonerId}")
    public ResponseEntity<Prisoner> getPrisoner(@PathVariable Integer prisonerId) {
        Infirmary inf = service.findByPrisonerId(prisonerId);
        return ResponseEntity.ok(inf.getPrisoner());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Infirmary create(@RequestBody @Valid Infirmary infirmary) {
        Infirmary created = service.create(infirmary);
        logger.info("Создана запись prescriptionNum={}", created.getPrescriptionNum());
        return created;
    }

    @PutMapping("/{prescriptionNum}")
    public Infirmary update(
            @PathVariable Integer prescriptionNum,
            @RequestBody @Valid Infirmary infirmary) {
        Infirmary updated = service.update(prescriptionNum, infirmary);
        logger.info("Обновлена запись prescriptionNum={}", prescriptionNum);
        return updated;
    }

    @DeleteMapping("/{prescriptionNum}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer prescriptionNum) {
        service.delete(prescriptionNum);
        logger.info("Удалена запись prescriptionNum={}", prescriptionNum);
    }
}