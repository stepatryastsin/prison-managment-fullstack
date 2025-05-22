package com.example.PrisonManagement.impl;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;


@Service
public class StatisticsService {

    private final JdbcTemplate jdbc;
    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("YYYY-MM");

    @Autowired
    public StatisticsService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // 1) Распределение заключённых по уровням безопасности
    public List<Map<String, Object>> getSecurityLevelDistribution() {
        return jdbc.queryForList("""
            SELECT sl.description AS category, COUNT(*)::int AS value
            FROM prisoner p
            JOIN security_level sl ON p.security_level_id = sl.security_level_no
            GROUP BY sl.description
            ORDER BY value DESC
        """);
    }

    // 2) Топ-5 самых читаемых книг
    public List<Map<String, Object>> getTopBorrowedBooks() {
        return jdbc.queryForList("""
            SELECT l.book_name AS category, COUNT(*)::int AS value
            FROM borrowed b
            JOIN library l ON b.library_id = l.internal_id
            GROUP BY l.book_name
            ORDER BY value DESC
            LIMIT 5
        """);
    }

    // 3) Средняя продолжительность срока по профессиям
    public List<Map<String, Object>> getAvgSentenceByOccupation() {
        return jdbc.queryForList("""
            SELECT p.occupation AS category,
                   ROUND(AVG(p.sentence_end_date - p.intake_date))::int AS value
            FROM prisoner p
            WHERE p.occupation IS NOT NULL
            GROUP BY p.occupation
            ORDER BY value DESC
        """);
    }

    // 4) Загруженность камер
    public List<Map<String, Object>> getCellOccupancy() {
        return jdbc.queryForList("""
            SELECT p.cell_num::text AS category, COUNT(*)::int AS value
            FROM prisoner p
            WHERE p.cell_num IS NOT NULL
            GROUP BY p.cell_num
            ORDER BY value DESC
        """);
    }

    // 5) Посещения по заключённым (топ-5)
    public List<Map<String, Object>> getTopVisitedPrisoners() {
        return jdbc.queryForList("""
            SELECT p.first_name || ' ' || p.last_name AS category, COUNT(*)::int AS value
            FROM visited_by vb
            JOIN prisoner p ON vb.prisoner_id = p.prisoner_id
            GROUP BY category
            ORDER BY value DESC
            LIMIT 5
        """);
    }

    // 6) Активность персонала
    public List<Map<String, Object>> getLaborActivityPerStaff() {
        return jdbc.queryForList("""
            SELECT s.first_name || ' ' || s.last_name AS category, COUNT(*)::int AS value
            FROM prisoner_labor pl
            JOIN staff s ON pl.staff_id = s.staff_id
            GROUP BY category
            ORDER BY value DESC
        """);
    }

    // 7) Новые заключённые по месяцам (12 мес.)
    public List<Map<String, Object>> getMonthlyNewPrisoners() {
        return jdbc.queryForList("""
            SELECT TO_CHAR(intake_date, 'YYYY-MM') AS period, COUNT(*)::int AS count
            FROM prisoner
            WHERE intake_date >= CURRENT_DATE - INTERVAL '12 months'
            GROUP BY period
            ORDER BY period
        """);
    }

    // 8) Посещения по месяцам (12 мес.)
    public List<Map<String, Object>> getMonthlyVisits() {
        return jdbc.queryForList("""
            SELECT TO_CHAR(v.visit_date, 'YYYY-MM') AS period, COUNT(*)::int AS count
            FROM visited_by vb
            JOIN visitor v2 ON vb.visitor_id = v2.visitor_id
            JOIN (SELECT visitor_id, visit_date FROM visitor) v ON v2.visitor_id = v.visitor_id
            WHERE v.visit_date >= CURRENT_DATE - INTERVAL '12 months'
            GROUP BY period
            ORDER BY period
        """);
    }

    // 9) Распределение по типам болезней
    public List<Map<String, Object>> getDiseaseDistribution() {
        return jdbc.queryForList("""
            SELECT disease_type AS category, COUNT(*)::int AS value
            FROM infirmary
            WHERE disease_type IS NOT NULL
            GROUP BY disease_type
            ORDER BY value DESC
        """);
    }

