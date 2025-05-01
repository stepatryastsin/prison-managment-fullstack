package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Model.Staff;
import com.example.PrisonManagement.Service.StaffService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "http://localhost:3000")
public class StaffController {

    private static final Logger logger = LoggerFactory.getLogger(StaffController.class);
    private final StaffService service;

    @Autowired
    public StaffController(StaffService service) {
        this.service = service;
        logger.info("StaffController инициализирован");
    }

    @GetMapping
    public List<Staff> getAll() {
        logger.info("Получен запрос GET /api/staff - получить всех сотрудников");
        List<Staff> list = service.findAll();
        logger.info("Найдено {} сотрудников", list.size());
        return list;
    }

    @GetMapping("/{id}")
    public Staff getOne(@PathVariable Integer id) {
        logger.info("Получен запрос GET /api/staff/{} - получить сотрудника по ID", id);
        Staff staff = service.findById(id);
        if (staff != null) {
            logger.info("Сотрудник с ID {} найден: {}", id, staff);
        } else {
            logger.warn("Сотрудник с ID {} не найден", id);
        }
        return staff;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Staff create(@RequestBody @Valid Staff staff) {
        logger.info("Получен запрос POST /api/staff - создать сотрудника: {}", staff);
        Staff created = service.create(staff);
        logger.info("Сотрудник создан с ID {}", created.getStaffId());
        return created;
    }

    @PutMapping("/{id}")
    public Staff update(@PathVariable Integer id,
                        @RequestBody @Valid Staff staff) {
        logger.info("Получен запрос PUT /api/staff/{} - обновить сотрудника", id);
        Staff updated = service.update(id, staff);
        logger.info("Сотрудник с ID {} обновлён", id);
        return updated;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        logger.info("Получен запрос DELETE /api/staff/{} - удалить сотрудника", id);
        service.delete(id);
        logger.info("Сотрудник с ID {} удалён", id);
    }

    @GetMapping("/job/{jobId}/usage")
    public int getUsage(@PathVariable Integer jobId) {
        logger.info("Получен запрос GET /api/staff/job/{}/usage - получить число сотрудников по вакансии", jobId);
        int usage = service.getUsageCount(jobId);
        logger.info("Количество сотрудников с jobId {}: {}", jobId, usage);
        return usage;
    }
}
