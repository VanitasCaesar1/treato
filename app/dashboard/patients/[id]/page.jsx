"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Calendar,
  Phone,
  Mail,
  MapPin,
  User,
  Clipboard,
  Edit3,
  AlertTriangle,
  Save,
  X,
  Heart,
  UserCog,
  ClipboardList,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";

export default function PatientDetailsPage({ params }) {
  const router = useRouter();
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const id = unwrappedParams.id; // Get the id from unwrapped params
  
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    age: "",
    blood_group: "",
    address: "",
    aadhaar_id: "",
    allergies: [],
    allergiesText: "" // Add a new field to store the raw text input
  });

  // Fetch patient data
  useEffect(() => {
    async function fetchPatientData() {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/patients/${id}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch patient data');
        }
        
        const data = await response.json();
        setPatient(data.patient);
        
        // Initialize form data
        setFormData({
          name: data.patient.name || "",
          email: data.patient.email || "",
          mobile: data.patient.mobile || "",
          age: data.patient.age || "",
          blood_group: data.patient.blood_group || "",
          address: data.patient.address || "",
          aadhaar_id: data.patient.aadhaar_id || "",
          allergies: data.patient.allergies || [],
          allergiesText: data.patient.allergies?.join(", ") || "" // Initialize the text input
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching patient data:", error);
        setLoading(false);
        setError(error.message);
        
        toast.error("Failed to load patient data", {
          position: 'top-right',
        });
      }
    }
    
    fetchPatientData();
  }, [id]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle select input changes 
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle allergies input (comma-separated list)
  const handleAllergiesChange = (e) => {
    const allergiesText = e.target.value;
    
    // Store the raw text input
    setFormData(prev => ({ 
      ...prev, 
      allergiesText: allergiesText,
      // Update the allergies array but only when saving
      allergies: allergiesText.split(",").map(item => item.trim()).filter(item => item !== "")
    }));
  };

  // Modify the handleSave function in your PatientDetailsPage component
const handleSave = async () => {
  try {
    const toastId = toast.loading("Updating patient information...");
    
    // Process allergies from text input when saving
    const allergiesArray = formData.allergiesText
      .split(",")
      .map(item => item.trim())
      .filter(item => item !== "");
    
    // Make sure we include patient_id in the update data
    const updateData = {
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      age: parseInt(formData.age) || 0,
      blood_group: formData.blood_group,
      address: formData.address,
      aadhaar_id: formData.aadhaar_id,
      allergies: allergiesArray,
      // Ensure patient_id is included if it exists in the patient object
      ...(patient.patient_id && { patient_id: patient.patient_id })
    };
    
    console.log("Sending update data:", updateData);
    console.log(`PUT request to: /api/patients/${id}`);
    
    const response = await fetch(`/api/patients/${id}`, {
      method: 'PUT', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    
    // Log the full response for debugging
    const responseData = await response.json();
    console.log("Response status:", response.status);
    console.log("Response data:", responseData);
    
    if (!response.ok) {
      throw new Error(responseData.error || 'Failed to update patient');
    }
    
    // Update local patient state with new data
    setPatient(prev => ({ ...prev, ...updateData }));
    setIsEditing(false);
    
    toast.success("Patient information updated successfully", {
      id: toastId,
    });
  } catch (error) {
    console.error("Error updating patient:", error);
    
    toast.error(error.message || "Failed to update patient information", {
      position: 'top-right',
    });
  }
};

// Optional: Add debug logging at component mount to verify correct IDs
useEffect(() => {
  if (patient) {
    console.log("Patient ID from params:", id);
    console.log("Patient ID from data:", patient.patient_id);
    console.log("Patient _id from data:", patient._id);
  }
}, [patient, id]);


  // Cancel editing
  const handleCancel = () => {
    // Reset form data to current patient data
    if (patient) {
      setFormData({
        name: patient.name || "",
        email: patient.email || "",
        mobile: patient.mobile || "",
        age: patient.age || "",
        blood_group: patient.blood_group || "",
        address: patient.address || "",
        aadhaar_id: patient.aadhaar_id || "",
        allergies: patient.allergies || [],
        allergiesText: patient.allergies?.join(", ") || ""
      });
    }
    setIsEditing(false);
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

  // Get patient initials for avatar
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading patient information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] p-8">
        <div className="max-w-[1200px] mx-auto bg-white rounded-2xl shadow-sm p-8">
          <div className="flex items-center gap-4 text-red-600 mb-4">
            <AlertTriangle className="h-6 w-6" />
            <h2 className="text-xl font-medium">Error Loading Patient Data</h2>
          </div>
          <p className="text-gray-700 mb-6">{error}</p>
          <Button
            className="bg-[#FFB347] text-black hover:bg-amber-500"
            onClick={() => router.push('/patients')}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Patients List
          </Button>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] p-8">
        <div className="max-w-[1200px] mx-auto bg-white rounded-2xl shadow-sm p-8 text-center">
          <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">Patient Not Found</h2>
          <p className="text-gray-600 mb-6">The patient record you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button
            className="bg-[#FFB347] text-black hover:bg-amber-500"
            onClick={() => router.push('/patients')}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Patients List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="max-w-[1200px] mx-auto p-8">
        {/* Back button and page header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <Link href="/dashboard/patients" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-2">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Patients List
            </Link>
            <h1 className="text-2xl font-medium text-gray-900">
              Patient Details
            </h1>
          </div>
          
          {!isEditing ? (
            <Button 
              className="bg-[#FFB347] text-black hover:bg-amber-500 mt-4 md:mt-0"
              onClick={() => setIsEditing(true)}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Patient
            </Button>
          ) : (
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button 
                variant="outline" 
                onClick={handleCancel}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={handleSave}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>

        {/* Patient Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="p-6 md:p-8 border-b border-gray-100">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex justify-center md:justify-start">
                <Avatar className="h-20 w-20 border-2 border-gray-100">
                  <AvatarImage src={patient.avatar_url} alt={patient.name} />
                  <AvatarFallback className="bg-[#FFB347] text-black text-xl">
                    {getInitials(patient.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-medium text-gray-900">
                      {isEditing ? (
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="mt-1 font-medium text-xl"
                        />
                      ) : (
                        patient.name
                      )}
                    </h2>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                        ID: {patient.patient_id?.substring(0, 8) || patient._id?.substring(0, 8) || 'N/A'}
                      </Badge>
                      {patient.blood_group && (
                        <Badge className="bg-red-50 text-red-600 hover:bg-red-50">
                          {isEditing ? (
                            <Select
                              value={formData.blood_group}
                              onValueChange={(value) => handleSelectChange("blood_group", value)}
                            >
                              <SelectTrigger className="h-6 min-h-0 py-0 w-20 bg-transparent border-0">
                                <SelectValue placeholder={patient.blood_group} />
                              </SelectTrigger>
                              <SelectContent>
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
                          ) : (
                            patient.blood_group
                          )}
                        </Badge>
                      )}
                      {patient.gender && (
                        <Badge className="bg-purple-50 text-purple-600 hover:bg-purple-50">
                          {patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : patient.gender}
                        </Badge>
                      )}
                      {patient.age && (
                        <Badge className="bg-green-50 text-green-600 hover:bg-green-50">
                          {isEditing ? (
                            <Input
                              name="age"
                              type="number"
                              value={formData.age}
                              onChange={handleInputChange}
                              className="w-16 h-6 min-h-0 py-0 bg-transparent border-0"
                            />
                          ) : (
                            `${patient.age} years`
                          )}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 text-sm text-gray-500">
                    <div>Created: {formatDate(patient.created_at)}</div>
                    <div>Last Updated: {formatDate(patient.updated_at)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {isEditing ? (
                      <Input
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="h-8"
                      />
                    ) : (
                      <span className="text-gray-700">{patient.email || 'No email'}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {isEditing ? (
                      <Input
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        className="h-8"
                      />
                    ) : (
                      <span className="text-gray-700">{patient.mobile || 'No phone'}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">
                      {patient.aadhaar_id ? (
                        isEditing ? (
                          <Input
                            name="aadhaar_id"
                            value={formData.aadhaar_id}
                            onChange={handleInputChange}
                            placeholder="12-digit ID"
                            className="h-8"
                          />
                        ) : (
                          `Aadhaar: ${patient.aadhaar_id}`
                        )
                      ) : (
                        isEditing ? (
                          <Input
                            name="aadhaar_id"
                            value={formData.aadhaar_id}
                            onChange={handleInputChange}
                            placeholder="12-digit ID"
                            className="h-8"
                          />
                        ) : (
                          'No ID provided'
                        )
                      )}
                    </span>
                  </div>
                </div>
                
                {/* Address section */}
                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {isEditing ? (
                      <Textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Patient address"
                        className="min-h-[60px]"
                      />
                    ) : (
                      <span className="text-gray-700">{patient.address || 'No address provided'}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Allergies section */}
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Heart className="h-5 w-5 text-red-500 mr-2" />
              Allergies
            </h3>
            
            {isEditing ? (
              <div>
                <Textarea
                  name="allergiesText"
                  placeholder="Enter allergies separated by commas"
                  value={formData.allergiesText}
                  onChange={handleAllergiesChange}
                  className="min-h-[60px]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter allergies separated by commas (e.g., "Penicillin, Peanuts, Latex")
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {patient.allergies && patient.allergies.length > 0 ? (
                  patient.allergies.map((allergy, index) => (
                    <Badge key={index} className="bg-red-50 text-red-600 hover:bg-red-50">
                      {allergy}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-500">No known allergies</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tabs for additional information */}
        <Tabs defaultValue="medical" className="mb-8">
          <TabsList className="bg-white rounded-lg mb-6">
            <TabsTrigger value="medical" className="text-sm">
              <ClipboardList className="h-4 w-4 mr-2" />
              Medical History
            </TabsTrigger>
            <TabsTrigger value="visits" className="text-sm">
              <Building className="h-4 w-4 mr-2" />
              Hospital Visits
            </TabsTrigger>
            <TabsTrigger value="emergency" className="text-sm">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Emergency Contact
            </TabsTrigger>
            <TabsTrigger value="insurance" className="text-sm">
              <Clipboard className="h-4 w-4 mr-2" />
              Insurance
            </TabsTrigger>
          </TabsList>
          
          {/* Medical History Tab */}
          <TabsContent value="medical">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Medical History</CardTitle>
                <CardDescription>
                  Patient's medical conditions and diagnoses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {patient.medical_history && patient.medical_history.length > 0 ? (
                  <div className="space-y-4">
                    {patient.medical_history.map((record, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{record.condition}</h4>
                          <span className="text-sm text-gray-500">
                            Diagnosed: {formatDate(record.diagnosed_date)}
                          </span>
                        </div>
                        {record.notes && (
                          <p className="text-sm text-gray-700 mt-2">{record.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    No medical history records available
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" className="gap-2">
                  <Edit3 className="h-4 w-4" />
                  Add Medical Record
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Hospital Visits Tab */}
          <TabsContent value="visits">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hospital Visits</CardTitle>
                <CardDescription>
                  History of patient's hospital visits
                </CardDescription>
              </CardHeader>
              <CardContent>
                {patient.hospital_visits && patient.hospital_visits.length > 0 ? (
                  <div className="space-y-4">
                    {patient.hospital_visits.map((visit, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{visit.hospital_name || "Unknown Hospital"}</h4>
                          <span className="text-sm text-gray-500">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {formatDate(visit.visit_date)}
                          </span>
                        </div>
                        {visit.reason && (
                          <p className="text-sm text-gray-700 mt-2">
                            <span className="font-medium">Reason:</span> {visit.reason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    No hospital visit records available
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" className="gap-2">
                  <Edit3 className="h-4 w-4" />
                  Add Visit Record
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Emergency Contact Tab */}
          <TabsContent value="emergency">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Emergency Contact</CardTitle>
                <CardDescription>
                  Contact information for emergencies
                </CardDescription>
              </CardHeader>
              <CardContent>
                {patient.emergency_contact ? (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-medium text-lg text-gray-900 mb-4">
                      {patient.emergency_contact.name}
                      {patient.emergency_contact.relationship && (
                        <span className="ml-2 text-sm text-gray-500">
                          ({patient.emergency_contact.relationship})
                        </span>
                      )}
                    </h4>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {patient.emergency_contact.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{patient.emergency_contact.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    No emergency contact information available
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" className="gap-2">
                  <UserCog className="h-4 w-4" />
                  Edit Emergency Contact
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Insurance Tab */}
          <TabsContent value="insurance">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Insurance Information</CardTitle>
                <CardDescription>
                  Patient's insurance coverage details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {patient.insurance ? (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-medium text-lg text-gray-900 mb-4">
                      {patient.insurance.provider}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Policy Number</p>
                        <p className="text-gray-900">{patient.insurance.policy_number}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Expiry Date</p>
                        <p className="text-gray-900">{formatDate(patient.insurance.expiry_date)}</p>
                      </div>
                    </div>
                    
                    {patient.insurance.coverage_details && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-500 mb-1">Coverage Details</p>
                        <p className="text-gray-700">{patient.insurance.coverage_details}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    No insurance information available
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" className="gap-2">
                  <Edit3 className="h-4 w-4" />
                  Edit Insurance Info
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}