package com.example.PrisonManagement.impl;
import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;
import com.itextpdf.layout.element.Table;
import com.example.PrisonManagement.Model.Prisoner;
import com.example.PrisonManagement.Model.ProgramsAndCourses;
import com.example.PrisonManagement.Repository.PrisonerDao;
import com.example.PrisonManagement.Repository.ProgramsAndCoursesDao;
import com.example.PrisonManagement.Service.CertificateService;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.property.TextAlignment;
import com.itextpdf.layout.property.UnitValue;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
@Service
public class CertificateServiceImpl implements CertificateService {

    private final PrisonerDao prisonerRepo;
    private final ProgramsAndCoursesDao courseRepo;

    @Autowired
    public CertificateServiceImpl(PrisonerDao prisonerRepo,
                                  ProgramsAndCoursesDao courseRepo) {
        this.prisonerRepo = prisonerRepo;
        this.courseRepo   = courseRepo;
    }
    @Override
    public ByteArrayOutputStream generateCertificate(Integer prisonerId, Integer courseId) {
        Prisoner p = prisonerRepo.findById(prisonerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Prisoner not found"));
        ProgramsAndCourses c = courseRepo.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        try {
            // 1) Подключаем шрифт с кириллицей
            String fontPath = "src/main/resources/fonts/FreeSans.ttf";
            PdfFont font = PdfFontFactory.createFont(
                    fontPath, PdfEncodings.IDENTITY_H, true
            );

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            com.itextpdf.kernel.pdf.PdfDocument pdf =
                    new com.itextpdf.kernel.pdf.PdfDocument(writer);
            Document doc = new Document(pdf, PageSize.A4.rotate());
            doc.setMargins(50, 50, 50, 50);

            // 2) Заголовок
            Paragraph title = new Paragraph("СЕРТИФИКАТ ОБ УСПЕШНОМ ОКОНЧАНИИ КУРСА")
                    .setFont(font)
                    .setFontSize(28)
                    .setBold()
                    .setFontColor(ColorConstants.BLUE)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(30);
            doc.add(title);

            // 3) Данные заключённого
            Paragraph prisonerInfo = new Paragraph()
                    .setFont(font)
                    .add(new Text("Настоящим подтверждается, что ").setFontSize(14))
                    .add(new Text(p.getFirstName() + " " + p.getLastName())
                            .setBold().setFontSize(16))
                    .add(new Text(" успешно завершил(а) курс:").setFontSize(14))
                    .setMarginBottom(20);
            doc.add(prisonerInfo);

            // 4) Таблица с данными курса
            Table table = new Table(new float[]{3, 5})
                    .setWidth(UnitValue.createPercentValue(100));
            table.addHeaderCell(new Cell().add(new Paragraph("Поле").setFont(font).setBold()));
            table.addHeaderCell(new Cell().add(new Paragraph("Значение").setFont(font).setBold()));
            table.addCell(new Paragraph("Название курса").setFont(font));
            table.addCell(new Paragraph(c.getCourseName()).setFont(font));
            table.addCell(new Paragraph("Инструктор").setFont(font));
            table.addCell(new Paragraph(
                    c.getInstructor().getFirstName() + " " + c.getInstructor().getLastName()
            ).setFont(font));
            table.setMarginBottom(30);
            doc.add(table);

            // 5) Дата выдачи
            Paragraph footer = new Paragraph()
                    .setFont(font)
                    .add(new Text("Дата выдачи: ").setFontSize(12))
                    .add(new Text(
                            java.time.LocalDate.now()
                                    .format(DateTimeFormatter.ofPattern("dd.MM.yyyy"))
                    ).setFontSize(12).setBold())
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setMarginTop(50);
            doc.add(footer);

            // 6) Линия для подписи
            SolidLine line = new SolidLine(1f);
            LineSeparator ls = new LineSeparator(line)
                    .setWidth(UnitValue.createPercentValue(30))
                    .setMarginLeft(400f);
            doc.add(ls);

            // 7) Подпись
            Paragraph signLabel = new Paragraph("Руководитель программы")
                    .setFont(font)
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setMarginTop(5);
            doc.add(signLabel);

            doc.close();
            return baos;
        } catch (Exception e) {
            throw new RuntimeException("Certificate generation failed", e);
        }
    }
}
