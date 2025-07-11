import { useState } from "react";

import { useApiBase } from "./api/useApiBase";
import {
  type AddressUpdate,
  type CustomerRequest,
  type CustomerResponse,
  type CustomerUpdateRequest,
  type ViaCEP,
} from "@/types/Customer";
import { handleApiError } from "./api/apiErrorHandler";
import api from "@/lib/axios";

// Hook para obter um cliente por ID (usando SWR)
export function useCustomerById(id: string) {
  const { data, error, isLoading } = useApiBase<{ Customer: CustomerRequest }>(
    `/Customers/?id=${id}`
  );
  return {
    Customer: data?.Customer ?? null,
    isLoading,
    isError: error ? String(error) : null,
  };
}

export function useViaCEP(cep: string) {
  const { data, error, isLoading } = useApiBase<ViaCEP>(
    `/core/get-cep/?cep=${cep}`
  );
  return {
    address: data ?? "",
    isLoading,
    isError: error ? String(error) : null,
  };
}
export function useCNPJ(cnpj: string) {
  const { data, error, isLoading } = useApiBase<ViaCEP>(
    `/core/get-cnpj/?cnpj=${cnpj}`
  );
  return {
    address: data ?? "",
    isLoading,
    isError: error ? String(error) : null,
  };
}

export function useCustomerList(page = 1, page_size = 10) {
  const { data, error, isLoading, mutate } = useApiBase<{
    count: number;
    customers: CustomerResponse[]; // Alterado de 'results' para 'products'
  }>(`/customers/?list&page=${page}&page_size=${page_size}`);

  return {
    mutate,
    data,
    customers: data?.customers ?? [], // Acessa a propriedade correta
    totalItems: data?.count ?? 0,
    isLoading,
    isError: error ? String(error) : null,
  };
}

export function useCustomer() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (Customer: CustomerRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post(`/customers/`, Customer);
      return response;
    } catch (error) {
      const formattedError = handleApiError(error);
      setError(formattedError.message);
      throw formattedError;
    } finally {
      setIsLoading(false);
    }
  };

  const update = async (Customer: CustomerUpdateRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.patch(`/customers/`, Customer);
      return response;
    } catch (error) {
      const formattedError = handleApiError(error);
      setError(formattedError.message);
      throw formattedError;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAddress = async (address: AddressUpdate) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.patch(`/customers/address/`, {
        address,
      });
      return response;
    } catch (error) {
      const formattedError = handleApiError(error);
      setError(formattedError.message);
      throw formattedError;
    } finally {
      setIsLoading(false);
    }
  };

  const del = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.delete(`/customers/?id=${id}`, {});
      return response;
    } catch (error) {
      const formattedError = handleApiError(error);
      setError(formattedError.message);
      throw formattedError;
    } finally {
      setIsLoading(false);
    }
  };

  const delAddress = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.delete(`/customers/address/?id=${id}`, {});
      return response;
    } catch (error) {
      const formattedError = handleApiError(error);
      setError(formattedError.message);
      throw formattedError;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    create,
    update,
    updateAddress,
    del,
    delAddress,
  };
}
