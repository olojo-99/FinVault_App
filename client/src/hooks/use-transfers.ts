import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { authFetch } from "@/lib/fetcher";
import { useToast } from "@/hooks/use-toast";

export function useTransfer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: typeof api.transfers.create.input._type) => {
      return await authFetch(api.transfers.create.path, {
        method: api.transfers.create.method,
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      // Invalidate accounts and any loaded transactions to reflect new balances
      queryClient.invalidateQueries({ queryKey: [api.accounts.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
      toast({ title: "Transfer Successful", description: "Your funds have been moved." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Transfer Failed", description: error.message });
    }
  });
}
