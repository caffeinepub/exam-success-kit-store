import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type UserProfile = {
    name : Text;
    phone : Text;
    email : Text;
  };

  type Order = {
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

  type CancelRequest = {
    id : Text;
    orderId : Text;
    customerEmail : Text;
    customerPhone : Text;
    reason : Text;
    requestType : Text;
    timestamp : Int;
    status : Text;
  };

  type OldActor = {
    orders : Map.Map<Text, Order>;
    cancelRequests : Map.Map<Text, CancelRequest>;
    userProfiles : Map.Map<Principal.Principal, UserProfile>;
    nextOrderId : Nat;
    nextRequestId : Nat;
    earlyBirdCount : Nat;
  };

  type NewActor = OldActor;

  public func run(old : OldActor) : NewActor {
    old;
  };
};
