import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  type OldOrder = {
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

  type OldActor = {
    orders : Map.Map<Text, OldOrder>;
    nextOrderId : Nat;
    earlyBirdCount : Nat;
  };

  type NewOrder = {
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

  type NewActor = {
    orders : Map.Map<Text, NewOrder>;
    nextOrderId : Nat;
    earlyBirdCount : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newOrders = old.orders.map<Text, OldOrder, NewOrder>(
      func(_id, oldOrder) {
        {
          oldOrder with
          customName = "";
          examType = "";
          bonusPages = "";
        };
      }
    );
    {
      old with
      orders = newOrders;
    };
  };
};
