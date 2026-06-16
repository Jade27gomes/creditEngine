package com.srm.creditengine.controller;

import com.srm.creditengine.dto.LiquidationRequestDTO;
import com.srm.creditengine.dto.TransactionResponseDTO;
import com.srm.creditengine.service.LiquidationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/liquidations")
@RequiredArgsConstructor
@Tag(name = "Liquidations", description = "Liquidação de recebíveis")
public class LiquidationController {

    private final LiquidationService liquidationService;

    @PostMapping
    @Operation(summary = "Liquida um recebível PENDING. Operação atômica (ACID) com lock pessimista.")
    public ResponseEntity<TransactionResponseDTO> liquidate(@RequestBody @Valid LiquidationRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(liquidationService.liquidate(dto));
    }
}
