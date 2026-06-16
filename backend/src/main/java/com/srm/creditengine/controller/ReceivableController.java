package com.srm.creditengine.controller;

import com.srm.creditengine.dto.*;
import com.srm.creditengine.service.ReceivableService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/receivables")
@RequiredArgsConstructor
@Tag(name = "Receivables", description = "Gestão de recebíveis")
public class ReceivableController {

    private final ReceivableService receivableService;

    @PostMapping
    @Operation(summary = "Cadastra um novo recebível com status PENDING")
    public ResponseEntity<ReceivableResponseDTO> create(@RequestBody @Valid ReceivableRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(receivableService.create(dto));
    }

    @GetMapping("/{id}/simulate")
    @Operation(summary = "Simula o valor presente sem liquidar. Query param: paymentCurrency (ex: BRL, USD)")
    public ResponseEntity<PriceSimulationResponseDTO> simulate(
            @PathVariable Long id,
            @RequestParam String paymentCurrency) {
        return ResponseEntity.ok(receivableService.simulate(id, paymentCurrency));
    }
}
