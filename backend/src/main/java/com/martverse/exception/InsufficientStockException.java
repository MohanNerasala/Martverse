package com.martverse.exception;

public class InsufficientStockException extends RuntimeException {
    public InsufficientStockException(String message) { super(message); }
    public InsufficientStockException(String productName, int requested, int available) {
        super("Insufficient stock for " + productName + ": requested " + requested + ", available " + available);
    }
}
