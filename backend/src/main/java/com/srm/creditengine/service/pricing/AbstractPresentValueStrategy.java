package com.srm.creditengine.service.pricing;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;

/**
 * Implementação base da fórmula de valor presente.
 */
public abstract class AbstractPresentValueStrategy implements PricingStrategy {

    
    private static final MathContext MC = new MathContext(20, RoundingMode.HALF_EVEN);

    @Override
    public BigDecimal calculate(BigDecimal faceValue, int termMonths, BigDecimal baseRate, BigDecimal spread) {
        // divisor = (1 + baseRate + spread) ^ termMonths
        BigDecimal rate    = BigDecimal.ONE.add(baseRate).add(spread);
        BigDecimal divisor = rate.pow(termMonths, MC);
        return faceValue.divide(divisor, 6, RoundingMode.HALF_EVEN);
    }
}
