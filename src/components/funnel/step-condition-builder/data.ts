// Sample properties and operators
export const properties = [
  { value: "page", label: "Page viewed" },
  { value: "event", label: "Event triggered" },
  { value: "user", label: "User property" }
];

// Event property types and their operators
export const propertyTypes = {
  string: [
    { value: "equals", label: "equals" },
    { value: "contains", label: "contains" },
    { value: "startsWith", label: "starts with" },
    { value: "endsWith", label: "ends with" },
    { value: "regex", label: "matches regex" },
    { value: "isSet", label: "is set" },
    { value: "isNotSet", label: "is not set" }
  ],
  number: [
    { value: "equalsNumeric", label: "equals" },
    { value: "notEqualsNumeric", label: "not equals" },
    { value: "greaterThanNumeric", label: "greater than" },
    { value: "lessThanNumeric", label: "less than" }
  ],
  boolean: [
    { value: "isTrue", label: "is true" },
    { value: "isFalse", label: "is false" }
  ],
  date: [
    { value: "equals", label: "equals" },
    { value: "greaterThan", label: "after" },
    { value: "lessThan", label: "before" }
  ]
};

// Predefined event properties
export const eventProperties = {
  addToCart: [
    { name: "productId", type: "string", label: "Product ID" },
    { name: "productSku", type: "string", label: "Product SKU" },
    { name: "quantity", type: "number", label: "Quantity" },
    { name: "price", type: "number", label: "Price" },
    { name: "currency", type: "string", label: "Currency" },
    { name: "timestamp", type: "date", label: "Timestamp" }
  ],
  purchaseCompleted: [
    { name: "orderId", type: "string", label: "Order ID" },
    { name: "totalAmount", type: "number", label: "Total Amount" },
    { name: "currency", type: "string", label: "Currency" },
    { name: "paymentMethod", type: "string", label: "Payment Method" },
    { name: "timestamp", type: "date", label: "Timestamp" }
  ],
  pageViewed: [
    { name: "urlPath", type: "string", label: "URL Path" },
    { name: "referrer", type: "string", label: "Referrer" },
    { name: "timestamp", type: "date", label: "Timestamp" }
  ],
  searchPerformed: [
    { name: "query", type: "string", label: "Search Query" },
    { name: "resultCount", type: "number", label: "Result Count" },
    { name: "timestamp", type: "date", label: "Timestamp" }
  ],
  filterApplied: [
    { name: "filterType", type: "string", label: "Filter Type" },
    { name: "filterValue", type: "string", label: "Filter Value" },
    { name: "timestamp", type: "date", label: "Timestamp" }
  ],
  quickAddToCart: [
    { name: "productId", type: "string", label: "Product ID" },
    { name: "productSku", type: "string", label: "Product SKU" },
    { name: "quantity", type: "number", label: "Quantity" },
    { name: "price", type: "number", label: "Price" },
    { name: "timestamp", type: "date", label: "Timestamp" }
  ],
  productPageAddToCart: [
    { name: "productId", type: "string", label: "Product ID" },
    { name: "productSku", type: "string", label: "Product SKU" },
    { name: "quantity", type: "number", label: "Quantity" },
    { name: "price", type: "number", label: "Price" },
    { name: "timestamp", type: "date", label: "Timestamp" }
  ],
  reviewSectionViewed: [
    { name: "productId", type: "string", label: "Product ID" },
    { name: "reviewCount", type: "number", label: "Review Count" },
    { name: "averageRating", type: "number", label: "Average Rating" },
    { name: "timestamp", type: "date", label: "Timestamp" }
  ],
  cartNotEmpty: [
    { name: "itemCount", type: "number", label: "Item Count" },
    { name: "totalValue", type: "number", label: "Total Value" },
    { name: "timestamp", type: "date", label: "Timestamp" }
  ],
  checkoutStarted: [
    { name: "step", type: "string", label: "Checkout Step" },
    { name: "totalAmount", type: "number", label: "Total Amount" },
    { name: "timestamp", type: "date", label: "Timestamp" }
  ],
  productViewed: [
    { name: "productId", type: "string", label: "Product ID" },
    { name: "productSku", type: "string", label: "Product SKU" },
    { name: "category", type: "string", label: "Category" },
    { name: "price", type: "number", label: "Price" },
    { name: "timestamp", type: "date", label: "Timestamp" }
  ],
  wishlistAdded: [
    { name: "productId", type: "string", label: "Product ID" },
    { name: "productSku", type: "string", label: "Product SKU" },
    { name: "timestamp", type: "date", label: "Timestamp" }
  ],
  wishlistRemoved: [
    { name: "productId", type: "string", label: "Product ID" },
    { name: "productSku", type: "string", label: "Product SKU" },
    { name: "timestamp", type: "date", label: "Timestamp" }
  ],
  couponApplied: [
    { name: "couponCode", type: "string", label: "Coupon Code" },
    { name: "discountAmount", type: "number", label: "Discount Amount" },
    { name: "timestamp", type: "date", label: "Timestamp" }
  ],
  couponRemoved: [
    { name: "couponCode", type: "string", label: "Coupon Code" },
    { name: "timestamp", type: "date", label: "Timestamp" }
  ],
  shippingMethodSelected: [
    { name: "method", type: "string", label: "Shipping Method" },
    { name: "cost", type: "number", label: "Shipping Cost" },
    { name: "timestamp", type: "date", label: "Timestamp" }
  ],
  paymentMethodSelected: [
    { name: "method", type: "string", label: "Payment Method" },
    { name: "timestamp", type: "date", label: "Timestamp" }
  ],
  orderConfirmed: [
    { name: "orderId", type: "string", label: "Order ID" },
    { name: "totalAmount", type: "number", label: "Total Amount" },
    { name: "timestamp", type: "date", label: "Timestamp" }
  ],
  orderCancelled: [
    { name: "orderId", type: "string", label: "Order ID" },
    { name: "reason", type: "string", label: "Cancellation Reason" },
    { name: "timestamp", type: "date", label: "Timestamp" }
  ],
  orderRefunded: [
    { name: "orderId", type: "string", label: "Order ID" },
    { name: "refundAmount", type: "number", label: "Refund Amount" },
    { name: "reason", type: "string", label: "Refund Reason" },
    { name: "timestamp", type: "date", label: "Timestamp" }
  ]
};

