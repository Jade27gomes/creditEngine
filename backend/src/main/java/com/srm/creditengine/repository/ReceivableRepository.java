package com.srm.creditengine.repository;

import com.srm.creditengine.model.Receivable;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.List;

public interface ReceivableRepository extends JpaRepository<Receivable, Long> {

    // Pessimistic Write Lock — garante que nenhuma outra transação
    // leia+liquide o mesmo recebível ao mesmo tempo
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM Receivable r WHERE r.id = :id")
    Optional<Receivable> findByIdForUpdate(@Param("id") Long id);

    @Query("SELECT r FROM Receivable r WHERE r.status = 'PENDING'")
    List<Receivable> listPending();
}
