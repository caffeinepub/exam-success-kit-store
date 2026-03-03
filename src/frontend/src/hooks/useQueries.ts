import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Order, Stats } from "../backend.d";
import { useActor } from "./useActor";

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      customerName,
      phone,
      address,
      pincode,
      paymentMethod,
      edition,
    }: {
      customerName: string;
      phone: string;
      address: string;
      pincode: string;
      paymentMethod: string;
      edition: string;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.placeOrder(
        customerName,
        phone,
        address,
        pincode,
        paymentMethod,
        edition,
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
      return actor.getOrdersByPhone(phone);
    },
    enabled: !!actor && !isFetching && phone.length >= 10,
  });
}

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["orders", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
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
      return actor.updateOrderStatus(orderId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useGetStats() {
  const { actor, isFetching } = useActor();
  return useQuery<Stats>({
    queryKey: ["stats"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.getStats();
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
