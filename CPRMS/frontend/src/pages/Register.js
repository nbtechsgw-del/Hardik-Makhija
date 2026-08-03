import React, { useState } from 'react';
import { registerPatient } from '../api'; // Check karein ki path sahi hai

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        dob: '',
        gender: 'Male',
        phone: '',
        address: ''
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Backend structure ke mutabik data wrap kar rahe hain
            const payload = { personalDetails: formData };
            const response = await registerPatient(payload);
            
            alert(`Success! Patient ID: ${response.data.data.patientId}`);
            // Form reset karne ke liye
            setFormData({ firstName: '', lastName: '', dob: '', gender: 'Male', phone: '', address: '' });
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Unknown error';
            alert(`Registration Failed: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-50 p-6">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg border border-slate-200">
                <h2 className="text-3xl font-extrabold text-blue-700 mb-2 text-center">CPRMS</h2>
                <p className="text-slate-500 text-center mb-8">Register New Patient Record</p>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                            <input 
                                type="text" placeholder="John" required
                                className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                value={formData.firstName}
                                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                            <input 
                                type="text" placeholder="Doe" required
                                className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                value={formData.lastName}
                                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                            <input 
                                type="date" required
                                className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                value={formData.dob}
                                onChange={(e) => setFormData({...formData, dob: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                            <select 
                                className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                value={formData.gender}
                                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                        <input 
                            type="text" placeholder="9876543210" required
                            className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                        <textarea 
                            placeholder="Full Address" rows="3"
                            className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                        ></textarea>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`w-full py-3 rounded-lg text-white font-bold text-lg shadow-lg transition-all ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
                    >
                        {loading ? 'Processing...' : 'Register Patient'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;