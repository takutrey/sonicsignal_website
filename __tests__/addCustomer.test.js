// addCustomer.test.js
const db = require("../config/config");
const Orders = require("../models/orders");
const OrderProducts = require("../models/orderproducts");
const Product = require("../models/product");
const Customers = require("../models/customers");
const {addCustomer} = require("../controllers/customer");

describe("addCustomer", () => {
  let req, res, transaction;

  beforeEach(() => {
    transaction = {
      commit: jest.fn(),
      rollback: jest.fn(),
    };
    db.transaction = jest.fn().mockResolvedValue(transaction);

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it("should create a new customer and order successfully", async () => {
    req = {
      body: {
        orderNumber: "ORD-001",
        customer: {
          fullName: "John Doe",
          email: "john@example.com",
          phone: "123456789",
          address: "123 Main St",
        },
        items: [{ id: 1, quantity: 2 }],
        orderType: "online",
        paymentMethod: "card",
        total: 100,
      },
    };

    Customers.findOne = jest.fn().mockResolvedValue(null);
    Customers.create = jest.fn().mockResolvedValue({ id: 1, ...req.body.customer });
    Orders.create = jest.fn().mockResolvedValue({ id: 10, customerId: 1 });
    Product.findOne = jest.fn().mockResolvedValue({ id: 1, name: "Product A", quantity: 5, price: 50 });
    OrderProducts.create = jest.fn().mockResolvedValue({});
    Product.update = jest.fn().mockResolvedValue([1]);

    await addCustomer(req, res);

    expect(Customers.findOne).toHaveBeenCalledWith({ where: { email: "john@example.com" } });
    expect(Customers.create).toHaveBeenCalled();
    expect(Orders.create).toHaveBeenCalled();
    expect(OrderProducts.create).toHaveBeenCalledTimes(1);
    expect(Product.update).toHaveBeenCalledTimes(1);
    expect(transaction.commit).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("should use existing customer without creating a new one", async () => {
    req = {
      body: {
        orderNumber: "ORD-002",
        customer: {
          fullName: "Jane Smith",
          email: "jane@example.com",
          phone: "987654321",
          address: "456 Market St",
        },
        items: [{ id: 1, quantity: 1 }],
        orderType: "pickup",
        paymentMethod: "cash",
        total: 50,
      },
    };

    const existingCustomer = { id: 42, ...req.body.customer };

    Customers.findOne = jest.fn().mockResolvedValue(existingCustomer);
    Customers.create = jest.fn();
    Orders.create = jest.fn().mockResolvedValue({ id: 20, customerId: 42 });
    Product.findOne = jest.fn().mockResolvedValue({ id: 1, name: "Product B", quantity: 3, price: 50 });
    OrderProducts.create = jest.fn().mockResolvedValue({});
    Product.update = jest.fn().mockResolvedValue([1]);

    await addCustomer(req, res);

    expect(Customers.create).not.toHaveBeenCalled();
    expect(Orders.create).toHaveBeenCalledWith(
      expect.objectContaining({ customerId: 42, total_amount: 50, order_type: "pickup" }),
      { transaction }
    );
    expect(transaction.commit).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("should handle multiple items and process each one", async () => {
    req = {
      body: {
        orderNumber: "ORD-003",
        customer: {
          fullName: "Mark Taylor",
          email: "mark@example.com",
          phone: "777777777",
          address: "789 Elm St",
        },
        items: [
          { id: 1, quantity: 1 },
          { id: 2, quantity: 2 },
        ],
        orderType: "delivery",
        paymentMethod: "card",
        total: 200,
      },
    };

    Customers.findOne = jest.fn().mockResolvedValue(null);
    Customers.create = jest.fn().mockResolvedValue({ id: 7, ...req.body.customer });
    Orders.create = jest.fn().mockResolvedValue({ id: 30, customerId: 7 });

    // Mock Product.findOne differently for each item
    Product.findOne = jest
      .fn()
      .mockResolvedValueOnce({ id: 1, name: "Product A", quantity: 5, price: 50 })
      .mockResolvedValueOnce({ id: 2, name: "Product B", quantity: 10, price: 75 });

    OrderProducts.create = jest.fn().mockResolvedValue({});
    Product.update = jest.fn().mockResolvedValue([1]);

    await addCustomer(req, res);

    expect(Product.findOne).toHaveBeenCalledTimes(2);
    expect(OrderProducts.create).toHaveBeenCalledTimes(2);
    expect(Product.update).toHaveBeenCalledTimes(2);
    expect(transaction.commit).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("should return 400 if product quantity is insufficient", async () => {
    req = {
      body: {
        customer: { fullName: "John", email: "john@example.com" },
        items: [{ id: 1, quantity: 10 }],
        orderType: "online",
        paymentMethod: "card",
        total: 100,
      },
    };

    Customers.findOne = jest.fn().mockResolvedValue({ id: 1 });
    Orders.create = jest.fn().mockResolvedValue({ id: 10 });
    Product.findOne = jest.fn().mockResolvedValue({ id: 1, name: "Product A", quantity: 5, price: 50 });

    await addCustomer(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(transaction.commit).not.toHaveBeenCalled();
    expect(transaction.rollback).not.toHaveBeenCalled();
  });

  it("should rollback transaction on error", async () => {
    req = {
      body: {
        customer: { fullName: "John", email: "john@example.com" },
        items: [{ id: 1, quantity: 1 }],
        orderType: "online",
        paymentMethod: "card",
        total: 100,
      },
    };

    Customers.findOne = jest.fn().mockRejectedValue(new Error("DB error"));

    await addCustomer(req, res);

    expect(transaction.rollback).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Internal server error" })
    );
  });
});
