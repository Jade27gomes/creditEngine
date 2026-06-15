package com.srm.creditengine;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.client.RestClient;

@SpringBootApplication
@EnableScheduling
public class CreditEngineApplication {

    public static void main(String[] args) {
        SpringApplication.run(CreditEngineApplication.class, args);
    }

    @Bean
    public RestClient restClient() {
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = 
            new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(5000);

        return RestClient.builder()
                .requestFactory(factory)
                .defaultHeader("Accept", "application/json")
                .build();
    }
}