import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Loader2, Search, Check, AlertCircle, Clock } from "lucide-react";

// Mock medicine data as fallback
const MOCK_MEDICINES = [
  { id: 1, code: "AMX500", name: "Amoxicillin 500mg", unit: "Capsule", company: "Generic Pharma" },
  { id: 2, code: "PCM650", name: "Paracetamol 650mg", unit: "Tablet", company: "Generic Pharma" },
  { id: 3, code: "IBU400", name: "Ibuprofen 400mg", unit: "Tablet", company: "Generic Pharma" },
  { id: 4, code: "MET500", name: "Metformin 500mg", unit: "Tablet", company: "Generic Pharma" },
  { id: 5, code: "ATO20", name: "Atorvastatin 20mg", unit: "Tablet", company: "Generic Pharma" },
  { id: 6, code: "LIS10", name: "Lisinopril 10mg", unit: "Tablet", company: "Generic Pharma" },
  { id: 7, code: "LOS50", name: "Losartan 50mg", unit: "Tablet", company: "Generic Pharma" },
  { id: 8, code: "AZI250", name: "Azithromycin 250mg", unit: "Tablet", company: "Generic Pharma" },
  { id: 9, code: "OME20", name: "Omeprazole 20mg", unit: "Capsule", company: "Generic Pharma" },
  { id: 10, code: "ALB100", name: "Albuterol 100mcg", unit: "Inhaler", company: "Generic Pharma" }
];

