// components/diagnosis/NotesSection.js
import React from 'react';
import { Textarea } from "@/components/ui/textarea";

const NotesSection = ({ notes, onChange }) => {
  return (
    <div>
      <Textarea
        placeholder="Additional notes, observations, or recommendations"
        value={notes || ''}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border-gray-300"
        rows={6}
      />
    </div>
  );
};

export default NotesSection;