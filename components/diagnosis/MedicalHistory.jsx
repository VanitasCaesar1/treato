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
  Stethoscope,
  TestTube,
  ClipboardList,
  UserCheck,
  MapPin,
  Phone,
  Mail,
  FileCheck,
  TrendingUp,
  Clock,
  Building,
  Badge,
  Scissors,
  Target,
  ArrowRight,
  Info
} from 'lucide-react';

const MedicalHistory = ({ patientId, className = "" }) => {
  const [records, setRecords] = useState([]);
  const [patientInfo, setPatientInfo] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [showSummary, setShowSummary] = useState(true);

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
      setSummary(data.summary || null);
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
      record.doctor_name?.toLowerCase().includes(search) ||
      record.specialty?.toLowerCase().includes(search) ||
      record.status?.toLowerCase().includes(search)
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
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      finalized: 'text-green-700 bg-green-100 border-green-200',
      draft: 'text-yellow-700 bg-yellow-100 border-yellow-200',
      amended: 'text-blue-700 bg-blue-100 border-blue-200',
      pending: 'text-orange-700 bg-orange-100 border-orange-200'
    };
    return colors[status?.toLowerCase()] || 'text-slate-700 bg-slate-100 border-slate-200';
  };

  const renderVitals = (record) => {
    const vitals = [
      { icon: Thermometer, label: 'Temperature', value: record.temperature ? `${record.temperature}°F` : null, color: 'text-red-600' },
      { icon: Activity, label: 'Blood Pressure', value: record.blood_pressure, color: 'text-blue-600' },
      { icon: Heart, label: 'Heart Rate', value: record.heart_rate ? `${record.heart_rate} bpm` : null, color: 'text-red-600' },
      { icon: Weight, label: 'Weight', value: record.weight ? `${record.weight} kg` : null, color: 'text-purple-600' },
      { icon: TrendingUp, label: 'Height', value: record.height ? `${record.height} cm` : null, color: 'text-green-600' },
      { icon: Activity, label: 'BMI', value: record.bmi, color: 'text-indigo-600' }
    ].filter(vital => vital.value);

    return vitals.map((vital, index) => {
      const IconComponent = vital.icon;
      return (
        <div key={index} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
          <IconComponent className={`h-4 w-4 ${vital.color}`} />
          <span className="text-sm text-gray-700">
            <span className="font-medium">{vital.label}:</span> {vital.value}
          </span>
        </div>
      );
    });
  };

  const renderSummary = () => {
    if (!summary || !showSummary) return null;

    return (
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Medical Summary
          </h4>
          <button
            onClick={() => setShowSummary(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {summary.total_visits && (
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Calendar className="h-4 w-4" />
                <span className="font-semibold">Total Visits</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{summary.total_visits}</div>
            </div>
          )}
          
          {summary.common_diagnoses && summary.common_diagnoses.length > 0 && (
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <FileText className="h-4 w-4" />
                <span className="font-semibold">Common Diagnoses</span>
              </div>
              <div className="space-y-1">
                {summary.common_diagnoses.slice(0, 3).map((diagnosis, index) => (
                  <div key={index} className="text-sm text-gray-700">{diagnosis}</div>
                ))}
              </div>
            </div>
          )}
          
          {summary.recent_medications && summary.recent_medications.length > 0 && (
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Pill className="h-4 w-4" />
                <span className="font-semibold">Recent Medications</span>
              </div>
              <div className="space-y-1">
                {summary.recent_medications.slice(0, 3).map((medication, index) => (
                  <div key={index} className="text-sm text-gray-700">{medication}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
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
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  {patientInfo.patient_name && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{patientInfo.patient_name}</span>
                    </div>
                  )}
                  {patientInfo.patient_age && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>Age: {patientInfo.patient_age}</span>
                    </div>
                  )}
                  {patientInfo.patient_gender && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <UserCheck className="h-4 w-4 text-gray-400" />
                      <span>{patientInfo.patient_gender}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Badge className="h-4 w-4 text-gray-400" />
                    <span>Patient ID: {patientInfo.patient_id}</span>
                  </div>
                </div>
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
            placeholder="Search diagnoses, symptoms, doctor, specialty, or status..."
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

      {/* Summary */}
      <div className="p-6 pb-0">
        {renderSummary()}
      </div>

      {/* Records */}
      <div className="max-h-[800px] overflow-y-auto">
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
          <div className="p-6 space-y-6">
            {filteredRecords.map((record) => (
              <div key={record.id} className="border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-gray-50">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {record.primary_diagnosis || 'No primary diagnosis'}
                        </h4>
                        {record.status && (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                            {record.status}
                          </span>
                        )}
                        {record.specialty && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                            {record.specialty}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">Date:</span>
                            <span>{formatDate(record.created_at)}</span>
                          </div>
                          
                          {record.doctor_name && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Stethoscope className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">Doctor:</span>
                              <span>Dr. {record.doctor_name}</span>
                              {record.doctor_specialty && (
                                <span className="text-gray-400">({record.doctor_specialty})</span>
                              )}
                            </div>
                          )}

                          {record.appointment_id && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Building className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">Appointment ID:</span>
                              <span>{record.appointment_id}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          {record.icd_codes && record.icd_codes.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FileCheck className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">ICD Codes:</span>
                              <span>{record.icd_codes.join(', ')}</span>
                            </div>
                          )}

                          {record.updated_at && record.updated_at !== record.created_at && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <RefreshCw className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">Updated:</span>
                              <span>{formatDate(record.updated_at)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {record.chief_complaint && (
                        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                          <span className="text-sm font-semibold text-blue-900">Chief Complaint: </span>
                          <span className="text-sm text-blue-800">{record.chief_complaint}</span>
                        </div>
                      )}

                      {record.symptoms?.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            <span className="text-sm font-semibold text-gray-700 mb-2">Symptoms:</span>
                            {record.symptoms.map((symptom, index) => (
                              <span 
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200"
                              >
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {record.secondary_diagnoses && record.secondary_diagnoses.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            <span className="text-sm font-semibold text-gray-700 mb-2">Secondary Diagnoses:</span>
                            {record.secondary_diagnoses.map((diagnosis, index) => (
                              <span 
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200"
                              >
                                {diagnosis}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Vitals */}
                      {renderVitals(record).length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-blue-600" />
                            Vital Signs
                          </h5>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {renderVitals(record)}
                          </div>
                        </div>
                      )}

                      {/* Expand button for additional details */}
                      {(record.clinical_notes || record.physical_exam || record.medications?.length > 0 || 
                        record.procedures || record.lab_orders || record.test_results?.length > 0 || 
                        record.referrals || record.specialty_data) && (
                        <button
                          onClick={() => toggleExpanded(record.id)}
                          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors border border-blue-200"
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
                    <div className="mt-6 pt-6 border-t border-gray-200 space-y-6">
                      {record.physical_exam && (
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Stethoscope className="h-4 w-4 text-blue-600" />
                            Physical Examination
                          </h5>
                          <p className="text-sm text-gray-700">{record.physical_exam}</p>
                        </div>
                      )}

                      {record.clinical_notes && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <ClipboardList className="h-4 w-4 text-gray-600" />
                            Clinical Notes
                          </h5>
                          <p className="text-sm text-gray-700">{record.clinical_notes}</p>
                        </div>
                      )}

                      {record.medications?.length > 0 && (
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Pill className="h-4 w-4 text-green-600" />
                            Medications ({record.medications.length})
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {record.medications.map((medication, index) => (
                              <div key={index} className="bg-white rounded-lg border border-green-200 p-3">
                                <h6 className="font-semibold text-gray-900 mb-2">
                                  {medication.name || medication.medication_name}
                                </h6>
                                <div className="space-y-1 text-sm text-gray-600">
                                  {medication.dosage && (
                                    <div><span className="font-medium">Dosage:</span> {medication.dosage}</div>
                                  )}
                                  {medication.frequency && (
                                    <div><span className="font-medium">Frequency:</span> {medication.frequency}</div>
                                  )}
                                  {medication.duration && (
                                    <div><span className="font-medium">Duration:</span> {medication.duration}</div>
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

                      {record.procedures && (
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                          <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Scissors className="h-4 w-4 text-purple-600" />
                            Procedures
                          </h5>
                          <p className="text-sm text-gray-700">{record.procedures}</p>
                        </div>
                      )}

                      {record.recommendations && (
                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                          <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Target className="h-4 w-4 text-yellow-600" />
                            Recommendations
                          </h5>
                          <p className="text-sm text-gray-700">{record.recommendations}</p>
                        </div>
                      )}

                      {record.lab_orders && (
                        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                          <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <TestTube className="h-4 w-4 text-indigo-600" />
                            Lab Orders
                          </h5>
                          <p className="text-sm text-gray-700">{record.lab_orders}</p>
                        </div>
                      )}

                      {record.test_results?.length > 0 && (
                        <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                          <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <TestTube className="h-4 w-4 text-teal-600" />
                            Test Results ({record.test_results.length})
                          </h5>
                          <div className="space-y-3">
                            {record.test_results.map((result, index) => (
                              <div key={index} className="bg-white rounded-lg border border-teal-200 p-3">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                  {result.test_name && (
                                    <div><span className="font-medium">Test:</span> {result.test_name}</div>
                                  )}
                                  {result.value && (
                                    <div><span className="font-medium">Value:</span> {result.value}</div>
                                  )}
                                  {result.reference_range && (
                                    <div><span className="font-medium">Reference:</span> {result.reference_range}</div>
                                  )}
                                </div>
                                {result.notes && (
                                  <div className="mt-2 text-sm text-gray-600">{result.notes}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {record.referrals && (
                        <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
                          <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <ArrowRight className="h-4 w-4 text-pink-600" />
                            Referrals
                          </h5>
                          <p className="text-sm text-gray-700">{record.referrals}</p>
                        </div>
                      )}

                      {record.specialty_data && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Badge className="h-4 w-4 text-gray-600" />
                            Specialty Data
                          </h5>
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap">{JSON.stringify(record.specialty_data, null, 2)}</pre>
                        </div>
                      )}

                      {record.follow_up_date && (
                        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                          <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-orange-600" />
                            Follow-up Date
                          </h5>
                          <p className="text-sm text-gray-700">{formatDate(record.follow_up_date)}</p>
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