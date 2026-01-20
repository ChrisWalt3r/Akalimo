import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, ArrowRight } from 'lucide-react';
import axios from 'axios';

const QuotationForm = ({ orderId, onSuccess }) => {
    const token = localStorage.getItem('token');
    const { register, control, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            serviceFee: 5000,
            items: [{ name: '', qty: 1, price: 0 }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    const [loading, setLoading] = useState(false);

    // Calculate totals for preview
    const watchedItems = watch("items");
    const watchedServiceFee = watch("serviceFee");

    const itemsTotal = watchedItems.reduce((acc, curr) => acc + (Number(curr.price) * Number(curr.qty)), 0);
    // Base fee is calculated on backend, but we can assume a placeholder
    const totalEst = Number(watchedServiceFee) + itemsTotal + 1500; // +1500 base

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/quotations', {
                orderId,
                serviceFee: Number(data.serviceFee),
                items: data.items
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onSuccess();
        } catch (error) {
            console.error(error);
            alert("Failed to send quote");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            <div className="bg-gray-50 p-4 rounded-xl mb-4">
                <h3 className="font-bold text-gray-700 mb-2">Quote Summary</h3>
                <div className="flex justify-between text-sm">
                    <span>Assessment Base Fee</span>
                    <span>1,500 (Est)</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span>Distance Charge</span>
                    <span>Click to Calc (Backend)</span>
                </div>
            </div>

            {/* Service Fee */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Project / Service Fee</label>
                <input
                    type="number"
                    {...register("serviceFee", { required: true })}
                    className="w-full rounded-xl border border-gray-300 p-3"
                />
            </div>

            {/* Application Items */}
            <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex justify-between items-center">
                    <span>Materials / Parts</span>
                    <button
                        type="button"
                        onClick={() => append({ name: '', qty: 1, price: 0 })}
                        className="text-[#5b4d9d] text-xs flex items-center gap-1 hover:underline"
                    >
                        <Plus size={14} /> Add Item
                    </button>
                </label>

                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-2 items-start">
                            <div className="flex-1">
                                <input
                                    {...register(`items.${index}.name`)}
                                    placeholder="Item Name"
                                    className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                                />
                            </div>
                            <div className="w-16">
                                <input
                                    type="number"
                                    {...register(`items.${index}.qty`)}
                                    placeholder="Qty"
                                    className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                                />
                            </div>
                            <div className="w-24">
                                <input
                                    type="number"
                                    {...register(`items.${index}.price`)}
                                    placeholder="Price"
                                    className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                                />
                            </div>
                            <button type="button" onClick={() => remove(index)} className="text-red-400 mt-2 hover:text-red-600">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-t pt-4 mt-6">
                <div className="flex justify-between items-center text-xl font-bold text-[#5b4d9d]">
                    <span>Total Estimate</span>
                    <span>{totalEst.toLocaleString()}</span>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#5b4d9d] text-white rounded-full font-bold shadow-lg hover:bg-[#4a3e80] transition-all flex justify-center items-center gap-2"
            >
                {loading ? "Sending..." : "Submit Quotation"} <ArrowRight size={20} />
            </button>
        </form>
    );
};

export default QuotationForm;
