package com.srm.creditengine.service.currencyengine;

import com.srm.creditengine.dto.ExchangeRateRequestDTO;
import com.srm.creditengine.dto.ExchangeRateResponseDTO;
import com.srm.creditengine.exception.ResourceNotFoundException;
import com.srm.creditengine.model.Currency;
import com.srm.creditengine.model.ExchangeRate;
import com.srm.creditengine.repository.CurrencyRepository;
import com.srm.creditengine.repository.ExchangeRateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CurrencyServiceImpl implements CurrencyService {

    private final CurrencyRepository currencyRepository;
    private final ExchangeRateRepository exchangeRateRepository;
    private final BacenPtaxApiClient ptaxApiClient;

    @Override
    @Transactional
    public ExchangeRateResponseDTO saveManual(ExchangeRateRequestDTO dto) {
        Currency from = currencyRepository.findByCode(dto.getFromCurrencyCode().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Moeda não encontrada: " + dto.getFromCurrencyCode()));
        Currency to = currencyRepository.findByCode(dto.getToCurrencyCode().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Moeda não encontrada: " + dto.getToCurrencyCode()));

        ExchangeRate rate = new ExchangeRate();
        rate.setFromCurrency(from);
        rate.setToCurrency(to);
        rate.setRate(dto.getRate());

        return mapToDTO(exchangeRateRepository.save(rate));
    }

    @Override
    @Transactional
    public ExchangeRateResponseDTO fetchAndSaveFromBacen(String date) {
        String dateToQuery = (date != null) ? date : LocalDate.now().format(DateTimeFormatter.ofPattern("MM-dd-yyyy"));
        BigDecimal rateValue = ptaxApiClient.fetchUsdToBrlRate(dateToQuery);
        return saveManual(new ExchangeRateRequestDTO("USD", "BRL", rateValue));
    }

    @Override
    public BigDecimal getLatestRateValue(String fromCode, String toCode) {
        if (fromCode.equalsIgnoreCase(toCode)) return BigDecimal.ONE;
        return exchangeRateRepository
                .findTopByFromCurrency_CodeAndToCurrency_CodeOrderByCreatedAtDesc(fromCode.toUpperCase(), toCode.toUpperCase())
                .map(ExchangeRate::getRate)
                .orElseThrow(() -> new ResourceNotFoundException("Taxa não disponível para " + fromCode + "/" + toCode));
    }

    @Override
    public ExchangeRateResponseDTO getLatestRate(String fromCode, String toCode) {
        return exchangeRateRepository
                .findTopByFromCurrency_CodeAndToCurrency_CodeOrderByCreatedAtDesc(fromCode.toUpperCase(), toCode.toUpperCase())
                .map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Taxa não encontrada"));
    }

    @Override
    public List<ExchangeRateResponseDTO> getRateHistory() {
        // Usando o findAllByOrderByCreatedAtDesc que sugeri no passo anterior
        return exchangeRateRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private ExchangeRateResponseDTO mapToDTO(ExchangeRate entity) {
        return ExchangeRateResponseDTO.builder()
                .id(entity.getId())
                .fromCurrency(entity.getFromCurrency().getCode())
                .toCurrency(entity.getToCurrency().getCode())
                .rate(entity.getRate())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}