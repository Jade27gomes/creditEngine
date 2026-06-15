package com.srm.creditengine.scheduler;

import com.srm.creditengine.service.currencyengine.CurrencyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Slf4j
@Component
@RequiredArgsConstructor
public class CurrencyRateScheduler {

    private final CurrencyService currencyService;

    /**
     * Sincroniza a taxa PTAX automaticamente.
     * Executa às 14:00 de segunda a sexta.
     */
    @Scheduled(cron = "0 0 14 * * MON-FRI")
    public void syncDailyExchangeRate() {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("MM-dd-yyyy"));
        log.info("Iniciando sincronização automática da taxa PTAX para o dia: {}", today);
        
        try {
            currencyService.fetchAndSaveFromBacen(today);
            log.info("Sincronização automática concluída com sucesso.");
        } catch (Exception e) {
            log.error("Falha na sincronização automática: {}", e.getMessage());
        }
    }

    @Scheduled(initialDelay = 10000, fixedRate = Long.MAX_VALUE)
    public void syncOnStartup() {
        log.info("Executando sincronização inicial de inicialização...");
        try {
            currencyService.fetchAndSaveFromBacen(null);
        } catch (Exception e) {
            log.warn("Não foi possível sincronizar na inicialização (provavelmente fim de semana): {}", e.getMessage());
        }
    }
}