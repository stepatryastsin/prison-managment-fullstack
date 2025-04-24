package com.example.PrisonManagement.Controller;
import com.example.PrisonManagement.Entity.Infirmary;
import com.example.PrisonManagement.Entity.Prisoner;
import com.example.PrisonManagement.Service.InfirmaryService;
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
// Bug
public class InfirmaryController {

    private final InfirmaryService infirmaryService;
    private final Logger logger = LoggerFactory.getLogger(InfirmaryController.class);

    @Autowired
    public InfirmaryController(InfirmaryService infirmaryService) {
        this.infirmaryService = infirmaryService;
    }

    @GetMapping
    public ResponseEntity<List<Infirmary>> getAllInfirmaries() {
        final List<Infirmary> infirmaries = infirmaryService.getAllInfirmaries();
        logger.info("Получено {} больных заключенным ",infirmaries.size());
        return ResponseEntity.ok(infirmaries);
    }

    @PostMapping
    public ResponseEntity<Infirmary> createInfirmary(@RequestBody Infirmary infirmary) {
        Infirmary savedInfirmary = infirmaryService.createInfirmary(infirmary);
        return ResponseEntity.ok(savedInfirmary);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Infirmary> updateInfirmary(@PathVariable Long id, @RequestBody Infirmary infirmary) {
        Infirmary updatedInfirmary = infirmaryService.updateInfirmary(id, infirmary);
        return ResponseEntity.ok(updatedInfirmary);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInfirmary(@PathVariable Long id) {
        infirmaryService.deleteInfirmary(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/prisoner/{id}")
    public ResponseEntity<Prisoner> getPrisonerById(@PathVariable Integer id) {
        Prisoner prisoner = infirmaryService.getInfirmaryById(id);
        return ResponseEntity.ok(prisoner);
    }
}