    // 10) Заключённые по уровню безопасности и возрастным группам
    public List<Map<String, Object>> getPrisonersBySecurityAndAgeGroup() {
        return jdbc.queryForList("""
            SELECT sl.description   AS group_label,
                   CASE
                     WHEN EXTRACT(YEAR FROM AGE(current_date, p.date_of_birth)) < 30 THEN '18-29'
                     WHEN EXTRACT(YEAR FROM AGE(current_date, p.date_of_birth)) < 50 THEN '30-49'
                     ELSE '50+' END        AS subgroup_label,
                   COUNT(*)::int         AS value
            FROM prisoner p
            JOIN security_level sl ON p.security_level_id = sl.security_level_no
            WHERE p.date_of_birth IS NOT NULL
            GROUP BY sl.description, subgroup_label
            ORDER BY sl.description, subgroup_label
        """);
    }

    // 11) Средний процент отбывания срока по уровням безопасности
    public List<Map<String, Object>> getAvgTimeServedPercentBySecurity() {
        return jdbc.queryForList("""
            SELECT sl.description AS group_label,
                   ROUND(
                     AVG(
                       LEAST(1.0,
                         (CURRENT_DATE - p.intake_date)::decimal /
                         (p.sentence_end_date - p.intake_date)
                       )
                     ) * 100
                   )::int        AS value
            FROM prisoner p
            JOIN security_level sl ON p.security_level_id = sl.security_level_no
            WHERE p.sentence_end_date > p.intake_date
            GROUP BY sl.description
            ORDER BY value DESC
        """);
    }

    public Map<String, Object> getEnrollmentRate() {
        // общее число заключённых
        Integer total = jdbc.queryForObject(
                "SELECT COUNT(*) FROM prisoner", Integer.class
        );
        // число уникальных участников программ
        Integer enrolled = jdbc.queryForObject(
                "SELECT COUNT(DISTINCT prisoner_id) FROM enrolled_in", Integer.class
        );

        int percent = (total != null && total > 0)
                ? Math.round(enrolled * 100.0f / total)
                : 0;

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("label", "Доля обучающихся (%)");
        m.put("value", percent);
        return m;
    }

    // 13) Предстоящие освобождения (3 мес.) — без изменений
    public List<Map<String, Object>> getUpcomingReleases() {
        return jdbc.queryForList("""
            SELECT TO_CHAR(p.sentence_end_date, 'YYYY-MM') AS period,
                   COUNT(*)::int                        AS value
            FROM prisoner p
            WHERE p.sentence_end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 months'
            GROUP BY period
            ORDER BY period
        """);
    }

    // 14) Сводный метод — всё вместе
    public Map<String, Object> getFullReport() {
        Map<String, Object> report = new LinkedHashMap<>();

        // базовые метрики
        report.put("securityLevelDistribution",       getSecurityLevelDistribution());
        report.put("topBorrowedBooks",                getTopBorrowedBooks());
        report.put("avgSentenceByOccupation",         getAvgSentenceByOccupation());
        report.put("cellOccupancy",                   getCellOccupancy());
        report.put("topVisitedPrisoners",             getTopVisitedPrisoners());
        report.put("laborActivityPerStaff",           getLaborActivityPerStaff());
        report.put("monthlyNewPrisoners",             getMonthlyNewPrisoners());
        report.put("monthlyVisits",                   getMonthlyVisits());
        report.put("diseaseDistribution",             getDiseaseDistribution());

        // расширенная аналитика
        report.put("prisonersBySecurityAndAgeGroup",   getPrisonersBySecurityAndAgeGroup());
        report.put("avgTimeServedPercentBySecurity",   getAvgTimeServedPercentBySecurity());
        report.put("enrollmentRate",                   List.of(getEnrollmentRate()));
        report.put("upcomingReleases",                 getUpcomingReleases());

        return report;
    }
}