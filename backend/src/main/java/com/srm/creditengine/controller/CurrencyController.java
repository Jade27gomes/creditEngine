package com.srm.creditengine.controller;

import com.srm.creditengine.dto.ExchangeRateRequestDTO;
import com.srm.creditengine.dto.ExchangeRateResponseDTO;
import com.srm.creditengine.service.currencyengine.CurrencyService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/currencies")
@RequiredArgsConstructor
public class CurrencyController {

    private final CurrencyService currencyService;

    @PostMapping("/rates/sync-bacen")
    @Operation(summary = "Sincroniza PTAX. Use formato MM-dd-yyyy")
    public ResponseEntity<ExchangeRateResponseDTO> sync(@RequestParam(required = false) String date) {
        return ResponseEntity.ok(currencyService.fetchAndSaveFromBacen(date));
    }

    @PostMapping("/rates")
    public ResponseEntity<ExchangeRateResponseDTO> create(@RequestBody @Valid ExchangeRateRequestDTO dto) {
        return ResponseEntity.ok(currencyService.saveManual(dto));
    }

    @GetMapping("/rates/history")
    public ResponseEntity<List<ExchangeRateResponseDTO>> getHistory() {
        return ResponseEntity.ok(currencyService.getRateHistory());
    }
}
