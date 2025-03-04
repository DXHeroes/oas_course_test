# Possible API Testing Scenarios

## GET /orders

### Happy Path:
- Successfully retrieve all orders when the database has orders
- Successfully retrieve an empty array when no orders exist

### Error Path:
- Authentication failure (401) when invalid credentials are provided

## POST /orders

### Happy Path:
- Successfully create a new order with valid data
- Successfully create a new order with minimum required fields
- Successfully create a new order with multiple items

### Error Path:
- Missing required field: customer_name (400)
- Missing required field: items (400)
- Invalid customer_name: too short (< 3 characters) (400)
- Invalid customer_name: too long (> 50 characters) (400)
- Invalid items: empty array (400)
- Invalid items: missing menu_item_id in an item (400)
- Invalid items: missing quantity in an item (400)
- Invalid items: non-numeric menu_item_id (400)
- Invalid items: non-numeric quantity (400)
- Invalid items: quantity less than 1 (400)
- Invalid items: menu_item_id not found in the menu (400)
- Authentication failure (401) when invalid credentials are provided

## DELETE /orders/{orderId}

### Happy Path:
- Successfully delete an existing order

### Error Path:
- Order not found: non-existent orderId (404)
- Invalid orderId format (400)
- Authentication failure (401) when invalid credentials are provided

## PUT /orders/{orderId}

### Happy Path:
- Successfully update an existing order with valid data
- Successfully update an order with minimum required fields
- Successfully update an order with multiple items

### Error Path:
- Order not found: non-existent orderId (404)
- Missing required field: customer_name (400)
- Missing required field: items (400)
- Invalid customer_name: too short (< 3 characters) (400)
- Invalid customer_name: too long (> 50 characters) (400)
- Invalid items: empty array (400)
- Invalid items: missing menu_item_id in an item (400)
- Invalid items: missing quantity in an item (400)
- Invalid items: non-numeric menu_item_id (400)
- Invalid items: non-numeric quantity (400)
- Invalid items: quantity less than 1 (400)
- Invalid items: menu_item_id not found in the menu (400)
- Authentication failure (401) when invalid credentials are provided
