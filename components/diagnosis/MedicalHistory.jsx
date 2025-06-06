import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  FileText, 
  Pill, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  User, 
  Activity,
  RefreshCw,
  Search,
  X,
  Thermometer,
  Heart,
  Weight,
  Stethoscope
} from 'lucide-react';

const MedicalHistory = ({ patientId, className = "" }) => {
  const [records, setRecords] = useState([]);
  const [patientInfo, setPatientInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (patientId?.trim()) {
      fetchMedicalHistory();
    } else {
      setLoading(false);
      setError(null);
    }
  }, [patientId]);

  const fetchMedicalHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/patients/medical-history/${encodeURIComponent(patientId)}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setRecords(data.records || []);
      setPatientInfo(data.patient_info || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(record => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      record.primary_diagnosis?.toLowerCase().includes(search) ||
      record.chief_complaint?.toLowerCase().includes(search) ||
      record.symptoms?.some(symptom => symptom.toLowerCase().includes(search)) ||
      record.doctor_name?.toLowerCase().includes(search)
    );
  });

  const toggleExpanded = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      finalized: 'text-green-700 bg-green-100',
      draft: 'text-yellow-700 bg-yellow-100',
      amended: 'text-blue-700 bg-blue-100'
    };
    return colors[status?.toLowerCase()] || 'text-slate-700 bg-slate-100';
  };

  const renderVitals = (record) => {
    const vitals = [
      { icon: Thermometer, label: 'Temperature', value: record.temperature ? `${record.temperature}°F` : null, color: 'text-red-600' },
      { icon: Activity, label: 'Blood Pressure', value: record.blood_pressure, color: 'text-blue-600' },
      { icon: Heart, label: 'Heart Rate', value: record.heart_rate ? `${record.heart_rate} bpm` : null, color: 'text-red-600' },
      { icon: Weight, label: 'Weight', value: record.weight ? `${record.weight} kg` : null, color: 'text-purple-600' },
      { icon: Activity, label: 'BMI', value: record.bmi, color: 'text-green-600' }
    ].filter(vital => vital.value);

    return vitals.map((vital, index) => {
      const IconComponent = vital.icon;
      return (
        <div key={index} className="flex items-center gap-1">
          <IconComponent className={`h-4 w-4 ${vital.color}`} />
          <span className="text-sm text-gray-600">
            <span className="font-medium">{vital.label}:</span> {vital.value}
          </span>
        </div>
      );
    });
  };

  if (!patientId?.trim()) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-8 ${className}`}>
        <div className="text-center text-gray-500">
          <User className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Patient Selected</h3>
          <p className="text-gray-500">Select a patient to view their medical history</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
        <div className="p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse border border-gray-100 rounded-lg p-4">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-8 ${className}`}>
        <div className="text-center">
          <AlertCircle className="mx-auto h-16 w-16 text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Medical History</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button 
            onClick={fetchMedicalHistory}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              Medical History
            </h3>
            {patientInfo && (
              <div className="mt-2 text-sm text-gray-600">
                <span className="font-medium">{patientInfo.patient_name}</span>
                {patientInfo.patient_age && <span className="ml-2">• Age: {patientInfo.patient_age}</span>}
                {patientInfo.patient_gender && <span className="ml-2">• {patientInfo.patient_gender}</span>}
              </div>
            )}
          </div>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {filteredRecords.length} of {records.length} records
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search diagnoses, symptoms, or doctor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Records */}
      <div className="max-h-[600px] overflow-y-auto">
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Activity className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {records.length === 0 ? 'No Medical History' : 'No Matching Records'}
            </h4>
            <p className="text-gray-500">
              {records.length === 0 
                ? 'This patient has no recorded medical history yet.'
                : 'Try adjusting your search criteria.'
              }
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {filteredRecords.map((record) => (
              <div key={record.id} className="border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {record.primary_diagnosis || 'No primary diagnosis'}
                        </h4>
                        {record.status && (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                            {record.status}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{formatDate(record.created_at)}</span>
                        </div>
                        {record.doctor_name && (
                          <div className="flex items-center gap-2">
                            <Stethoscope className="h-4 w-4 text-gray-400" />
                            <span>Dr. {record.doctor_name}</span>
                            {record.doctor_specialty && (
                              <span className="text-gray-400">({record.doctor_specialty})</span>
                            )}
                          </div>
                        )}
                      </div>

                      {record.chief_complaint && (
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-700">Chief Complaint: </span>
                          <span className="text-sm text-gray-600">{record.chief_complaint}</span>
                        </div>
                      )}

                      {record.symptoms?.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-2">
                            <span className="text-sm font-medium text-gray-700">Symptoms:</span>
                            {record.symptoms.map((symptom, index) => (
                              <span 
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                              >
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Vitals */}
                      {renderVitals(record).length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-4">
                            {renderVitals(record)}
                          </div>
                        </div>
                      )}

                      {/* Expand button for additional details */}
                      {(record.clinical_notes || record.physical_exam || record.medications?.length > 0) && (
                        <button
                          onClick={() => toggleExpanded(record.id)}
                          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          {expandedItems.has(record.id) ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                              Hide Details
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" />
                              Show Details
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedItems.has(record.id) && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                      {record.clinical_notes && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="text-sm font-semibold text-gray-900 mb-2">Clinical Notes</h5>
                          <p className="text-sm text-gray-700">{record.clinical_notes}</p>
                        </div>
                      )}

                      {record.physical_exam && (
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h5 className="text-sm font-semibold text-gray-900 mb-2">Physical Examination</h5>
                          <p className="text-sm text-gray-700">{record.physical_exam}</p>
                        </div>
                      )}

                      {record.medications?.length > 0 && (
                        <div className="bg-green-50 rounded-lg p-4">
                          <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Pill className="h-4 w-4 text-green-600" />
                            Medications ({record.medications.length})
                          </h5>
                          <div className="space-y-3">
                            {record.medications.map((medication, index) => (
                              <div key={index} className="bg-white rounded-lg border border-green-200 p-3">
                                <h6 className="font-semibold text-gray-900 mb-1">
                                  {medication.name || medication.medication_name}
                                </h6>
                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                  {medication.dosage && (
                                    <div><span className="font-medium">Dosage:</span> {medication.dosage}</div>
                                  )}
                                  {medication.frequency && (
                                    <div><span className="font-medium">Frequency:</span> {medication.frequency}</div>
                                  )}
                                </div>
                                {medication.instructions && (
                                  <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-gray-700">
                                    <span className="font-medium">Instructions:</span> {medication.instructions}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {record.recommendations && (
                        <div className="bg-purple-50 rounded-lg p-4">
                          <h5 className="text-sm font-semibold text-gray-900 mb-2">Recommendations</h5>
                          <p className="text-sm text-gray-700">{record.recommendations}</p>
                        </div>
                      )}

                      {record.follow_up_date && (
                        <div className="bg-orange-50 rounded-lg p-4">
                          <h5 className="text-sm font-semibold text-gray-900 mb-2">Follow-up</h5>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Calendar className="h-4 w-4 text-orange-600" />
                            <span className="font-medium">Date:</span> {formatDate(record.follow_up_date)}
                          </div>
                          {record.follow_up_notes && (
                            <p className="mt-2 text-sm text-gray-700">{record.follow_up_notes}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalHistory;