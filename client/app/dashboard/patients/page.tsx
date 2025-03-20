'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search, PlusCircle, Edit2, Trash2, X, Check, Loader2 } from 'lucide-react';

interface Patient {
  id: number;
  name: string;
  userId: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [newPatientName, setNewPatientName] = useState('');
  const [editingPatientId, setEditingPatientId] = useState<number | null>(null);
  const [editedPatientName, setEditedPatientName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  // Get token from localStorage
  const getToken = () => localStorage.getItem('token') || '';

  // Fetch helper with auth header
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = getToken();
    const headers = {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };
    return fetch(url, { ...options, headers });
  };

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/patients`);
      if (res.ok) {
        const data = await res.json();
        setPatients(data);
        setFilteredPatients(data);
      } else {
        setError('Failed to fetch patients.');
      }
    } catch (err) {
      setError('An error occurred while fetching patients.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!getToken()) {
      router.push('/login');
    } else {
      fetchPatients();
    }
  }, []);

  const addPatient = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim()) {
      setError('Patient name cannot be empty.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPatientName }),
      });
      if (res.ok) {
        setNewPatientName('');
        fetchPatients();
      } else {
        setError('Failed to add patient.');
      }
    } catch (err) {
      setError('An error occurred while adding patient.');
    } finally {
      setLoading(false);
    }
  };

  const deletePatient = async (id: number) => {
    if (!confirm('Are you sure you want to delete this patient?')) return;
    
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/patients/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchPatients();
      } else {
        setError('Failed to delete patient.');
      }
    } catch (err) {
      setError('An error occurred while deleting patient.');
    } finally {
      setLoading(false);
    }
  };

  const updatePatient = async (id: number, newName: string) => {
    if (!newName.trim()) {
      setError('Patient name cannot be empty.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/patients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      if (res.ok) {
        fetchPatients();
      } else {
        setError('Failed to update patient.');
      }
    } catch (err) {
      setError('An error occurred while updating patient.');
    } finally {
      setLoading(false);
      setEditingPatientId(null);
    }
  };

  const searchPatientById = async () => {
    if (!searchId.trim()) {
      setFilteredPatients(patients);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    setLoading(true);
    
    try {
      const id = parseInt(searchId);
      if (isNaN(id)) {
        setError('Please enter a valid numeric ID.');
        setFilteredPatients(patients);
        return;
      }
      
      const res = await fetchWithAuth(`${API_URL}/api/patients/${id}`);
      if (res.ok) {
        const patient = await res.json();
        setFilteredPatients([patient]);
      } else if (res.status === 404) {
        setFilteredPatients([]);
      } else {
        setError('Failed to search for patient.');
        setFilteredPatients(patients);
      }
    } catch (err) {
      setError('An error occurred while searching.');
      setFilteredPatients(patients);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchId('');
    setFilteredPatients(patients);
    setIsSearching(false);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Patient Management
        </h1>
        <p className="text-gray-400 mb-8">Manage your patients efficiently</p>
        
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4 mb-6 flex items-center">
            <span className="text-red-400">{error}</span>
            <button 
              onClick={() => setError('')}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              <X size={18} />
            </button>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Add Patient Form */}
          <form onSubmit={addPatient} className="bg-gray-800 bg-opacity-50 p-5 rounded-xl shadow-lg backdrop-blur-sm border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Add New Patient</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={newPatientName}
                onChange={(e) => setNewPatientName(e.target.value)}
                placeholder="Enter patient name"
                className="p-3 rounded-lg bg-gray-700 text-white w-full md:flex-1 border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 font-medium disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <PlusCircle size={18} />}
                Add Patient
              </button>
            </div>
          </form>
          
          {/* Search Patient Form */}
          <div className="bg-gray-800 bg-opacity-50 p-5 rounded-xl shadow-lg backdrop-blur-sm border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Search Patient</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="Enter patient ID"
                  className="p-3 pl-10 rounded-lg bg-gray-700 text-white w-full border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                />
                <Search size={18} className="absolute top-3.5 left-3 text-gray-400" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={searchPatientById}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                  Search
                </button>
                {isSearching && (
                  <button
                    onClick={clearSearch}
                    className="px-6 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <X size={18} />
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {loading && !isSearching ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 size={40} className="animate-spin text-blue-500" />
          </div>
        ) : filteredPatients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <div key={patient.id} className="bg-gray-800 bg-opacity-50 p-5 rounded-xl shadow-lg backdrop-blur-sm border border-gray-700 hover:border-blue-500 transition-colors">
                <div className="mb-3 text-sm text-gray-400 flex justify-between items-center">
                  <span>Patient ID: {patient.id}</span>
                  <span className="bg-blue-500 bg-opacity-20 text-blue-400 px-2 py-1 rounded-full text-xs">Active</span>
                </div>
                
                {editingPatientId === patient.id ? (
                  <div className="mt-4">
                    <input
                      type="text"
                      value={editedPatientName}
                      onChange={(e) => setEditedPatientName(e.target.value)}
                      className="p-3 rounded-lg bg-gray-700 text-white mb-3 w-full border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => updatePatient(patient.id, editedPatientName)}
                        className="flex-1 px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-1"
                      >
                        <Check size={16} />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingPatientId(null)}
                        className="flex-1 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-1"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-semibold mb-3 truncate">{patient.name}</h3>
                    <div className="flex justify-between items-center mt-4">
                      <button
                        onClick={() => {
                          setEditingPatientId(patient.id);
                          setEditedPatientName(patient.name);
                        }}
                        className="px-4 py-2 bg-blue-500 bg-opacity-20 text-blue-400 rounded-lg hover:bg-opacity-30 transition-colors flex items-center gap-1"
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => deletePatient(patient.id)}
                        className="px-4 py-2 bg-red-500 bg-opacity-20 text-red-400 rounded-lg hover:bg-opacity-30 transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Search size={48} className="mb-4 opacity-50" />
            <p className="text-xl">{isSearching ? "No patient found with that ID" : "No patients available"}</p>
            <p className="mt-2">Add a new patient or try a different search</p>
          </div>
        )}
      </div>
    </div>
  );
}