import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { authFetch } from "@/lib/fetcher";

export function useTransactions(accountId?: number) {
  return useQuery({
    queryKey: [api.transactions.list.path, accountId],
    queryFn: async () => {
      if (!accountId) return [];
      const url = api.transactions.list.path.replace(":accountId", accountId.toString());
      return await authFetch(url);
    },
    enabled: !!accountId,
  });
}
