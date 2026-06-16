package com.srm.creditengine.controller;

import com.srm.creditengine.dto.PagedResponseDTO;
import com.srm.creditengine.dto.StatementItemDTO;
import com.srm.creditengine.repository.StatementRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/statement")
@RequiredArgsConstructor
@Tag(name = "Statement", description = "Extrato de liquidações")
public class StatementController {

    private final StatementRepository statementRepository;

    @GetMapping
    @Operation(summary = "Extrato de liquidações com filtros dinâmicos e paginação server-side")
    public ResponseEntity<PagedResponseDTO<StatementItemDTO>> getStatement(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long assignorId,
            @RequestParam(required = false) String paymentCurrency,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<StatementItemDTO> content = statementRepository.findStatement(
                startDate, endDate, assignorId, paymentCurrency, page, size
        );
        long total = statementRepository.countStatement(
                startDate, endDate, assignorId, paymentCurrency
        );

        return ResponseEntity.ok(PagedResponseDTO.<StatementItemDTO>builder()
                .content(content)
                .page(page)
                .size(size)
                .totalElements(total)
                .totalPages((int) Math.ceil((double) total / size))
                .build()
        );
    }
}