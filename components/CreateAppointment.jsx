"use client"
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
  addDays,
  parseISO,
  getDay,
} from "date-fns";
import { Search, ChevronLeft, ChevronRight, X, Loader2, User, Calendar, Clock, CreditCard, FileText, Info } from "lucide-react";
import PatientSearch from "@/components/PatientSearch";
import { toast } from "react-hot-toast";

const CreateAppointment = ({ isOpen, onClose, onSuccess }) => {
  // Main state setup
  const [step, setStep] = useState(1);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [formData, setFormData] = useState({
    patient: null,
    doctor: null,
    date: null,
    time: null,
    reason: "",
    feeType: "recurring",
    paymentMethod: "online",
  });
  
  // UI state
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpeciality, setSelectedSpeciality] = useState("_all");
  const [specialities, setSpecialities] = useState([]);
  const [doctorShifts, setDoctorShifts] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [doctorFees, setDoctorFees] = useState({
    default: 0,
    recurring: 0,
    emergency: 0
  });
  
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [loadingFees, setLoadingFees] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
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
  
  // Map day number to day name
  const getDayName = (dayNumber) => {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return dayNames[dayNumber];
  };

  // Updated fetchDoctors function with better error handling
  const fetchDoctors = async (query = "", speciality = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) {
        params.append("q", query);
        params.append("by", "all"); 
      }
      if (speciality && speciality !== "_all") {
        params.append("speciality", speciality);
      }
      params.append("limit", "20");
      
      const response = await fetch(`/api/doctors/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch doctors: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Ensure doctors array exists
      const doctorsArray = data.doctors || [];
      
      // Transform the response to match our component's format
      const formattedDoctors = doctorsArray.map(doctor => ({
        id: doctor.DoctorID || doctor.doctor_id,
        name: doctor.Name || doctor.name,
        specialty: doctor.Speciality || doctor.speciality || doctor.specialization?.[0]?.name || "General",
        qualification: doctor.Qualification || doctor.qualification || "MD",
        hospitalName: doctor.HospitalName || doctor.hospital_name || "Main Hospital",
        hospitalId: doctor.HospitalID || doctor.hospital_id || doctor.OrganizationID || doctor.organization_id,
        image: doctor.Image || doctor.image || "/api/placeholder/32/32",
        slotDuration: doctor.SlotDuration || doctor.slot_duration || 30
      }));
      
      setDoctors(formattedDoctors);
      
      // Extract unique specialities for filtering
      if (!speciality || speciality === "_all") {
        const uniqueSpecialities = [...new Set(doctorsArray.map(doc => {
          if (doc.specialization && Array.isArray(doc.specialization)) {
            return doc.specialization[0]?.name;
          }
          return doc.Speciality || doc.speciality || "";
        }))].filter(Boolean);
        setSpecialities(uniqueSpecialities);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("Failed to fetch doctors. Please try again.");
      setDoctors([]);
      if (!speciality || speciality === "_all") {
        setSpecialities([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // New function to fetch doctor shifts
  const fetchDoctorShifts = async (doctorId, orgId) => {
    if (!doctorId || !orgId) return;
    
    setLoadingShifts(true);
    try {
      const response = await fetch(`/api/doctors/${doctorId}/shifts?org_id=${orgId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch doctor shifts: ${response.status}`);
      }
      
      const data = await response.json();
      setDoctorShifts(data.shifts || []);
      
      // If we have a selected date, calculate available time slots
      if (formData.date) {
        calculateAvailableTimeSlots(data.shifts || [], formData.date);
      }
    } catch (error) {
      console.error("Error fetching doctor shifts:", error);
      toast.error("Failed to fetch doctor's schedule. Please try again.");
      setDoctorShifts([]);
      setAvailableTimeSlots([]);
    } finally {
      setLoadingShifts(false);
    }
  };

// Function to fetch doctor fees - Fixed
const fetchDoctorFees = async (doctorId, orgId) => {
  if (!doctorId || !orgId) return;
  
  setLoadingFees(true);
  try {
    // API call remains the same
    const response = await fetch(`/api/doctors/${doctorId}/fees?org_id=${orgId}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}):`, errorText);
      throw new Error(`Failed to fetch doctor fees: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log("Raw doctor fees response:", responseData);
    
    // Handle the array response format from the backend
    // The backend returns an array of fee objects
    if (Array.isArray(responseData) && responseData.length > 0) {
      const feeData = responseData[0]; // Get the first fee object
      
      setDoctorFees({
        default: parseInt(feeData.default_fees ?? 1000),
        recurring: parseInt(feeData.recurring_fees ?? 800),
        emergency: parseInt(feeData.emergency_fees ?? 1500)
      });
      
      console.log("Doctor fees parsed successfully:", {
        default: parseInt(feeData.default_fees ?? 1000),
        recurring: parseInt(feeData.recurring_fees ?? 800),
        emergency: parseInt(feeData.emergency_fees ?? 1500)
      });
      return;
    }
    
    // Handle empty array - use default values
    if (Array.isArray(responseData) && responseData.length === 0) {
      setDoctorFees({
        default: 1000,
        recurring: 800,
        emergency: 1500
      });
      console.log("No fees found. Using default values.");
      return;
    }
    
    // Legacy handling for other response formats (keeping as fallback)
    let feeData = responseData;
    
    // Check if data has a fee property directly
    if (responseData.fee) {
      setDoctorFees({
        default: parseInt(responseData.fee.default_fees || responseData.fee.default_fee || responseData.fee || 1000),
        recurring: parseInt(responseData.fee.recurring_fees || responseData.fee.recurring_fee || responseData.fee || 800),
        emergency: parseInt(responseData.fee.emergency_fees || responseData.fee.emergency_fee || responseData.fee || 1500)
      });
      return;
    }
    
    // Handle nested data structures
    if (responseData.data) {
      feeData = responseData.data;
    }
    
    // Extract fee values using database column naming
    const defaultFee = 
      parseInt(feeData.default_fees ?? 
      feeData.defaultFees ?? 
      1000);
      
    const recurringFee = 
      parseInt(feeData.recurring_fees ?? 
      feeData.recurringFees ?? 
      feeData.follow_up_fees ?? 
      800);
      
    const emergencyFee = 
      parseInt(feeData.emergency_fees ?? 
      feeData.emergencyFees ?? 
      1500);
    
    setDoctorFees({
        default: defaultFee,
        recurring: recurringFee,
        emergency: emergencyFee
    });
    
  } catch (error) {
    console.error("Error fetching doctor fees:", error);
    toast.error("Failed to fetch doctor's fees. Using default values.");
    setDoctorFees({
      default: 1000,
      recurring: 800,
      emergency: 1500
    });
  } finally {
    setLoadingFees(false);
  }
};

