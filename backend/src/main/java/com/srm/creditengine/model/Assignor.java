package com.srm.creditengine.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "assignors")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Assignor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, unique = true, length = 18)
    private String document; // CNPJ ou CPF
}
