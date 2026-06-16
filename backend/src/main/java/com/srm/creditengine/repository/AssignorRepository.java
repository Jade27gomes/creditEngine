package com.srm.creditengine.repository;

import com.srm.creditengine.model.Assignor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AssignorRepository extends JpaRepository<Assignor, Long> {
    Optional<Assignor> findByDocument(String document);
}
