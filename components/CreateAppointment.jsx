import React, { useState } from "react";
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
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

const CreateAppointment = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [formData, setFormData] = useState({
    patient: null,
    doctor: null,
    date: null,
    time: null,
    reason: "",
  });

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

  // Mock data - replace with actual API calls
  const doctors = [
    {
      id: 1,
      name: "Dr. Sarah Wilson",
      specialty: "Cardiologist",
      image: "/api/placeholder/32/32",
    },
    {
      id: 2,
      name: "Dr. James Murphy",
      specialty: "Neurologist",
      image: "/api/placeholder/32/32",
    },
  ];

  const patients = [
    {
      id: 1,
      name: "John Doe",
      age: 45,
      phone: "+1 234-567-8900",
      image: "/api/placeholder/32/32",
    },
    {
      id: 2,
      name: "Jane Smith",
      age: 32,
      phone: "+1 234-567-8901",
      image: "/api/placeholder/32/32",
    },
  ];

  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
  ];

  const handleSubmit = () => {
    console.log("Appointment created:", formData);
    onClose();
  };

  const renderCalendar = () => {
    const days = getDaysInMonth();
    const firstDayOfMonth = startOfMonth(currentDate).getDay();

    return (
      <div className="w-full">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-medium">
            {format(currentDate, "MMMM yyyy")}
          </h3>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight className="w-5 h-5" />
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
            <div key={`empty-${index}`} className="p-2" />
          ))}

          {/* Actual days */}
          {days.map((day) => (
            <button
              key={day.toISOString()}
              onClick={() => setFormData((prev) => ({ ...prev, date: day }))}
              disabled={day < new Date()}
              className={`
                p-2 rounded-lg text-center relative hover:bg-gray-50
                ${!isSameMonth(day, currentDate) ? "text-gray-300" : ""}
                ${isSameDay(day, formData.date || new Date()) ? "bg-blue-50 text-blue-600" : ""}
                ${isToday(day) ? "font-bold" : ""}
                ${day < new Date() ? "text-gray-300 cursor-not-allowed" : ""}
              `}
            >
              {format(day, "d")}
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">
              Create Appointment
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          {/* Progress indicator */}
          <div className="mt-4 flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full flex-1 transition-colors duration-200 ${
                  s <= step ? "bg-blue-500" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              {/* Patient Selection */}
              <div>
                <h3 className="text-lg font-medium mb-4">Select Patient</h3>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {patients.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, patient }));
                        setStep(2);
                      }}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors duration-200 hover:bg-gray-50 ${
                        formData.patient?.id === patient.id
                          ? "border-blue-500 bg-blue-50"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={patient.image}
                          alt=""
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <div className="font-medium">{patient.name}</div>
                          <div className="text-sm text-gray-500">
                            Age: {patient.age} • {patient.phone}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {/* Doctor Selection */}
              <div>
                <h3 className="text-lg font-medium mb-4">Select Doctor</h3>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search doctors..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {doctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, doctor }));
                        setStep(3);
                      }}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors duration-200 hover:bg-gray-50 ${
                        formData.doctor?.id === doctor.id
                          ? "border-blue-500 bg-blue-50"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={doctor.image}
                          alt=""
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <div className="font-medium">{doctor.name}</div>
                          <div className="text-sm text-gray-500">
                            {doctor.specialty}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Date Selection */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Select Date</h3>
                  <div className="border rounded-lg p-4">
                    {renderCalendar()}
                  </div>
                </div>

                {/* Time Selection */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Select Time</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, time }))
                        }
                        className={`p-2 rounded-lg text-center border hover:bg-gray-50 ${
                          formData.time === time
                            ? "border-blue-500 bg-blue-50"
                            : ""
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reason for Visit */}
              <div>
                <h3 className="text-lg font-medium mb-2">Reason for Visit</h3>
                <textarea
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  className="w-full p-3 border rounded-lg min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Please describe the reason for your visit..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <button
              onClick={() => step > 1 && setStep(step - 1)}
              className={`px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 ${
                step === 1 ? "invisible" : ""
              }`}
            >
              Back
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={!formData[step === 1 ? "patient" : "doctor"]}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!formData.date || !formData.time}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Appointment
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
