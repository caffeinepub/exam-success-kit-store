import Map "mo:core/Map";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
    phone : Text;
    email : Text;
  };

  public type Order = {
    id : Text;
    customerName : Text;
    phone : Text;
    email : Text;
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

  public type CancelRequest = {
    id : Text;
    orderId : Text;
    customerEmail : Text;
    customerPhone : Text;
    reason : Text;
    requestType : Text;
    timestamp : Int;
    status : Text;
  };

  public type Stats = {
    totalOrders : Nat;
    baseOrders : Nat;
    premiumOrders : Nat;
    eliteOrders : Nat;
    totalRevenue : Nat;
    totalProfit : Nat;
    earlyBirdUsed : Nat;
    pendingCancelRequests : Nat;
  };

  let orders = Map.empty<Text, Order>();
  let cancelRequests = Map.empty<Text, CancelRequest>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextOrderId = 1;
  var nextRequestId = 1;
  var earlyBirdCount = 0;

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
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

  public shared ({ caller }) func placeOrder(
    customerName : Text,
    phone : Text,
    email : Text,
    address : Text,
    pincode : Text,
    paymentMethod : Text,
    edition : Text,
    customName : Text,
    examType : Text,
    bonusPages : Text,
  ) : async Text {
    let orderId = "ORD-" # nextOrderId.toText();
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
      case (_) {
        Runtime.trap("Invalid edition type. Must be 'Base', 'Premium', or 'Elite'");
      };
    };

    if (isEarlyBird and (
      edition == "Base" or edition == "Premium"
    )) {
      earlyBirdCount += 1;
    };

    let newOrder : Order = {
      id = orderId;
      customerName;
      phone;
      email;
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

  public query ({ caller }) func getAllOrders() : async [Order] {
    orders.values().toArray();
  };

  public query ({ caller }) func getOrderById(orderId : Text) : async ?Order {
    orders.get(orderId);
  };

  public query ({ caller }) func getOrdersByPhone(phone : Text) : async [Order] {
    let iter = orders.values();
    iter.filter(func(o) { o.phone == phone }).toArray();
  };

  public query ({ caller }) func getOrdersByEmail(email : Text) : async [Order] {
    let iter = orders.values();
    iter.filter(func(o) { o.email == email }).toArray();
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Text, newStatus : Text) : async Bool {
    switch (orders.get(orderId)) {
      case (null) { false };
      case (?order) {
        let updatedOrder : Order = { order with status = newStatus };
        orders.add(orderId, updatedOrder);
        true;
      };
    };
  };

  public shared ({ caller }) func submitCancelRequest(
    orderId : Text,
    customerEmail : Text,
    customerPhone : Text,
    reason : Text,
    requestType : Text,
  ) : async Text {
    let requestId = nextRequestId.toText();
    let newRequest : CancelRequest = {
      id = requestId;
      orderId;
      customerEmail;
      customerPhone;
      reason;
      requestType;
      timestamp = Time.now();
      status = "Pending";
    };

    cancelRequests.add(requestId, newRequest);
    nextRequestId += 1;
    requestId;
  };

  public query ({ caller }) func getAllCancelRequests() : async [CancelRequest] {
    cancelRequests.values().toArray();
  };

  public shared ({ caller }) func updateCancelRequest(requestId : Text, newStatus : Text) : async Bool {
    switch (cancelRequests.get(requestId)) {
      case (null) { false };
      case (?request) {
        let updatedRequest : CancelRequest = { request with status = newStatus };
        cancelRequests.add(requestId, updatedRequest);
        true;
      };
    };
  };

  public shared ({ caller }) func clearOrders(clearAll : Bool) : async Nat {
    var deletedCount = 0;

    if (clearAll) {
      deletedCount := orders.size();
      orders.clear();
    } else {
      let toKeep = Map.empty<Text, Order>();
      for ((orderId, order) in orders.entries()) {
        if (order.status != "Delivered") {
          toKeep.add(orderId, order);
        } else {
          deletedCount += 1;
        };
      };
      orders.clear();
      toKeep.entries().forEach(
        func((orderId, order)) {
          orders.add(orderId, order);
        }
      );
    };

    deletedCount;
  };

  public query ({ caller }) func getStats() : async Stats {
    var totalOrders = 0;
    var baseOrders = 0;
    var premiumOrders = 0;
    var eliteOrders = 0;
    var totalRevenue = 0;
    var totalProfit = 0;
    var pendingCancelRequests = 0;

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

    for ((_, request) in cancelRequests.entries()) {
      if (request.status == "Pending") {
        pendingCancelRequests += 1;
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
      pendingCancelRequests;
    };
  };

  public query ({ caller }) func getEarlyBirdCount() : async Nat {
    earlyBirdCount;
  };
};
