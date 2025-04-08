"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Search, User, Loader2, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

const PatientSearch = ({ onSelectPatient, selectedPatient }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search patients with debounce
  const searchPatients = useCallback(
    async (query) => {
      setLoading(true);
      setError(null);
      
      try {
        // Build query parameters - using the search parameter that GetAllPatients expects
        const params = new URLSearchParams();
        if (query.trim()) {
          params.append("search", query);
        }
        params.append("limit", "20");
        params.append("page", "1");

        // Use the GetAllPatients endpoint instead of the search endpoint
        const response = await fetch(`/api/patients?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch patients");
        }

        const data = await response.json();
        
        // GetAllPatients returns data in the "data" field
        const patientsArray = data.data || [];
        
        setPatients(patientsArray);
      } catch (error) {
        console.error("Error searching patients:", error);
        setError(error.message || "Failed to search patients");
        toast.error("Failed to search patients", {
          duration: 4000,
          position: 'top-right',
        });
        setPatients([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Trigger search when query changes or on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      searchPatients(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, searchPatients]);

  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-2">Select Patient</h3>
      
      {/* Search input */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search patients by name, email, or phone..."
              className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Patient list */}
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
              <p className="mt-2 text-gray-500">Searching patients...</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-8 bg-gray-50">
              <User className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">
                {searchQuery.trim() 
                  ? "No patients found. Try a different search term." 
                  : "No patients found."}
              </p>
            </div>
          ) : (
            patients.map((patient) => (
              <div
                key={patient.patient_id || patient._id}
                className={`p-4 border-b border-gray-100 last:border-0 cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedPatient?.id === (patient.patient_id || patient._id)
                    ? "bg-blue-50 border-l-4 border-l-blue-500"
                    : ""
                }`}
                onClick={() => onSelectPatient(patient)}
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10 border border-gray-200">
                    <AvatarImage src={patient.avatar_url} alt={patient.name} />
                    <AvatarFallback className="bg-gray-100 text-gray-600">
                      {getInitials(patient.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{patient.name}</div>
                      <div className="text-xs text-gray-500">
                        ID: {((patient.patient_id || patient._id)?.substring(0, 8)) || 'N/A'}
                      </div>
                    </div>
                    
                    <div className="mt-1 flex flex-wrap items-center gap-x-4">
                      <div className="text-sm text-gray-500">
                        {patient.age ? `${patient.age} years` : 'Age: N/A'}
                      </div>
                      
                      {patient.gender && (
                        <div className="text-sm text-gray-500">
                          {patient.gender}
                        </div>
                      )}
                      
                      {patient.blood_group && (
                        <Badge className="bg-red-50 text-red-600 hover:bg-red-50 rounded-full px-2 py-0.5 text-xs font-normal">
                          {patient.blood_group}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="mt-1 text-xs text-gray-500 flex flex-wrap gap-x-4">
                      {patient.email && (
                        <span>{patient.email}</span>
                      )}
                      {patient.mobile && (
                        <span>{patient.mobile}</span>
                      )}
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
};

export default PatientSearch;