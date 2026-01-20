import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { Briefcase, ShoppingCart, ArrowRight } from 'lucide-react';

const MakeOrderPage = () => {
    const navigate = useNavigate();

    return (
        <DashboardLayout>
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-800">Make an Order</h1>
                <p className="text-gray-500 mt-2">What would you like to request today?</p>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                {/* Request Service Card */}
                <button
                    onClick={() => navigate('/request-service')}
                    className="group bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#5b4d9d]/30 transition-all duration-300 text-left flex flex-col items-center md:items-start"
                >
                    <div className="w-20 h-20 rounded-full bg-[#5b4d9d]/10 text-[#5b4d9d] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Briefcase size={32} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Request a Service</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed text-center md:text-left">
                        Hire a professional for plumbing, electrical work, beauty, carpentry, and more.
                    </p>
                    <div className="w-full mt-auto flex items-center justify-between text-[#5b4d9d] font-bold">
                        <span>Get Started</span>
                        <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                    </div>
                </button>

                {/* Request Product Card */}
                <button
                    onClick={() => navigate('/request-product')}
                    className="group bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#4DA1D6]/30 transition-all duration-300 text-left flex flex-col items-center md:items-start"
                >
                    <div className="w-20 h-20 rounded-full bg-[#4DA1D6]/10 text-[#4DA1D6] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <ShoppingCart size={32} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Request a Product</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed text-center md:text-left">
                        Order quality materials, tools, and supplies directly to your location.
                    </p>
                    <div className="w-full mt-auto flex items-center justify-between text-[#4DA1D6] font-bold">
                        <span>Shop Now</span>
                        <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                    </div>
                </button>
            </div>
        </DashboardLayout>
    );
};

export default MakeOrderPage;
