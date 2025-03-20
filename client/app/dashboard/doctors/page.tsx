'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search, PlusCircle, Edit2, Trash2, X, Check, Loader2, Stethoscope } from 'lucide-react';

interface Doctor {
  id: number;
  name: string;
  speciality?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [newDoctorName, setNewDoctorName] = useState('');
  const [newDoctorSpeciality, setNewDoctorSpeciality] = useState('');
  const [editingDoctorId, setEditingDoctorId] = useState<number | null>(null);
  const [editedDoctorName, setEditedDoctorName] = useState('');
  const [editedDoctorSpeciality, setEditedDoctorSpeciality] = useState('');
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

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/doctors`);
      if (res.ok) {
        const data = await res.json();
        setDoctors(data);
        setFilteredDoctors(data);
      } else {
        setError('Failed to fetch doctors.');
      }
    } catch (err) {
      setError('An error occurred while fetching doctors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!getToken()) {
      router.push('/login');
    } else {
      fetchDoctors();
    }
  }, []);

  const addDoctor = async (e: FormEvent) => {
    e.preventDefault();
    if (!newDoctorName.trim()) {
      setError('Doctor name cannot be empty.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/doctors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newDoctorName,
          speciality: newDoctorSpeciality,
        }),
      });
      if (res.ok) {
        setNewDoctorName('');
        setNewDoctorSpeciality('');
        fetchDoctors();
      } else {
        setError('Failed to add doctor.');
      }
    } catch (err) {
      setError('An error occurred while adding doctor.');
    } finally {
      setLoading(false);
    }
  };

  const deleteDoctor = async (id: number) => {
    if (!confirm('Are you sure you want to delete this doctor?')) return;
    
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/doctors/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchDoctors();
      } else {
        setError('Failed to delete doctor.');
      }
    } catch (err) {
      setError('An error occurred while deleting doctor.');
    } finally {
      setLoading(false);
    }
  };

  const updateDoctor = async (id: number, newName: string, newSpeciality: string) => {
    if (!newName.trim()) {
      setError('Doctor name cannot be empty.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/doctors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, speciality: newSpeciality }),
      });
      if (res.ok) {
        fetchDoctors();
      } else {
        setError('Failed to update doctor.');
      }
    } catch (err) {
      setError('An error occurred while updating doctor.');
    } finally {
      setLoading(false);
      setEditingDoctorId(null);
    }
  };

  const searchDoctorById = async () => {
    if (!searchId.trim()) {
      setFilteredDoctors(doctors);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    setLoading(true);
    
    try {
      const id = parseInt(searchId);
      if (isNaN(id)) {
        setError('Please enter a valid numeric ID.');
        setFilteredDoctors(doctors);
        return;
      }
      
      const res = await fetchWithAuth(`${API_URL}/api/doctors/${id}`);
      if (res.ok) {
        const doctor = await res.json();
        setFilteredDoctors([doctor]);
      } else if (res.status === 404) {
        setFilteredDoctors([]);
      } else {
        setError('Failed to search for doctor.');
        setFilteredDoctors(doctors);
      }
    } catch (err) {
      setError('An error occurred while searching.');
      setFilteredDoctors(doctors);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchId('');
    setFilteredDoctors(doctors);
    setIsSearching(false);
    setError('');
  };

  // Helper function to get specialty badge color
  const getSpecialtyColor = (specialty: string) => {
    const specialtyMap: {[key: string]: string} = {
      'Cardiology': 'text-red-400 bg-red-500',
      'Neurology': 'text-purple-400 bg-purple-500',
      'Pediatrics': 'text-blue-400 bg-blue-500',
      'Orthopedics': 'text-green-400 bg-green-500',
      'Dermatology': 'text-yellow-400 bg-yellow-500',
      'Oncology': 'text-orange-400 bg-orange-500',
      'Psychiatry': 'text-indigo-400 bg-indigo-500',
      'Gynecology': 'text-pink-400 bg-pink-500',
    };
    
    return specialtyMap[specialty] || 'text-teal-400 bg-teal-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-500">
          Doctor Management
        </h1>
        <p className="text-gray-400 mb-8">Manage your medical staff efficiently</p>
        
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
          {/* Add Doctor Form */}
          <form onSubmit={addDoctor} className="bg-gray-800 bg-opacity-50 p-5 rounded-xl shadow-lg backdrop-blur-sm border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Add New Doctor</h2>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                value={newDoctorName}
                onChange={(e) => setNewDoctorName(e.target.value)}
                placeholder="Enter doctor name"
                className="p-3 rounded-lg bg-gray-700 text-white w-full border border-gray-600 focus:border-green-500 focus:outline-none transition-colors"
              />
              <input
                type="text"
                value={newDoctorSpeciality}
                onChange={(e) => setNewDoctorSpeciality(e.target.value)}
                placeholder="Enter specialty (e.g., Cardiology)"
                className="p-3 rounded-lg bg-gray-700 text-white w-full border border-gray-600 focus:border-green-500 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 font-medium disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <PlusCircle size={18} />}
                Add Doctor
              </button>
            </div>
          </form>
          
          {/* Search Doctor Form */}
          <div className="bg-gray-800 bg-opacity-50 p-5 rounded-xl shadow-lg backdrop-blur-sm border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Search Doctor</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="Enter doctor ID"
                  className="p-3 pl-10 rounded-lg bg-gray-700 text-white w-full border border-gray-600 focus:border-green-500 focus:outline-none transition-colors"
                />
                <Search size={18} className="absolute top-3.5 left-3 text-gray-400" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={searchDoctorById}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 font-medium disabled:opacity-50"
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
            <Loader2 size={40} className="animate-spin text-green-500" />
          </div>
        ) : filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="bg-gray-800 bg-opacity-50 p-5 rounded-xl shadow-lg backdrop-blur-sm border border-gray-700 hover:border-green-500 transition-colors">
                <div className="mb-3 text-sm text-gray-400 flex justify-between items-center">
                  <span>Doctor ID: {doctor.id}</span>
                  <span className="bg-green-500 bg-opacity-20 text-green-400 px-2 py-1 rounded-full text-xs">Active</span>
                </div>
                
                {editingDoctorId === doctor.id ? (
                  <div className="mt-4">
                    <input
                      type="text"
                      value={editedDoctorName}
                      onChange={(e) => setEditedDoctorName(e.target.value)}
                      className="p-3 rounded-lg bg-gray-700 text-white mb-3 w-full border border-gray-600 focus:border-green-500 focus:outline-none transition-colors"
                    />
                    <input
                      type="text"
                      value={editedDoctorSpeciality}
                      onChange={(e) => setEditedDoctorSpeciality(e.target.value)}
                      className="p-3 rounded-lg bg-gray-700 text-white mb-3 w-full border border-gray-600 focus:border-green-500 focus:outline-none transition-colors"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateDoctor(doctor.id, editedDoctorName, editedDoctorSpeciality)}
                        className="flex-1 px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-1"
                      >
                        <Check size={16} />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingDoctorId(null)}
                        className="flex-1 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-1"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Stethoscope size={18} className="text-green-500" />
                      <h3 className="text-xl font-semibold truncate">{doctor.name}</h3>
                    </div>
                    
                    {doctor.speciality && (
                      <div className="mb-3">
                        <span className={`${getSpecialtyColor(doctor.speciality)} bg-opacity-20 px-2 py-1 rounded-full text-xs`}>
                          {doctor.speciality}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mt-4">
                      <button
                        onClick={() => {
                          setEditingDoctorId(doctor.id);
                          setEditedDoctorName(doctor.name);
                          setEditedDoctorSpeciality(doctor.speciality || '');
                        }}
                        className="px-4 py-2 bg-green-500 bg-opacity-20 text-green-400 rounded-lg hover:bg-opacity-30 transition-colors flex items-center gap-1"
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteDoctor(doctor.id)}
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
            <Stethoscope size={48} className="mb-4 opacity-50" />
            <p className="text-xl">{isSearching ? "No doctor found with that ID" : "No doctors available"}</p>
            <p className="mt-2">Add a new doctor or try a different search</p>
          </div>
        )}
      </div>
    </div>
  );
}