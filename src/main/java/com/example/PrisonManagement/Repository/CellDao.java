package com.example.PrisonManagement.Repository;
import com.example.PrisonManagement.Model.Cell;
import com.example.PrisonManagement.Repository.RepInterface.AbstractJdbcDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * DAO для работы с сущностью Cell (камера).
 *
 * <p>Расширяет {@link AbstractJdbcDao}, используя:
 * <ul>
 *     <li>Таблицу "cell" в БД</li>
 *     <li>PK-колонку "cell_num"</li>
 *     <li>Маппер строк в объект {@link Cell}</li>
 * </ul>
 */
@Repository
public class CellDao extends AbstractJdbcDao<Cell, Integer> {

    /**
     * Преобразует каждую строку ResultSet в объект Cell
     */
    private static final RowMapper<Cell> MAPPER = (rs, rowNum) -> {
        Cell cell = new Cell();
        cell.setCellNum(rs.getInt("cell_num"));
        Date dt = rs.getDate("last_shakedown_date");
        cell.setLastShakedownDate(dt != null ? dt.toLocalDate() : null);
        return cell;
    };

    /**
     * @param jdbc шаблон для выполнения SQL-запросов
     */
    @Autowired
    public CellDao(JdbcTemplate jdbc) {
        super(jdbc, "cell", "cell_num", MAPPER);
    }

    /**
     * Преобразует объект Cell в карту столбец→значение для INSERT/UPDATE.
     *
     * @param entity объект камеры
     * @return карта значений для БД
     */
    @Override
    protected Map<String, Object> entityToParams(Cell entity) {
        Map<String, Object> m = new HashMap<>();
        m.put("cell_num",            entity.getCellNum());
        m.put("last_shakedown_date", entity.getLastShakedownDate());
        return m;
    }

    /**
     * Извлекает PK-значение (номер камеры) из объекта
     *
     * @param entity камера
     * @return ее номер
     */
    @Override
    protected Integer extractId(Cell entity) {
        return entity.getCellNum();
    }

    /**
     * Устанавливает PK (номер камеры) после INSERT
     *
     * @param entity объект камеры
     * @param id     сгенерированный номер
     */
    @Override
    protected void setId(Cell entity, Integer id) {
        entity.setCellNum(id);
    }
}
