import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Info, Shield, CheckCircle } from 'lucide-react';

const InfoPage = () => {
    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-800">About Akalimo</h1>
                    <p className="text-gray-500 mt-2">Connecting you with creative & reliable professionals</p>
                </div>

                <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-8">
                    <div className="bg-[#5b4d9d] p-8 text-white text-center">
                        <h2 className="text-2xl font-bold mb-2">Akalimo Platform</h2>
                        <p className="opacity-80">Version 1.0.0</p>
                    </div>
                    <div className="p-8 space-y-6">
                        <section>
                            <h3 className="font-bold text-gray-800 text-lg mb-3">Our Mission</h3>
                            <p className="text-gray-600 leading-relaxed">
                                To provide a digital marketplace that connects service receivers with skilled, vetted, and tech-driven professionals across various vocational fields, ensuring quality, timeliness, and professionalism.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold text-gray-800 text-lg mb-3">Core Guarantees</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <CheckCircle size={20} className="text-green-500 mt-1 flex-shrink-0" />
                                    <span className="text-gray-600"><strong>Quality Work:</strong> We guarantee 100% satisfaction or rework.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle size={20} className="text-green-500 mt-1 flex-shrink-0" />
                                    <span className="text-gray-600"><strong>Vetted Professionals:</strong> All providers are checked for skills and conduct.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle size={20} className="text-green-500 mt-1 flex-shrink-0" />
                                    <span className="text-gray-600"><strong>Secure Payments:</strong> Your funds are safe in our escrow wallet system until work is done.</span>
                                </li>
                            </ul>
                        </section>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer">
                        <Shield className="text-[#5b4d9d] mb-4" size={32} />
                        <h4 className="font-bold text-gray-800 mb-2">Privacy Policy</h4>
                        <p className="text-sm text-gray-500">Read how we protect your data and privacy.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer">
                        <Info className="text-[#5b4d9d] mb-4" size={32} />
                        <h4 className="font-bold text-gray-800 mb-2">Terms of Service</h4>
                        <p className="text-sm text-gray-500">Understand the rules and regulations of using Akalimo.</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default InfoPage;
