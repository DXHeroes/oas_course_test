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
  
  // Check required properties
  if (!order.hasOwnProperty('customer_name')) {
    errors.push('customer_name is required');
  } else if (order.customer_name.length < 3 || order.customer_name.length > 50) {
    errors.push('Customer name must be between 3 and 50 characters');
  }
  
  if (!order.hasOwnProperty('items')) {
    errors.push('items is required');
  } else if (!Array.isArray(order.items)) {
    errors.push('items must be an array');
  } else if (order.items.length === 0) {
    errors.push('Order must contain at least one item');
  } else {
    order.items.forEach((item, index) => {
      // Check required properties for each order item
      if (!item.hasOwnProperty('menu_item_id')) {
        errors.push(`Item ${index}: menu_item_id is required`);
      } else if (typeof item.menu_item_id !== 'number') {
        errors.push(`Item ${index}: menu_item_id must be a number`);
      }
      
      if (!item.hasOwnProperty('quantity')) {
        errors.push(`Item ${index}: quantity is required`);
      } else if (typeof item.quantity !== 'number' || item.quantity < 1) {
        errors.push(`Item ${index}: quantity must be a positive number and at least 1`);
      }
    });
  }

  if(order.total_price !== undefined) {
    if(typeof order.total_price !== 'number' || order.total_price < 0) {
      errors.push('total_price must be a non-negative number');
    }
  }
  
  return errors;
};


// Routes for Orders
app.get('/v1/orders', (req, res) => {
  console.log('Getting all orders', db.orders);
  res.status(200).json(db.orders);
});

app.post('/v1/orders', (req, res) => {
  console.log('Creating new order', req.body);
  const order = req.body;
  const errors = validateOrder(order);

  console.log(errors);
  
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

  console.log('New order created', db.orders);
  res.status(201).json(newOrder.id);
});

app.delete('/v1/orders/:orderId', (req, res) => {
  if(!req.params.orderId) {
    return res.status(400).json({
      code: 400,
      message: 'Order ID is required'
    });
  }
  
  const orderId = parseInt(req.params.orderId);

  if(isNaN(orderId)) {
    return res.status(400).json({
      code: 400,
      message: 'Order ID must be a number'
    });
  }
  const orderIndex = db.orders.findIndex(o => o.id === orderId);
  
  if (orderIndex === -1) {
    return res.status(404).json({
      code: 404,
      message: `Order with ID ${orderId} not found`
    });
  }
  
  db.orders.splice(orderIndex, 1);
  console.log('Order deleted', db.orders);
  res.status(204).send();
});

app.put('/v1/orders/:orderId', (req, res) => {

  if(!req.params.orderId) {
    return res.status(400).json({
      code: 400,
      message: 'Order ID is required'
    });
  }
  
  const orderId = parseInt(req.params.orderId);

  if(isNaN(orderId)) {
    return res.status(400).json({
      code: 400,
      message: 'Order ID must be a number'
    });
  }
  
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

  console.log('Order updated', db.orders);
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

// Apply error handling middleware
app.use(errorHandler);

// Start the server
app.listen(port, () => {
  console.log(`Coffee Shop API server running at http://localhost:${port}`);
});

// Export for testing
module.exports = app; 