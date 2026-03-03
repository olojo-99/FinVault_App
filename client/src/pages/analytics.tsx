import { BarChart3, Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Analytics() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        <div className="relative">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center border-4 border-primary/20 shadow-xl">
            <BarChart3 className="w-12 h-12 text-primary" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-background rounded-full flex items-center justify-center border border-border shadow-sm">
            <Construction className="w-4 h-4 text-amber-500" />
          </div>
        </div>
      </motion.div>
      
      <div className="space-y-2 max-w-md">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Analytics</h1>
        <p className="text-xl font-medium text-primary mt-2">Coming Soon - Hackathon Challenge #1</p>
        <p className="text-muted-foreground">
          This module is reserved for building advanced charts and spending breakdowns. Implement D3 or Recharts here to visualize user flow.
        </p>
      </div>

      <Card className="w-full max-w-lg mt-8 border-dashed bg-muted/30">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">Challenge Goals:</h3>
          <ul className="text-sm text-muted-foreground text-left space-y-2 list-disc list-inside">
            <li>Aggregate transactions by category across all accounts</li>
            <li>Render a beautiful Donut chart showing spending allocation</li>
            <li>Create a monthly line chart comparing Income vs Expenses</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
