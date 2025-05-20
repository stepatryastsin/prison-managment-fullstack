package com.example.PrisonManagement.Repository.RepInterface;

import java.util.List;
import java.util.Optional;

public interface GenericDao<T, ID> {
    List<T> findAll();
    Optional<T> findById(ID id);
    T create(T entity);
    T update(T entity);
    void delete(ID id);
    boolean existsById(ID id);
}
