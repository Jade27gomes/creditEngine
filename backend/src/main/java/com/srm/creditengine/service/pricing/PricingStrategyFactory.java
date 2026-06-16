package com.srm.creditengine.service.pricing;

import com.srm.creditengine.exception.BusinessException;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Factory que resolve a strategy correta pelo nome do produto.
 */
@Component
public class PricingStrategyFactory {

    private final Map<String, PricingStrategy> strategies;

    public PricingStrategyFactory(List<PricingStrategy> strategyList) {
        this.strategies = strategyList.stream()
                .collect(Collectors.toMap(PricingStrategy::getProductName, Function.identity()));
    }

    public PricingStrategy getStrategy(String productName) {
        PricingStrategy strategy = strategies.get(productName);
        if (strategy == null) {
            throw new BusinessException(
                "Nenhuma estratégia de precificação encontrada para o produto: " + productName
            );
        }
        return strategy;
    }
}
