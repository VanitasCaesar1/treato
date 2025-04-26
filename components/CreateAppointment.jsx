import React, { useState, useEffect } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { Search, ChevronLeft, ChevronRight, X, Loader2, User } from "lucide-react";
import PatientSearch from "@/components/PatientSearch"
import toast from "react-hot-toast";
import { withAuth,} from '@workos-inc/authkit-nextjs';

const CreateAppointment = ({ isOpen, onClose }) => {
  // Existing state setup from your code
  const [step, setStep] = useState(1); // Changed to start at step 1 to test patient search
  const [currentDate, setCurrentDate] = useState(new Date());
  const [formData, setFormData] = useState({
    patient: null,
    doctor: null,
    date: null,
    time: "14:00",
    reason: "",
    feeType: "recurring",
    paymentMethod: "online",
  });
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpeciality, setSelectedSpeciality] = useState("_all");
  const [specialities, setSpecialities] = useState([]);
  
  // Get organizationId from useAuth
  const { organizationId, user } = withAuth();  
  // Calendar navigation functions
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Generate calendar days
  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  // Get day names
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Fetch doctors based on search criteria
  const fetchDoctors = async (query = "", speciality = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append("q", query);
      if (query) params.append("by", "all"); // Search in all fields
      if (speciality) params.append("speciality", speciality);
      params.append("limit", "20");
      
      // Add organizationId from auth context to the API request if available
      if (organizationId) {
        params.append("org_id", organizationId);
      }
      
      const response = await fetch(`/api/doctors/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch doctors");
      }
      
      const data = await response.json();
      
      // Defensive programming - ensure data.doctors exists before mapping
      const doctorsArray = data.doctors || [];
      
      // Transform the response to match our component's expected format
      // Adding organizationId to each doctor object
      const formattedDoctors = doctorsArray.map(doctor => ({
        id: doctor.DoctorID || doctor.doctor_id,
        name: doctor.Name || doctor.name,
        specialty: doctor.Speciality || doctor.speciality,
        qualification: doctor.Qualification || doctor.qualification,
        hospitalName: doctor.HospitalName || doctor.hospital_name,
        hospitalId: doctor.HospitalID || doctor.hospital_id,
        orgId: organizationId, // Add organizationId from auth context
        image: "/api/placeholder/32/32", // Placeholder image
      }));
      
      setDoctors(formattedDoctors);
      
      // Extract unique specialities for the filter dropdown
      if (!speciality && query === "") {
        const uniqueSpecialities = [...new Set(doctorsArray.map(doc => doc.Speciality || doc.speciality || ""))]
          .filter(Boolean);
        setSpecialities(uniqueSpecialities);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("Failed to fetch doctors. Please try again.");
      // Set empty arrays to prevent UI errors
      setDoctors([]);
      if (!speciality && query === "") {
        setSpecialities([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch of doctors when the component mounts at step 2
  useEffect(() => {
    if (step === 2) {
      fetchDoctors();
    }
  }, [step]);

  // Handle search input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (step === 2) {
        fetchDoctors(searchQuery, selectedSpeciality === "_all" ? "" : selectedSpeciality);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, selectedSpeciality, step]);

  // Available time slots - these would ideally be retrieved from the backend based on doctor availability
  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  ];

  // Fee types options
  const feeTypes = [
    { value: "default", label: "Standard Consultation" },
    { value: "recurring", label: "Follow-up Visit" },
    { value: "emergency", label: "Emergency Care" }
  ];

  // Payment method options
  const paymentMethods = [
    { value: "online", label: "Online Payment" },
    { value: "insurance", label: "Insurance" },
    { value: "cash", label: "Cash on Visit" }
  ];

  const validateForm = () => {
    // Validate required fields based on current step
    if (step === 1 && !formData.patient) {
      toast.error("Please select a patient");
      return false;
    }
    
    if (step === 2 && !formData.doctor) {
      toast.error("Please select a doctor");
      return false;
    }
    
    if (step === 3) {
      if (!formData.date) {
        toast.error("Please select an appointment date");
        return false;
      }
      if (!formData.time) {
        toast.error("Please select an appointment time");
        return false;
      }
      if (!formData.feeType) {
        toast.error("Please select an appointment type");
        return false;
      }
      if (!formData.paymentMethod) {
        toast.error("Please select a payment method");
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    // Show loading toast
    const loadingToast = toast.loading("Creating appointment...");
    
    try {
      // Validate ID formats before submitting
      if (!formData.patient?.id || !/^[A-Z0-9]{8}$/.test(formData.patient.id)) {
        throw new Error("Patient ID must be in 8-digit alphanumeric format");
      }
      
      if (!formData.doctor?.id || 
          !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(formData.doctor.id)) {
        throw new Error("Doctor ID must be in UUID format");
      }
      
      // Use organizationId from auth context directly
      if (!organizationId || !/^org_[A-Z0-9]{26}$/.test(organizationId)) {
        throw new Error("Organization ID must be in ULID format (org_[A-Z0-9]{26})");
      }
      
      // Transform data to match the backend API expectations
      const appointmentData = {
        patient_id: formData.patient.id,
        doctor_id: formData.doctor.id,
        org_id: organizationId, // Use organizationId from auth context
        patient_name: formData.patient.name,
        doctor_name: formData.doctor.name,
        appointment_date: formData.date ? new Date(
          formData.date.getFullYear(), 
          formData.date.getMonth(), 
          formData.date.getDate(),
          ...formData.time.split(':').map(Number)
        ) : null,
        fee_type: formData.feeType || "default",
        payment_method: formData.paymentMethod || "online",
        reason: formData.reason || ""
      };
      
      const response = await fetch("/api/appointments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to create appointment");
      }
      
      // Success toast
      toast.success("Appointment created successfully", {
        id: loadingToast,
      });
      
      console.log("Appointment created:", data);
      onClose();
    } catch (error) {
      console.error("Error creating appointment:", error);
      
      // Error toast
      toast.error(error.message || "Failed to create appointment", {
        id: loadingToast,
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  
  const handleSelectPatient = (patient) => {
    // First, check for patient_id (matching your MongoDB schema)
    const patientId = patient.patient_id || patient.PatientID || patient._id || patient.id;
    
    // Validate patient ID format
    if (!patientId || !/^[A-Z0-9]{8}$/.test(patientId)) {
      toast.error("This patient has an invalid ID format. Please contact support.");
      return;
    }
    
    setFormData((prev) => ({ 
      ...prev, 
      patient: {
        id: patientId, // Store the ID correctly here
        name: patient.Name || patient.name,
        age: patient.Age || patient.age,
        phone: patient.Mobile || patient.mobile || patient.Phone || patient.phone,
        email: patient.Email || patient.email,
        gender: patient.Gender || patient.gender,
        bloodGroup: patient.BloodGroup || patient.blood_group || patient.bloodGroup,
      } 
    }));
    toast.success(`Selected patient: ${patient.Name || patient.name}`);
    setStep(2);
  };
  

  const handleNextStep = () => {
    if (!validateForm()) return;
    setStep(step + 1);
  };

  const renderCalendar = () => {
    const days = getDaysInMonth();
    const firstDayOfMonth = startOfMonth(currentDate).getDay();

    return (
      <div className="w-full">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button 
            className="p-2 rounded-lg hover:bg-gray-100"
            onClick={prevMonth}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h3 className="text-lg font-medium">
            {format(currentDate, "MMMM yyyy")}
          </h3>
          <button 
            className="p-2 rounded-lg hover:bg-gray-100"
            onClick={nextMonth}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Week days */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before the first of the month */}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className="p-1" />
          ))}

          {/* Actual days */}
          {days.map((day) => (
            <button
              key={day.toISOString()}
              onClick={() => {
                setFormData((prev) => ({ ...prev, date: day }));
                toast.success(`Selected date: ${format(day, "MMMM d, yyyy")}`);
              }}
              disabled={day < new Date()}
              className={`
                h-8 w-8 p-0 rounded-full transition-colors
                ${!isSameMonth(day, currentDate) ? "text-gray-400" : ""}
                ${isToday(day) ? "font-medium" : ""}
                ${isSameDay(day, formData.date || new Date(2025, 2, 25)) 
                  ? "bg-blue-100 text-blue-700 hover:bg-blue-200" 
                  : "hover:bg-gray-100"}
                ${day < new Date() ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {format(day, "d")}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            {/* Our updated PatientSearch component */}
            <PatientSearch 
              onSelectPatient={handleSelectPatient}
              selectedPatient={formData.patient}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            {/* Doctor Selection with API integration */}
            <div>
              <h3 className="text-lg font-medium mb-2">Select Doctor</h3>
              
              {/* Search section */}
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search doctors..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {/* Speciality filter */}
                <select
                  value={selectedSpeciality}
                  onChange={(e) => {
                    setSelectedSpeciality(e.target.value);
                    if (e.target.value !== "_all") {
                      toast.success(`Filtering by ${e.target.value}`);
                    }
                  }}
                  className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-[180px]"
                >
                  <option value="_all">All Specialities</option>
                  {specialities.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Doctor list */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {loading ? (
                  <div className="text-center py-6">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                    <p className="mt-2 text-gray-500">Loading doctors...</p>
                  </div>
                ) : doctors.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <User className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500">No doctors found. Try changing your search criteria.</p>
                  </div>
                ) : (
                  doctors.map((doctor) => (
                    <div 
                      key={doctor.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors duration-200 hover:bg-gray-50 ${
                        formData.doctor?.id === doctor.id
                          ? "border-blue-500 bg-blue-50"
                          : ""
                      }`}
                        onClick={() => {
                          // No need to check doctor.orgId - we now use organizationId from auth context
                          // Just check the doctor ID format
                          if (!doctor.id || !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(doctor.id)) {
                            toast.error("This doctor has an invalid ID format. Please contact support.");
                            return;
                          }
                          
                          // If check passes, update the form data
                          setFormData((prev) => ({ 
                            ...prev, 
                            doctor: {
                              ...doctor
                            } 
                          }));
                          toast.success(`Selected doctor: ${doctor.name}`);
                          setStep(3);
                        }}
                      >
                        <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                          {doctor.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{doctor.name}</div>
                          <div className="text-sm text-gray-500">
                            {doctor.specialty}
                          </div>
                          <div className="text-xs text-gray-500">
                            {doctor.qualification} • {doctor.hospitalName}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            {/* Date and Time Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Date Selection */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">Select Date</h3>
                {renderCalendar()}
              </div>

              {/* Time Selection */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">Select Time</h3>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        formData.time === time 
                          ? "bg-blue-100 text-blue-700 border border-blue-300" 
                          : "border hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, time }));
                        toast.success(`Selected time: ${time}`);
                      }}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Fee Type Selection */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">Appointment Type</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {feeTypes.map((type) => (
                  <button
                    key={type.value}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      formData.feeType === type.value 
                        ? "bg-blue-100 text-blue-700 border border-blue-300" 
                        : "border hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, feeType: type.value }));
                      toast.success(`Selected appointment type: ${type.label}`);
                    }}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">Payment Method</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.value}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      formData.paymentMethod === method.value 
                        ? "bg-blue-100 text-blue-700 border border-blue-300" 
                        : "border hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, paymentMethod: method.value }));
                      toast.success(`Selected payment method: ${method.label}`);
                    }}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isOpen ? "" : "hidden"}`}>
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden relative z-10">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">Create Appointment</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {/* Progress indicator */}
          <div className="mt-4 flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 rounded-full flex-1 transition-colors duration-200 ${
                  s <= step ? "bg-blue-500" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t sticky bottom-0 bg-gray-50">
          <div className="flex justify-between items-center w-full">
            <button
              onClick={() => step > 1 && setStep(step - 1)}
              className={`px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors ${step === 1 ? "invisible" : ""}`}
              disabled={submitting}
            >
              Back
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  toast.success("Appointment creation cancelled");
                  onClose();
                }}
                className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              {step < 3 ? (
                <button
                  onClick={handleNextStep}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                  disabled={submitting}
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    "Create Appointment"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAppointment;