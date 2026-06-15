package com.srm.creditengine.repository;
import com.srm.creditengine.model.ExchangeRate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExchangeRateRepository extends JpaRepository<ExchangeRate, Long> {
    Optional<ExchangeRate> findTopByFromCurrency_CodeAndToCurrency_CodeOrderByCreatedAtDesc(String fromCode, String toCode);

    List<ExchangeRate> findAllByOrderByCreatedAtDesc();
}
   
