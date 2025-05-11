
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface ComplaintsSectionProps {
  complaints: string[];
  onAddComplaint: (complaint: string) => void;
  onRemoveComplaint: (index: number) => void;
}

const ComplaintsSection = ({ complaints, onAddComplaint, onRemoveComplaint }: ComplaintsSectionProps) => {
  const [newComplaint, setNewComplaint] = useState("");

  const handleAddComplaint = () => {
    if (newComplaint.trim()) {
      onAddComplaint(newComplaint.trim());
      setNewComplaint("");
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">Complaints</h3>
      <div className="flex mb-3">
        <Input
          placeholder="Add complaints..."
          value={newComplaint}
          onChange={(e) => setNewComplaint(e.target.value)}
          className="bg-white rounded-r-none"
          onKeyPress={(e) => {
            if (e.key === "Enter") handleAddComplaint();
          }}
        />
        <Button 
          onClick={handleAddComplaint}
          variant="default"
          className="rounded-l-none bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {complaints.map((complaint, index) => (
          <Badge 
            key={index} 
            className="bg-purple-100 text-purple-800 hover:bg-purple-200 px-3 py-1"
          >
            {complaint}
            <X 
              className="h-3 w-3 ml-2 cursor-pointer" 
              onClick={() => onRemoveComplaint(index)}
            />
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default ComplaintsSection;