function PrescriptionSection({ treatmentPlan, updateTreatmentPlan }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [prescriptions, setPrescriptions] = useState(treatmentPlan?.medications || []);
  const [dosagePattern, setDosagePattern] = useState("0-1-0-0");
  const [frequency, setFrequency] = useState("daily");
  const [duration, setDuration] = useState("7 days");
  const [instructions, setInstructions] = useState("with-food");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [formStep, setFormStep] = useState("search");
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const [apiStatus, setApiStatus] = useState("unknown"); // unknown, working, failed
  
  const searchInputRef = useRef(null);
  const searchResultsRef = useRef(null);
  const debounceTimer = useRef(null);

  // Handle clicks outside of dropdown to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchResultsRef.current && 
        !searchResultsRef.current.contains(event.target) &&
        !searchInputRef.current?.contains(event.target)
      ) {
        setDropdownVisible(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Improved search function with better error handling
  const performSearch = useCallback(async (term) => {
    if (!term || term.trim().length < 1) {
      setSearchResults([]);
      setDropdownVisible(false);
      return;
    }
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      console.log('Searching for:', term);
      
      // Build the API URL
      const apiUrl = `/api/medicines/search?term=${encodeURIComponent(term.trim())}&limit=20`;
      console.log('API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      // Handle different response formats
      let medicines = [];
      if (data.medicines && Array.isArray(data.medicines)) {
        medicines = data.medicines;
      } else if (Array.isArray(data)) {
        medicines = data;
      } else if (data.data && Array.isArray(data.data)) {
        medicines = data.data;
      }
      
      setSearchResults(medicines);
      setDropdownVisible(true);
      setApiStatus("working");
      
      if (medicines.length === 0) {
        setSearchError("No medicines found for this search term");
      }
      
    } catch (error) {
      console.error("API search failed:", error);
      setApiStatus("failed");
      
      // Fallback to mock data
      const filteredResults = MOCK_MEDICINES.filter(med => 
        med.name.toLowerCase().includes(term.toLowerCase()) ||
        med.code.toLowerCase().includes(term.toLowerCase()) ||
        med.company.toLowerCase().includes(term.toLowerCase())
      );
      
      setSearchResults(filteredResults);
      setDropdownVisible(true);
      
      if (filteredResults.length > 0) {
        setSearchError(`API unavailable - showing ${filteredResults.length} demo results`);
      } else {
        setSearchError("API unavailable and no demo results match your search");
      }
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search with improved logic
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    if (searchTerm.trim().length >= 1) {
      debounceTimer.current = setTimeout(() => {
        performSearch(searchTerm);
      }, 300);
    } else {
      setSearchResults([]);
      setDropdownVisible(false);
      setSearchError(null);
    }
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchTerm, performSearch]);

  // Reset selected index when search results change
  useEffect(() => {
    setSelectedResultIndex(-1);
  }, [searchResults]);

  // Select a medicine from search results
  const selectMedicine = (medicine) => {
    setSelectedMedicine(medicine);
    setSearchTerm(medicine.name);
    setDropdownVisible(false);
    setFormStep("details");
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!dropdownVisible || searchResults.length === 0) {
      if (e.key === "Enter" && formStep === "details") {
        e.preventDefault();
        handleAddPrescription();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedResultIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedResultIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedResultIndex >= 0) {
          selectMedicine(searchResults[selectedResultIndex]);
        } else if (searchResults.length > 0) {
          selectMedicine(searchResults[0]);
        }
        break;
      case "Escape":
        setDropdownVisible(false);
        setSelectedResultIndex(-1);
        break;
      default:
        break;
    }
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (searchTerm.trim().length >= 1 && searchResults.length > 0) {
      setDropdownVisible(true);
    }
  };

  // Add prescription to the list
  const handleAddPrescription = () => {
    if (!searchTerm.trim()) return;
    
    const newPrescription = {
      id: Date.now(), // Add unique ID
      name: selectedMedicine ? selectedMedicine.name : searchTerm.trim(),
      code: selectedMedicine?.code || '',
      unit: selectedMedicine?.unit || '',
      company: selectedMedicine?.company || '',
      dosage: dosagePattern,
      frequency: frequency,
      duration: duration || '7 days',
      instructions: instructions.replace(/-/g, ' ')
    };
    
    const updatedPrescriptions = [...prescriptions, newPrescription];
    setPrescriptions(updatedPrescriptions);
    
    // Update the parent form
    updateTreatmentPlan("medications", updatedPrescriptions);
    
    // Reset form
    setSelectedMedicine(null);
    setSearchTerm("");
    setDuration("7 days");
    setDosagePattern("0-1-0-0");
    setFrequency("daily");
    setInstructions("with-food");
    setFormStep("search");
    setSearchError(null);
  };

  // Remove a prescription
  const removePrescription = (index) => {
    const updatedPrescriptions = prescriptions.filter((_, i) => i !== index);
    setPrescriptions(updatedPrescriptions);
    updateTreatmentPlan("medications", updatedPrescriptions);
  };

  // Helper function to update follow-up notes
  const updateFollowUpNotes = (notes) => {
    const currentFollowUp = treatmentPlan?.follow_up || {};
    const updatedFollowUp = {
      ...currentFollowUp,
      notes: notes
    };
    updateTreatmentPlan("follow_up", updatedFollowUp);
  };

  // Manual search trigger
  const handleManualSearch = () => {
    if (searchTerm.trim()) {
      performSearch(searchTerm);
    }
  };

  const dosageOptions = [
    { value: "0-1-0-0", label: "0-1-0-0 (Once daily at noon)" },
    { value: "1-0-0-0", label: "1-0-0-0 (Once daily morning)" },
    { value: "0-0-1-0", label: "0-0-1-0 (Once daily evening)" },
    { value: "0-0-0-1", label: "0-0-0-1 (Once daily at night)" },
    { value: "1-0-1-0", label: "1-0-1-0 (Twice daily)" },
    { value: "1-1-1-0", label: "1-1-1-0 (Three times daily)" },
    { value: "1-1-1-1", label: "1-1-1-1 (Four times daily)" }
  ];

  const frequencyOptions = [
    { value: "daily", label: "Daily" },
    { value: "twice-daily", label: "Twice Daily" },
    { value: "every-other-day", label: "Every Other Day" },
    { value: "weekly", label: "Weekly" },
    { value: "as-needed", label: "As Needed (PRN)" }
  ];

  const instructionOptions = [
    { value: "with-water", label: "With Water" },
    { value: "with-food", label: "With Food" },
    { value: "after-food", label: "After Food" },
    { value: "before-food", label: "Before Food" },
    { value: "with-hot-water", label: "With Hot Water" },
    { value: "with-milk", label: "With Milk" },
    { value: "empty-stomach", label: "On Empty Stomach" }
  ];

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          API Status: {apiStatus} | Search Term: "{searchTerm}" | Results: {searchResults.length}
        </div>
      )}

      {/* Prescription Panel Header */}
      <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
        <h2 className="text-lg font-medium text-emerald-800 flex items-center">
          Prescription Details
        </h2>
      </div>
      
      {/* Medication Panel */}
      <div className="rounded-xl border border-emerald-200 overflow-hidden">
        <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-200">
          <h3 className="font-medium text-emerald-800">Medications</h3>
        </div>
        <div className="p-4">
          {/* Medicine Search & Form */}
          <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            {formStep === "search" ? (
              <>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="relative flex-grow">
                    <Input 
                      ref={searchInputRef}
                      placeholder="Search for medicine (e.g., paracetamol, amoxicillin)..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={handleInputFocus}
                      onKeyDown={handleKeyDown}
                      className="pl-9 rounded-lg"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Search className="h-4 w-4" />
                    </div>
                    {isSearching && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                      </div>
                    )}
                  </div>
                  <Button 
                    type="button" 
                    onClick={handleManualSearch}
                    disabled={isSearching || searchTerm.trim().length < 1}
                    className="bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                  >
                    Search
                  </Button>
                </div>
                
                {searchError && (
                  <div className={`border rounded-lg p-3 text-sm mb-3 flex items-center ${
                    apiStatus === "failed" 
                      ? "bg-amber-50 border-amber-200 text-amber-700" 
                      : "bg-blue-50 border-blue-200 text-blue-700"
                  }`}>
                    <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{searchError}</span>
                  </div>
                )}
                
                {/* Live Search Results */}
                {dropdownVisible && searchResults.length > 0 && (
                  <div 
                    ref={searchResultsRef}
                    className="bg-white shadow-lg rounded-lg border border-gray-200 max-h-60 overflow-y-auto z-10"
                  >
                    <div className="sticky top-0 bg-gray-50 px-3 py-2 text-xs text-gray-600 border-b">
                      Found {searchResults.length} results
                    </div>
                    <ul className="py-1">
                      {searchResults.map((medicine, index) => (
                        <li 
                          key={medicine.id || index} 
                          className={`px-3 py-3 hover:bg-emerald-50 cursor-pointer transition-colors flex justify-between items-center border-b border-gray-100 last:border-b-0 ${
                            selectedResultIndex === index ? "bg-emerald-50" : ""
                          }`}
                          onClick={() => selectMedicine(medicine)}
                          onMouseEnter={() => setSelectedResultIndex(index)}
                        >
                          <div className="flex-grow">
                            <div className="font-medium text-gray-900">{medicine.name}</div>
                            <div className="text-xs text-gray-500 mt-1 space-x-2">
                              {medicine.code && <span className="bg-gray-100 px-2 py-0.5 rounded">{medicine.code}</span>}
                              {medicine.unit && <span className="bg-gray-100 px-2 py-0.5 rounded">{medicine.unit}</span>}
                              {medicine.company && <span className="text-gray-400">{medicine.company}</span>}
                            </div>
                          </div>
                          <Button 
                            type="button" 
                            size="sm" 
                            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-full h-6 px-3 ml-2"
                          >
                            Select
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {dropdownVisible && searchTerm.trim().length >= 1 && searchResults.length === 0 && !isSearching && (
                  <div className="bg-white shadow-md rounded-lg border border-gray-200 p-4">
                    <div className="text-sm text-gray-600 mb-3">
                      No medicines found matching "{searchTerm}". You can add it as a custom medicine.
                    </div>
                    <Button 
                      type="button" 
                      className="bg-emerald-600 hover:bg-emerald-700 w-full rounded-lg"
                      onClick={() => setFormStep("details")}
                    >
                      Add Custom Medicine
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="mb-4 bg-emerald-50 p-3 rounded-lg border border-emerald-100 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-emerald-800">{searchTerm}</div>
                    <div className="text-xs text-emerald-600">Configure prescription details</div>
                    {selectedMedicine && (
                      <div className="text-xs text-gray-500 mt-1">
                        {selectedMedicine.code && `Code: ${selectedMedicine.code}`}
                        {selectedMedicine.unit && ` • ${selectedMedicine.unit}`}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFormStep("search");
                      setSelectedMedicine(null);
                    }}
                    className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100"
                  >
                    Change
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dosage Pattern</label>
                    <Select value={dosagePattern} onValueChange={setDosagePattern}>
                      <SelectTrigger className="border-gray-200 focus:border-emerald-400 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dosageOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                    <Select value={frequency} onValueChange={setFrequency}>
                      <SelectTrigger className="border-gray-200 focus:border-emerald-400 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {frequencyOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                    <Input 
                      placeholder="e.g., 7 days, 2 weeks" 
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddPrescription()}
                      className="border-gray-200 focus:border-emerald-400 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                    <Select value={instructions} onValueChange={setInstructions}>
                      <SelectTrigger className="border-gray-200 focus:border-emerald-400 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {instructionOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setFormStep("search");
                      setSelectedMedicine(null);
                    }}
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleAddPrescription}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                  >
                    <Check className="h-4 w-4 mr-2" /> Add to Prescription
                  </Button>
                </div>
              </>
            )}
          </div>
          
          {/* Display Added Prescriptions */}
          {prescriptions.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Prescription List ({prescriptions.length})</h3>
              <div className="space-y-3">
                {prescriptions.map((med, index) => (
                  <div 
                    key={med.id || index} 
                    className="p-4 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <div className="font-medium text-emerald-800 mb-2">{med.name}</div>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-block bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-xs">
                            {med.dosage}
                          </span>
                          <span className="inline-block bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-xs">
                            {med.frequency}
                          </span>
                          <span className="inline-block bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-xs">
                            {med.duration}
                          </span>
                          <span className="inline-block bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-xs">
                            {med.instructions}
                          </span>
                        </div>
                        {(med.code || med.unit || med.company) && (
                          <div className="text-xs text-gray-500 mt-2">
                            {med.code && `Code: ${med.code}`}
                            {med.unit && ` • ${med.unit}`}
                            {med.company && ` • ${med.company}`}
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePrescription(index)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 ml-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Follow-up Instructions */}
      <div className="rounded-xl border border-emerald-200 overflow-hidden">
        <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-200">
          <h3 className="font-medium text-emerald-800">Follow-up Instructions</h3>
        </div>
        <div className="p-4">
          <Textarea 
            placeholder="Enter follow-up instructions for the patient..."
            className="min-h-24 resize-y rounded-lg border-gray-200 focus:border-emerald-300 focus:ring focus:ring-emerald-100 transition-colors"
            value={treatmentPlan?.follow_up?.notes || ""}
            onChange={(e) => updateFollowUpNotes(e.target.value)}
          />
        </div>
      </div>
      
      {/* Additional Notes */}
      <div className="rounded-xl border border-emerald-200 overflow-hidden">
        <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-200">
          <h3 className="font-medium text-emerald-800">Additional Notes</h3>
        </div>
        <div className="p-4">
          <Textarea 
            placeholder="Enter any additional notes about this prescription..."
            className="min-h-24 resize-y rounded-lg border-gray-200 focus:border-emerald-300 focus:ring focus:ring-emerald-100 transition-colors"
            value={treatmentPlan?.notes || ""}
            onChange={(e) => updateTreatmentPlan("notes", e.target.value)}
          />
        </div>
      </div>
      
      {/* Prescription Action Buttons */}
      <div className="flex justify-end space-x-3">
        <Button 
          type="button" 
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
        >
          Cancel
        </Button>
        <Button 
          type="button" 
          className="bg-emerald-600 hover:bg-emerald-700 rounded-lg"
        >
          Save Prescription
        </Button>
      </div>
    </div>
  );
}

export default PrescriptionSection;