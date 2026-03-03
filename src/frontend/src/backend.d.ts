import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Stats {
    totalOrders: bigint;
    baseOrders: bigint;
    premiumOrders: bigint;
    totalProfit: bigint;
    totalRevenue: bigint;
    earlyBirdUsed: bigint;
}
export interface Order {
    id: string;
    customerName: string;
    status: string;
    paymentMethod: string;
    edition: string;
    isEarlyBird: boolean;
    address: string;
    timestamp: bigint;
    phone: string;
    pricePaid: bigint;
    pincode: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getCallerUserRole(): Promise<UserRole>;
    getOrdersByPhone(phone: string): Promise<Array<Order>>;
    getStats(): Promise<Stats>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(customerName: string, phone: string, address: string, pincode: string, paymentMethod: string, edition: string): Promise<string>;
    updateOrderStatus(orderId: string, newStatus: string): Promise<boolean>;
}
