'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, X, RefreshCw, User, UserCheck, ChevronDown, AlertCircle } from 'lucide-react';

interface Patient {
  id: number;
  name: string;
  userId: number;
}

interface Doctor {
  id: number;
  name: string;
  speciality?: string;
}

interface Mapping {
  id: number;
  patientId: number;
  doctorId: number;
  createdAt: string;
  patient: Patient;
  doctor: Doctor;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Mappings() {
  const router = useRouter();
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [filteredMappings, setFilteredMappings] = useState<Mapping[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [patientFilter, setPatientFilter] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Fix hydration issues by ensuring client-side only rendering for components that might differ
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get token from localStorage (only on client)
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || '';
    }
    return '';
  };

  // Fetch helper with auth header
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = getToken();
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };
    return fetch(url, { ...options, headers });
  };

  const fetchMappings = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/mappings`);
      if (res.ok) {
        const data = await res.json();
        setMappings(data);
        setFilteredMappings(data);
        setIsLoading(false);
      } else {
        throw new Error('Failed to fetch mappings');
      }
    } catch (err) {
      setError('Failed to fetch mappings. Please try again.');
      setIsLoading(false);
      showNotification('Failed to fetch mappings', 'error');
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/api/patients`);
      if (res.ok) {
        const data = await res.json();
        setPatients(data);
      }
    } catch (err) {
      setError('Failed to fetch patients');
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/api/doctors`);
      if (res.ok) {
        const data = await res.json();
        setDoctors(data);
      }
    } catch (err) {
      setError('Failed to fetch doctors');
    }
  };

  const fetchPatientDoctors = async (patientId: number) => {
    try {
      const res = await fetchWithAuth(`${API_URL}/api/mappings/${patientId}`);
      if (res.ok) {
        const data = await res.json();
        setFilteredMappings(data);
        setPatientFilter(patientId);
      }
    } catch (err) {
      setError('Failed to fetch patient doctors');
      showNotification('Failed to fetch patient doctors', 'error');
    }
  };

  const showNotification = (message: string, type: string) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  useEffect(() => {
    if (isMounted) {
      if (!getToken()) {
        router.push('/login');
      } else {
        fetchMappings();
        fetchPatients();
        fetchDoctors();
      }
    }
  }, [isMounted, router]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = mappings.filter(mapping => 
        mapping.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mapping.doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMappings(filtered);
    } else if (patientFilter) {
      // Keep the patient filter active
    } else {
      setFilteredMappings(mappings);
    }
  }, [searchTerm, mappings, patientFilter]);

  const addMapping = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !selectedDoctor) {
      setError('Please select both patient and doctor');
      return;
    }
    
    setIsAdding(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/mappings`, {
        method: 'POST',
        body: JSON.stringify({
          patientId: selectedPatient.id,
          doctorId: selectedDoctor.id,
        }),
      });
      
      if (res.ok) {
        setSelectedPatient(null);
        setSelectedDoctor(null);
        showNotification('Mapping added successfully', 'success');
        fetchMappings();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add mapping');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add mapping');
      showNotification(err.message || 'Failed to add mapping', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const deleteMapping = async (id: number) => {
    setIsDeleting(id);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/mappings/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        showNotification('Mapping deleted successfully', 'success');
        fetchMappings();
      } else {
        throw new Error('Failed to delete mapping');
      }
    } catch (err) {
      setError('Failed to delete mapping');
      showNotification('Failed to delete mapping', 'error');
    } finally {
      setIsDeleting(null);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setPatientFilter(null);
    setFilteredMappings(mappings);
  };

  // Handle dropdown close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (showPatientDropdown && !target.closest('[data-dropdown="patient"]')) {
        setShowPatientDropdown(false);
      }
      if (showDoctorDropdown && !target.closest('[data-dropdown="doctor"]')) {
        setShowDoctorDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPatientDropdown, showDoctorDropdown]);

  // If not mounted yet (server-side), return a minimal loading state
  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50 ${
          notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
        }`}>
          {notification.type === 'success' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <p>{notification.message}</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Patient-Doctor Assignments
          </h1>
          
          <div className="flex space-x-2">
            <button 
              onClick={resetFilters}
              className="flex items-center px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-200"
            >
              <RefreshCw size={16} className="mr-1" />
              Reset
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle size={18} className="mr-2" />
            {error}
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl mb-6 shadow-lg border border-gray-700/50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by patient or doctor name"
                className="pl-10 p-3 w-full rounded-lg bg-gray-700/50 border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-white placeholder-gray-400"
              />
            </div>

            <div className="relative" data-dropdown="patient">
              <button
                onClick={() => setShowPatientDropdown(!showPatientDropdown)}
                className="flex items-center justify-between px-4 py-3 w-full md:w-64 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-indigo-500 focus:outline-none text-white"
              >
                <div className="flex items-center">
                  <User size={16} className="mr-2 text-gray-400" />
                  <span className={patientFilter ? "text-white" : "text-gray-400"}>
                    {patientFilter ? patients.find(p => p.id === patientFilter)?.name || 'Filter by Patient' : 'Filter by Patient'}
                  </span>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {showPatientDropdown && (
                <div className="absolute z-[9999] mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                  <div className="p-2">
                    <div 
                      className="p-2 hover:bg-gray-700 rounded cursor-pointer"
                      onClick={() => {
                        resetFilters();
                        setShowPatientDropdown(false);
                      }}
                    >
                      All Patients
                    </div>
                    {patients.map((patient) => (
                      <div 
                        key={patient.id}
                        className="p-2 hover:bg-gray-700 rounded cursor-pointer"
                        onClick={() => {
                          fetchPatientDoctors(patient.id);
                          setShowPatientDropdown(false);
                        }}
                      >
                        {patient.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 font-medium shadow-lg"
            >
              {isAdding ? (
                <>
                  <X size={16} className="mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus size={16} className="mr-2" />
                  New Assignment
                </>
              )}
            </button>
          </div>

          {/* Add New Mapping Form */}
          {isAdding && (
            <form onSubmit={addMapping} className="mt-4 pt-4 border-t border-gray-700/50">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1" data-dropdown="patient">
                  <button
                    type="button"
                    onClick={() => setShowPatientDropdown(!showPatientDropdown)}
                    className="flex items-center justify-between px-4 py-3 w-full rounded-lg bg-gray-700/50 border border-gray-600 focus:border-indigo-500 focus:outline-none text-white"
                  >
                    <div className="flex items-center">
                      <User size={16} className="mr-2 text-gray-400" />
                      <span className={selectedPatient ? "text-white" : "text-gray-400"}>
                        {selectedPatient ? selectedPatient.name : 'Select Patient'}
                      </span>
                    </div>
                    <ChevronDown size={16} className="text-gray-400" />
                  </button>

                  {showPatientDropdown && (
                    <div className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                      <div className="p-2">
                        {patients.map((patient) => (
                          <div 
                            key={patient.id}
                            className="p-2 hover:bg-gray-700 rounded cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPatient(patient);
                              setShowPatientDropdown(false);
                            }}
                          >
                            {patient.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative flex-1" data-dropdown="doctor">
                  <button
                    type="button"
                    onClick={() => setShowDoctorDropdown(!showDoctorDropdown)}
                    className="flex items-center justify-between px-4 py-3 w-full rounded-lg bg-gray-700/50 border border-gray-600 focus:border-indigo-500 focus:outline-none text-white"
                  >
                    <div className="flex items-center">
                      <UserCheck size={16} className="mr-2 text-gray-400" />
                      <span className={selectedDoctor ? "text-white" : "text-gray-400"}>
                        {selectedDoctor ? selectedDoctor.name : 'Select Doctor'}
                      </span>
                    </div>
                    <ChevronDown size={16} className="text-gray-400" />
                  </button>

                  {showDoctorDropdown && (
                    <div className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                      <div className="p-2">
                        {doctors.map((doctor) => (
                          <div 
                            key={doctor.id}
                            className="p-2 hover:bg-gray-700 rounded cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDoctor(doctor);
                              setShowDoctorDropdown(false);
                            }}
                          >
                            {doctor.name} {doctor.speciality ? `(${doctor.speciality})` : ''}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!selectedPatient || !selectedDoctor}
                  className={`px-6 py-3 rounded-lg font-medium shadow-lg flex items-center justify-center ${
                    !selectedPatient || !selectedDoctor
                      ? 'bg-gray-600 opacity-60 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all duration-200'
                  }`}
                >
                  <Plus size={16} className="mr-2" />
                  Assign Doctor
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Mappings List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredMappings.length === 0 ? (
          <div className="bg-gray-800/30 rounded-xl p-10 text-center border border-gray-700/30">
            <div className="mx-auto w-16 h-16 bg-gray-700/50 flex items-center justify-center rounded-full mb-4">
              <UserCheck size={24} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-300 mb-2">No Assignments Found</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              {searchTerm || patientFilter ? 
                "No assignments match your current filters. Try adjusting your search criteria." : 
                "No doctor-patient assignments have been created yet. Click the 'New Assignment' button to create one."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredMappings.map((mapping) => (
              <div
                key={mapping.id}
                className="bg-gray-800/30 p-5 rounded-xl border border-gray-700/30 hover:border-indigo-500/30 transition-all duration-200 group relative"
              >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMapping(mapping.id);
                    }}
                    disabled={isDeleting === mapping.id}
                    className="p-1 bg-red-500/10 hover:bg-red-500/20 rounded-full text-red-400 transition-colors duration-200"
                  >
                    {isDeleting === mapping.id ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-red-400"></div>
                    ) : (
                      <X size={16} />
                    )}
                  </button>
                </div>
                
                <div className="mb-2 text-xs text-gray-500 flex items-center">
                  <span>Assignment #{mapping.id}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(mapping.createdAt).toLocaleDateString('en-US')}</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                      <User size={16} className="text-indigo-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Patient</div>
                      <div className="font-medium">{mapping.patient.name}</div>
                      <div className="text-xs text-gray-500">ID: {mapping.patient.id}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <UserCheck size={16} className="text-purple-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Doctor</div>
                      <div className="font-medium">{mapping.doctor.name}</div>
                      <div className="text-xs text-gray-500">
                        ID: {mapping.doctor.id}
                        {mapping.doctor.speciality && ` • ${mapping.doctor.speciality}`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}