package com.example.PrisonManagement.Repository;
import com.example.PrisonManagement.Model.Cell;
import com.example.PrisonManagement.Model.Prisoner;
import com.example.PrisonManagement.Model.SecurityLevel;
import com.example.PrisonManagement.Repository.RepInterface.AbstractJdbcDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Blob;
import java.sql.Types;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;


@Repository
public class PrisonerDao extends AbstractJdbcDao<Prisoner, Integer> {

    private static final String TABLE_NAME = "prisoner";

    private static final RowMapper<Prisoner> MAPPER = (rs, rowNum) -> {
        Prisoner p = new Prisoner();
        p.setPrisonerId(rs.getInt("prisoner_id"));
        p.setFirstName(rs.getString("first_name"));
        p.setLastName(rs.getString("last_name"));
        p.setBirthPlace(rs.getString("birth_place"));
        p.setDateOfBirth(rs.getObject("date_of_birth", LocalDate.class));
        p.setOccupation(rs.getString("occupation"));
        p.setIndictment(rs.getString("indictment"));
        p.setIntakeDate(rs.getObject("intake_date", LocalDate.class));
        p.setSentenceEndDate(rs.getObject("sentence_end_date", LocalDate.class));

        Cell cell = new Cell();
        cell.setCellNum(rs.getInt("cell_num"));
        p.setCell(cell);

        SecurityLevel sl = new SecurityLevel();
        sl.setSecurityLevelNo(rs.getInt("security_level_id"));
        p.setSecurityLevel(sl);

        return p;
    };

    @Autowired
    public PrisonerDao(JdbcTemplate jdbc) {
        super(jdbc, TABLE_NAME, "prisoner_id", MAPPER);
    }

    /**
     * Вставка с ручным заданием prisoner_id.
     */
    @Override
    public Prisoner create(Prisoner entity) {
        Map<String, Object> params = entityToParams(entity);

        // Формируем список колонок и плейсхолдеров
        String columns = String.join(", ", params.keySet());
        String placeholders = params.keySet().stream()
                .map(c -> ":" + c)
                .collect(Collectors.joining(", "));

        String sql = "INSERT INTO " + TABLE_NAME +
                " (" + columns + ") VALUES (" + placeholders + ")";

        // Выполняем вставку без GeneratedKeyHolder
        new NamedParameterJdbcTemplate(jdbc)
                .update(sql, new MapSqlParameterSource(params));

        // entity.prisonerId уже задан вручную, просто возвращаем его
        return entity;
    }

    @Override
    protected Map<String, Object> entityToParams(Prisoner entity) {
        Map<String, Object> m = new HashMap<>();
        m.put("prisoner_id",       entity.getPrisonerId());
        m.put("first_name",        entity.getFirstName());
        m.put("last_name",         entity.getLastName());
        m.put("birth_place",       entity.getBirthPlace());
        m.put("date_of_birth",     entity.getDateOfBirth());
        m.put("occupation",        entity.getOccupation());
        m.put("indictment",        entity.getIndictment());
        m.put("intake_date",       entity.getIntakeDate());
        m.put("sentence_end_date", entity.getSentenceEndDate());
        m.put("cell_num",          entity.getCell() != null
                ? entity.getCell().getCellNum() : null);
        m.put("security_level_id", entity.getSecurityLevel().getSecurityLevelNo());
        return m;
    }

    @Override
    protected Integer extractId(Prisoner entity) {
        return entity.getPrisonerId();
    }

    @Override
    protected void setId(Prisoner entity, Integer id) {
        entity.setPrisonerId(id);
    }

    public boolean existsByCellNum(Integer cellNum) {
        String sql = "SELECT COUNT(1) FROM prisoner WHERE cell_num = ?";
        Integer count = jdbc.queryForObject(sql, Integer.class, cellNum);
        return count != null && count > 0;
    }
}