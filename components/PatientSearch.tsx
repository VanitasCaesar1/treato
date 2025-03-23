import React, { useState, useEffect } from "react";
import { Search, User, Loader2 } from "lucide-react";

const PatientSearch = ({ onSelectPatient, selectedPatient }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchBy, setSearchBy] = useState("name");
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0
  });

  // Search options
  const searchOptions = [
    { value: "name", label: "Name" },
    { value: "email", label: "Email" },
    { value: "mobile", label: "Mobile" },
    { value: "patient_id", label: "Patient ID" },
    { value: "aadhaar_id", label: "Aadhaar ID" }
  ];

  // Function to search patients
  const searchPatients = async (query = searchQuery, by = searchBy, offset = 0) => {
    if (!query && by !== "all") return;
    
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (query) params.append("q", query);
      params.append("by", by);
      params.append("limit", pagination.limit.toString());
      params.append("offset", offset.toString());
      
      const response = await fetch(`/api/patients/search?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to search patients");
      }
      
      const data = await response.json();
      setPatients(data.patients || []);
      setPagination(data.pagination || { 
        total: data.patients?.length || 0, 
        limit: pagination.limit, 
        offset 
      });
    } catch (err) {
      console.error("Error searching patients:", err);
      setError("Failed to search patients. Please try again.");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle search option changes
  const handleSearchByChange = (e) => {
    setSearchBy(e.target.value);
  };

  // Load more results
  const loadMore = () => {
    const newOffset = pagination.offset + pagination.limit;
    searchPatients(searchQuery, searchBy, newOffset);
  };

  // Debounced search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery) {
        searchPatients(searchQuery, searchBy, 0);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery, searchBy]);

  // Initial search on component mount - fetch most recent patients
  useEffect(() => {
    searchPatients("", "all", 0);
  }, []);

  return (
    <div className="space-y-4 w-full">
      <h3 className="text-lg font-medium mb-2">Select Patient</h3>
      
      {/* Search controls */}
      <div className="flex gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search patients..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={searchBy}
          onChange={handleSearchByChange}
          className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {searchOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Loading state */}
      {loading && patients.length === 0 && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-4 text-red-500 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && patients.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <User className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">No patients found</p>
          <button 
            onClick={() => searchPatients("", "all", 0)} 
            className="mt-2 text-blue-500 hover:text-blue-700"
          >
            Show all patients
          </button>
        </div>
      )}

      {/* Patient list */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {patients.map((patient) => (
          <div
            key={patient.PatientID || patient._id || `patient-${patients.indexOf(patient)}`}
            onClick={() => onSelectPatient(patient)}
            className={`p-4 rounded-lg border cursor-pointer transition-colors duration-200 hover:bg-gray-50 ${
              selectedPatient?.id === (patient.PatientID || patient._id) || 
              selectedPatient?.PatientID === patient.PatientID ? "border-blue-500 bg-blue-50" : ""
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                {patient.Name?.charAt(0) || patient.name?.charAt(0) || "P"}
              </div>
              <div className="flex-grow">
                <div className="font-medium">{patient.Name || patient.name}</div>
                <div className="text-sm text-gray-500 flex flex-wrap gap-x-3">
                  {patient.Age && <span>Age: {patient.Age}</span>}
                  {patient.Mobile && <span>• {patient.Mobile}</span>}
                  {patient.mobile && <span>• {patient.mobile}</span>}
                  {patient.PatientID && <span>• ID: {patient.PatientID}</span>}
                  {patient.BloodGroup && <span>• Blood: {patient.BloodGroup}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      {pagination.total > patients.length && (
        <div className="text-center pt-2">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-4 py-2 text-blue-500 hover:text-blue-700 disabled:text-gray-400"
          >
            {loading ? (
              <span className="flex items-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Loading...
              </span>
            ) : (
              `Load more (${patients.length} of ${pagination.total})`
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default PatientSearch;