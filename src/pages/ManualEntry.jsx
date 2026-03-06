import React, { useState, useEffect } from 'react';
import api from '../api/api';

const ManualEntry = () => {
    const [formData, setFormData] = useState({
        abId: 'AB00',
        itemType: 'pass',
        itemId: '',
        days: 1,
        manualPaymentId: ''
    });

    const [passes, setPasses] = useState([]);
    const [accommodations, setAccommodations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [passRes, accRes] = await Promise.all([
                    api.get('/passes/types'),
                    api.get('/accommodation/types')
                ]);
                setPasses(passRes.data.passesTypes || []);
                setAccommodations(accRes.data.accommodationTypes || []);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching types:", err);
                setMessage({ type: 'error', text: 'Failed to fetch inventory types.' });
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const payload = {
                ...formData,
                itemId: parseInt(formData.itemId),
                days: parseInt(formData.days)
            };

            await api.post('/sales/manual-entry', payload);
            setMessage({ type: 'success', text: 'Manual entry recorded successfully!' });
            setFormData({
                abId: '',
                itemType: 'PASS',
                itemId: '',
                days: 1,
                manualPaymentId: ''
            });
        } catch (err) {
            console.error("Manual entry failed:", err);
            setMessage({ type: 'error', text: err.response?.data?.error || 'Manual entry failed. Check logs.' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full font-black text-indigo-600 uppercase text-[10px] tracking-widest"></div>
        </div>
    );

    return (
        <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
                <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Manual Sales Entry</h2>
                <p className="text-gray-500 font-medium text-sm mt-2 font-mono">INTERNAL USE ONLY • BYPASS GATEWAY</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl shadow-2xl p-6 md:p-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ABID Input */}
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">User ABID</label>
                        <input
                            type="text"
                            placeholder="e.g. AB03452"
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-700 transition-all"
                            value={formData.abId}
                            onChange={(e) => setFormData({ ...formData, abId: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Item Type */}
                        <div>
                            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Item Category</label>
                            <select
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-700 appearance-none"
                                value={formData.itemType}
                                onChange={(e) => setFormData({ ...formData, itemType: e.target.value, itemId: '' })}
                            >
                                <option value="pass">Pass</option>
                                <option value="accommodation">Accommodation</option>
                            </select>
                        </div>

                        {/* Item ID Selection */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Specific Item</label>
                            <select
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-700 appearance-none"
                                value={formData.itemId}
                                onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                            >
                                <option value="" disabled>Select {formData.itemType.toLowerCase()}...</option>
                                {formData.itemType === 'pass'
                                    ? passes.map(p => <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>)
                                    : accommodations.map(a => <option key={a.id} value={a.id}>{a.name} (₹{a.price})</option>)
                                }
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Days / Quantity */}
                        <div>
                            {formData.itemType === 'accommodation' &&
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                        Quantity (Days)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-700 transition-all font-mono"
                                        value={formData.days}
                                        onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                                    />
                                </div>}
                        </div>

                        {/* Manual Payment ID */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Reference / Internal ID</label>
                            <input
                                type="text"
                                placeholder="e.g. CASH_OFFLINE_REC"
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-700 transition-all font-mono"
                                value={formData.manualPaymentId}
                                onChange={(e) => setFormData({ ...formData, manualPaymentId: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Feedback Message */}
                    {message.text && (
                        <div className={`p-4 rounded-xl text-xs font-black uppercase tracking-widest border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-gray-900 text-white py-4 rounded-xl font-black text-sm uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-gray-200 disabled:opacity-50"
                    >
                        {submitting ? 'Recording Action...' : 'Confirm Manual Entry'}
                    </button>
                </form>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl">
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Audit Notice</h4>
                <p className="text-xs text-indigo-900 font-medium leading-relaxed">
                    Performing a manual entry will bypass the payment gateway.
                    This action will be tied to your admin account and visible in the
                    <span className="font-black underline mx-1">security logs</span>.
                    Ensure you have received the payment physically or via alternate bank transfer.
                </p>
            </div>
        </div>
    );
};

export default ManualEntry;
