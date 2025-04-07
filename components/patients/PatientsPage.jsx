"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CreatePatient from "@/components/CreatePatient"; // Adjust the path as needed
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  User,
  UserPlus,
  Phone,
  Mail,
  Calendar,
  ChevronRight,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 10;

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBloodGroup, setFilterBloodGroup] = useState("all");
  const [error, setError] = useState(null);
  const [totalPatients, setTotalPatients] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const observer = useRef();

  // This function will handle fetching patients with pagination
  const fetchPatients = useCallback(async (pageNum = 1, reset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query string to match our API routes
      let queryString = `?page=${pageNum}&limit=${ITEMS_PER_PAGE}`;
      if (searchQuery) queryString += `&search=${encodeURIComponent(searchQuery)}`;
      if (filterBloodGroup && filterBloodGroup !== "all") queryString += `&bloodGroup=${encodeURIComponent(filterBloodGroup)}`;
      
      // Use the correct API endpoint
      const response = await fetch(`/api/patients${queryString}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch patients');
      }
      
      const data = await response.json();
      
      // Handle the response structure from our API
      if (reset) {
        setPatients(data.data || []);
      } else {
        setPatients(prev => [...prev, ...(data.data || [])]);
      }
      
      setTotalPatients(data.total || 0);
      setHasMore((data.data || []).length === ITEMS_PER_PAGE);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching patients:", error);
      setLoading(false);
      setError(error.message);
      
      toast.error(error.message || "Failed to load patients", {
        duration: 4000,
        position: 'top-right',
        style: {
          border: '1px solid #F56565',
          padding: '16px',
          color: '#E53E3E',
        },
        iconTheme: {
          primary: '#E53E3E',
          secondary: '#FFFAEE',
        },
      });
    }
  }, [searchQuery, filterBloodGroup]);

  // Initial load
  useEffect(() => {
    fetchPatients(1, true);
  }, [fetchPatients]);

  // Search handler with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        setPage(1);
        fetchPatients(1, true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchPatients]);

  // Blood group filter handler
  useEffect(() => {
    if (filterBloodGroup !== undefined) {
      setPage(1);
      fetchPatients(1, true);
    }
  }, [filterBloodGroup, fetchPatients]);

  // Setup intersection observer for infinite scroll
  const lastPatientElementRef = useCallback(node => {
    if (loading) return;
    
    if (observer.current) {
      observer.current.disconnect();
    }
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
        fetchPatients(page + 1);
      }
    });
    
    if (node) {
      observer.current.observe(node);
    }
  }, [loading, hasMore, fetchPatients, page]);

  // Handle new patient creation
  const handleNewPatient = () => {
    setShowCreateModal(true);
  
  };

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
  
  // Format date to a readable string
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      }).format(date);
    } catch (e) {
      return "Invalid Date";
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="max-w-[1400px] mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-medium text-gray-900">
              Patient Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              View and manage all patient records ({totalPatients} total)
            </p>
          </div>
          <Button 
            className="bg-[#FFB347] text-black hover:bg-amber-500 rounded-full px-6 gap-2"
            onClick={handleNewPatient}
          >
            <UserPlus className="h-4 w-4" />
            New Patient
          </Button>
        </div>

        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm overflow-hidden mb-8">
          {/* Search and filter section */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search patients by name, email, or phone..."
                  className="pl-10 h-10 bg-gray-50 border-0 rounded-lg focus:ring-1 focus:ring-gray-900"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterBloodGroup} onValueChange={setFilterBloodGroup}>
                <SelectTrigger className="w-[180px] bg-gray-50 border-0 rounded-lg focus:ring-1 focus:ring-gray-900">
                  <SelectValue placeholder="Blood Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Blood Groups</SelectItem>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => {
                  toast('Advanced filters coming soon!', {
                    icon: '🔍',
                    duration: 2000,
                  });
                }}
              >
                <Filter className="h-4 w-4" />
                More Filters
              </Button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Table header */}
          <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100">
            <div className="grid grid-cols-[80px_1.5fr_2fr_1fr_1fr_1fr_1fr] gap-4 items-center">
              <div className="text-xs font-medium text-gray-500">Patient</div>
              <div></div> {/* Empty column for patient name */}
              <div className="text-xs font-medium text-gray-500">Contact Information</div>
              <div className="text-xs font-medium text-gray-500">Age/Blood Group</div>
              <div className="text-xs font-medium text-gray-500">Last Visit</div>
              <div className="text-xs font-medium text-gray-500">Medical Records</div>
              <div className="text-xs font-medium text-gray-500 text-right">Actions</div>
            </div>
          </div>

          {/* Patients list */}
          <div>
            {patients.length === 0 && !loading ? (
              <div className="p-8 text-center text-gray-500">
                No patients found. Please try a different search.
              </div>
            ) : (
              patients.map((patient, index) => {
                // Check if this is the last element to observe for infinite scroll
                const isLastElement = patients.length === index + 1;
                return (
                  <div
                    key={patient._id || patient.patient_id}
                    ref={isLastElement ? lastPatientElementRef : null}
                    className="px-6 py-4 grid grid-cols-[80px_1.5fr_2fr_1fr_1fr_1fr_1fr] gap-4 items-center border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors duration-200"
                  >
                    {/* Patient avatar */}
                    <div className="flex justify-center">
                      <Avatar className="h-10 w-10 border border-gray-200">
                        <AvatarImage src={patient.avatar_url} alt={patient.name} />
                        <AvatarFallback className="bg-gray-100 text-gray-600">
                          {getInitials(patient.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    {/* Patient name and ID */}
                    <div>
                      <Link
                        href={`/patients/${patient._id || patient.patient_id}`}
                        className="text-sm font-medium text-gray-900 hover:text-gray-700 flex items-center gap-1 group"
                        onClick={() => {
                          toast.loading(`Loading ${patient.name}'s record...`, {
                            id: `loading-${patient._id || patient.patient_id}`,
                          });
                          // This would be dismissed in the patient detail page
                        }}
                      >
                        {patient.name}
                        <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </Link>
                      <div className="text-xs text-gray-500 mt-0.5">
                        ID: {(patient._id || patient.patient_id)?.substring(0, 8) || 'N/A'}
                      </div>
                    </div>

                    {/* Contact information */}
                    <div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span>{patient.email || 'No email'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span>{patient.mobile || 'No phone'}</span>
                      </div>
                    </div>

                    {/* Age and blood group */}
                    <div>
                      <div className="text-sm text-gray-900">
                        {patient.age ? `${patient.age} years` : 'N/A'}
                      </div>
                      {patient.blood_group && (
                        <Badge className="mt-1 bg-red-50 text-red-600 hover:bg-red-50 rounded-full px-3 py-0.5 font-normal">
                          {patient.blood_group}
                        </Badge>
                      )}
                    </div>

                    {/* Last visit */}
                    <div>
                      {patient.hospital_visits && patient.hospital_visits.length > 0 ? (
                        <div>
                          <div className="text-sm text-gray-900">
                            {formatDate(patient.hospital_visits[patient.hospital_visits.length - 1].visit_date)}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {patient.hospital_visits[patient.hospital_visits.length - 1].hospital_name || 'Unknown Hospital'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No visits recorded</span>
                      )}
                    </div>

                    {/* Medical records count */}
                    <div>
                      {patient.medical_history && patient.medical_history.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <ClipboardList className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {patient.medical_history.length} records
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No records</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        asChild
                      >
                        <Link 
                          href={`/patients/${patient._id || patient.patient_id}`}
                          onClick={() => {
                            toast.loading(`Loading ${patient.name}'s record...`, {
                              id: `loading-${patient._id || patient.patient_id}`,
                            });
                          }}
                        >
                          View Patient
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
            
            {/* Loading indicator */}
            {loading && (
              <div className="p-4 text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-gray-900 border-r-transparent"></div>
                <span className="ml-2 text-sm text-gray-600">Loading patients...</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <CreatePatient 
  isOpen={showCreateModal} 
  onClose={() => setShowCreateModal(false)} 
/>
    </div>
  );
}