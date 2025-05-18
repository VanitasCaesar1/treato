import { useState, useEffect, useRef } from "react";
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
import { Plus, X, Loader2, Search, Check, AlertCircle } from "lucide-react";

// Mock medicine data for demo purposes - replace this with your actual data source
const MOCK_MEDICINES = [
  { id: 1, name: "Amoxicillin", company: "Generic" },
  { id: 2, name: "Paracetamol", company: "Generic" },
  { id: 3, name: "Ibuprofen", company: "Generic" },
  { id: 4, name: "Metformin", company: "Generic" },
  { id: 5, name: "Atorvastatin", company: "Generic" },
  { id: 6, name: "Lisinopril", company: "Generic" },
  { id: 7, name: "Losartan", company: "Generic" },
  { id: 8, name: "Azithromycin", company: "Generic" },
  { id: 9, name: "Omeprazole", company: "Generic" },
  { id: 10, name: "Albuterol", company: "Generic" }
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
  const [formStep, setFormStep] = useState("search"); // search, details
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  
  const searchInputRef = useRef(null);
  const searchResultsRef = useRef(null);

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

  // Live search function with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim().length >= 1) { // Changed from 2 to 1 character minimum
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset selected index when search results change
  useEffect(() => {
    setSelectedResultIndex(-1);
  }, [searchResults]);

  // Search for medicines
  const performSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      // Try fetching from API first
      const response = await fetch(`/api/medicines/search?term=${encodeURIComponent(searchTerm)}`);
      
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      const data = await response.json();
      setSearchResults(data.medicines || []);
      setDropdownVisible(true);
      
    } catch (error) {
      console.error("Error searching medicines:", error);
      
      // Fallback to mock data
      const filteredResults = MOCK_MEDICINES.filter(med => 
        med.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setSearchResults(filteredResults);
      setDropdownVisible(true);
      
      if (filteredResults.length > 0) {
        setSearchError("Using demo data - API connection failed");
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Select a medicine from search results
  const selectMedicine = (medicine) => {
    setSelectedMedicine(medicine);
    setSearchTerm(medicine.name);
    setDropdownVisible(false);
    setFormStep("details");
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    // Only process keyboard navigation when dropdown is visible
    if (!dropdownVisible || searchResults.length === 0) return;

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
        } else if (formStep === "details") {
          handleAddPrescription();
        } else if (searchResults.length > 0) {
          // Select first result if none is selected
          selectMedicine(searchResults[0]);
        } else if (searchTerm.trim()) {
          // Move to details if we have a search term but no results
          setFormStep("details");
        }
        break;
      case "Escape":
        setDropdownVisible(false);
        break;
      default:
        break;
    }
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (searchTerm.trim().length >= 1) {
      setDropdownVisible(true);
    }
  };

  // Add prescription to the list
  const handleAddPrescription = () => {
    if (!searchTerm.trim()) return;
    
    const newPrescription = {
      name: selectedMedicine ? selectedMedicine.name : searchTerm.trim(),
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
    setFormStep("search");
  };

  // Remove a prescription
  const removePrescription = (index) => {
    const updatedPrescriptions = [...prescriptions];
    updatedPrescriptions.splice(index, 1);
    setPrescriptions(updatedPrescriptions);
    updateTreatmentPlan("medications", updatedPrescriptions);
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
                      placeholder="Search for medicine..." 
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
                    onClick={performSearch}
                    disabled={isSearching || searchTerm.trim().length < 2}
                    className="bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                  >
                    Search
                  </Button>
                </div>
                
                {searchError && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-lg p-2 text-xs mb-3 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {searchError}
                  </div>
                )}
                
                {/* Live Search Results */}
                {dropdownVisible && searchResults.length > 0 && (
                  <div 
                    ref={searchResultsRef}
                    className="bg-white shadow-md rounded-lg border border-gray-200 max-h-60 overflow-y-auto"
                  >
                    <ul className="py-1 divide-y divide-gray-100">
                      {searchResults.map((medicine, index) => (
                        <li 
                          key={index} 
                          className={`px-3 py-2 hover:bg-emerald-50 cursor-pointer transition-colors flex justify-between items-center ${
                            selectedResultIndex === index ? "bg-emerald-50" : ""
                          }`}
                          onClick={() => selectMedicine(medicine)}
                          onMouseEnter={() => setSelectedResultIndex(index)}
                        >
                          <div>
                            <div className="font-medium">{medicine.name}</div>
                            {medicine.company && (
                              <div className="text-xs text-gray-500">{medicine.company}</div>
                            )}
                          </div>
                          <Button 
                            type="button" 
                            size="sm" 
                            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-full h-6 px-2"
                          >
                            Select
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {dropdownVisible && searchTerm.trim().length >= 1 && searchResults.length === 0 && !isSearching && (
                  <div className="bg-white shadow-md rounded-lg border border-gray-200 p-3 text-sm text-gray-600">
                    No medicines found. You can still add it manually by clicking "Add Custom".
                    <Button 
                      type="button" 
                      className="bg-emerald-600 hover:bg-emerald-700 mt-2 w-full rounded-lg"
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
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormStep("search")}
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
                    onClick={() => setFormStep("search")}
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleAddPrescription}
                    onKeyDown={(e) => e.key === "Enter" && handleAddPrescription()}
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
              <h3 className="text-sm font-medium text-gray-700 mb-2">Prescription List</h3>
              <div className="space-y-2">
                {prescriptions.map((med, index) => (
                  <div 
                    key={index} 
                    className="p-3 bg-white rounded-lg border border-gray-200 flex justify-between items-center group hover:border-emerald-300 hover:shadow-sm transition-all"
                  >
                    <div>
                      <div className="font-medium text-emerald-800">{med.name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="inline-block bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-xs mr-2">
                          {med.dosage}
                        </span>
                        <span className="inline-block bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-xs mr-2">
                          {med.frequency}
                        </span>
                        <span className="inline-block bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-xs mr-2">
                          {med.duration}
                        </span>
                        <span className="inline-block bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-xs">
                          {med.instructions}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePrescription(index)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
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
            value={treatmentPlan?.follow_up || ""}
            onChange={(e) => updateTreatmentPlan("follow_up", e.target.value)}
          />
        </div>
      </div>
      
      {/* Notes Section - properly positioned after prescriptions */}
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