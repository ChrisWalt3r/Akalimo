import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { HelpCircle, ChevronDown, ChevronUp, Mail, Phone } from 'lucide-react';

const HelpPage = () => {
    const [openFaq, setOpenFaq] = useState(null);

    const faqs = [
        {
            question: "How do I pay for a service?",
            answer: "You can pay using your User Wallet. Ensure you have topped up your wallet using Mobile Money. Once a quotation is accepted, 50% commitment fee is deducted, and the remaining 50% is paid upon completion."
        },
        {
            question: "How are service providers vetted?",
            answer: "All professionals on Akalimo undergo a strict background check, skills assessment, and conduct verification before they can accept jobs."
        },
        {
            question: "What if I am not satisfied with the work?",
            answer: "We offer a Quality Guarantee. If the work does not meet the agreed standards, you can report it via the 'Orders' page, and we will arrange for a redo or resolution."
        },
        {
            question: "How do I change my location?",
            answer: "You can update your default location in the Profile settings. For specific orders, you can pin a new location during the request process."
        }
    ];

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Help Center</h1>
                    <p className="text-gray-500 mt-1">Get answers and support</p>
                </div>

                {/* FAQ Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <HelpCircle size={20} className="text-[#5b4d9d]" /> Frequently Asked Questions
                        </h2>
                    </div>
                    <div>
                        {faqs.map((faq, index) => (
                            <div key={index} className="border-b border-gray-100 last:border-0">
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full flex justify-between items-center p-6 text-left hover:bg-gray-50 transition-colors"
                                >
                                    <span className="font-bold text-gray-700">{faq.question}</span>
                                    {openFaq === index ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                                </button>
                                {openFaq === index && (
                                    <div className="px-6 pb-6 text-gray-500 leading-relaxed bg-gray-50/50">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Support */}
                <div className="bg-[#5b4d9d] rounded-3xl p-8 text-white text-center shadow-xl">
                    <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
                    <p className="opacity-90 mb-8 max-w-md mx-auto">Our support team is available 24/7 to assist you with any issues or inquiries.</p>

                    <div className="flex flex-col md:flex-row justify-center gap-6">
                        <a href="mailto:support@akalimo.com" className="flex items-center justify-center gap-2 bg-white text-[#5b4d9d] px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors">
                            <Mail size={20} /> Email Support
                        </a>
                        <a href="tel:+256700000000" className="flex items-center justify-center gap-2 bg-white/20 text-white border border-white/30 px-6 py-3 rounded-xl font-bold hover:bg-white/30 transition-colors">
                            <Phone size={20} /> Call Helpline
                        </a>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default HelpPage;
