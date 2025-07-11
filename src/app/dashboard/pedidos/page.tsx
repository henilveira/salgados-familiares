"use client";

import { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DataTable } from "@/components/datatable";
import { SiteHeader } from "@/components/site-header";
import { DialogPedidos } from "./_components/dialog";
import { OrdersSkeletonLoading } from "@/components/ui/base-skeleton";
import { columns, useDrawerConfig } from "./_components/data-config";
import { useOrder, useOrderList } from "@/hooks/useOrder";
import {
  type OrderResponse,
  type OrderUpdateRequest,
  orderUpdateRequestSchema,
} from "@/types/Order";
import { DrawerFormProvider } from "@/contexts/DrawerFormContext";
import { Button } from "@/components/ui/button";
import { AlertFinishWork } from "@/components/alerts";

export default function OrdersPage() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [finishWorkDialog, setfinishWorkDialog] = useState(false);

  const { update, error: updateError, finishWork, del } = useOrder();
  const { orders, isLoading, isError, totalItems, mutate } = useOrderList(
    pagination.pageIndex + 1,
    pagination.pageSize
  );

  // form methods for drawer
  const formMethods = useForm<OrderUpdateRequest>();
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
      ...updated,
    };
    try {
      await update(payload);
      toast.success("Pedido atualizado com sucesso!");
      mutate();
    } catch (error) {
      toast.error("Falha ao atualizar pedido.", {
        description: updateError || String(error),
        duration: 3000,
      });
      throw error;
    }
  };

  const handleOpenDialog = () => {
    setfinishWorkDialog(true);
  };

  const handleDeleteOrder = async (item: string) => {
    try {
      await del(item);
      toast.success("Pedido exlcuido com sucesso!");
      mutate();
    } catch (error) {
      toast.error("Falha ao excluir pedido", {
        description: updateError || String(error),
        duration: 3000,
      });
      throw error;
    }
  };

  const handleFinishWork = async () => {
    try {
      await finishWork();
      toast.success("Expediente finalizado com sucesso!", {
        description: "Todos seus pedidos foram enviados para logística",
      });
      mutate();
    } catch (error) {
      toast.error("Falha ao atualizar pedido.", {
        description: updateError || String(error),
        duration: 3000,
      });
      throw error;
    }
  };

  const ascendingOrders = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];
    
    return [...orders].sort((a, b) => {
      // Conversão segura para números
      const orderA = Number(a.order_number) || 0;
      const orderB = Number(b.order_number) || 0;
      
      // Ordenação ascendente (1, 2, 3, 4...)
      return orderA - orderB;
    });
  }, [orders]);
  

  // Show skeleton while loading
  if (isLoading) {
    return <OrdersSkeletonLoading />;
  }

  return (
    <div className="flex flex-col gap-4">
      <SiteHeader
        title="Pedidos"
        button={
          <div className="space-x-2 flex items-center">
            <Button variant={"outline"} onClick={() => handleOpenDialog()}>
              Finalizar expediente
            </Button>
            <DialogPedidos />
          </div>
        }
      />

      {isError ? (
        <div className="p-4 text-center text-red-500">
          Erro ao carregar pedidos: {String(isError)}
        </div>
      ) : (
        <DrawerFormProvider formMethods={formMethods}>
          <DataTable<OrderResponse, OrderUpdateRequest>
            updateSchema={orderUpdateRequestSchema}
            drawerConfig={drawerConfig}
            title="Pedidos"
            columns={columns}
            data={ascendingOrders || []}
            totalCount={totalItems || 0}
            pageSize={pagination.pageSize}
            currentPage={pagination.pageIndex}
            onUpdate={handleUpdateOrder}
            onPaginationChange={handlePaginationChange}
            mutate={mutate} 
            onDelete={(item) => handleDeleteOrder(item.id)}
          />
        </DrawerFormProvider>
      )}
      <AlertFinishWork
        open={finishWorkDialog}
        onOpenChange={setfinishWorkDialog}
        onConfirm={handleFinishWork}
      />
    </div>
  );
}
