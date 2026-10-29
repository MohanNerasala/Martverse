package com.martverse.repository;

import com.martverse.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    List<Category> findByActiveTrue();
    List<Category> findByFloorNumberAndActiveTrue(Integer floorNumber);
    List<Category> findByParentIsNullAndActiveTrue();
}
