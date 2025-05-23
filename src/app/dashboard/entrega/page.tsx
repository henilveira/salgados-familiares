"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DataTable } from "@/components/datatable";
import { SiteHeader } from "@/components/site-header";
import { ProductsSkeletonLoading } from "@/components/skeleton";
import { columns, useDrawerConfig } from "./data-config";

import { useOrder, useOrderList } from "@/hooks/useOrder";
import {
  OrderResponse,
  OrderUpdateRequest,
  orderUpdateRequestSchema,
} from "@/types/Order";
import { OrdersSkeletonLoading } from "@/components/ui/base-skeleton";

export default function OrdersPage() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const { update, error: updateError } = useOrder();
  const { orders, isLoading, isError, totalItems, mutate } = useOrderList(
    pagination.pageIndex + 1,
    pagination.pageSize
  );

  // form methods for drawer
  const drawerConfig = useDrawerConfig();

  const handlePaginationChange = useCallback((newPagination: any) => {
    setPagination({
      pageIndex: newPagination.pageIndex,
      pageSize: newPagination.pageSize,
    });
  }, []);

  const handleUpdateOrder = async (
    original: OrderResponse,
    updated: OrderUpdateRequest
  ) => {
    const payload = {
      id: original.id,
      is_delivered: true,
      order_status_id: "9a9fc47a-4fb0-429a-b39f-d2b815015eaf"
    };
    try {
      await update(payload);
      toast.success("Pedido entregue com sucesso!");
      mutate();
    } catch (error) {
      toast.error("Falha ao atualizar pedido.", {
        description: updateError || String(error),
        duration: 3000,
      });
      throw error;
    }
  };

    if (isLoading) {
      return <OrdersSkeletonLoading />
    }

    const filteredOrders = (orders || []).filter(
      (o: { order_status: { identifier: number } }) => o.order_status.identifier === 2
    );
    

  return (
    <div className="flex flex-col gap-4">
      <SiteHeader title="Entregas" />

      {isLoading ? (
        <ProductsSkeletonLoading />
      ) : isError ? (
        <div className="p-4 text-center text-red-500">
          Erro ao carregar pedidos: {String(isError)}
        </div>
      ) : (
          <DataTable<OrderResponse, OrderUpdateRequest>
            updateSchema={orderUpdateRequestSchema}
            drawerConfig={drawerConfig}
            title="Pedidos esperando por entrega"
            columns={columns}
            data={filteredOrders || []}
            totalCount={totalItems || 0}
            pageSize={pagination.pageSize}
            currentPage={pagination.pageIndex}
            onUpdate={handleUpdateOrder}
            onPaginationChange={handlePaginationChange}
            mutate={mutate}
            saveButtonText="Finalizar entrega"
            savingButtonText="Finalizando..."
          />
      )}
    </div>
  );
}