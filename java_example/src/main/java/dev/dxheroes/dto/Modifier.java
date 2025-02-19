package dev.dxheroes.dto;
import java.util.List;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Modifier {
    @NotNull
    @JsonProperty(value = "name", required = true)
    private String name;

    @NotNull
    @Min(1)
    @JsonProperty(value = "options", required = true)
    private List<String> options;
    
}