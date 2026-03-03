import { Target, Construction, Rocket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Savings() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-premium rounded-full flex items-center justify-center shadow-xl shadow-primary/20">
            <Target className="w-12 h-12 text-white" />
          </div>
        </div>
      </motion.div>
      
      <div className="space-y-2 max-w-md">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Savings Goals</h1>
        <p className="text-xl font-medium text-primary mt-2 flex justify-center items-center gap-2">
          <Rocket className="w-5 h-5" /> Coming Soon - Hackathon Challenge #2
        </p>
        <p className="text-muted-foreground mt-4">
          Help users save for their dream house, vacation, or emergency fund.
        </p>
      </div>

      <Card className="w-full max-w-lg mt-8 border border-border/50 shadow-md">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 text-left">Implementation Ideas:</h3>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg text-left">
              <h4 className="font-medium text-sm">Data Model</h4>
              <p className="text-xs text-muted-foreground mt-1">Create a `goals` table with targetAmount, currentAmount, deadline.</p>
            </div>
            <div className="bg-muted p-4 rounded-lg text-left">
              <h4 className="font-medium text-sm">Auto-Save Feature</h4>
              <p className="text-xs text-muted-foreground mt-1">Implement a cron job or hook to transfer fixed amounts from checking to savings weekly.</p>
            </div>
            <Button className="w-full mt-2" variant="outline" disabled>
              <Construction className="w-4 h-4 mr-2" />
              Module Locked
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
