import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CancelRequest, Order, Stats } from "../backend.d";
import { useActor } from "./useActor";

// The backend.ts wrapper is auto-generated from an older schema (10-arg placeOrder,
// no country/dueDate/priority on Order). backend.d.ts reflects the CURRENT Motoko backend.
// We cast at the actor boundary so the rest of the app uses the correct types.
type BackendActor = {
  placeOrder(
    customerName: string,
    phone: string,
    email: string,
    address: string,
    pincode: string,
    country: string,
    paymentMethod: string,
    edition: string,
    customName: string,
    examType: string,
    bonusPages: string,
    dueDate: string,
  ): Promise<string>;
  getAllOrders(): Promise<Order[]>;
  getOrdersByPhone(phone: string): Promise<Order[]>;
  getOrdersByEmail(email: string): Promise<Order[]>;
  getOrderById(orderId: string): Promise<Order | null>;
  getStats(): Promise<Stats>;
  getEarlyBirdCount(): Promise<bigint>;
  updateOrderStatus(orderId: string, newStatus: string): Promise<boolean>;
  isCallerAdmin(): Promise<boolean>;
  submitCancelRequest(
    orderId: string,
    customerEmail: string,
    customerPhone: string,
    reason: string,
    requestType: string,
  ): Promise<string>;
  getAllCancelRequests(): Promise<CancelRequest[]>;
  updateCancelRequest(requestId: string, newStatus: string): Promise<boolean>;
  clearOrders(clearAll: boolean): Promise<bigint>;
};

function getTypedActor(actor: unknown): BackendActor {
  return actor as BackendActor;
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      customerName,
      phone,
      email = "",
      address,
      pincode,
      country = "India",
      paymentMethod,
      edition,
      customName = "",
      examType = "",
      bonusPages = "",
      dueDate = "",
    }: {
      customerName: string;
      phone: string;
      email?: string;
      address: string;
      pincode: string;
      country?: string;
      paymentMethod: string;
      edition: string;
      customName?: string;
      examType?: string;
      bonusPages?: string;
      dueDate?: string;
    }) => {
      let resolvedActor = actor;
      if (!resolvedActor) {
        try {
          const { createActorWithConfig } = await import("../config");
          resolvedActor = await createActorWithConfig();
        } catch (_e) {
          throw new Error(
            "Could not connect to store. Please refresh and try again.",
          );
        }
      }
      return getTypedActor(resolvedActor).placeOrder(
        customerName,
        phone,
        email,
        address,
        pincode,
        country,
        paymentMethod,
        edition,
        customName,
        examType,
        bonusPages,
        dueDate,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useGetOrdersByPhone(phone: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["orders", "phone", phone],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await getTypedActor(actor).getOrdersByPhone(phone);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && phone.length >= 10,
  });
}

export function useGetOrdersByEmail(email: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["orders", "email", email],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await getTypedActor(actor).getOrdersByEmail(email);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && email.includes("@"),
  });
}

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["orders", "all"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await getTypedActor(actor).getAllOrders();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetOrderById(orderId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Order | null>({
    queryKey: ["order", "id", orderId],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await getTypedActor(actor).getOrderById(orderId);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && orderId.trim().length > 0,
  });
}

export function useGetEarlyBirdCount() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["earlyBirdCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      try {
        return await getTypedActor(actor).getEarlyBirdCount();
      } catch {
        return BigInt(0);
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      newStatus,
    }: { orderId: string; newStatus: string }) => {
      if (!actor) throw new Error("Actor not initialized");
      try {
        return await getTypedActor(actor).updateOrderStatus(orderId, newStatus);
      } catch {
        return false;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["cancelRequests"] });
    },
  });
}

export function useGetStats() {
  const { actor, isFetching } = useActor();
  return useQuery<Stats | null>({
    queryKey: ["stats"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await getTypedActor(actor).getStats();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return getTypedActor(actor).isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitCancelRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      customerEmail,
      customerPhone,
      reason,
      requestType,
    }: {
      orderId: string;
      customerEmail: string;
      customerPhone: string;
      reason: string;
      requestType: string;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return getTypedActor(actor).submitCancelRequest(
        orderId,
        customerEmail,
        customerPhone,
        reason,
        requestType,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cancelRequests"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useGetAllCancelRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<CancelRequest[]>({
    queryKey: ["cancelRequests"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await getTypedActor(actor).getAllCancelRequests();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateCancelRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      requestId,
      newStatus,
    }: { requestId: string; newStatus: string }) => {
      if (!actor) throw new Error("Actor not initialized");
      return getTypedActor(actor).updateCancelRequest(requestId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cancelRequests"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useClearOrders() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ clearAll }: { clearAll: boolean }) => {
      if (!actor) throw new Error("Actor not initialized");
      try {
        return await getTypedActor(actor).clearOrders(clearAll);
      } catch {
        return BigInt(0);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["cancelRequests"] });
    },
  });
}

export function useSetOrderPriority() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      priority,
    }: { orderId: string; priority: string }) => {
      if (!actor) throw new Error("Actor not initialized");
      return (actor as any).setOrderPriority(orderId, priority, true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
