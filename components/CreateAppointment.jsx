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

// Simplified fetchDoctors function
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
const doctorsArray = data.doctors || [];

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

// Fetch doctor shifts
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

// Fetch doctor fees
const fetchDoctorFees = async (doctorId, orgId) => {
if (!doctorId || !orgId) return;
setLoadingFees(true);
try {
const response = await fetch(`/api/doctors/${doctorId}/fees?org_id=${orgId}`);
if (!response.ok) {
throw new Error(`Failed to fetch doctor fees: ${response.status}`);
 }
const responseData = await response.json();

if (Array.isArray(responseData) && responseData.length > 0) {
const feeData = responseData[0];
setDoctorFees({
default: parseInt(feeData.default_fees ?? 1000),
recurring: parseInt(feeData.recurring_fees ?? 800),
emergency: parseInt(feeData.emergency_fees ?? 1500)
 });
return;
 }

if (Array.isArray(responseData) && responseData.length === 0) {
setDoctorFees({ default: 1000, recurring: 800, emergency: 1500 });
return;
 }

let feeData = responseData;
if (responseData.fee) {
setDoctorFees({
default: parseInt(responseData.fee.default_fees || responseData.fee.default_fee || responseData.fee || 1000),
recurring: parseInt(responseData.fee.recurring_fees || responseData.fee.recurring_fee || responseData.fee || 800),
emergency: parseInt(responseData.fee.emergency_fees || responseData.fee.emergency_fee || responseData.fee || 1500)
 });
return;
 }

if (responseData.data) {
feeData = responseData.data;
 }

const defaultFee = parseInt(feeData.default_fees ?? feeData.defaultFees ?? 1000);
const recurringFee = parseInt(feeData.recurring_fees ?? feeData.recurringFees ?? feeData.follow_up_fees ?? 800);
const emergencyFee = parseInt(feeData.emergency_fees ?? feeData.emergencyFees ?? 1500);

setDoctorFees({
default: defaultFee,
recurring: recurringFee,
emergency: emergencyFee
 });
 } catch (error) {
console.error("Error fetching doctor fees:", error);
toast.error("Failed to fetch doctor's fees. Using default values.");
setDoctorFees({ default: 1000, recurring: 800, emergency: 1500 });
 } finally {
setLoadingFees(false);
 }
};

