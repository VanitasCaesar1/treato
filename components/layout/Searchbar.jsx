"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Search, User, Calendar, Stethoscope, Loader2, X, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import toast from "react-hot-toast";

const UnifiedSearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("all"); // all, patients, doctors, appointments
  const [showResults, setShowResults] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState({
    patients: [],
    doctors: [],
    appointments: []
  });
  const [hasSearched, setHasSearched] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
      
      // Only close dropdown if clicking outside both search and dropdown areas
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          !event.target.closest('[data-dropdown-trigger="true"]')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Perform search with debounce
  const performSearch = useCallback(async (query, type) => {
    if (!query.trim()) {
      setSearchResults({ patients: [], doctors: [], appointments: [] });
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    
    try {
      const results = { patients: [], doctors: [], appointments: [] };
      const searchPromises = [];
      const searchTermLower = query.toLowerCase().trim();

      // Only search the specified type or all types
      if (type === "all" || type === "patients") {
        const patientsPromise = searchPatients(query)
          .then(data => {
            // Apply client-side filtering to ensure matches
            const allPatients = data.data || [];
            results.patients = allPatients.filter(patient => 
              patient.name && patient.name.toLowerCase().includes(searchTermLower) ||
              patient.email && patient.email.toLowerCase().includes(searchTermLower) ||
              patient.mobile && patient.mobile.toLowerCase().includes(searchTermLower) ||
              patient.patient_id && patient.patient_id.toString().includes(searchTermLower)
            );
          })
          .catch(err => {
            console.error("Error searching patients:", err);
            toast.error("Failed to search patients");
          });
        searchPromises.push(patientsPromise);
      }

      if (type === "all" || type === "doctors") {
        const doctorsPromise = searchDoctors(query)
          .then(data => {
            // Apply client-side filtering to ensure matches
            const allDoctors = data.doctors || [];
            results.doctors = allDoctors.filter(doctor => {
              const doctorName = doctor.Name || doctor.name || '';
              const doctorSpeciality = doctor.Speciality || doctor.specialization || '';
              const doctorId = (doctor.DoctorID || doctor.doctor_id || '').toString();
              
              return doctorName.toLowerCase().includes(searchTermLower) ||
                     doctorSpeciality.toLowerCase().includes(searchTermLower) ||
                     doctorId.includes(searchTermLower);
            });
          })
          .catch(err => {
            console.error("Error searching doctors:", err);
            toast.error("Failed to search doctors");
          });
        searchPromises.push(doctorsPromise);
      }

      if (type === "all" || type === "appointments") {
        const appointmentsPromise = searchAppointments(query)
          .then(data => {
            // Apply client-side filtering to ensure matches
            const allAppointments = data.appointments || [];
            results.appointments = allAppointments.filter(appointment => {
              const searchFields = [
                appointment.patient_name,
                appointment.doctor_name,
                appointment.status,
                appointment.appointment_id?.toString(),
                // Include date if needed
                appointment.appointment_date && new Date(appointment.appointment_date).toLocaleDateString()
              ].filter(Boolean); // Remove undefined/null values
              
              return searchFields.some(field => 
                field.toLowerCase().includes(searchTermLower)
              );
            });
          })
          .catch(err => {
            console.error("Error searching appointments:", err);
            toast.error("Failed to search appointments");
          });
        searchPromises.push(appointmentsPromise);
      }

      await Promise.all(searchPromises);
      setSearchResults(results);
    } catch (error) {
      console.error("Error in unified search:", error);
      toast.error("Search failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Search APIs
  const searchPatients = async (query) => {
    const params = new URLSearchParams();
    params.append("search", query);
    params.append("limit", "5");
    params.append("page", "1");
    
    const response = await fetch(`/api/patients?${params.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch patients");
    return await response.json();
  };

  const searchDoctors = async (query) => {
    const params = new URLSearchParams();
    params.append("q", query);
    params.append("by", "name");
    params.append("limit", "5");
    
    const response = await fetch(`/api/doctors/search?${params.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch doctors");
    return await response.json();
  };

  const searchAppointments = async (query) => {
    const params = new URLSearchParams();
    params.append("search", query);
    params.append("limit", "5");
    
    const response = await fetch(`/api/appointments?${params.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch appointments");
    return await response.json();
  };

  // Handle input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery, searchType);
        setShowResults(true);
      } else {
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchType, performSearch]);

  // Format date for appointments
  const formatAppointmentDate = (dateString) => {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Handle change search type
  const handleChangeSearchType = (type) => {
    setSearchType(type);
    if (searchQuery) {
      performSearch(searchQuery, type);
    }
  };

  // Navigation functions
  const navigateToPatient = (patient) => {
    window.location.href = `/patients/${patient.patient_id}`;
  };

  const navigateToDoctor = (doctor) => {
    window.location.href = `/doctors/${doctor.DoctorID || doctor.doctor_id}`;
  };

  const navigateToAppointment = (appointment) => {
    window.location.href = `/appointments/${appointment.appointment_id}`;
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="relative w-full max-w-xl" ref={searchRef}>
      {/* Search Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
          <input
            type="search"
            placeholder={`Search for ${searchType === "all" ? "Patients, Doctors or Appointments" : 
              searchType === "patients" ? "Patients" : 
              searchType === "doctors" ? "Doctors" : "Appointments"}...`}
            className="w-full bg-white/10 border border-white/10 rounded-xl py-2 pl-10 pr-20 text-[15px] text-white placeholder-white/60 focus:outline-none focus:border-[#FFB347] focus:ring-1 focus:ring-[#FFB347] transition-all duration-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchQuery.trim()) setShowResults(true);
            }}
          />
          
          {/* Search type selector */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-20">
            <div className="relative">
              <button 
                onClick={toggleDropdown}
                data-dropdown-trigger="true"
                className="flex items-center text-white/70 cursor-pointer text-sm hover:text-white"
              >
                {searchType === "all" && "All"}
                {searchType === "patients" && "Patients"}
                {searchType === "doctors" && "Doctors"}
                {searchType === "appointments" && "Appointments"}
                <ChevronDown className="ml-1 w-4 h-4" />
              </button>
              
              {showDropdown && (
                <div 
                  ref={dropdownRef}
                  className="absolute right-0 mt-1 py-2 w-40 bg-white rounded-md shadow-lg z-30"
                >
                  <button 
                    className={`w-full text-left px-4 py-2 text-sm ${searchType === "all" ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChangeSearchType("all");
                      setShowDropdown(false);
                    }}
                  >
                    All
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-2 text-sm ${searchType === "patients" ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChangeSearchType("patients");
                      setShowDropdown(false);
                    }}
                  >
                    Patients
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-2 text-sm ${searchType === "doctors" ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChangeSearchType("doctors");
                      setShowDropdown(false);
                    }}
                  >
                    Doctors
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-2 text-sm ${searchType === "appointments" ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChangeSearchType("appointments");
                      setShowDropdown(false);
                    }}
                  >
                    Appointments
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Clear search button */}
          {searchQuery && (
            <button
              className="absolute right-20 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
              onClick={() => setSearchQuery("")}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {showResults && hasSearched && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg z-10 max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mr-2" />
              <span className="text-gray-600">Searching...</span>
            </div>
          ) : (
            <div>
              {/* No results case */}
              {!searchResults.patients.length && !searchResults.doctors.length && !searchResults.appointments.length && (
                <div className="p-6 text-center text-gray-500">
                  <Search className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p>No results found for "{searchQuery}"</p>
                  <p className="text-sm mt-1">Try a different search term or filter</p>
                </div>
              )}

              {/* Patients Section */}
              {(searchType === "all" || searchType === "patients") && searchResults.patients.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="font-medium text-gray-700">Patients</span>
                    </div>
                  </div>
                  {searchResults.patients.map((patient) => (
                    <div
                      key={patient.patient_id}
                      className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigateToPatient(patient)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-gray-200">
                          <AvatarImage src={patient.avatar_url} alt={patient.name} />
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {getInitials(patient.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{patient.name}</div>
                          <div className="text-sm text-gray-500">
                            {patient.email || patient.mobile || "No contact information"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Doctors Section */}
              {(searchType === "all" || searchType === "doctors") && searchResults.doctors.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center">
                      <Stethoscope className="w-4 h-4 mr-2 text-green-500" />
                      <span className="font-medium text-gray-700">Doctors</span>
                    </div>
                  </div>
                  {searchResults.doctors.map((doctor) => (
                    <div
                      key={doctor.DoctorID || doctor.doctor_id}
                      className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigateToDoctor(doctor)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-gray-200">
                          <AvatarImage src={doctor.avatar_url} alt={doctor.Name || doctor.name} />
                          <AvatarFallback className="bg-green-100 text-green-600">
                            {getInitials(doctor.Name || doctor.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{doctor.Name || doctor.name}</div>
                          <div className="text-sm text-gray-500">
                            {doctor.Speciality || doctor.specialization || "General Practitioner"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Appointments Section */}
              {(searchType === "all" || searchType === "appointments") && searchResults.appointments.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                      <span className="font-medium text-gray-700">Appointments</span>
                    </div>
                  </div>
                  {searchResults.appointments.map((appointment) => (
                    <div
                      key={appointment.appointment_id}
                      className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigateToAppointment(appointment)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {appointment.patient_name || "Patient"} with {appointment.doctor_name || "Doctor"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatAppointmentDate(appointment.appointment_date)}
                            {appointment.status && (
                              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                appointment.status === "confirmed" ? "bg-green-100 text-green-700" :
                                appointment.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                appointment.status === "cancelled" ? "bg-red-100 text-red-700" :
                                "bg-gray-100 text-gray-700"
                              }`}>
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* View All Results Link */}
              {(searchResults.patients.length > 0 || searchResults.doctors.length > 0 || searchResults.appointments.length > 0) && (
                <div className="p-3 text-center border-t border-gray-200">
                  <a href={`/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View all results
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UnifiedSearchBar;