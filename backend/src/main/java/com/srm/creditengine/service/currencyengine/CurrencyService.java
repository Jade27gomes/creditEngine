package com.srm.creditengine.service.currencyengine;

import com.srm.creditengine.dto.ExchangeRateRequestDTO;
import com.srm.creditengine.dto.ExchangeRateResponseDTO;
import java.math.BigDecimal;
import java.util.List;

public interface CurrencyService {
    ExchangeRateResponseDTO saveManual(ExchangeRateRequestDTO dto);
    ExchangeRateResponseDTO fetchAndSaveFromBacen(String date);
    ExchangeRateResponseDTO getLatestRate(String fromCode, String toCode);
    BigDecimal getLatestRateValue(String fromCode, String toCode);
    List<ExchangeRateResponseDTO> getRateHistory();
}
