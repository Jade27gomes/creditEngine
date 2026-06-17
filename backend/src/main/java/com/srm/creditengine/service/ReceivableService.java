package com.srm.creditengine.service;

import com.srm.creditengine.dto.*;
import com.srm.creditengine.exception.ResourceNotFoundException;
import com.srm.creditengine.model.*;
import com.srm.creditengine.repository.*;
import com.srm.creditengine.service.pricing.PricingService;
import lombok.RequiredArgsConstructor;
import com.srm.creditengine.dto.PriceSimulationResponseDTO;
import com.srm.creditengine.dto.ReceivableRequestDTO;
import com.srm.creditengine.dto.ReceivableResponseDTO;
import com.srm.creditengine.model.Assignor;
import com.srm.creditengine.model.Product;
import com.srm.creditengine.model.Receivable;
import com.srm.creditengine.repository.AssignorRepository;
import com.srm.creditengine.repository.CurrencyRepository;
import com.srm.creditengine.repository.ProductRepository;
import com.srm.creditengine.repository.ReceivableRepository;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReceivableService {

    private final ReceivableRepository receivableRepository;
    private final AssignorRepository   assignorRepository;
    private final ProductRepository    productRepository;
    private final CurrencyRepository   currencyRepository;
    private final PricingService       pricingService;

    @Transactional
    public ReceivableResponseDTO create(ReceivableRequestDTO dto) {
        Assignor assignor = assignorRepository.findById(dto.getAssignorId())
                .orElseThrow(() -> new ResourceNotFoundException("Cedente não encontrado: " + dto.getAssignorId()));

        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado: " + dto.getProductId()));

        Currency currency = currencyRepository.findByCode(dto.getCurrencyCode().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Moeda não encontrada: " + dto.getCurrencyCode()));

        Receivable receivable = new Receivable();
        receivable.setAssignor(assignor);
        receivable.setProduct(product);
        receivable.setCurrency(currency);
        receivable.setFaceValue(dto.getFaceValue());
        receivable.setDueDate(dto.getDueDate());
        receivable.setTermMonths(dto.getTermMonths());
        receivable.setStatus("PENDING");



        return mapToDTO(receivableRepository.save(receivable));
    }

    @Transactional(readOnly = true)
    public List<ReceivableResponseDTO> listPending() {
        // Busca do banco e converte cada um para DTO
        return receivableRepository.listPending().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PriceSimulationResponseDTO simulate(Long receivableId, String paymentCurrencyCode) {
        Receivable receivable = receivableRepository.findById(receivableId)
                .orElseThrow(() -> new ResourceNotFoundException("Recebível não encontrado: " + receivableId));

        PricingService.PricingResult result = pricingService.price(receivable, paymentCurrencyCode);

        return PriceSimulationResponseDTO.builder()
                .faceValue(receivable.getFaceValue())
                .originalCurrency(receivable.getCurrency().getCode())
                .paymentCurrency(paymentCurrencyCode.toUpperCase())
                .presentValue(result.presentValue())
                .discount(result.discount())
                .exchangeRateUsed(result.exchangeRateUsed())
                .productName(receivable.getProduct().getName())
                .termMonths(receivable.getTermMonths())
                .build();
    }

    private ReceivableResponseDTO mapToDTO(Receivable r) {
        return ReceivableResponseDTO.builder()
                .id(r.getId())
                .assignorName(r.getAssignor().getName())
                .productName(r.getProduct().getName())
                .currencyCode(r.getCurrency().getCode())
                .faceValue(r.getFaceValue())
                .dueDate(r.getDueDate())
                .termMonths(r.getTermMonths())
                .status(r.getStatus())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
