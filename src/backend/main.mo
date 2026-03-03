import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";
import Runtime "mo:core/Runtime";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

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
    customName : Text;
    examType : Text;
    bonusPages : Text;
  };

  type Stats = {
    totalOrders : Nat;
    baseOrders : Nat;
    premiumOrders : Nat;
    eliteOrders : Nat;
    totalRevenue : Nat;
    totalProfit : Nat;
    earlyBirdUsed : Nat;
  };

  let orders = Map.empty<Text, Order>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextOrderId = 1;
  var earlyBirdCount = 0;

  // User profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Order management functions
  public shared ({ caller }) func placeOrder(
    customerName : Text,
    phone : Text,
    address : Text,
    pincode : Text,
    paymentMethod : Text,
    edition : Text,
    customName : Text,
    examType : Text,
    bonusPages : Text,
  ) : async Text {
    let orderId = nextOrderId.toText();
    var price = 0;
    var isEarlyBird = false;

    switch (edition) {
      case ("Base") {
        isEarlyBird := earlyBirdCount < 20;
        price := if (isEarlyBird) { 449 } else { 499 };
      };
      case ("Premium") {
        isEarlyBird := earlyBirdCount < 20;
        price := if (isEarlyBird) { 549 } else { 599 };
      };
      case ("Elite") {
        price := 799;
      };
    };

    if (isEarlyBird and (edition == "Base" or edition == "Premium")) {
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
      customName;
      examType;
      bonusPages;
    };

    orders.add(orderId, newOrder);
    nextOrderId += 1;
    orderId;
  };

  // CRITICAL FIX 1: No admin check - any user can look up orders by phone
  public query ({ caller }) func getOrdersByPhone(phone : Text) : async [Order] {
    orders.values().toArray().filter(func(o) { o.phone == phone });
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
    var eliteOrders = 0;
    var totalRevenue = 0;
    var totalProfit = 0;

    for ((_, order) in orders.entries()) {
      totalOrders += 1;
      totalRevenue += order.pricePaid;

      switch (order.edition) {
        case ("Base") { baseOrders += 1 };
        case ("Premium") { premiumOrders += 1 };
        case ("Elite") { eliteOrders += 1 };
        case (_) {};
      };

      switch (order.edition) {
        case ("Base") { totalProfit += order.pricePaid - 245 };
        case ("Premium") { totalProfit += order.pricePaid - 320 };
        case ("Elite") { totalProfit += order.pricePaid - 450 };
        case (_) {};
      };
    };

    {
      totalOrders;
      baseOrders;
      premiumOrders;
      eliteOrders;
      totalRevenue;
      totalProfit;
      earlyBirdUsed = earlyBirdCount;
    };
  };
};

