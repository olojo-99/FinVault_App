import { useState } from "react";
import { useAccounts } from "@/hooks/use-accounts";
import { useTransactions } from "@/hooks/use-transactions";
import { Currency } from "@/components/currency";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ArrowDownRight, ArrowUpRight, Receipt, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Transactions() {
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  const activeAccountId = selectedAccountId ? parseInt(selectedAccountId) : accounts?.[0]?.id;
  
  const { data: transactions, isLoading: txLoading } = useTransactions(activeAccountId);

  if (accountsLoading) return <div className="p-8 text-center text-muted-foreground">Loading accounts...</div>;

  const handleAccountChange = (val: string) => {
    setSelectedAccountId(val);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Transactions</h1>
        <p className="text-muted-foreground mt-1">Review your recent account activity.</p>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <label className="text-sm font-medium text-foreground">Select Account:</label>
        <Select 
          value={selectedAccountId || accounts?.[0]?.id?.toString() || ""} 
          onValueChange={handleAccountChange}
        >
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select an account" />
          </SelectTrigger>
          <SelectContent>
            {accounts?.map(acc => (
              <SelectItem key={acc.id} value={acc.id.toString()}>
                {acc.name} - <Currency valueInCents={acc.balance} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/50">
          <CardTitle>History</CardTitle>
          <CardDescription>Recent transactions for selected account</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {txLoading ? (
             <div className="p-12 text-center text-muted-foreground animate-pulse">Loading history...</div>
          ) : !transactions || transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Receipt className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No transactions yet</h3>
              <p className="text-muted-foreground max-w-sm mt-2">When you make transfers or spend money, it will show up here.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {transactions.map((tx: any, i: number) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={tx.id} 
                  className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                      {tx.type === 'credit' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{tx.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{format(new Date(tx.date || new Date()), "MMM dd, yyyy")}</span>
                        {tx.category && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">
                              {tx.category.icon} {tx.category.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Currency 
                      valueInCents={tx.amount} 
                      className={`font-bold ${tx.type === 'credit' ? 'text-success' : 'text-foreground'}`} 
                      showSign={tx.type === 'credit'}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
