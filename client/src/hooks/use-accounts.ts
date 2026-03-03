import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { authFetch } from "@/lib/fetcher";

export function useAccounts() {
  return useQuery({
    queryKey: [api.accounts.list.path],
    queryFn: async () => {
      const data = await authFetch(api.accounts.list.path);
      // Let's assume the API returns the exact schema array
      return data;
    },
  });
}

export function useAccount(id: number) {
  return useQuery({
    queryKey: [api.accounts.get.path, id],
    queryFn: async () => {
      if (!id) return null;
      const url = api.accounts.get.path.replace(":id", id.toString());
      return await authFetch(url);
    },
    enabled: !!id,
  });
}
