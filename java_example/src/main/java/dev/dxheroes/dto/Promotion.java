package dev.dxheroes.dto;
import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = DiscountPromotion.class, name = "discount"),
    @JsonSubTypes.Type(value = BuyOneGetOnePromotion.class, name = "bogo")
})
public sealed interface Promotion permits DiscountPromotion, BuyOneGetOnePromotion {}

record DiscountPromotion(
    @NotNull
    @JsonProperty(value = "amount", required = true)
    Double amount
) implements Promotion {}

record BuyOneGetOnePromotion(
    @NotNull
    @JsonProperty(value = "description", required = true)
    String description
) implements Promotion {}
