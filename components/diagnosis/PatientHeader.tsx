
import { Card, CardContent } from "@/components/ui/card";

interface PatientHeaderProps {
  name: string;
  gender: string;
  id: string;
}

const PatientHeader = ({ name, gender, id }: PatientHeaderProps) => {
  return (
    <Card className="bg-white mb-6 border-l-4 border-l-purple-500">
      <CardContent className="flex justify-between items-center p-4">
        <div>
          <h2 className="text-xl font-semibold">{name}</h2>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>Gender: {gender}</span>
            <span>ID: {id}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-purple-700">MedCare Clinic</div>
          <div className="text-xs text-gray-500">Current Date: {new Date().toLocaleDateString()}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientHeader;