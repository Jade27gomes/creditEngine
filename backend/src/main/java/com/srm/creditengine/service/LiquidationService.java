package com.srm.creditengine.service;

import com.srm.creditengine.dto.LiquidationRequestDTO;
import com.srm.creditengine.dto.TransactionResponseDTO;
import com.srm.creditengine.exception.BusinessException;
import com.srm.creditengine.exception.ResourceNotFoundException;
import com.srm.creditengine.model.*;
import com.srm.creditengine.repository.*;
import com.srm.creditengine.service.pricing.PricingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LiquidationService {

    private final ReceivableRepository  receivableRepository;
    private final TransactionRepository transactionRepository;
    private final CurrencyRepository    currencyRepository;
    private final PricingService        pricingService;

    /**
     * Liquida um recebível de forma atômica (ACID).
     *
     * Proteção em camadas contra race condition:
     *  1. PESSIMISTIC_WRITE no SELECT (banco bloqueia a linha)
     *  2. @Version no Transaction (Optimistic Lock como segunda barreira)
     *  3. Verificação de status antes de prosseguir
     */
    @Transactional
    public TransactionResponseDTO liquidate(LiquidationRequestDTO dto) {
        Receivable receivable = receivableRepository.findByIdForUpdate(dto.getReceivableId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Recebível não encontrado: " + dto.getReceivableId()));

        if (!"PENDING".equals(receivable.getStatus())) {
            throw new BusinessException(
                    "Recebível não pode ser liquidado. Status atual: " + receivable.getStatus());
        }

        Currency paymentCurrency = currencyRepository.findByCode(dto.getPaymentCurrencyCode().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Moeda não encontrada: " + dto.getPaymentCurrencyCode()));

        PricingService.PricingResult result = pricingService.price(receivable, dto.getPaymentCurrencyCode());

        receivable.setStatus("LIQUIDATED");
        receivableRepository.save(receivable);

        Transaction transaction = new Transaction();
        transaction.setReceivable(receivable);
        transaction.setPaymentCurrency(paymentCurrency);
        transaction.setPresentValue(result.presentValue());
        transaction.setDiscount(result.discount());
        transaction.setExchangeRateUsed(result.exchangeRateUsed());

        return mapToDTO(transactionRepository.save(transaction));
    }

    private TransactionResponseDTO mapToDTO(Transaction t) {
        return TransactionResponseDTO.builder()
                .id(t.getId())
                .receivableId(t.getReceivable().getId())
                .faceValue(t.getReceivable().getFaceValue())
                .receivableCurrency(t.getReceivable().getCurrency().getCode())
                .paymentCurrency(t.getPaymentCurrency().getCode())
                .presentValue(t.getPresentValue())
                .discount(t.getDiscount())
                .exchangeRateUsed(t.getExchangeRateUsed())
                .createdAt(t.getCreatedAt())
                .build();
    }
}
