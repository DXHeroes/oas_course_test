package dev.dxheroes.dto;

import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Error {
    @NotNull
    @JsonProperty(value = "code", required = true)
    private Integer code;

    @NotNull
    @JsonProperty(value = "message", required = true)
    private String message;

    public Error(Integer code, String message) {
        this.code = code;
        this.message = message;
    }
}