// Fetch doctor availability
const fetchDoctorAvailability = async (doctorId, date, orgId) => {
if (!doctorId || !date || !orgId) {
setAvailableTimeSlots([]);
return;
 }

const formattedDate = format(date, "yyyy-MM-dd");
setLoadingSlots(true);
try {
const response = await fetch(`/api/doctors/${doctorId}/slots?date=${formattedDate}&org_id=${orgId}`);
if (!response.ok) {
const errorData = await response.json();
throw new Error(errorData.error || `Failed to fetch slots: ${response.status}`);
 }

const data = await response.json();
let formattedSlots = [];

if (Array.isArray(data.available_slots) && data.available_slots.length > 0) {
formattedSlots = data.available_slots.map(slot => {
if (slot && slot.start_time) {
return slot.start_time;
 }
if (typeof slot === 'string') {
return slot;
 }
return null;
 }).filter(Boolean);
 }
else if (Array.isArray(data.slots) && data.slots.length > 0) {
formattedSlots = data.slots.map(slot => {
if (typeof slot === 'string') {
return slot;
 }
else if (slot.start_time) {
return typeof slot.start_time === 'string'
? slot.start_time
: format(new Date(slot.start_time), 'HH:mm');
 }
else if (slot.startTime) {
return typeof slot.startTime === 'string'
? slot.startTime
: format(new Date(slot.startTime), 'HH:mm');
 }
return null;
 }).filter(Boolean);
 }

setAvailableTimeSlots(formattedSlots);
if (formattedSlots.length === 0) {
toast.error(data.message || "No available time slots for the selected date");
 } else if (formData.time && !formattedSlots.includes(formData.time)) {
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

// Calculate available time slots
const calculateAvailableTimeSlots = async (shifts, date) => {
if (!formData.doctor?.id || !date) {
setAvailableTimeSlots([]);
return;
 }

const dayOfWeek = getDayName(getDay(date));
const dayShift = shifts.find(shift => shift.weekday === dayOfWeek && shift.isactive);

if (!dayShift || !dayShift.starttime || !dayShift.endtime) {
setAvailableTimeSlots([]);
toast.error(`No shift scheduled for ${dayOfWeek}`);
return;
 }

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
 { value: "default", label: "Standard" },
 { value: "recurring", label: "Follow-up" },
 { value: "emergency", label: "Emergency" }
 ];

// Payment method options
const paymentMethods = [
 { value: "online", label: "Online" },
 { value: "insurance", label: "Insurance" },
 { value: "cash", label: "Cash" }
 ];

// Form validation
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
if (timeStr.includes(':') && timeStr.split(':').length === 3) {
return timeStr;
 }
if (timeStr.includes(':') && timeStr.split(':').length === 2) {
return `${timeStr}:00`;
 }
return timeStr;
};

function calculateEndTimeFromString(timeStr, slotDuration = 30) {
if (!timeStr) return "";
const timeParts = timeStr.split(':');
const hours = parseInt(timeParts[0]);
const minutes = parseInt(timeParts[1]);
const seconds = timeParts.length > 2 ? parseInt(timeParts[2]) : 0;

let endHours = hours;
let endMinutes = minutes + slotDuration;
let endSeconds = seconds;

if (endMinutes >= 60) {
endHours = Math.floor(endHours + (endMinutes / 60)) % 24;
endMinutes = endMinutes % 60;
 }

return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}:${endSeconds.toString().padStart(2, '0')}`;
}

// Handle submit
const handleSubmit = async () => {
if (!validateForm()) return;
setSubmitting(true);
const loadingToast = toast.loading("Creating appointment...");

try {
if (!formData.patient?.id || !/^[A-Z0-9]{8}$/.test(formData.patient.id)) {
throw new Error("Patient ID must be in 8-digit alphanumeric format");
 }
if (!formData.doctor?.id ||
!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(formData.doctor.id)) {
throw new Error("Doctor ID must be in UUID format");
 }

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
slot_duration: doctorSlotDuration,
fee_type: formData.feeType,
payment_method: formData.paymentMethod,
reason: formData.reason || ""
 };

const response = await fetch("/api/appointments/create", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(appointmentData),
 });

const data = await response.json();
if (!response.ok) {
throw new Error(data.error || "Failed to create appointment");
 }

toast.success("Appointment created successfully", { id: loadingToast });
if (onSuccess) {
onSuccess(data.appointment);
 }
onClose();
 } catch (error) {
console.error("Error creating appointment:", error);
toast.error(error.message || "Failed to create appointment", { id: loadingToast });
 } finally {
setSubmitting(false);
 }
};

// Handle patient selection
const handleSelectPatient = (patient) => {
const patientId = patient.patient_id || patient.PatientID || patient._id || patient.id;
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

// Navigate to next step
const handleNextStep = () => {
if (!validateForm()) return;
setStep(step + 1);
 };

// Fee display component
const FeeDisplay = () => {
if (loadingFees) {
return (
<div className="flex items-center text-gray-500 text-sm p-3 bg-white/50 rounded-xl border border-white/20">
<Loader2 className="w-4 h-4 mr-2 animate-spin" />
 Loading fee information...
</div>
 );
 }

const selectedFeeType = feeTypes.find(f => f.value === formData.feeType);
const feeAmount = doctorFees[formData.feeType] || 0;

return (
<div className="space-y-2">
<div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl text-sm border border-blue-200">
<div className="flex items-center">
<CreditCard className="text-blue-600 w-4 h-4 mr-2" />
<span className="font-medium text-gray-700">Fee: </span>
<span className="text-blue-700 font-bold">₹{feeAmount}</span>
</div>
<div className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
{selectedFeeType?.label}
</div>
</div>
</div>
 );
};

// Compact doctor card
const DoctorCard = ({ doctor, onSelect, isSelected }) => {
return (
<div
className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
isSelected
 ? "border-blue-400 bg-blue-50 shadow-md"
 : "border-gray-200 bg-white hover:bg-gray-50 hover:shadow-sm"
}`}
onClick={() => onSelect(doctor)}
>
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
{doctor.name.charAt(0)}
</div>
<div className="flex-1 min-w-0">
<div className="font-semibold text-gray-800 text-sm truncate">{doctor.name}</div>
<div className="text-xs text-gray-600">{doctor.specialty}</div>
<div className="text-xs text-gray-500">
 {doctor.slotDuration} min slots
</div>
</div>
{isSelected && (
<div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
<svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
</svg>
</div>
 )}
</div>
</div>
 );
};

