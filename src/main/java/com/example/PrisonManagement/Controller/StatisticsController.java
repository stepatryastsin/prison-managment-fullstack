package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.impl.StatisticsService;
import org.apache.poi.util.Units;
import org.apache.poi.xwpf.usermodel.*;
import org.jfree.chart.ChartFactory;
import org.jfree.chart.ChartUtils;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.plot.PlotOrientation;
import org.jfree.data.category.DefaultCategoryDataset;
import org.jfree.data.general.DefaultPieDataset;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.BiConsumer;

@RestController
@RequestMapping("/api/statistics")
@CrossOrigin(origins = "http://localhost:3000")
public class StatisticsController {

    private final StatisticsService statisticsService;

    @Autowired
    public StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    @GetMapping("/report")
    public ResponseEntity<Map<String, Object>> getFullReport() {
        return ResponseEntity.ok(statisticsService.getFullReport());
    }

    /** Новый: Word-документ со статистикой */
    @GetMapping("/report/docx")
    public ResponseEntity<ByteArrayResource> downloadDocx() throws IOException {
        Map<String,Object> report = statisticsService.getFullReport();

        XWPFDocument doc = new XWPFDocument();

        // Заголовок
        XWPFParagraph title = doc.createParagraph();
        title.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun run = title.createRun();
        run.setText("Полный отчёт по статистике");
        run.setBold(true);
        run.setFontSize(20);
        doc.createParagraph().createRun().addBreak();

        // Функция для вставки картинки
        BiConsumer<JFreeChart, String> insertChart = (chart, caption) -> {
            try {
                int width = 400;
                int height = 250;

                ByteArrayOutputStream chartOut = new ByteArrayOutputStream();
                ChartUtils.writeChartAsPNG(chartOut, chart, width, height);

                XWPFParagraph pCap = doc.createParagraph();
                pCap.setStyle("Heading2");
                pCap.createRun().setText(caption);

                XWPFParagraph imgPara = doc.createParagraph();
                XWPFRun imgRun = imgPara.createRun();
                imgRun.addPicture(
                        new ByteArrayInputStream(chartOut.toByteArray()),
                        Document.PICTURE_TYPE_PNG,
                        caption + ".png",
                        Units.toEMU(width),
                        Units.toEMU(height)
                );
                doc.createParagraph().createRun().addBreak();
            } catch(Exception e) {
                e.printStackTrace();
            }
        };

        // 1. Уровни безопасности (Pie)
        DefaultPieDataset pieDs1 = new DefaultPieDataset();
        ((List<Map<String,Object>>)report.get("securityLevelDistribution"))
                .forEach(m -> pieDs1.setValue(
                        (String)m.get("category"),
                        ((Number)m.get("value")).doubleValue()
                ));
        JFreeChart pieChart1 = ChartFactory.createPieChart(
                "Уровни безопасности", pieDs1, true, true, false
        );
        insertChart.accept(pieChart1, "Уровни безопасности");

        // 2. Топ-5 читаемых книг (Bar horizontal)
        DefaultCategoryDataset barDs2 = new DefaultCategoryDataset();
        ((List<Map<String,Object>>)report.get("topBorrowedBooks"))
                .forEach(m -> barDs2.addValue(
                        ((Number)m.get("value")).doubleValue(),
                        "Книги",
                        (String)m.get("category")
                ));
        JFreeChart barChart2 = ChartFactory.createBarChart(
                "Топ-5 читаемых книг",
                "Книга", "Количество",
                barDs2,
                PlotOrientation.HORIZONTAL,
                false, true, false
        );
        insertChart.accept(barChart2, "Топ-5 читаемых книг");

        // 3. Средний срок по профессиям (Bar)
        DefaultCategoryDataset barDs3 = new DefaultCategoryDataset();
        ((List<Map<String,Object>>)report.get("avgSentenceByOccupation"))
                .forEach(m -> barDs3.addValue(
                        ((Number)m.get("value")).doubleValue(),
                        "Дни",
                        (String)m.get("category")
                ));
        JFreeChart barChart3 = ChartFactory.createBarChart(
                "Средний срок (дни) по профессиям",
                "Профессия", "Дней",
                barDs3,
                PlotOrientation.VERTICAL,
                false, true, false
        );
        insertChart.accept(barChart3, "Средний срок по профессиям");

        // 4. Загруженность камер (Bar horizontal)
        DefaultCategoryDataset barDs4 = new DefaultCategoryDataset();
        ((List<Map<String,Object>>)report.get("cellOccupancy"))
                .forEach(m -> barDs4.addValue(
                        ((Number)m.get("value")).doubleValue(),
                        "Заключённые",
                        (String)m.get("category")
                ));
        JFreeChart barChart4 = ChartFactory.createBarChart(
                "Загруженность камер",
                "Камера", "Число",
                barDs4,
                PlotOrientation.HORIZONTAL,
                false, true, false
        );
        insertChart.accept(barChart4, "Загруженность камер");

        // 5. Топ-5 посещаемых заключённых (Bar horizontal)
        DefaultCategoryDataset barDs5 = new DefaultCategoryDataset();
        ((List<Map<String,Object>>)report.get("topVisitedPrisoners"))
                .forEach(m -> barDs5.addValue(
                        ((Number)m.get("value")).doubleValue(),
                        "Визиты",
                        (String)m.get("category")
                ));
        JFreeChart barChart5 = ChartFactory.createBarChart(
                "Топ-5 посещаемых заключённых",
                "Заключённый", "Визитов",
                barDs5,
                PlotOrientation.HORIZONTAL,
                false, true, false
        );
        insertChart.accept(barChart5, "Топ-5 посещаемых заключённых");

        // 6. Активность персонала (Bar horizontal)
        DefaultCategoryDataset barDs6 = new DefaultCategoryDataset();
        ((List<Map<String,Object>>)report.get("laborActivityPerStaff"))
                .forEach(m -> barDs6.addValue(
                        ((Number)m.get("value")).doubleValue(),
                        "Заключённые",
                        (String)m.get("category")
                ));
        JFreeChart barChart6 = ChartFactory.createBarChart(
                "Активность персонала",
                "Сотрудник", "Число заключённых",
                barDs6,
                PlotOrientation.HORIZONTAL,
                false, true, false
        );
        insertChart.accept(barChart6, "Активность персонала");

        // 7. Новые заключённые по месяцам (Line)
        DefaultCategoryDataset lineDs7 = new DefaultCategoryDataset();
        ((List<Map<String,Object>>)report.get("monthlyNewPrisoners"))
                .forEach(m -> lineDs7.addValue(
                        ((Number)m.get("count")).doubleValue(),
                        "Новые",
                        (String)m.get("period")
                ));
        JFreeChart lineChart7 = ChartFactory.createLineChart(
                "Новые заключённые по месяцам",
                "Месяц", "Число",
                lineDs7,
                PlotOrientation.VERTICAL,
                false, true, false
        );
        insertChart.accept(lineChart7, "Новые заключённые по месяцам");

        // 8. Посещения по месяцам (Line)
        DefaultCategoryDataset lineDs8 = new DefaultCategoryDataset();
        ((List<Map<String,Object>>)report.get("monthlyVisits"))
                .forEach(m -> lineDs8.addValue(
                        ((Number)m.get("count")).doubleValue(),
                        "Визиты",
                        (String)m.get("period")
                ));
        JFreeChart lineChart8 = ChartFactory.createLineChart(
                "Посещения по месяцам",
                "Месяц", "Число визитов",
                lineDs8,
                PlotOrientation.VERTICAL,
                false, true, false
        );
        insertChart.accept(lineChart8, "Посещения по месяцам");

        // 9. Типы болезней (Pie)
        DefaultPieDataset pieDs9 = new DefaultPieDataset();
        ((List<Map<String,Object>>)report.get("diseaseDistribution"))
                .forEach(m -> pieDs9.setValue(
                        (String)m.get("category"),
                        ((Number)m.get("value")).doubleValue()
                ));
        JFreeChart pieChart9 = ChartFactory.createPieChart(
                "Типы болезней (рецепты)", pieDs9, true, true, false
        );
        insertChart.accept(pieChart9, "Типы болезней");

        // Сохраняем документ
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        doc.write(baos);
        doc.close();

        ByteArrayResource resource = new ByteArrayResource(baos.toByteArray());
        HttpHeaders headers = new HttpHeaders();
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename("Statistics_Report.docx").build());
        headers.setContentType(MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ));

        return new ResponseEntity<>(resource, headers, HttpStatus.OK);
    }

}
