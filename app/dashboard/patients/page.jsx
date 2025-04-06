import PatientsPage from "../../../components/patients/PatientsPage";

export default function Patients() {
    return (
        <div className="min-h-screen bg-[#F5F5F7]">
            <div className="max-w-[1400px] mx-auto p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
                        <p className="text-sm text-gray-500">Manage your patients effectively</p>
                    </div>
                </div>
                <PatientsPage />
            </div>
        </div>
    );
}