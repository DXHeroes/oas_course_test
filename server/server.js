const express = require('express');
const bodyParser = require('body-parser');
const basicAuth = require('express-basic-auth');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Basic Authentication
app.use(basicAuth({
  users: { 'admin': 'password' }, // Replace with real credentials in production
  challenge: true,
  unauthorizedResponse: { 
    code: 401, 
    message: 'Unauthorized access' 
  }
}));

// In-memory database
const db = {
  orders: [],
  menuItems: [
    {
      id: 1,
      name: "Espresso",
      description: "Strong coffee brewed by forcing hot water through finely-ground coffee beans",
      price: 2.50,
      size: "Small",
      extraItems: ["Extra Shot", "Whipped Cream"],
      modifiers: [
        {
          name: "Sugar",
          options: ["None", "Low", "Medium", "High"]
        }
      ]
    },
    {
      id: 2,
      name: "Cappuccino",
      description: "Coffee drink with espresso, hot milk, and steamed milk foam",
      price: 3.50,
      size: "Medium",
      extraItems: ["Extra Shot", "Soy Milk", "Cinnamon"],
      modifiers: [
        {
          name: "Milk Type",
          options: ["Whole Milk", "Skim Milk", "Soy Milk", "Almond Milk"]
        }
      ]
    }
  ],
  nextOrderId: 1,
  nextMenuItemId: 3
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    code: err.statusCode || 500,
    message: err.message || 'Internal server error'
  });
};

// Validation functions
const validateOrder = (order) => {
  const errors = [];
  
  if (!order.customer_name || order.customer_name.length < 3 || order.customer_name.length > 50) {
    errors.push('Customer name must be between 3 and 50 characters');
  }
  
  if (!Array.isArray(order.items) || order.items.length === 0) {
    errors.push('Order must contain at least one item');
  } else {
    order.items.forEach((item, index) => {
      if (!item.menu_item_id || typeof item.menu_item_id !== 'number') {
        errors.push(`Item ${index}: menu_item_id must be a number`);
      }
      if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
        errors.push(`Item ${index}: quantity must be a positive number`);
      }
    });
  }
  
  return errors;
};

const validateMenuItem = (menuItem) => {
  const errors = [];
  
  if (!menuItem.name || menuItem.name.length < 3 || menuItem.name.length > 50) {
    errors.push('Name must be between 3 and 50 characters');
  }
  
  if (menuItem.description && menuItem.description.length > 100) {
    errors.push('Description must not exceed 100 characters');
  }
  
  if (typeof menuItem.price !== 'number' || menuItem.price < 0) {
    errors.push('Price must be a non-negative number');
  }
  
  if (menuItem.size && !['Small', 'Medium', 'Large'].includes(menuItem.size)) {
    errors.push('Size must be Small, Medium, or Large');
  }
  
  if (menuItem.extraItems && (!Array.isArray(menuItem.extraItems) || menuItem.extraItems.length > 5)) {
    errors.push('ExtraItems must be an array with at most 5 items');
  }
  
  if (menuItem.modifiers) {
    if (!Array.isArray(menuItem.modifiers)) {
      errors.push('Modifiers must be an array');
    } else {
      menuItem.modifiers.forEach((modifier, index) => {
        if (!modifier.name) {
          errors.push(`Modifier ${index}: name is required`);
        }
        if (!Array.isArray(modifier.options) || modifier.options.length < 1) {
          errors.push(`Modifier ${index}: options must be an array with at least one item`);
        }
      });
    }
  }
  
  if (menuItem.promotion) {
    if (menuItem.promotion.type === 'discount') {
      if (typeof menuItem.promotion.amount !== 'number') {
        errors.push('Promotion discount amount must be a number');
      }
    } else if (menuItem.promotion.type === 'bogo') {
      if (!menuItem.promotion.description) {
        errors.push('Promotion BOGO description is required');
      }
    } else {
      errors.push('Promotion type must be either "discount" or "bogo"');
    }
  }
  
  return errors;
};

// Routes for Orders
app.get('/v1/orders', (req, res) => {
  res.status(200).json(db.orders);
});

