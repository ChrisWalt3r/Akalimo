import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { User, Mail, Phone, MapPin, Save, Lock } from 'lucide-react';

const ProfilePage = () => {
    const { user } = useAuth();

    // Mock States for editing
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [contact, setContact] = useState(user?.contact || '');
    const [location, setLocation] = useState(user?.location || '');

    const handleSave = (e) => {
        e.preventDefault();
        alert("Profile Update functionality would be connected to backend here.");
    };

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
                <p className="text-gray-500 mt-1">Manage your personal information</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center h-fit">
                    <div className="w-32 h-32 rounded-full bg-[#5b4d9d] mx-auto flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-xl ring-4 ring-purple-50">
                        {name.charAt(0).toUpperCase()}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">{name}</h2>
                    <p className="text-[#5b4d9d] font-medium mb-6">{user?.role === 'SERVICE_PROVIDER' ? 'Service Provider' : 'Client Account'}</p>

                    <div className="text-left space-y-4 border-t border-gray-100 pt-6">
                        <div className="flex items-center gap-3 text-gray-600">
                            <Mail size={18} className="text-gray-400" /> {email}
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                            <Phone size={18} className="text-gray-400" /> {contact}
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                            <MapPin size={18} className="text-gray-400" /> {location}
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <User size={20} className="text-[#5b4d9d]" /> Edit Details
                    </h3>

                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#5b4d9d] focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Contact</label>
                                <input
                                    type="text"
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#5b4d9d] focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#5b4d9d] focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Default Location</label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#5b4d9d] focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                                <Lock size={16} /> Security
                            </h4>
                            <button type="button" className="text-[#5b4d9d] font-bold text-sm bg-purple-50 px-4 py-2 rounded-lg hover:bg-purple-100">
                                Change Password
                            </button>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button type="submit" className="bg-[#5b4d9d] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#4a3e80] shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                                <Save size={18} /> Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ProfilePage;
