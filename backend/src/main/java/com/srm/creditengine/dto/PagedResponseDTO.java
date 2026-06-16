package com.srm.creditengine.dto;

import lombok.*;
import java.util.List;

@Getter 
@Builder

public class PagedResponseDTO<T> {
    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
}