// Event operators
export const operators = [
  { value: "equals", label: "equals" },
  { value: "contains", label: "contains" },
  { value: "startsWith", label: "starts with" },
  { value: "endsWith", label: "ends with" },
  { value: "regex", label: "matches regex" },
  { value: "isSet", label: "is set" },
  { value: "isNotSet", label: "is not set" },
  { value: "isTrue", label: "is true" },
  { value: "isFalse", label: "is false" },
  { value: "greaterThan", label: "greater than" },
  { value: "lessThan", label: "less than" },
  { value: "equalsNumeric", label: "equals" },
  { value: "notEqualsNumeric", label: "not equals" },
  { value: "greaterThanNumeric", label: "greater than" },
  { value: "lessThanNumeric", label: "less than" }
];

// Predefined events
export const predefinedEvents = [
  { value: "pageViewed", label: "Page Viewed" },
  { value: "addToCart", label: "Add to Cart" },
  { value: "quickAddToCart", label: "Quick Add to Cart" },
  { value: "productPageAddToCart", label: "Product Page Add to Cart" },
  { value: "reviewSectionViewed", label: "Review Section Viewed" },
  { value: "cartNotEmpty", label: "Cart Not Empty" },
  { value: "purchaseCompleted", label: "Purchase Completed" },
  { value: "checkoutStarted", label: "Checkout Started" },
  { value: "productViewed", label: "Product Viewed" },
  { value: "searchPerformed", label: "Search Performed" },
  { value: "filterApplied", label: "Filter Applied" },
  { value: "wishlistAdded", label: "Added to Wishlist" },
  { value: "wishlistRemoved", label: "Removed from Wishlist" },
  { value: "couponApplied", label: "Coupon Applied" },
  { value: "couponRemoved", label: "Coupon Removed" },
  { value: "shippingMethodSelected", label: "Shipping Method Selected" },
  { value: "paymentMethodSelected", label: "Payment Method Selected" },
  { value: "orderConfirmed", label: "Order Confirmed" },
  { value: "orderCancelled", label: "Order Cancelled" },
  { value: "orderRefunded", label: "Order Refunded" }
];
