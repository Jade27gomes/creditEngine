package com.srm.creditengine.service.pricing;

import com.srm.creditengine.model.Receivable;
import com.srm.creditengine.service.currencyengine.CurrencyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Orquestra o cálculo: resolve a strategy → calcula VP → aplica câmbio (se cross-currency).
 *
 * Taxa base = 0 por enquanto (spread do produto já embute o risco).
 * Pode ser parametrizada no futuro para refletir, por exemplo, o CDI do dia.
 */
@Service
@RequiredArgsConstructor
public class PricingService {

    private final PricingStrategyFactory strategyFactory;
    private final CurrencyService currencyService;

    private static final BigDecimal BASE_RATE = BigDecimal.ZERO;

    public PricingResult price(Receivable receivable, String paymentCurrencyCode) {
        PricingStrategy strategy = strategyFactory.getStrategy(receivable.getProduct().getName());

        BigDecimal presentValueOriginal = strategy.calculate(
                receivable.getFaceValue(),
                receivable.getTermMonths(),
                BASE_RATE,
                receivable.getProduct().getSpread()
        );

        String originalCurrency = receivable.getCurrency().getCode();
        boolean isCrossCurrency = !originalCurrency.equalsIgnoreCase(paymentCurrencyCode);

        BigDecimal exchangeRate   = null;
        BigDecimal finalPresentValue = presentValueOriginal;

        if (isCrossCurrency) {
            exchangeRate     = currencyService.getLatestRateValue(originalCurrency, paymentCurrencyCode);
            finalPresentValue = presentValueOriginal
                    .multiply(exchangeRate)
                    .setScale(6, RoundingMode.HALF_EVEN);
        }

        // Deságio sempre na moeda original do título (lucro real do fundo)
        BigDecimal discount = receivable.getFaceValue()
                .subtract(presentValueOriginal)
                .setScale(6, RoundingMode.HALF_EVEN);

        return new PricingResult(finalPresentValue, discount, exchangeRate);
    }

    public record PricingResult(
            BigDecimal presentValue,
            BigDecimal discount,
            BigDecimal exchangeRateUsed
    ) {}
}
