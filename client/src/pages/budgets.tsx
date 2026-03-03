import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBudgets, useCreateBudget } from "@/hooks/use-budgets";
import { useCategories } from "@/hooks/use-categories";
import { Currency } from "@/components/currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const budgetSchema = z.object({
  categoryId: z.string().min(1, "Select a category"),
  limitAmount: z.coerce.number().positive("Must be greater than 0"),
  period: z.enum(["monthly", "weekly"])
});

export default function Budgets() {
  const { data: budgets, isLoading: budgetsLoading } = useBudgets();
  const { data: categories } = useCategories();
  const createBudget = useCreateBudget();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof budgetSchema>>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { categoryId: "", limitAmount: 0, period: "monthly" },
  });

  function onSubmit(values: z.infer<typeof budgetSchema>) {
    createBudget.mutate({
      categoryId: parseInt(values.categoryId),
      limitAmount: Math.round(values.limitAmount * 100),
      period: values.period,
    }, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      }
    });
  }

  // Helper to find category info
  const getCategory = (id: number) => categories?.find(c => c.id === id) || { name: 'Unknown', icon: '❓', colorHex: '#ccc' };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground mt-1">Manage spending limits by category.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-md">
              <Plus className="w-4 h-4 mr-2" />
              New Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Budget</DialogTitle>
              <DialogDescription>Set a limit for a specific category to track your spending.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map(c => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                              {c.icon} {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="period"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Period</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select period" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="limitAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Limit Amount (€)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full mt-4" disabled={createBudget.isPending}>
                  {createBudget.isPending ? "Saving..." : "Save Budget"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {budgetsLoading ? (
          <div className="col-span-full p-8 text-center text-muted-foreground animate-pulse">Loading budgets...</div>
        ) : budgets?.length === 0 ? (
          <div className="col-span-full border-2 border-dashed border-border rounded-xl p-12 text-center flex flex-col items-center">
            <Target className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">No active budgets</h3>
            <p className="text-muted-foreground max-w-sm mt-2">Create your first budget to start tracking your spending.</p>
          </div>
        ) : (
          budgets?.map((budget: any) => {
            const cat = getCategory(budget.categoryId);
            // Mocking spent amount for hackathon demo purposes
            // In a real app, backend would calculate this from transactions
            const spentMock = Math.floor(Math.random() * budget.limitAmount * 0.8); 
            const percent = Math.min(100, (spentMock / budget.limitAmount) * 100);
            
            return (
              <Card key={budget.id} className="border-border/50 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl" aria-hidden="true">{cat.icon}</span>
                      <CardTitle className="text-lg">{cat.name}</CardTitle>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 bg-secondary rounded-full uppercase tracking-wider text-secondary-foreground">
                      {budget.period}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Spent: <Currency valueInCents={spentMock} className="text-foreground font-medium" /></span>
                      <span className="text-muted-foreground">Limit: <Currency valueInCents={budget.limitAmount} className="font-medium" /></span>
                    </div>
                    <Progress 
                      value={percent} 
                      className="h-2.5" 
                      indicatorColor={percent > 90 ? "bg-destructive" : percent > 75 ? "bg-amber-500" : "bg-primary"}
                    />
                    <p className="text-xs text-right mt-1 font-medium" style={{ color: percent > 90 ? 'hsl(var(--destructive))' : 'var(--muted-foreground)' }}>
                      {percent.toFixed(0)}% utilized
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
