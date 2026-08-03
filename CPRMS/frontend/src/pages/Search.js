import React, { useEffect, useState } from 'react';
import { getPatientData, quickSearchPatients } from '../api';

const Search = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('Start typing to search across patient records.');

    useEffect(() => {
        const timeout = setTimeout(async () => {
            if (!query.trim()) {
                setResults([]);
                setSelectedPatient(null);
                setMessage('Start typing to search across patient records.');
                return;
            }

            setLoading(true);
            try {
                const res = await quickSearchPatients(query.trim());
                setResults(res.data.results || []);
                setMessage(res.data.results.length ? '' : 'No matching patients found.');
            } catch (err) {
                setResults([]);
                setMessage('Search failed. Please try again.');
            } finally {
                setLoading(false);
            }
        }, 250);

        return () => clearTimeout(timeout);
    }, [query]);

    const handleSelect = async (patientId) => {
        setLoading(true);
        try {
            const res = await getPatientData(patientId);
            setSelectedPatient(res.data);
        } catch (err) {
            setSelectedPatient(null);
            setMessage('Unable to load selected patient.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-10 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Search Patient Records</h1>

            <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
                <div className="space-y-6">
                    <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Patient ID / Phone / Name</label>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search thousands of patients quickly"
                            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                        {message && <p className="mt-3 text-sm text-slate-500">{message}</p>}
                    </div>

                    <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Search Results</h2>
                        {loading ? (
                            <p className="text-slate-500">Loading...</p>
                        ) : results.length === 0 ? (
                            <p className="text-slate-500">No results yet.</p>
                        ) : (
                            <ul className="space-y-3">
                                {results.map((item) => (
                                    <li key={item.patientId}>
                                        <button
                                            onClick={() => handleSelect(item.patientId)}
                                            className="w-full text-left rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-blue-500"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="font-semibold text-slate-900">{item.personalDetails.firstName} {item.personalDetails.lastName}</p>
                                                    <p className="text-sm text-slate-500">{item.patientId} • {item.personalDetails.phone}</p>
                                                </div>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {selectedPatient && (
                    <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                        <h2 className="text-xl font-semibold text-slate-900">Patient Details</h2>
                        <div className="mt-5 space-y-4 text-slate-700">
                            <p><strong>Name:</strong> {selectedPatient.personalDetails.firstName} {selectedPatient.personalDetails.lastName}</p>
                            <p><strong>Patient ID:</strong> {selectedPatient.patientId}</p>
                            <p><strong>Phone:</strong> {selectedPatient.personalDetails.phone}</p>
                            <p><strong>DOB:</strong> {new Date(selectedPatient.personalDetails.dob).toLocaleDateString()}</p>
                            <p><strong>Gender:</strong> {selectedPatient.personalDetails.gender}</p>
                            <p><strong>Address:</strong> {selectedPatient.personalDetails.address || 'N/A'}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;