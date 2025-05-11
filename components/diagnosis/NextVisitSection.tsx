
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NextVisitSectionProps {
  nextVisitDate: Date | undefined;
  onNextVisitDateChange: (date: Date | undefined) => void;
}

const NextVisitSection = ({ nextVisitDate, onNextVisitDateChange }: NextVisitSectionProps) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">Next Visit (Optional)</h3>
      <div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full bg-white justify-start text-left font-normal border",
                !nextVisitDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {nextVisitDate ? format(nextVisitDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={nextVisitDate}
              onSelect={onNextVisitDateChange}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default NextVisitSection;