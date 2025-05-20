package com.example.PrisonManagement.Repository;

import com.example.PrisonManagement.Model.Infirmary;
import com.example.PrisonManagement.Model.Prisoner;
import com.example.PrisonManagement.Repository.RepInterface.AbstractJdbcDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * DAO для медицинских предписаний заключённых (Infirmary).
 *
 * <p>Использует таблицу "infirmary" с PK prescription_num.
 * Расширяет {@link AbstractJdbcDao} и добавляет операции по prisoner_id.
 */
@Repository
public class InfirmaryDao extends AbstractJdbcDao<Infirmary, Integer> {

    /**
     * Маппер строки результата в объект Infirmary
     */
    private static final RowMapper<Infirmary> MAPPER = (rs, rowNum) -> {
        Infirmary inf = new Infirmary();
        inf.setPrescriptionNum(rs.getInt("prescription_num"));

        // Заполняем только ID заключённого, сам объект можно загрузить через PrisonerDao
        Prisoner prisoner = new Prisoner();
        prisoner.setPrisonerId(rs.getInt("prisoner_id"));
        inf.setPrisoner(prisoner);

        inf.setRelatedDoctor(rs.getString("related_doctor"));
        inf.setDrugName(rs.getString("drug_name"));
        inf.setDrugUsageDay(rs.getObject("drug_usage_day", Integer.class));
        inf.setDiseaseType(rs.getString("disease_type"));
        return inf;
    };


    private static final String TABLE_NAME = "infirmary";

    /**
     * @param jdbc JdbcTemplate для выполнения SQL
     */
    @Autowired
    public InfirmaryDao(JdbcTemplate jdbc) {
        super(jdbc, TABLE_NAME, "prescription_num", MAPPER);
    }

    /**
     * Преобразование сущности в карту столбец→значение для INSERT/UPDATE.
     */
    @Override
    protected Map<String, Object> entityToParams(Infirmary entity) {
        Map<String, Object> m = new HashMap<>();
        m.put("prescription_num", entity.getPrescriptionNum());
        m.put("prisoner_id",      entity.getPrisoner().getPrisonerId());
        m.put("related_doctor",   entity.getRelatedDoctor());
        m.put("drug_name",        entity.getDrugName());
        m.put("drug_usage_day",   entity.getDrugUsageDay());
        m.put("disease_type",     entity.getDiseaseType());
        return m;
    }

    /**
     * Извлечение ID предписания
     */
    @Override
    protected Integer extractId(Infirmary entity) {
        return entity.getPrescriptionNum();
    }

    /**
     * Установка сгенерированного ID предписания в сущность
     */
    @Override
    protected void setId(Infirmary entity, Integer id) {
        entity.setPrescriptionNum(id);
    }

    /**
     * Поиск предписания по ID заключённого
     *
     * @param prisonerId ID заключённого
     * @return Optional с найденным предписанием или пустой
     */
    public Optional<Infirmary> findByPrisonerId(Integer prisonerId) {
        String sql = """
            SELECT prescription_num, prisoner_id, related_doctor, drug_name,
                   drug_usage_day, disease_type
              FROM infirmary
             WHERE prisoner_id = :prisonerId
            """;
        var params = new MapSqlParameterSource("prisonerId", prisonerId);
        List<Infirmary> list = new NamedParameterJdbcTemplate(jdbc)
                .query(sql, params, MAPPER);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    /**
     * Проверка наличия предписания у заключённого
     *
     * @param prisonerId ID заключённого
     * @return true если есть хотя бы одно предписание
     */
    public boolean existsByPrisonerId(Integer prisonerId) {
        String sql = "SELECT COUNT(1) FROM infirmary WHERE prisoner_id = ?";
        Integer cnt = jdbc.queryForObject(sql, Integer.class, prisonerId);
        return cnt != null && cnt > 0;
    }

    /**
     * Удалить предписания по ID заключённого
     *
     * @param prisonerId ID заключённого
     */
    public void deleteByPrisonerId(Integer prisonerId) {
        String sql = "DELETE FROM infirmary WHERE prisoner_id = ?";
        jdbc.update(sql, prisonerId);
    }

    /**
     * Подсчитать количество предписаний у заключённого
     *
     * @param prisonerId ID заключённого
     * @return количество записей
     */
    public long countByPrisonerId(Integer prisonerId) {
        String sql = "SELECT COUNT(1) FROM infirmary WHERE prisoner_id = ?";
        Long cnt = jdbc.queryForObject(sql, Long.class, prisonerId);
        return cnt != null ? cnt : 0L;
    }
}
