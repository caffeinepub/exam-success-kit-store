import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Order = {
    id : Text;
    customerName : Text;
    phone : Text;
    address : Text;
    pincode : Text;
    paymentMethod : Text;
    edition : Text;
    status : Text;
    timestamp : Int;
    isEarlyBird : Bool;
    pricePaid : Nat;
  };

  // Stats record
  type Stats = {
    totalOrders : Nat;
    baseOrders : Nat;
    premiumOrders : Nat;
    totalRevenue : Nat;
    totalProfit : Nat;
    earlyBirdUsed : Nat;
  };

  let orders = Map.empty<Text, Order>();
  var nextOrderId = 1;
  var earlyBirdCount = 0;

  public shared ({ caller }) func placeOrder(
    customerName : Text,
    phone : Text,
    address : Text,
    pincode : Text,
    paymentMethod : Text,
    edition : Text,
  ) : async Text {
    let orderId = nextOrderId.toText();
    let isEarlyBird = earlyBirdCount < 20;

    let price = switch (edition) {
      case ("Base") {
        if (isEarlyBird) { 449 } else { 499 };
      };
      case ("Premium") {
        if (isEarlyBird) { 549 } else { 599 };
      };
      case (_) { 0 };
    };

    if (isEarlyBird) {
      earlyBirdCount += 1;
    };

    let newOrder : Order = {
      id = orderId;
      customerName;
      phone;
      address;
      pincode;
      paymentMethod;
      edition;
      status = "Pending";
      timestamp = Time.now();
      isEarlyBird;
      pricePaid = price;
    };

    orders.add(orderId, newOrder);
    nextOrderId += 1;
    orderId;
  };

  public query ({ caller }) func getOrdersByPhone(phone : Text) : async [Order] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can query orders by phone number");
    };
    let orderList = List.empty<Order>();
    for ((_, order) in orders.entries()) {
      if (order.phone == phone) {
        orderList.add(order);
      };
    };
    orderList.toArray();
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can get all orders");
    };
    orders.values().toArray();
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Text, newStatus : Text) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can update order status");
    };

    switch (orders.get(orderId)) {
      case (null) { false };
      case (?order) {
        let updatedOrder : Order = { order with status = newStatus };
        orders.add(orderId, updatedOrder);
        true;
      };
    };
  };

  public query ({ caller }) func getStats() : async Stats {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can get stats");
    };

    var totalOrders = 0;
    var baseOrders = 0;
    var premiumOrders = 0;
    var totalRevenue = 0;
    var totalProfit = 0;

    for ((_, order) in orders.entries()) {
      totalOrders += 1;
      totalRevenue += order.pricePaid;

      if (order.edition == "Base") {
        baseOrders += 1;
      } else if (order.edition == "Premium") {
        premiumOrders += 1;
      };

      switch (order.edition) {
        case ("Base") { totalProfit += order.pricePaid - 350 };
        case ("Premium") { totalProfit += order.pricePaid - 400 };
        case (_) {};
      };
    };

    {
      totalOrders;
      baseOrders;
      premiumOrders;
      totalRevenue;
      totalProfit;
      earlyBirdUsed = earlyBirdCount;
    };
  };
};
