import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAccounts } from "@/hooks/use-accounts";
import { useTransfer } from "@/hooks/use-transfers";
import { Currency } from "@/components/currency";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft } from "lucide-react";

const transferSchema = z.object({
  fromAccountId: z.string().min(1, "Please select source account"),
  toAccountId: z.string().min(1, "Please select destination account"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
}).refine((data) => data.fromAccountId !== data.toAccountId, {
  message: "Source and destination accounts must be different",
  path: ["toAccountId"]
});

export default function Transfers() {
  const { data: accounts, isLoading } = useAccounts();
  const transfer = useTransfer();

  const form = useForm<z.infer<typeof transferSchema>>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      fromAccountId: "",
      toAccountId: "",
      amount: 0,
    },
  });

  function onSubmit(values: z.infer<typeof transferSchema>) {
    // API expects cents
    const amountInCents = Math.round(values.amount * 100);
    transfer.mutate({
      fromAccountId: parseInt(values.fromAccountId),
      toAccountId: parseInt(values.toAccountId),
      amount: amountInCents,
    }, {
      onSuccess: () => {
        form.reset({ fromAccountId: "", toAccountId: "", amount: 0 });
      }
    });
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Internal Transfer</h1>
        <p className="text-muted-foreground mt-1">Move money instantly between your accounts.</p>
      </div>

      <Card className="border-border/50 shadow-md">
        <CardHeader className="bg-muted/30 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Transfer Funds</CardTitle>
              <CardDescription>Details for the new transaction</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid sm:grid-cols-2 gap-6 relative">
                <FormField
                  control={form.control}
                  name="fromAccountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Account</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {accounts?.map(acc => (
                            <SelectItem key={acc.id} value={acc.id.toString()}>
                              {acc.name} (Balance: <Currency valueInCents={acc.balance} />)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Visual Connector */}
                <div className="hidden sm:flex absolute left-1/2 top-9 -translate-x-1/2 items-center justify-center w-8 h-8 rounded-full bg-background border border-border shadow-sm z-10">
                  <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                </div>

                <FormField
                  control={form.control}
                  name="toAccountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To Account</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select destination" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {accounts?.map(acc => (
                            <SelectItem key={acc.id} value={acc.id.toString()}>
                              {acc.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (€)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00" 
                          className="h-16 pl-8 text-2xl font-semibold"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormDescription>Enter the amount in Euros. It will be converted to cents automatically.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                size="lg"
                className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-primary/25 transition-all hover:-translate-y-0.5"
                disabled={transfer.isPending}
              >
                {transfer.isPending ? "Processing..." : "Complete Transfer"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
