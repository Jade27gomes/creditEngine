package com.srm.creditengine.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "currencies")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Currency {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, length = 3)
    private String code;
    @Column(nullable = false, length = 50)
    private String name;
}
