package com.example.PrisonManagement.Repository.RepInterface;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Общая абстрактная реализация DAO с использованием JdbcTemplate.
 *
 * <p>Поддерживает:
 * <ul>
 *     <li>Простые SELECT * и SELECT по ID</li>
 *     <li>Проверку существования записи по ID</li>
 *     <li>Удаление записи по ID</li>
 *     <li>Вставку и обновление через {@code Map<String,Object>}</li>
 * </ul>
 *
 * <p>Для конкретного DAO необходимо лишь:
 * <ol>
 *     <li>Параметризовать: JdbcTemplate, имя таблицы, имя PK-колонки, RowMapper</li>
 *     <li>Реализовать преобразование сущности в карту столбец→значение ({@link #entityToParams})</li>
 *     <li>Реализовать получение и установку ID сущности ({@link #extractId}, {@link #setId})</li>
 * </ol>
 *
 * @param <T>  тип сущности
 * @param <ID> тип первичного ключа
 */
public abstract class AbstractJdbcDao<T, ID> implements GenericDao<T, ID> {

    /**
     * Шаблон для выполнения SQL-запросов
     */
    protected final JdbcTemplate jdbc;

    private final RowMapper<T> rowMapper;
    private final String       table;
    private final String       idColumn;

    /**
     * @param jdbc      готовый JdbcTemplate для работы с БД
     * @param table     имя таблицы в БД
     * @param idColumn  имя PK-колонки в таблице
     * @param rowMapper маппер из строки результата в объект T
     */
    protected AbstractJdbcDao(JdbcTemplate jdbc,
                              String table,
                              String idColumn,
                              RowMapper<T> rowMapper) {
        this.jdbc      = jdbc;
        this.table     = table;
        this.idColumn  = idColumn;
        this.rowMapper = rowMapper;
    }

    /**
     * Получение всех записей из таблицы.
     *
     * @return список всех сущностей T
     */
    @Override
    public List<T> findAll() {
        String sql = "SELECT * FROM " + table;
        return jdbc.query(sql, rowMapper);
    }

    /**
     * Получение одной записи по ее ID.
     *
     * @param id значение первичного ключа
     * @return {@link Optional} с сущностью или пустой, если не найдено
     */
    @Override
    public Optional<T> findById(ID id) {
        String sql = "SELECT * FROM " + table +
                " WHERE " + idColumn + " = ?";
        List<T> list = jdbc.query(sql, rowMapper, id);
        return list.isEmpty()
                ? Optional.empty()
                : Optional.of(list.get(0));
    }

    /**
     * Проверка существования записи с данным ID.
     *
     * @param id значение первичного ключа
     * @return true, если запись найдена, иначе false
     */
    @Override
    public boolean existsById(ID id) {
        String sql = "SELECT COUNT(1) FROM " + table +
                " WHERE " + idColumn + " = ?";
        Integer cnt = jdbc.queryForObject(sql, Integer.class, id);
        return cnt != null && cnt > 0;
    }

    /**
     * Удаление записи по ID.
     *
     * @param id значение первичного ключа
     */
    @Override
    public void delete(ID id) {
        String sql = "DELETE FROM " + table +
                " WHERE " + idColumn + " = ?";
        jdbc.update(sql, id);
    }

    /**
     * Вставка новой сущности.
     * <p>Исключает PK-колонку из INSERT (предполагается,
     * что база генерирует ключ), затем считывает
     * сгенерированный ключ и вызывает {@link #setId}.
     *
     * @param entity новая сущность для сохранения
     * @return та же сущность с установленным ID
     */
    @Override
    public T create(T entity) {
        // получаем все поля из сущности
        Map<String,Object> params = entityToParams(entity);

        // исключаем PK-колонку из вставки
        Map<String,Object> insertParams = new HashMap<>(params);
        insertParams.remove(idColumn);

        // формируем список колонок и плейсхолдеров
        String columns      = insertParams.keySet().stream()
                .collect(Collectors.joining(", "));
        String placeholders = insertParams.keySet().stream()
                .map(c -> ":" + c)
                .collect(Collectors.joining(", "));

        String sql = String.format(
                "INSERT INTO %s (%s) VALUES (%s)",
                table, columns, placeholders
        );

        KeyHolder keyHolder = new GeneratedKeyHolder();
        new NamedParameterJdbcTemplate(jdbc)
                .update(sql,
                        new MapSqlParameterSource(insertParams),
                        keyHolder,
                        new String[]{idColumn});

        @SuppressWarnings("unchecked")
        ID generatedId = (ID) keyHolder.getKey();
        setId(entity, generatedId);

        return entity;
    }

    /**
     * Обновление существующей сущности.
     * <p>Строит SET-клаузу из всех колонок, кроме PK,
     * и выполняет UPDATE через NamedParameterJdbcTemplate.
     *
     * @param entity сущность с новыми значениями и ID
     * @return та же сущность
     */
    @Override
    public T update(T entity) {
        Map<String,Object> params = entityToParams(entity);
        ID id = extractId(entity);

        // строим SET col1 = :col1, col2 = :col2, ...
        String setClause = params.keySet().stream()
                .filter(c -> !c.equals(idColumn))
                .map(c -> c + " = :" + c)
                .collect(Collectors.joining(", "));

        String sql = "UPDATE " + table +
                " SET " + setClause +
                " WHERE " + idColumn + " = :" + idColumn;

        new NamedParameterJdbcTemplate(jdbc).update(sql, params);
        return entity;
    }

    // ------------------------------------------------------------------------
    // Методы, которые должен реализовать подкласс:
    // ------------------------------------------------------------------------

    /**
     * Преобразование сущности в карту <имя_колонки, значение>.
     * Обязательно должна содержать запись для PK-колонки.
     *
     * @param entity сущность для конвертации
     * @return карта имени колонок и их значений
     */
    protected abstract Map<String,Object> entityToParams(T entity);

    /**
     * Получить значение первичного ключа из сущности.
     *
     * @param entity сущность
     * @return значение PK
     */
    protected abstract ID extractId(T entity);

    /**
     * Установить значение PK в сущность после вставки.
     *
     * @param entity сущность
     * @param id     сгенерированный ключ
     */
    protected abstract void setId(T entity, ID id);
}
