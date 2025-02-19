package dev.dxheroes.dto;

import java.util.List;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import com.fasterxml.jackson.annotation.JsonProperty;

enum ItemSize {
    Small,
    Medium,
    Large;
}

public class MenuItem {
    @JsonProperty(value = "id", required = true)
    private Integer id;

    @NotNull
    @Size(min = 3, max = 50)
    @JsonProperty(value = "name", required = true)
    private String name;

    @Size(max = 100)
    @JsonProperty(value = "description", required = false)
    private String description;

    @NotNull
    @Min(0)
    @JsonProperty(value = "price", required = true)
    private Double price;

    @NotNull
    @JsonProperty(value = "size", required = false)
    private ItemSize size;

    @NotNull
    @Size(min = 0, max = 5)
    @JsonProperty(value = "extraItems", required = false)
    private List<String> extraItems;

    @NotNull
    @JsonProperty(value = "modifiers", required = false)
    private List<Modifier> modifiers;

    @NotNull
    @JsonProperty(value = "promotion", required = false)
    private Promotion promotion;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }
}
