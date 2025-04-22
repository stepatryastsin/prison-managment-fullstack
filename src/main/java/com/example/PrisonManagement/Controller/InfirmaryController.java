package com.example.PrisonManagement.Controller;
import com.example.PrisonManagement.Entity.Infirmary;
import com.example.PrisonManagement.Entity.Prisoner;
import com.example.PrisonManagement.Service.InfirmaryService;
import com.example.PrisonManagement.Service.PrisonerService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/infirmary")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class InfirmaryController {

    private final InfirmaryService infirmaryService;
    private final PrisonerService prisonerService;

    @GetMapping
    public ResponseEntity<List<Infirmary>> getAllInfirmaries() {
        List<Infirmary> infirmaries = infirmaryService.getAllInfirmaries();
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
        return ResponseEntity.noContent().build();
    }

    // Пример дополнительного эндпоинта для получения заключенного по id
    @GetMapping("/prisoner/{id}")
    public ResponseEntity<Prisoner> getPrisonerById(@PathVariable Integer id) {
        Prisoner prisoner = prisonerService.findById(id);
        return ResponseEntity.ok(prisoner);
    }
}