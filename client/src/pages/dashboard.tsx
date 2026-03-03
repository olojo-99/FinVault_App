import { useAccounts } from "@/hooks/use-accounts";
import { Currency } from "@/components/currency";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wallet, CreditCard, PiggyBank, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: accounts, isLoading } = useAccounts();

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading vault data...</div>;
  }

  const accountsList = accounts || [];
  const totalNetWorth = accountsList.reduce((sum, acc) => sum + acc.balance, 0);

  const getAccountIcon = (type: string) => {
    switch(type.toLowerCase()) {
      case 'checking': return <Wallet className="w-5 h-5 text-blue-500" />;
      case 'savings': return <PiggyBank className="w-5 h-5 text-green-500" />;
      case 'credit': return <CreditCard className="w-5 h-5 text-purple-500" />;
      default: return <Vault className="w-5 h-5 text-primary" />;
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Here's a summary of your finances.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/transfers" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Make Transfer
          </Link>
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {/* Net Worth Card - Spans full or partial depending on grid */}
        <motion.div variants={item} className="md:col-span-2 lg:col-span-3">
          <Card className="bg-gradient-premium border-0 shadow-lg text-white overflow-hidden relative">
            <div className="absolute right-0 top-0 opacity-10 scale-150 transform translate-x-1/4 -translate-y-1/4">
              <Activity className="w-64 h-64" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-white/80 font-medium text-sm uppercase tracking-wider">Total Net Worth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold tracking-tighter">
                <Currency valueInCents={totalNetWorth} className="text-white" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Individual Accounts */}
        {accountsList.map((account) => (
          <motion.div variants={item} key={account.id}>
            <Card className="hover:shadow-md transition-shadow duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {account.name}
                </CardTitle>
                <div className="p-2 bg-background rounded-lg shadow-sm border border-border/50">
                  {getAccountIcon(account.type)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  <Currency valueInCents={account.balance} />
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary/50"></span>
                  {account.type} Account
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {accountsList.length === 0 && (
          <div className="col-span-full p-12 text-center border-2 border-dashed border-border rounded-xl">
            <p className="text-muted-foreground">No accounts found. Start by adding one in settings.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