// Compact calendar
const renderCalendar = () => {
const days = getDaysInMonth();
const firstDayOfMonth = startOfMonth(currentDate).getDay();
const today = new Date();
today.setHours(0, 0, 0, 0);

return (
<div className="w-full bg-white rounded-xl p-4 border border-gray-200">
{/* Month navigation */}
<div className="flex items-center justify-between mb-4">
<button
className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
onClick={prevMonth}
>
<ChevronLeft className="w-5 h-5 text-gray-600" />
</button>
<h3 className="text-lg font-semibold text-gray-800">
{format(currentDate, "MMM yyyy")}
</h3>
<button
className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
onClick={nextMonth}
>
<ChevronRight className="w-5 h-5 text-gray-600" />
</button>
</div>

{/* Week days */}
<div className="grid grid-cols-7 gap-2 mb-3">
{weekDays.map((day) => (
<div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
{day}
</div>
 ))}
</div>

{/* Calendar grid */}
<div className="grid grid-cols-7 gap-2">
{Array.from({ length: firstDayOfMonth }).map((_, index) => (
<div key={`empty-${index}`} className="p-2" />
 ))}
{days.map((day) => {
const isPastDay = day < today;
const isSelectedDay = formData.date && isSameDay(day, formData.date);
const isTodayDay = isToday(day);

return (
<button
key={day.toISOString()}
onClick={() => {
if (!isPastDay) {
const selectedDate = new Date(day);
selectedDate.setHours(12, 0, 0, 0);
setFormData((prev) => ({
 ...prev,
date: selectedDate,
time: null
 }));
 }
 }}
disabled={isPastDay}
className={`
 p-3 rounded-lg text-sm font-medium transition-all duration-200 min-h-[40px] w-full
${isPastDay
 ? "text-gray-300 cursor-not-allowed bg-gray-50"
 : isSelectedDay
 ? "bg-blue-500 text-white shadow-md"
 : isTodayDay
 ? "bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200"
 : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
}
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

// Compact time slots
const renderTimeSlots = () => {
if (loadingSlots) {
return (
<div className="flex items-center justify-center p-6 text-gray-500">
<Loader2 className="w-5 h-5 mr-2 animate-spin" />
 Loading slots...
</div>
 );
 }

if (availableTimeSlots.length === 0) {
return (
<div className="text-center p-6 text-gray-500 bg-gray-50 rounded-xl">
<Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
<p className="text-sm font-medium">No available slots</p>
<p className="text-xs">Select a different date</p>
</div>
 );
 }

return (
<div className="flex flex-wrap gap-3">
{availableTimeSlots.map((time) => (
<button
key={time}
onClick={() => setFormData((prev) => ({ ...prev, time }))}
className={`
 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border
${formData.time === time
 ? "bg-blue-500 text-white shadow-md border-blue-600"
 : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-gray-200 hover:border-blue-200"
}
 `}
>
{format(new Date(`2000-01-01T${time}`), "h:mm a")}
</button>
 ))}
</div>
 );
 };

// Reset form when modal closes
useEffect(() => {
if (!isOpen) {
setStep(1);
setFormData({
patient: null,
doctor: null,
date: null,
time: null,
reason: "",
feeType: "recurring",
paymentMethod: "online",
 });
setSearchQuery("");
setSelectedSpeciality("_all");
setDoctors([]);
setSpecialities([]);
setDoctorShifts([]);
setAvailableTimeSlots([]);
setDoctorFees({ default: 0, recurring: 0, emergency: 0 });
 }
 }, [isOpen]);

if (!isOpen) return null;

return (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
<div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
{/* Compact Header */}
<div className="flex items-center justify-between p-4 border-b bg-gray-50 flex-shrink-0">
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
<Calendar className="w-4 h-4 text-white" />
</div>
<div>
<h2 className="text-lg font-bold text-gray-800">Create Appointment</h2>
<p className="text-xs text-gray-600">Step {step} of 3</p>
</div>
</div>
<button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
<X className="w-5 h-5 text-gray-500" />
</button>
</div>

{/* Compact Progress */}
<div className="px-4 py-3 bg-gray-50 border-b flex-shrink-0">
<div className="flex items-center justify-center gap-4">
{[1, 2, 3].map((stepNumber) => (
<div key={stepNumber} className="flex items-center">
<div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
step >= stepNumber ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
}`}>
{stepNumber}
</div>
<span className="ml-1 text-xs font-medium text-gray-600">
{stepNumber === 1 && "Patient"}
{stepNumber === 2 && "Doctor"}
{stepNumber === 3 && "Schedule"}
</span>
{stepNumber < 3 && <div className={`w-8 h-0.5 mx-2 ${step > stepNumber ? "bg-blue-500" : "bg-gray-200"}`} />}
</div>
 ))}
</div>
</div>

{/* Content - Scrollable */}
<div className="flex-1 overflow-y-auto p-4">
{/* Step 1: Patient Selection */}
{step === 1 && (
<div className="space-y-4">
<div className="text-center">
<User className="w-12 h-12 mx-auto mb-2 text-blue-500" />
<h3 className="text-lg font-semibold text-gray-800">Select Patient</h3>
<p className="text-sm text-gray-600">Search and select the patient</p>
</div>
<PatientSearch onSelectPatient={handleSelectPatient} />
{formData.patient && (
<div className="p-3 bg-green-50 rounded-xl border border-green-200">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold text-sm">
{formData.patient.name.charAt(0)}
</div>
<div>
<div className="font-semibold text-gray-800 text-sm">{formData.patient.name}</div>
<div className="text-xs text-gray-600">
 Age: {formData.patient.age} | Phone: {formData.patient.phone}
</div>
</div>
</div>
</div>
 )}
</div>
 )}

{/* Step 2: Doctor Selection */}
{step === 2 && (
<div className="space-y-4">
<div className="text-center">
<User className="w-12 h-12 mx-auto mb-2 text-blue-500" />
<h3 className="text-lg font-semibold text-gray-800">Select Doctor</h3>
<p className="text-sm text-gray-600">Search and select the doctor</p>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedSpeciality}
              onChange={(e) => setSelectedSpeciality(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="_all">All Specialities</option>
              {specialities.map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          {/* Doctor List */}
          {loading ? (
            <div className="flex items-center justify-center p-6 text-gray-500">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Loading doctors...
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center p-6 text-gray-500 bg-gray-50 rounded-xl">
              <User className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm font-medium">No doctors found</p>
              <p className="text-xs">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {doctors.map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  onSelect={(selectedDoctor) => {
                    setFormData((prev) => ({ ...prev, doctor: selectedDoctor }));
                  }}
                  isSelected={formData.doctor?.id === doctor.id}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Schedule */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center">
            <Calendar className="w-12 h-12 mx-auto mb-2 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-800">Schedule Appointment</h3>
            <p className="text-sm text-gray-600">Select date, time, and appointment details</p>
          </div>

          {/* Selected Patient & Doctor Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                  {formData.patient?.name?.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-gray-800 text-sm">{formData.patient?.name}</div>
                  <div className="text-xs text-gray-600">Patient</div>
                </div>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold text-sm">
                  {formData.doctor?.name?.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-gray-800 text-sm">{formData.doctor?.name}</div>
                  <div className="text-xs text-gray-600">{formData.doctor?.specialty}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Select Date
              </h4>
              {renderCalendar()}
            </div>

            {/* Time Slots */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Available Times
                {formData.date && (
                  <span className="ml-2 text-sm text-gray-600">
                    {format(formData.date, "MMM dd, yyyy")}
                  </span>
                )}
              </h4>
              {formData.date ? (
                <div className="bg-white rounded-xl p-4 border border-gray-200 min-h-[200px]">
                  {renderTimeSlots()}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 min-h-[200px] flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Select a date first</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Appointment Type & Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Appointment Type
              </h4>
              <div className="space-y-2">
                {feeTypes.map((type) => (
                  <label key={type.value} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="feeType"
                      value={type.value}
                      checked={formData.feeType === type.value}
                      onChange={(e) => setFormData((prev) => ({ ...prev, feeType: e.target.value }))}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-700">{type.label}</div>
                      <div className="text-sm text-gray-500">₹{doctorFees[type.value] || 0}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <CreditCard className="w-4 h-4 mr-2" />
                Payment Method
              </h4>
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <label key={method.value} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={formData.paymentMethod === method.value}
                      onChange={(e) => setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                      className="mr-3"
                    />
                    <div className="font-medium text-gray-700">{method.label}</div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Info className="w-4 h-4 mr-2" />
              Reason for Visit (Optional)
            </h4>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
              placeholder="Brief description of the reason for this appointment..."
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Fee Display */}
          <FeeDisplay />
        </div>
      )}
    </div>

    {/* Footer - Fixed */}
    <div className="flex-shrink-0 p-4 border-t bg-gray-50 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Back
          </button>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        {step < 3 ? (
          <button
            onClick={handleNextStep}
            disabled={!validateForm()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting || !validateForm()}
            className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
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
);
};

export default CreateAppointment;