// Function to fetch doctor availability using the slots API
const fetchDoctorAvailability = async (doctorId, date, orgId) => {
  if (!doctorId || !date || !orgId) {
    setAvailableTimeSlots([]);
    return;
  }
  
  // Format date for API call
  const formattedDate = format(date, "yyyy-MM-dd");
  
  setLoadingSlots(true);
  try {
    // Use the slots API route
    const response = await fetch(
      `/api/doctors/${doctorId}/slots?date=${formattedDate}&org_id=${orgId}`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to fetch slots: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Create formatted time slots from the API response
    let formattedSlots = [];
    
    // Check if available_slots are in the response
    if (Array.isArray(data.available_slots) && data.available_slots.length > 0) {
      // Extract start_time from each slot object
      formattedSlots = data.available_slots.map(slot => {
        // Handle object format with start_time property
        if (slot && slot.start_time) {
          return slot.start_time;
        }
        // Handle direct string format (fallback)
        if (typeof slot === 'string') {
          return slot;
        }
        return null;
      }).filter(Boolean); // Remove any null values
    }
    // Fallback to check data.slots for backward compatibility
    else if (Array.isArray(data.slots) && data.slots.length > 0) {
      formattedSlots = data.slots.map(slot => {
        // Handle string format (e.g., "14:30")
        if (typeof slot === 'string') {
          return slot;
        }
        // Handle object format (e.g., {start_time: "14:30"})
        else if (slot.start_time) {
          return typeof slot.start_time === 'string' 
            ? slot.start_time 
            : format(new Date(slot.start_time), 'HH:mm');
        }
        // Handle alternative naming conventions
        else if (slot.startTime) {
          return typeof slot.startTime === 'string'
            ? slot.startTime
            : format(new Date(slot.startTime), 'HH:mm');
        }
        return null;
      }).filter(Boolean); // Remove any null values
    }
    
    // Update available time slots
    setAvailableTimeSlots(formattedSlots);
    
    if (formattedSlots.length === 0) {
      toast.error(data.message || "No available time slots for the selected date");
    } else if (formData.time && !formattedSlots.includes(formData.time)) {
      // Reset selected time if it's no longer available
      setFormData(prev => ({ ...prev, time: null }));
    }
  } catch (error) {
    console.error("Error fetching doctor slots:", error);
    toast.error(error.message || "Failed to fetch doctor's available slots. Please try again.");
    setAvailableTimeSlots([]);
  } finally {
    setLoadingSlots(false);
  }
};

// Updated calculate available time slots function that uses the slots API directly
const calculateAvailableTimeSlots = async (shifts, date) => {
  if (!formData.doctor?.id || !date) {
    setAvailableTimeSlots([]);
    return;
  }
  
  // Get day of week to check if there's a shift for that day
  const dayOfWeek = getDayName(getDay(date));
  const dayShift = shifts.find(shift => shift.weekday === dayOfWeek && shift.isactive);
  
  if (!dayShift || !dayShift.starttime || !dayShift.endtime) {
    setAvailableTimeSlots([]);
    // Change from toast.info to toast.error
    toast.error(`No shift scheduled for ${dayOfWeek}`);
    return;
  }
  
  // Call the API to get slots
  await fetchDoctorAvailability(formData.doctor.id, date, formData.doctor.hospitalId);
};

  // Initial fetch of doctors when component mounts at step 2
  useEffect(() => {
    if (step === 2) {
      fetchDoctors();
    }
  }, [step]);

  // Fetch doctor shifts and fees when doctor changes
  useEffect(() => {
    if (formData.doctor?.id && formData.doctor?.hospitalId) {
      fetchDoctorShifts(formData.doctor.id, formData.doctor.hospitalId);
      fetchDoctorFees(formData.doctor.id, formData.doctor.hospitalId);
    }
  }, [formData.doctor?.id, formData.doctor?.hospitalId]);

  // Calculate available time slots when date changes
  useEffect(() => {
    if (formData.doctor?.id && formData.date) {
      calculateAvailableTimeSlots(doctorShifts, formData.date);
    }
  }, [formData.date, doctorShifts]);

  // Handle search input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (step === 2) {
        fetchDoctors(searchQuery, selectedSpeciality === "_all" ? "" : selectedSpeciality);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, selectedSpeciality, step]);

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

  // Form validation based on current step
  const validateForm = () => {
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

  const formatTimeWithSeconds = (timeStr) => {
  if (!timeStr) return "";
  
  // If already in HH:mm:ss format, return as is
  if (timeStr.includes(':') && timeStr.split(':').length === 3) {
    return timeStr;
  }
  
  // If in HH:mm format, add :00 seconds
  if (timeStr.includes(':') && timeStr.split(':').length === 2) {
    return `${timeStr}:00`;
  }
  
  return timeStr;
};

// Helper function to calculate end time using doctor's slot duration
function calculateEndTimeFromString(timeStr, slotDuration = 30) {
  if (!timeStr) return "";
  
  // Parse the time string (could be HH:mm or HH:mm:ss)
  const timeParts = timeStr.split(':');
  const hours = parseInt(timeParts[0]);
  const minutes = parseInt(timeParts[1]);
  const seconds = timeParts.length > 2 ? parseInt(timeParts[2]) : 0;
  
  // Add the doctor's slot duration (in minutes)
  let endHours = hours;
  let endMinutes = minutes + slotDuration;
  let endSeconds = seconds;
  
  // Handle minute overflow
  if (endMinutes >= 60) {
    endHours = Math.floor(endHours + (endMinutes / 60)) % 24;
    endMinutes = endMinutes % 60;
  }
  
  // Return in HH:mm:ss format
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}:${endSeconds.toString().padStart(2, '0')}`;
}

// Update the handleSubmit function to use doctor's slot duration:
const handleSubmit = async () => {
  if (!validateForm()) return;
  setSubmitting(true);
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

    // Use doctor's slot duration for end time calculation
    const doctorSlotDuration = formData.doctor?.slotDuration || 30;
    const formattedStartTime = formatTimeWithSeconds(formData.time);
    const formattedEndTime = calculateEndTimeFromString(formData.time, doctorSlotDuration);

    const appointmentData = {
      patient_id: formData.patient.id,
      doctor_id: formData.doctor.id,
      org_id: formData.doctor.hospitalId,
      patient_name: formData.patient.name,
      doctor_name: formData.doctor.name,
      appointment_date: new Date(formData.date).toISOString(),
      slot_start_time: formattedStartTime,
      slot_end_time: formattedEndTime,
      slot_duration: doctorSlotDuration, // Include slot duration in the payload
      fee_type: formData.feeType,
      payment_method: formData.paymentMethod,
      reason: formData.reason || ""
    };

    console.log("Sending appointment data with doctor's slot duration:", appointmentData);

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
    
    toast.success("Appointment created successfully", {
      id: loadingToast,
    });
    
    if (onSuccess) {
      onSuccess(data.appointment);
    }
    onClose();
  } catch (error) {
    console.error("Error creating appointment:", error);
    toast.error(error.message || "Failed to create appointment", {
      id: loadingToast,
    });
  } finally {
    setSubmitting(false);
  }
};
  // Handle patient selection with proper validation
  const handleSelectPatient = (patient) => {
    // Extract patient ID using various possible property names
    const patientId = patient.patient_id || patient.PatientID || patient._id || patient.id;
    
    // Validate patient ID format
    if (!patientId || !/^[A-Z0-9]{8}$/.test(patientId)) {
      toast.error("This patient has an invalid ID format. Please contact support.");
      return;
    }
    
    setFormData((prev) => ({ 
      ...prev, 
      patient: {
        id: patientId,
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

  // Navigate to next step if validation passes
  const handleNextStep = () => {
    if (!validateForm()) return;
    setStep(step + 1);
  };

// Updated fee display component for Step 3
const FeeDisplay = () => {
  if (loadingFees) {
    return (
      <div className="flex items-center text-gray-500 text-sm">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading fee information...
      </div>
    );
  }
  
  // Get the selected fee type label
  const selectedFeeType = feeTypes.find(f => f.value === formData.feeType);
  const feeAmount = doctorFees[formData.feeType] || 0;
  
  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg text-sm border-l-4 border-blue-500">
        <div className="flex items-center">
          <CreditCard className="text-blue-500 w-5 h-5 mr-2 flex-shrink-0" />
          <div>
            <span className="font-medium">Consultation Fee: </span>
            <span className="text-blue-700 font-semibold">₹{feeAmount}</span>
          </div>
        </div>
        <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
          {selectedFeeType?.label || 'Standard Consultation'}
        </div>
      </div>
      
      {/* Payment information note */}
      {formData.paymentMethod === "insurance" && (
        <div className="flex items-center p-3 bg-gray-50 rounded-lg text-sm border-l-4 border-gray-300">
          <Info className="text-gray-500 w-4 h-4 mr-2 flex-shrink-0" />
          <div className="text-gray-600">
            Insurance coverage may apply. Please bring your insurance card.
          </div>
        </div>
      )}
      
      {/* Prepayment note for online payment */}
      {formData.paymentMethod === "online" && (
        <div className="flex items-center p-3 bg-gray-50 rounded-lg text-sm border-l-4 border-gray-300">
          <Info className="text-gray-500 w-4 h-4 mr-2 flex-shrink-0" />
          <div className="text-gray-600">
            You will be prompted to make payment after booking your appointment.
          </div>
        </div>
      )}
    </div>
  );
};

  // Updated doctor card component with better UI
  const DoctorCard = ({ doctor, onSelect, isSelected }) => {
  return (
    <div 
      className={`p-4 rounded-lg border cursor-pointer transition-colors duration-200 hover:bg-gray-50 ${
        isSelected ? "border-blue-500 bg-blue-50" : ""
      }`}
      onClick={() => onSelect(doctor)}
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
          <div className="text-sm text-gray-500">
            Slot Duration: {doctor.slotDuration || "ERROR"} minutes
          </div>
        </div>
      </div>
    </div>
  );
};
  
// Fix for the calendar date selection issue
const renderCalendar = () => {
  const days = getDaysInMonth();
  const firstDayOfMonth = startOfMonth(currentDate).getDay();
  // Calculate today's date (for preventing selection of past dates)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to beginning of day for proper comparison
  
  return (
    <div className="w-full">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          className="p-2 rounded-lg hover:bg-gray-100"
          onClick={prevMonth}
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="text-lg font-medium">
          {format(currentDate, "MMMM yyyy")}
        </h3>
        <button
          className="p-2 rounded-lg hover:bg-gray-100"
          onClick={nextMonth}
          aria-label="Next month"
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
        {days.map((day) => {
          // Only block dates before today (past dates)
          const isPastDay = day < today;
          const isSelectedDay = formData.date && isSameDay(day, formData.date);
          
          return (
            <button
              key={day.toISOString()}
              onClick={() => {
                if (!isPastDay) {
                  // FIXED: Create date at noon to avoid timezone issues
                  const selectedDate = new Date(day);
                  selectedDate.setHours(12, 0, 0, 0); // Set to noon local time
                  
                  setFormData((prev) => ({ 
                    ...prev, 
                    date: selectedDate, 
                    // Send as ISO string to backend to ensure proper parsing
                    appointment_date: selectedDate.toISOString(),
                    time: null 
                  }));
                  toast.success(`Selected date: ${format(day, "MMMM d, yyyy")}`);
                }
              }}
              disabled={isPastDay}
              aria-label={format(day, "MMMM d, yyyy")}
              aria-pressed={isSelectedDay}
              className={`
                h-8 w-8 p-0 rounded-full transition-colors
                ${!isSameMonth(day, currentDate) ? "text-gray-400" : ""}
                ${isToday(day) ? "font-medium ring-1 ring-blue-200" : ""}
                ${isSelectedDay
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "hover:bg-gray-100"}
                ${isPastDay ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Render time slots with availability indicators
const renderTimeSlots = () => {
  if (!formData.date) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500">
        Please select a date first
      </div>
    );
  }
  
  if (loadingSlots) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading available time slots...</span>
      </div>
    );
  }
  
  if (availableTimeSlots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500">
        <Clock className="w-10 h-10 text-gray-400 mb-2" />
        <p>No available time slots for the selected date</p>
        <p className="text-sm mt-1">Please select another date</p>
      </div>
    );
  }
  
  // Group time slots by morning, afternoon, and evening
  const groupedSlots = {
    morning: [],
    afternoon: [],
    evening: []
  };
  
  // Sort time slots chronologically
  const sortedSlots = [...availableTimeSlots].sort((a, b) => {
    const [aHour, aMinute] = a.split(':').map(Number);
    const [bHour, bMinute] = b.split(':').map(Number);
    
    if (aHour !== bHour) return aHour - bHour;
    return aMinute - bMinute;
  });
  
  // Group slots by time of day
  sortedSlots.forEach(time => {
    const hour = parseInt(time.split(':')[0]);
    
    if (hour < 12) {
      groupedSlots.morning.push(time);
    } else if (hour < 17) {
      groupedSlots.afternoon.push(time);
    } else {
      groupedSlots.evening.push(time);
    }
  });
  
  return (
    <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
      {/* Morning slots */}
      {groupedSlots.morning.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
            <div className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></div>
            Morning
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {groupedSlots.morning.map((time, index) => (
              <button
                key={`morning-${index}-${time}`}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  formData.time === time 
                    ? "bg-blue-500 text-white" 
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
      )}
      
      {/* Afternoon slots */}
      {groupedSlots.afternoon.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
            <div className="w-2 h-2 rounded-full bg-orange-400 mr-2"></div>
            Afternoon
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {groupedSlots.afternoon.map((time, index) => (
              <button
                key={`afternoon-${index}-${time}`}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  formData.time === time 
                    ? "bg-blue-500 text-white" 
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
      )}
      
      {/* Evening slots */}
      {groupedSlots.evening.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
            <div className="w-2 h-2 rounded-full bg-purple-400 mr-2"></div>
            Evening
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {groupedSlots.evening.map((time, index) => (
              <button
                key={`evening-${index}-${time}`}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  formData.time === time 
                    ? "bg-blue-500 text-white" 
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
      )}
      
      {/* Show total slot count */}
      <div className="text-xs text-right text-gray-500 mt-2">
        {availableTimeSlots.length} time slots available
      </div>
    </div>
  );
};
  // Step content based on current step
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600 mb-6">
              <User className="w-5 h-5" />
              <h3 className="font-medium">Select Patient</h3>
            </div>
            
            <PatientSearch 
              onSelectPatient={handleSelectPatient}
              selectedPatient={formData.patient}
            />
            
            {formData.patient && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="font-medium text-blue-800 mb-2">Selected Patient</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">Name:</span> {formData.patient.name}</div>
                  <div><span className="text-gray-500">Age:</span> {formData.patient.age || "N/A"}</div>
                  <div><span className="text-gray-500">Gender:</span> {formData.patient.gender || "N/A"}</div>
                  <div><span className="text-gray-500">Blood Group:</span> {formData.patient.bloodGroup || "N/A"}</div>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600 mb-6">
              <User className="w-5 h-5" />
              <h3 className="font-medium">Select Doctor</h3>
            </div>
            
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
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-40"
                aria-label="Filter by speciality"
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
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
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
                  <DoctorCard
                    key={doctor.id}
                    doctor={doctor}
                    isSelected={formData.doctor?.id === doctor.id}
                    onSelect={(doctor) => {
                      // UUID validation with more flexible regex
                      const idPattern = /^[0-9a-fA-F-]{8,36}$/;
                      if (!doctor.id || !idPattern.test(doctor.id)) {
                        toast.error("This doctor has an invalid ID format. Please contact support.");
                        return;
                      }
                  
                      // Reset the date and time when selecting a new doctor
                      setFormData((prev) => ({ 
                        ...prev, 
                        doctor,
                        date: null,
                        time: null
                      }));
                      toast.success(`Selected doctor: ${doctor.name}`);
                      setStep(3);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        );

        case 3:
      return (
        <div className="space-y-6">
          {/* Summary of selections so far */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-blue-600">Selected Patient</div>
                <div className="font-medium">{formData.patient?.name}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-blue-600">Selected Doctor</div>
                <div className="font-medium">{formData.doctor?.name}</div>
                <div className="text-xs text-gray-500">{formData.doctor?.specialty}</div>
              </div>
            </div>
          </div>
          {/* Date & Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Calendar className="w-5 h-5" />
                <h3 className="font-medium">Select Date</h3>
              </div>
              
              {loadingShifts ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500 mr-2" />
                  <span className="text-gray-600">Loading shifts...</span>
                </div>
              ) : (
                renderCalendar()
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Clock className="w-5 h-5" />
                <h3 className="font-medium">Select Time</h3>
              </div>
              
              {renderTimeSlots()}
            </div>
          </div>

          {/* Appointment Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600">
              <FileText className="w-5 h-5" />
              <h3 className="font-medium">Appointment Details</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Appointment Type */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Appointment Type
  </label>
  <select
    value={formData.feeType}
    onChange={(e) => setFormData((prev) => ({ ...prev, feeType: e.target.value }))}
    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    {feeTypes.map((type) => (
      <option key={type.value} value={type.value}>
        {type.label} (₹{doctorFees[type.value] || 0})
      </option>
    ))}
  </select>
</div>
              
              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {paymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Reason for visit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Visit (Optional)
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
                placeholder="Describe the reason for the appointment..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
              />
            </div>
          </div>
          
          {/* Fee information */}
          {loadingFees ? (
            <div className="flex items-center text-gray-500 text-sm">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading fee information...
            </div>
          ) : (
            <div className="flex items-center p-3 bg-blue-50 rounded-lg text-sm border-l-4 border-blue-500">
              <Info className="text-blue-500 w-5 h-5 mr-2 flex-shrink-0" />
              <div>
                <span className="font-medium">Fee: </span>
                ₹{doctorFees[formData.feeType] || 0} ({feeTypes.find(f => f.value === formData.feeType)?.label})
                {formData.paymentMethod === "insurance" && " • Insurance coverage may apply"}
              </div>
            </div>
          )}
        </div>
      );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-blue-600 mb-6">
              <FileText className="w-5 h-5" />
              <h3 className="font-medium">Appointment Summary</h3>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-5 border">
              <div className="space-y-4">
                <div className="flex justify-between pb-4 border-b">
                  <div className="text-gray-500">Patient</div>
                  <div className="font-medium">{formData.patient?.name}</div>
                </div>
                
                <div className="flex justify-between pb-4 border-b">
                  <div className="text-gray-500">Doctor</div>
                  <div>
                    <div className="font-medium">{formData.doctor?.name}</div>
                    <div className="text-sm text-gray-500">{formData.doctor?.specialty}</div>
                  </div>
                </div>
                
                <div className="flex justify-between pb-4 border-b">
                  <div className="text-gray-500">Date & Time</div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formData.date ? format(formData.date, "MMMM d, yyyy") : ""}
                    </div>
                    <div className="text-sm text-gray-500">{formData.time}</div>
                  </div>
                </div>
                
                <div className="flex justify-between pb-4 border-b">
                  <div className="text-gray-500">Appointment Type</div>
                  <div className="font-medium">
                    {feeTypes.find((type) => type.value === formData.feeType)?.label}
                  </div>
                </div>
                
                <div className="flex justify-between pb-4 border-b">
                  <div className="text-gray-500">Payment Method</div>
                  <div className="font-medium">
                    {paymentMethods.find((method) => method.value === formData.paymentMethod)?.label}
                  </div>
                </div>
                
                <div className="flex justify-between pb-4 border-b">
                  <div className="text-gray-500">Fee</div>
                  <div className="font-medium">₹{doctorFees[formData.feeType] || 0}</div>
                </div>
                
                {formData.reason && (
                  <div className="pt-2">
                    <div className="text-gray-500 mb-1">Reason for Visit</div>
                    <div className="bg-white p-3 rounded border text-sm">
                      {formData.reason}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  // If the modal is not open, don't render anything
  if (!isOpen) return null;

  // Get the step title based on current step
  const getStepTitle = () => {
    switch (step) {
      case 1: return "Select Patient";
      case 2: return "Select Doctor";
      case 3: return "Schedule Appointment";
      case 4: return "Appointment Summary";
      default: return "";
    }
  };

  // Show back button except for first step
  const showBackButton = step > 1;
  
  // Show next button except for last step
  const showNextButton = step < 4;
  
  // Show submit button only on last step
  const showSubmitButton = step === 4;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">New Appointment</h2>
            <div className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
              Step {step} of 4
            </div>
          </div>
          <button
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Steps indicators */}
        <div className="px-6 pt-4">
          <div className="flex justify-between">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className="flex flex-col items-center"
                style={{ width: "25%" }}
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === i 
                      ? "bg-blue-500 text-white" 
                      : step > i 
                        ? "bg-green-100 text-green-600" 
                        : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {step > i ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    i
                  )}
                </div>
                <div className={`text-xs mt-1 text-center ${step === i ? "text-blue-600 font-medium" : "text-gray-500"}`}>
                  {i === 1 ? "Patient" : i === 2 ? "Doctor" : i === 3 ? "Schedule" : "Summary"}
                </div>
              </div>
            ))}
          </div>
          <div className="relative flex items-center justify-between mt-1 mb-6">
            <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-0.5 bg-gray-200" />
            <div 
              className="absolute left-0 top-1/2 transform -translate-y-1/2 h-0.5 bg-blue-500 transition-all duration-300" 
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Main content */}
        <div className="px-6 py-4 flex-1 overflow-y-auto">
          {renderStepContent()}
        </div>
        
        {/* Footer with actions */}
        <div className="px-6 py-4 border-t flex justify-between">
          <div>
            {showBackButton && (
              <button
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={() => setStep(step - 1)}
              >
                Back
              </button>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              onClick={onClose}
            >
              Cancel
            </button>
            
            {showNextButton && (
              <button
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                onClick={handleNextStep}
              >
                Next
              </button>
            )}
            
            {showSubmitButton && (
              <button
                className={`px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center ${
                  submitting ? "opacity-75 cursor-not-allowed" : ""
                }`}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Appointment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAppointment;