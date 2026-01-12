import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, User } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext'; // Import Auth

// Schema for Step 1
const step1Schema = z.object({
    fullName: z.string().min(2, 'Full name is required'),
    phone: z.string().min(10, 'Valid phone number is required'),
    accessCode: z.string().optional(), // Only for providers really, but keeping generic for now
    role: z.enum(['SERVICE_RECEIVER', 'SERVICE_PROVIDER']),
});

// Schema for Step 2
const step2Schema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

const RegisterPage = () => {
    const { register: authRegister } = useAuth(); // Use register function from AuthContext
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [role, setRole] = useState('SERVICE_RECEIVER'); // Default role
    // We need to store data across steps
    const [formData, setFormData] = useState({});

    // Step 1 Form
    const {
        register: registerStep1,
        handleSubmit: handleSubmitStep1,
        formState: { errors: errorsStep1 },
        trigger: triggerStep1
    } = useForm({
        resolver: zodResolver(step1Schema),
        defaultValues: { role: 'SERVICE_RECEIVER' }
    });

    // Step 2 Form
    const {
        register: registerStep2,
        handleSubmit: handleSubmitStep2,
        formState: { errors: errorsStep2, isSubmitting },
        setError
    } = useForm({
        resolver: zodResolver(step2Schema)
    });

    const onNextStep = async (data) => {
        setFormData((prev) => ({ ...prev, ...data }));
        setStep(2);
    };

    const onFinalSubmit = async (data) => {
        const finalData = { ...formData, ...data, role };
        // Call API
        const result = await authRegister(finalData);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError('root', { message: result.message });
        }
    };

    return (
        <div className="relative min-h-screen w-full bg-[#4c51bf]"> {/* Fallback color */}
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-sky-400 to-indigo-900" />

            <div className="relative flex min-h-screen flex-col items-center pt-20 px-6">

                {/* Header Icon */}
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white text-sky-500 shadow-xl">
                    <User size={48} strokeWidth={2.5} />
                </div>

                <h2 className="mb-12 text-center text-xl font-bold tracking-widest text-white">
                    CREATE ACCOUNT
                </h2>

                {/* Step 1: Personal Details */}
                {step === 1 && (
                    <form onSubmit={handleSubmitStep1(onNextStep)} className="w-full max-w-sm space-y-6">

                        {/* Role Switcher (Custom UI not in design but needed for logic) */}
                        <div className="flex justify-center gap-4 mb-4">
                            <button
                                type="button"
                                onClick={() => { setRole('SERVICE_RECEIVER'); setFormData(p => ({ ...p, role: 'SERVICE_RECEIVER' })) }}
                                className={`text-xs font-bold px-4 py-1 rounded-full border ${role === 'SERVICE_RECEIVER' ? 'bg-white text-blue-900 border-white' : 'text-white border-white/50'}`}
                            >
                                RECEIVER
                            </button>
                            <button
                                type="button"
                                onClick={() => { setRole('SERVICE_PROVIDER'); setFormData(p => ({ ...p, role: 'SERVICE_PROVIDER' })) }}
                                className={`text-xs font-bold px-4 py-1 rounded-full border ${role === 'SERVICE_PROVIDER' ? 'bg-white text-blue-900 border-white' : 'text-white border-white/50'}`}
                            >
                                PROVIDER
                            </button>
                            <input type="hidden" {...registerStep1('role')} value={role} />
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Input
                                    placeholder="Full Names"
                                    {...registerStep1('fullName')}
                                />
                                {errorsStep1.fullName && <p className="mt-1 text-xs text-red-200">{errorsStep1.fullName.message}</p>}
                            </div>

                            <div>
                                <Input
                                    placeholder="Telephone"
                                    {...registerStep1('phone')}
                                />
                                {errorsStep1.phone && <p className="mt-1 text-xs text-red-200">{errorsStep1.phone.message}</p>}
                            </div>

                            <div>
                                <Input
                                    placeholder="Access Code (Optional)"
                                    {...registerStep1('accessCode')}
                                />
                                {errorsStep1.accessCode && <p className="mt-1 text-xs text-red-200">{errorsStep1.accessCode.message}</p>}
                            </div>
                        </div>

                        <div className="flex justify-center pt-8">
                            <button
                                type="submit"
                                className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-400 text-white shadow-lg transition hover:bg-sky-500 hover:scale-105"
                            >
                                <ArrowRight size={28} />
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 2: Password */}
                {step === 2 && (
                    <form onSubmit={handleSubmitStep2(onFinalSubmit)} className="w-full max-w-sm space-y-6">
                        {/* Back button logic could go here */}

                        <div className="space-y-4">
                            <div>
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    {...registerStep2('password')}
                                />
                                {errorsStep2.password && <p className="mt-1 text-xs text-red-200">{errorsStep2.password.message}</p>}
                            </div>

                            <div>
                                <Input
                                    type="password"
                                    placeholder="Confirm Password"
                                    {...registerStep2('confirmPassword')}
                                />
                                {errorsStep2.confirmPassword && <p className="mt-1 text-xs text-red-200">{errorsStep2.confirmPassword.message}</p>}
                            </div>

                            {errorsStep2.root && <p className="text-center text-sm text-red-200 bg-red-500/20 p-2 rounded">{errorsStep2.root.message}</p>}
                        </div>

                        <div className="pt-8">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full rounded-full bg-sky-400 py-3 font-bold text-white shadow-lg transition hover:bg-sky-500 disabled:opacity-50"
                            >
                                {isSubmitting ? 'CREATING ACCOUNT...' : 'SUBMIT'}
                            </button>
                        </div>
                        <div className="text-center">
                            <button type="button" onClick={() => setStep(1)} className="text-sm text-white/70 hover:text-white mt-4">Back to details</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default RegisterPage;
