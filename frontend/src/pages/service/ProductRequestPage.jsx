import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { ShoppingCart, Hammer, Wrench } from 'lucide-react';

const ProductRequestPage = () => {
    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Request Products</h1>
                <p className="text-gray-500 mt-1">Purchase materials and tools for your projects</p>
            </div>

            <div className="bg-white p-12 rounded-3xl shadow-sm text-center border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
                <div className="bg-blue-50 p-6 rounded-full mb-6">
                    <ShoppingCart size={64} className="text-[#4DA1D6]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Shop Coming Soon</h2>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                    We are building a marketplace for you to easily order quality materials like plumbing pipes, electrical fittings, and construction tools directly to your site.
                </p>

                <div className="flex gap-4 opacity-50">
                    <div className="flex flex-col items-center gap-2">
                        <Hammer size={32} className="text-gray-400" />
                        <span className="text-xs font-bold text-gray-400">Tools</span>
                    </div>
                    <div className="w-px bg-gray-200 h-12"></div>
                    <div className="flex flex-col items-center gap-2">
                        <Wrench size={32} className="text-gray-400" />
                        <span className="text-xs font-bold text-gray-400">Materials</span>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ProductRequestPage;