app.post('/v1/orders', (req, res) => {
  const order = req.body;
  const errors = validateOrder(order);
  
  if (errors.length > 0) {
    return res.status(400).json({
      code: 400,
      message: 'Validation error',
      errors: errors
    });
  }
  
  // Calculate total price
  let totalPrice = 0;
  for (const item of order.items) {
    const menuItem = db.menuItems.find(m => m.id === item.menu_item_id);
    if (!menuItem) {
      return res.status(400).json({
        code: 400,
        message: `Menu item with ID ${item.menu_item_id} not found`
      });
    }
    totalPrice += menuItem.price * item.quantity;
  }
  
  const newOrder = {
    id: db.nextOrderId++,
    customer_name: order.customer_name,
    items: order.items,
    total_price: totalPrice
  };
  
  db.orders.push(newOrder);
  res.status(201).json(newOrder.id);
});

app.delete('/v1/orders/:orderId', (req, res) => {
  const orderId = parseInt(req.params.orderId);
  const orderIndex = db.orders.findIndex(o => o.id === orderId);
  
  if (orderIndex === -1) {
    return res.status(404).json({
      code: 404,
      message: `Order with ID ${orderId} not found`
    });
  }
  
  db.orders.splice(orderIndex, 1);
  res.status(204).send();
});

app.put('/v1/orders/:orderId', (req, res) => {
  const orderId = parseInt(req.params.orderId);
  const orderIndex = db.orders.findIndex(o => o.id === orderId);
  
  if (orderIndex === -1) {
    return res.status(404).json({
      code: 404,
      message: `Order with ID ${orderId} not found`
    });
  }
  
  const order = req.body;
  const errors = validateOrder(order);
  
  if (errors.length > 0) {
    return res.status(400).json({
      code: 400,
      message: 'Validation error',
      errors: errors
    });
  }
  
  // Calculate total price
  let totalPrice = 0;
  for (const item of order.items) {
    const menuItem = db.menuItems.find(m => m.id === item.menu_item_id);
    if (!menuItem) {
      return res.status(400).json({
        code: 400,
        message: `Menu item with ID ${item.menu_item_id} not found`
      });
    }
    totalPrice += menuItem.price * item.quantity;
  }
  
  const updatedOrder = {
    id: orderId,
    customer_name: order.customer_name,
    items: order.items,
    total_price: totalPrice
  };
  
  db.orders[orderIndex] = updatedOrder;
  res.status(200).json(updatedOrder);
});

// Routes for Menu
app.get('/v1/menu', (req, res) => {
  res.status(200).json(db.menuItems);
});

app.get('/v1/menu/:menuId', (req, res) => {
  const menuId = parseInt(req.params.menuId);
  const menuItem = db.menuItems.find(m => m.id === menuId);
  
  if (!menuItem) {
    return res.status(404).json({
      code: 404,
      message: `Menu item with ID ${menuId} not found`
    });
  }
  
  res.status(200).json(menuItem);
});

app.post('/v1/menu', (req, res) => {
  const menuItem = req.body;
  const errors = validateMenuItem(menuItem);
  
  if (errors.length > 0) {
    return res.status(400).json({
      code: 400,
      message: 'Validation error',
      errors: errors
    });
  }
  
  const newMenuItem = {
    ...menuItem,
    id: db.nextMenuItemId++
  };
  
  db.menuItems.push(newMenuItem);
  res.status(200).json(newMenuItem);
});

app.put('/v1/menu/:menuId', (req, res) => {
  const menuId = parseInt(req.params.menuId);
  const menuItemIndex = db.menuItems.findIndex(m => m.id === menuId);
  
  if (menuItemIndex === -1) {
    return res.status(404).json({
      code: 404,
      message: `Menu item with ID ${menuId} not found`
    });
  }
  
  const menuItem = req.body;
  const errors = validateMenuItem(menuItem);
  
  if (errors.length > 0) {
    return res.status(400).json({
      code: 400,
      message: 'Validation error',
      errors: errors
    });
  }
  
  const updatedMenuItem = {
    ...menuItem,
    id: menuId
  };
  
  db.menuItems[menuItemIndex] = updatedMenuItem;
  res.status(200).json(updatedMenuItem);
});

// Apply error handling middleware
app.use(errorHandler);

// Start the server
app.listen(port, () => {
  console.log(`Coffee Shop API server running at http://localhost:${port}`);
});

// Export for testing
module.exports = app; 