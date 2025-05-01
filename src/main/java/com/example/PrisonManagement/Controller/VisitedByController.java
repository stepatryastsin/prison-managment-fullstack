package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Model.VisitedBy;
import com.example.PrisonManagement.Model.VisitedByKey;
import com.example.PrisonManagement.Service.VisitedByService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/visited-by")
@CrossOrigin(origins = "http://localhost:3000")
public class VisitedByController {

    private static final Logger logger = LoggerFactory.getLogger(VisitedByController.class);
    private final VisitedByService visitedByService;

    @Autowired
    public VisitedByController(VisitedByService visitedByService) {
        this.visitedByService = visitedByService;
        logger.info("VisitedByController инициализирован");
    }

    @GetMapping
    public List<VisitedBy> getAll() {
        logger.info("Получен запрос GET /api/visited-by - получить все посещения");
        List<VisitedBy> list = visitedByService.findAll();
        logger.info("Найдена {} записей посещений", list.size());
        return list;
    }

    @GetMapping("/{prisonerId}/{visitorId}")
    public ResponseEntity<VisitedBy> getById(@PathVariable Integer prisonerId,
                                             @PathVariable Integer visitorId) {
        logger.info("Получен запрос GET /api/visited-by/{}/{} - получить посещение", prisonerId, visitorId);
        VisitedByKey key = new VisitedByKey(prisonerId, visitorId);
        VisitedBy vb = visitedByService.findById(key);
        if (vb != null) {
            logger.info("Запись посещения для PrisonerId={} и VisitorId={} найдена", prisonerId, visitorId);
            return ResponseEntity.ok(vb);
        } else {
            logger.warn("Запись посещения для PrisonerId={} и VisitorId={} не найдена", prisonerId, visitorId);
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VisitedBy create(@RequestBody VisitedBy visitedBy) {
        logger.info("Получен запрос POST /api/visited-by - создать посещение: {}", visitedBy);
        VisitedBy created = visitedByService.create(visitedBy);
        logger.info("Создана запись посещения для PrisonerId={} и VisitorId={}", created.getId().getPrisonerId(), created.getId().getVisitorId());
        return created;
    }

    @PutMapping("/{prisonerId}/{visitorId}")
    public VisitedBy update(@PathVariable Integer prisonerId,
                            @PathVariable Integer visitorId,
                            @RequestBody VisitedBy visitedBy) {
        logger.info("Получен запрос PUT /api/visited-by/{}/{} - обновить посещение", prisonerId, visitorId);
        VisitedBy updated = visitedByService.update(prisonerId, visitorId, visitedBy);
        logger.info("Обновлена запись посещения для PrisonerId={} и VisitorId={}", prisonerId, visitorId);
        return updated;
    }

    @DeleteMapping("/{prisonerId}/{visitorId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer prisonerId,
                       @PathVariable Integer visitorId) {
        logger.info("Получен запрос DELETE /api/visited-by/{}/{} - удалить посещение", prisonerId, visitorId);
        VisitedByKey key = new VisitedByKey(prisonerId, visitorId);
        visitedByService.deleteById(key);
        logger.info("Удалена запись посещения для PrisonerId={} и VisitorId={}", prisonerId, visitorId);
    }
}
