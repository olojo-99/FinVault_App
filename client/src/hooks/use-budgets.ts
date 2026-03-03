import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { authFetch } from "@/lib/fetcher";
import { useToast } from "@/hooks/use-toast";

export function useBudgets() {
  return useQuery({
    queryKey: [api.budgets.list.path],
    queryFn: async () => {
      return await authFetch(api.budgets.list.path);
    },
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: typeof api.budgets.create.input._type) => {
      return await authFetch(api.budgets.create.path, {
        method: api.budgets.create.method,
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.budgets.list.path] });
      toast({ title: "Budget Created", description: "Your new budget has been set." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Creation Failed", description: error.message });
    }
  });
}
