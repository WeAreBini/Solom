"use client";

/**
 * @ai-context RecurringBuyModal component allowing users to set up automated investing.
 * @ai-related app/trade/page.tsx
 */
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarClock, DollarSign } from "lucide-react";

interface RecurringBuyModalProps {
  symbol: string;
  currentPrice: number;
}

export function RecurringBuyModal({ symbol, currentPrice }: RecurringBuyModalProps) {
  const [amount, setAmount] = useState("50");
  const [frequency, setFrequency] = useState("weekly");
  const [day, setDay] = useState("monday");
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    // In a real app, this would call an API to save the recurring buy
    console.log(`Saved recurring buy: $${amount} of ${symbol} every ${frequency} on ${day}`);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2">
          <CalendarClock className="h-4 w-4" />
          Set Up Recurring Buy
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Recurring Investment</DialogTitle>
          <DialogDescription>
            Automate your investing by setting up a recurring buy for {symbol}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <div className="col-span-3 relative">
              <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="frequency" className="text-right">
              Frequency
            </Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(frequency === "weekly" || frequency === "biweekly") && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="day" className="text-right">
                Day
              </Label>
              <Select value={day} onValueChange={setDay}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">Monday</SelectItem>
                  <SelectItem value="tuesday">Tuesday</SelectItem>
                  <SelectItem value="wednesday">Wednesday</SelectItem>
                  <SelectItem value="thursday">Thursday</SelectItem>
                  <SelectItem value="friday">Friday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {frequency === "monthly" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Select value={day} onValueChange={setDay}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1st of month</SelectItem>
                  <SelectItem value="15">15th of month</SelectItem>
                  <SelectItem value="last">Last day of month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <div className="bg-muted/50 p-3 rounded-md text-sm text-muted-foreground mb-4">
          You will buy approximately {(Number(amount) / currentPrice).toFixed(4)} {symbol} every {frequency === "daily" ? "day" : frequency === "monthly" ? "month" : `${day}`}.
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Plan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
