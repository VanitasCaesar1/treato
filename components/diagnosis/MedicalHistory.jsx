import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  FileText, 
  Pill, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  AlertCircle, 
  User, 
  Activity,
  RefreshCw,
  Filter,
  Search,
  X
} from 'lucide-react';

const MedicalHistory = ({ patientId, className = "" }) => {
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (patientId) {
      fetchMedicalHistory();
    }
  }, [patientId]);

  useEffect(() => {
    filterHistoryData();
  }, [medicalHistory, searchTerm, filterStatus]);

  const fetchMedicalHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      // Updated endpoint to match the new route structure
      const response = await fetch(`/api/patients/medical-history/${patientId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch medical history');
      }
      
      const data = await response.json();
      setMedicalHistory(data.history || []);
    } catch (err) {
      console.error('Error fetching medical history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterHistoryData = () => {
    let filtered = medicalHistory;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.diagnosis_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.primary_diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.symptoms?.some(symptom => symptom.toLowerCase().includes(searchTerm.toLowerCase())) ||
        record.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(record => record.status === filterStatus);
    }

    setFilteredHistory(filtered);
  };

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

  const formatDateDetailed = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
      case 'severe':
        return 'text-red-700 bg-red-100 border-red-200';
      case 'medium':
      case 'moderate':
        return 'text-amber-700 bg-amber-100 border-amber-200';
      case 'low':
      case 'mild':
        return 'text-emerald-700 bg-emerald-100 border-emerald-200';
      default:
        return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'text-blue-700 bg-blue-100';
      case 'resolved':
        return 'text-green-700 bg-green-100';
      case 'chronic':
        return 'text-purple-700 bg-purple-100';
      case 'draft':
        return 'text-gray-700 bg-gray-100';
      default:
        return 'text-slate-700 bg-slate-100';
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
  };

  if (!patientId) {
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
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>
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
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            Medical History
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {filteredHistory.length} of {medicalHistory.length} records
            </span>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        {showFilters && (
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search diagnoses, symptoms, or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
                <option value="chronic">Chronic</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            {(searchTerm || filterStatus !== 'all') && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
              >
                <X className="h-4 w-4" />
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-h-[600px] overflow-y-auto">
        {filteredHistory.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {medicalHistory.length === 0 ? (
              <>
                <Activity className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Medical History</h4>
                <p className="text-gray-500">This patient has no recorded medical history yet.</p>
              </>
            ) : (
              <>
                <Search className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Matching Records</h4>
                <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
              </>
            )}
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {filteredHistory.map((record) => (
              <div key={record.id} className="border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {record.diagnosis_name || record.primary_diagnosis}
                        </h4>
                        <div className="flex items-center gap-2">
                          {record.severity && (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(record.severity)}`}>
                              {record.severity}
                            </span>
                          )}
                          {record.status && (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                              {record.status}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{formatDate(record.diagnosis_date || record.created_at)}</span>
                        </div>
                        {record.created_at && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>Recorded {formatDate(record.created_at)}</span>
                          </div>
                        )}
                      </div>

                      {record.symptoms && record.symptoms.length > 0 && (
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

                      {(record.notes || record.prescriptions?.length > 0) && (
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

                  {expandedItems.has(record.id) && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid gap-4">
                        {record.notes && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h5 className="text-sm font-semibold text-gray-900 mb-2">Clinical Notes</h5>
                            <p className="text-sm text-gray-700 leading-relaxed">{record.notes}</p>
                          </div>
                        )}

                        {record.prescriptions && record.prescriptions.length > 0 && (
                          <div className="bg-green-50 rounded-lg p-4">
                            <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <Pill className="h-4 w-4 text-green-600" />
                              Prescriptions ({record.prescriptions.length})
                            </h5>
                            <div className="grid gap-3">
                              {record.prescriptions.map((prescription, index) => (
                                <div key={index} className="bg-white rounded-lg border border-green-200 p-3">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <h6 className="font-semibold text-gray-900 mb-1">
                                        {prescription.medication_name}
                                      </h6>
                                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                        <div>
                                          <span className="font-medium">Dosage:</span> {prescription.dosage}
                                        </div>
                                        <div>
                                          <span className="font-medium">Frequency:</span> {prescription.frequency}
                                        </div>
                                        {prescription.duration && (
                                          <div>
                                            <span className="font-medium">Duration:</span> {prescription.duration}
                                          </div>
                                        )}
                                      </div>
                                      {prescription.instructions && (
                                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-gray-700">
                                          <span className="font-medium">Instructions:</span> {prescription.instructions}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
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