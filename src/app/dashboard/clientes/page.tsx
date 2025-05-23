"use client";

import { DataTable } from "@/components/datatable";
import { SiteHeader } from "@/components/site-header";
import { DialogClientes } from "./_components/dialog";
import { ProductsSkeletonLoading } from "@/components/skeleton";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { columns, useDrawerConfig } from "./_components/data-config";
import {
  CustomerResponse,
  CustomerUpdateRequest,
  CustomerUpdateRequestSchema,
} from "@/types/Customer";
import { useCustomer, useCustomerList } from "@/hooks/useCustomer";
import { OrdersSkeletonLoading } from "@/components/ui/base-skeleton";

type PaginationType = {
  pageIndex: number;
  pageSize: number;
  [key: string]: unknown; // Caso haja propriedades adicionais
};

export default function ClientsPage() {
  const [pagination, setPagination] = useState<PaginationType>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { update, error: updateError, del } = useCustomer();
  const { customers, isLoading, isError, totalItems, mutate } = useCustomerList(
    pagination.pageIndex + 1,
    pagination.pageSize
  );

  const drawerConfig = useDrawerConfig()

  // No handlePaginationChange:
  const handlePaginationChange = useCallback((newPagination: any) => {
    setPagination({
      pageIndex: newPagination.pageIndex,
      pageSize: newPagination.pageSize,
    });
  }, []);

  const handleUpdateProduct = async (
    original: CustomerResponse,
    updated: CustomerUpdateRequest
  ) => {
    const payload = {
      id: original.id,
      ...updated,
    };

    try {
      await update(payload);
      toast.success("Cliente atualizado com sucesso!");
    } catch (error) {
      toast.error("Falha, tente novamente mais tarde!", {
        description: updateError || String(error),
        duration: 3000,
      });
      throw error;
    }
  };

  const handleDeleteCustomer = async (item: string) => {
    try {
      await del(item);
      toast.success("Cliente exlcuido com sucesso!");
      mutate();
    } catch (error) {
      toast.error("Falha ao excluir cliente", {
        description: updateError || String(error),
        duration: 3000,
      });
      throw error;
    }
  };

    if (isLoading) {
      return <OrdersSkeletonLoading />
    }

  return (
    <div>
      <div className="flex flex-col gap-4">
        <SiteHeader title="Clientes" button={<DialogClientes />} />

        {isLoading ? (
          <ProductsSkeletonLoading />
        ) : isError ? (
          <div className="p-4 text-center text-red-500">
            Erro ao carregar clientes: {isError}
          </div>
        ) : (
          <DataTable
            updateSchema={CustomerUpdateRequestSchema}
            drawerConfig={drawerConfig}
            title="Clientes"
            columns={columns}
            data={customers || []}
            totalCount={totalItems || 0}
            pageSize={pagination.pageSize}
            currentPage={pagination.pageIndex}
            onUpdate={handleUpdateProduct}
            onPaginationChange={handlePaginationChange}
            mutate={mutate}
            onDelete={(item) => handleDeleteCustomer(item.id)}
          />
        )}
      </div>
    </div>
  );
}
