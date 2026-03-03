import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CancelRequest, Order, Stats } from "../backend.d";
import { useActor } from "./useActor";

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
      paymentMethod,
      edition,
      customName = "",
      examType = "",
      bonusPages = "",
    }: {
      customerName: string;
      phone: string;
      email?: string;
      address: string;
      pincode: string;
      paymentMethod: string;
      edition: string;
      customName?: string;
      examType?: string;
      bonusPages?: string;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.placeOrder(
        customerName,
        phone,
        email,
        address,
        pincode,
        paymentMethod,
        edition,
        customName,
        examType,
        bonusPages,
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
        return await actor.getOrdersByPhone(phone);
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
        return await actor.getOrdersByEmail(email);
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
        return await actor.getAllOrders();
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
        return await actor.getOrderById(orderId);
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
        return await actor.getEarlyBirdCount();
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
        return await actor.updateOrderStatus(orderId, newStatus);
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
        return await actor.getStats();
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
      return actor.isCallerAdmin();
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
      return actor.submitCancelRequest(
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
        return await actor.getAllCancelRequests();
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
      return actor.updateCancelRequest(requestId, newStatus);
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
        return await actor.clearOrders(clearAll);
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
