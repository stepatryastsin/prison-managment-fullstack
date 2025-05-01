package com.example.PrisonManagement.Controller;


import com.example.PrisonManagement.Model.Visitor;
import com.example.PrisonManagement.Service.VisitorService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/visitors")
@CrossOrigin(origins = "http://localhost:3000")
public class VisitorController {

    private static final Logger logger = LoggerFactory.getLogger(VisitorController.class);
    private final VisitorService service;

    @Autowired
    public VisitorController(VisitorService service) {
        this.service = service;
        logger.info("VisitorController инициализирован");
    }

    @GetMapping
    public List<Visitor> getAll() {
        logger.info("Получен запрос GET /api/visitors - получить всех посетителей");
        List<Visitor> list = service.findAll();
        logger.info("Найдено {} посетителей", list.size());
        return list;
    }

    @GetMapping("/{id}")
    public Visitor getOne(@PathVariable Integer id) {
        logger.info("Получен запрос GET /api/visitors/{} - получить посетителя по ID", id);
        Visitor visitor = service.findById(id);
        if (visitor != null) {
            logger.info("Посетитель с ID {} найден: {}", id, visitor);
        } else {
            logger.warn("Посетитель с ID {} не найден", id);
        }
        return visitor;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Visitor create(@RequestBody @Valid Visitor visitor) {
        logger.info("Получен запрос POST /api/visitors - создать посетителя: {}", visitor);
        Visitor created = service.create(visitor);
        logger.info("Создан посетитель с ID {}", created.getVisitorId());
        return created;
    }

    @PutMapping("/{id}")
    public Visitor update(@PathVariable Integer id,
                          @RequestBody @Valid Visitor visitor) {
        logger.info("Получен запрос PUT /api/visitors/{} - обновить посетителя", id);
        Visitor updated = service.update(id, visitor);
        logger.info("Посетитель с ID {} обновлён", id);
        return updated;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        logger.info("Получен запрос DELETE /api/visitors/{} - удалить посетителя", id);
        service.delete(id);
        logger.info("Посетитель с ID {} удалён", id);
    }
}
