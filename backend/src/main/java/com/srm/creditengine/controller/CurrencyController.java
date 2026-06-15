package com.srm.creditengine.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class CurrencyController {

    @GetMapping("/hello")
    public String hello() {
        return "Hello World! SRM Credit Engine está rodando com sucesso.";
    }
}