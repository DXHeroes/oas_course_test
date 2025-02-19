package dev.dxheroes.service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import dev.dxheroes.dto.MenuItem;

@Service
public class MenuService {
    private final List<MenuItem> menuItems = new ArrayList<>();
    private final AtomicInteger idGenerator = new AtomicInteger(1);

    public List<MenuItem> getAllMenuItems() {
        return new ArrayList<>(menuItems);
    }

    public MenuItem getMenuItemById(Integer menuId) {
        if (menuId == null) {
            throw new IllegalArgumentException("Menu ID cannot be null");
        }
        if (menuId <= 0) {
            throw new IllegalArgumentException("Menu ID must be a positive number");
        }
        return menuItems.stream()
                .filter(menuItem -> menuItem.getId().equals(menuId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu item not found"));
    }

    public MenuItem createMenuItem(MenuItem menuItem) {
        menuItem.setId(idGenerator.getAndIncrement());
        menuItems.add(menuItem);
        return menuItem;
    }

    public MenuItem updateMenuItem(Integer menuId, MenuItem menuItem) {
        MenuItem existingMenuItem = getMenuItemById(menuId);
        if (existingMenuItem != null) {
            existingMenuItem.setName(menuItem.getName());
            existingMenuItem.setDescription(menuItem.getDescription());
            existingMenuItem.setPrice(menuItem.getPrice()); 
        }
        return existingMenuItem;
    }
}