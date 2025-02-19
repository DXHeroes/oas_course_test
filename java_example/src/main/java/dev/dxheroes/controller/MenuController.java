package dev.dxheroes.controller;

import java.util.List;

import javax.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import dev.dxheroes.dto.MenuItem;
import dev.dxheroes.service.MenuService;

@RestController
public class MenuController {
    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    @GetMapping("/")
    public String healthCheck() {
        return "OK";
    }

    @GetMapping("/menu")
    public ResponseEntity<List<MenuItem>> getMenu() {
        List<MenuItem> menuItems = menuService.getAllMenuItems();
        return ResponseEntity.ok(menuItems);
    }

    @PostMapping("/menu")
    public ResponseEntity<MenuItem> createMenuItem(@Valid @RequestBody MenuItem menuItem) {
        MenuItem createdItem = menuService.createMenuItem(menuItem);
        return ResponseEntity.ok(createdItem);
    }

    @GetMapping("/menu/{menuId}")
    public ResponseEntity<MenuItem> getMenuById(@PathVariable Integer menuId) {
        MenuItem menuItem = menuService.getMenuItemById(menuId);
        return ResponseEntity.ok(menuItem);
    }

    @PutMapping("/menu/{menuId}")
    public ResponseEntity<MenuItem> updateMenu(@PathVariable Integer menuId, @Valid @RequestBody MenuItem menuItem) {
        MenuItem updatedItem = menuService.updateMenuItem(menuId, menuItem);
        return ResponseEntity.ok(updatedItem);
    }
}