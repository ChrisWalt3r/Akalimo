import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';

const loginSchema = z.object({
    identifier: z.string().min(1, 'Identifier is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        const result = await login(data.identifier, data.password);
        if (result.success) {
            navigate('/dashboard'); // TODO: Redirect based on role
        } else {
            setError('root', { message: result.message });
        }
    };

    return (
        <div className="relative min-h-screen w-full bg-[url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
            {/* Blue Overlay */}
            <div className="absolute inset-0 bg-blue-600/80 mix-blend-multiply" />

            <div className="relative flex min-h-screen flex-col items-center justify-center px-6">
                {/* Logo */}
                <h1 className="mb-12 text-5xl font-black italic tracking-tighter text-white drop-shadow-lg">
                    Akalimo.
                </h1>

                {/* Login Card */}
                <div className="w-full max-w-sm rounded-[2rem] bg-sky-500/90 p-8 shadow-2xl backdrop-blur-sm">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <Input
                                    type="text"
                                    placeholder="Names / Mobile"
                                    {...register('identifier')}
                                />
                                {errors.identifier && <p className="mt-1 text-xs text-red-200">{errors.identifier.message}</p>}
                            </div>

                            <div>
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    {...register('password')}
                                />
                                {errors.password && <p className="mt-1 text-xs text-red-200">{errors.password.message}</p>}
                            </div>

                            {errors.root && <p className="text-center text-sm text-red-200 bg-red-500/20 p-2 rounded">{errors.root.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-full bg-white py-3 font-bold text-gray-900 shadow-lg transition hover:bg-gray-100 disabled:opacity-50"
                        >
                            {isSubmitting ? 'LOGGING IN...' : 'LOGIN'}
                        </button>
                    </form>
                </div>

                {/* Separator */}
                <div className="my-8 w-full max-w-sm">
                    <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/50"></div>
                        </div>
                        <div className="relative bg-transparent px-2">
                            <span className="text-sm font-medium text-white">OR</span>
                        </div>
                    </div>
                </div>

                {/* Forgot / Signup */}
                <Link
                    to="/register"
                    className="w-full max-w-sm rounded-full bg-sky-400 py-3 text-center font-bold text-white shadow-lg backdrop-blur-sm transition hover:bg-sky-500"
                >
                    FORGOT PASSWORD / SIGNUP
                </Link>
            </div>
        </div>
    );
};

export default LoginPage;
