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
    eliteOrders: bigint;
    premiumOrders: bigint;
    totalProfit: bigint;
    pendingCancelRequests: bigint;
    totalRevenue: bigint;
    earlyBirdUsedBase: bigint;
    earlyBirdUsedPremium: bigint;
    investmentAmount: bigint;
}
export interface CancelRequest {
    id: string;
    status: string;
    customerPhone: string;
    orderId: string;
    timestamp: bigint;
    customerEmail: string;
    requestType: string;
    reason: string;
}
export interface Order {
    id: string;
    customerName: string;
    status: string;
    paymentMethod: string;
    edition: string;
    isEarlyBird: boolean;
    email: string;
    address: string;
    timestamp: bigint;
    customName: string;
    phone: string;
    pricePaid: bigint;
    pincode: string;
    country: string;
    examType: string;
    bonusPages: string;
    dueDate: string;
    priority: string;
    customPriority: boolean;
}
export interface UserProfile {
    name: string;
    email: string;
    phone: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearOrders(clearAll: boolean): Promise<bigint>;
    getAllCancelRequests(): Promise<Array<CancelRequest>>;
    getAllOrders(): Promise<Array<Order>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEarlyBirdCount(): Promise<bigint>;
    getOrderById(orderId: string): Promise<Order | null>;
    getOrdersByEmail(email: string): Promise<Array<Order>>;
    getOrdersByPhone(phone: string): Promise<Array<Order>>;
    getStats(): Promise<Stats>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(customerName: string, phone: string, email: string, address: string, pincode: string, country: string, paymentMethod: string, edition: string, customName: string, examType: string, bonusPages: string, dueDate: string): Promise<string>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitCancelRequest(orderId: string, customerEmail: string, customerPhone: string, reason: string, requestType: string): Promise<string>;
    updateCancelRequest(requestId: string, newStatus: string): Promise<boolean>;
    updateOrderStatus(orderId: string, newStatus: string): Promise<boolean>;
}
