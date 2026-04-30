import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Plus, MapPin, Edit2, Trash2, CheckCircle2, X, AlertCircle } from 'lucide-react';
import ProfileLayout from '@/Layouts/profile-layout';

// --- Dummy Data ---
const INITIAL_ADDRESSES = [
    {
        id: 1,
        label: 'Home',
        recipient: 'Siti Aisyah',
        phone: '0812 3456 789',
        fullAddress: 'Jl. Melati No. 12, Coblong',
        city: 'Bandung',
        province: 'Jawa Barat',
        postalCode: '40132',
        isDefault: true
    },
    {
        id: 2,
        label: 'Office',
        recipient: 'Siti Aisyah',
        phone: '0812 9876 543',
        fullAddress: 'Gedung Sate Lt. 3, Jl. Diponegoro No. 22, Citarum',
        city: 'Bandung',
        province: 'Jawa Barat',
        postalCode: '40115',
        isDefault: false
    }
];

export default function ManageAddress() {
    const [addresses, setAddresses] = useState(INITIAL_ADDRESSES);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showAlert, setShowAlert] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

    const openModal = (id: number | null = null) => {
        setEditingId(id);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    const handleDelete = (id: number) => {
        setAddresses(addresses.filter(a => a.id !== id));
        setShowDeleteConfirm(null);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
    };

    const setAsDefault = (id: number) => {
        setAddresses(addresses.map(a => ({
            ...a,
            isDefault: a.id === id
        })));
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
    };

    return (
        <ProfileLayout
            title="Address Book"
            pageTitle="Manage Addresses"
            subtitle="Manage your shipping and billing addresses for a faster checkout."
            activePath="address"
            breadcrumbs={[
                { label: 'Home', href: '/' },
                { label: 'My Account', href: '/my-account' },
                { label: 'Address Book' }
            ]}
        >
            {/* Success Alert */}
            {showAlert && (
                <div className="bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] px-4 py-3 rounded-lg flex items-center justify-between text-[12px] font-medium animate-fade-in-up mb-6" style={{ animationDelay: '100ms' }}>
                    <div className="flex items-center">
                        <CheckCircle2 size={16} className="mr-2 text-[#22C55E]" />
                        Address list updated successfully.
                    </div>
                    <button onClick={() => setShowAlert(false)} className="text-[#166534] hover:text-black transition-colors">
                        <X size={16} />
                    </button>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                <div>
                    <h2 className="text-xl font-serif text-[#3C3428]">Saved Addresses</h2>
                    <p className="text-[12px] text-[#8C8578] mt-1">You have {addresses.length} saved address{addresses.length !== 1 ? 'es' : ''}</p>
                </div>
                <button 
                    onClick={() => openModal()}
                    className="flex items-center justify-center px-6 py-2.5 bg-[#3C3428] text-white text-[12px] font-bold tracking-wider rounded-lg hover:bg-[#2D261C] hover:shadow-lg transition-all active:scale-[0.98]"
                >
                    <Plus size={16} className="mr-2" /> Add New Address
                </button>
            </div>

            {/* Address Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {addresses.map((address, index) => (
                    <div 
                        key={address.id} 
                        className={`relative bg-white border ${address.isDefault ? 'border-[#C2AA92]' : 'border-[#EAE8E3]'} rounded-2xl p-6 md:p-8 shadow-sm group animate-fade-in-up hover:shadow-md transition-all duration-300`} 
                        style={{ animationDelay: `${200 + index * 50}ms` }}
                    >
                        {address.isDefault && (
                            <div className="absolute top-0 right-8 -translate-y-1/2">
                                <span className="bg-[#3C3428] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                                    Default Address
                                </span>
                            </div>
                        )}
                        
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${address.isDefault ? 'bg-[#F5F2E6] text-[#C2AA92]' : 'bg-[#FAF9F6] text-[#A89F91]'}`}>
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h3 className="text-[14px] font-bold text-[#333] flex items-center">
                                        {address.label}
                                    </h3>
                                    <p className="text-[12px] font-semibold text-[#4A4A4A] mt-0.5">{address.recipient}</p>
                                </div>
                            </div>
                            
                            <div className="flex space-x-2">
                                <button 
                                    onClick={() => openModal(address.id)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAF9F6] text-[#8C8578] hover:bg-[#F5F2E6] hover:text-[#3C3428] transition-colors"
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button 
                                    onClick={() => setShowDeleteConfirm(address.id)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FFF5F5] text-[#EF4444] hover:bg-[#FEE2E2] hover:text-red-700 transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="text-[13px] text-[#4A4A4A] space-y-1.5 mb-6 pl-13">
                            <p className="text-[#8C8578] text-[11px] font-medium mb-2">{address.phone}</p>
                            <p className="leading-relaxed">
                                {address.fullAddress}<br/>
                                {address.city}, {address.province} {address.postalCode}
                            </p>
                        </div>
                        
                        {!address.isDefault && (
                            <button 
                                onClick={() => setAsDefault(address.id)}
                                className="w-full py-2.5 border border-[#EAE8E3] rounded-lg text-[12px] font-bold text-[#4A4A4A] hover:bg-[#FAF9F6] hover:border-[#C2AA92] transition-colors"
                            >
                                Set as Default
                            </button>
                        )}

                        {/* Delete Confirmation Overlay */}
                        {showDeleteConfirm === address.id && (
                            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center justify-center text-center z-10">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-3">
                                    <AlertCircle size={24} />
                                </div>
                                <h4 className="text-[14px] font-bold text-[#333] mb-1">Delete this address?</h4>
                                <p className="text-[11px] text-[#8C8578] mb-4">This action cannot be undone.</p>
                                <div className="flex w-full space-x-3">
                                    <button 
                                        onClick={() => setShowDeleteConfirm(null)}
                                        className="flex-1 py-2 border border-[#EAE8E3] text-[#4A4A4A] text-[12px] font-bold rounded-lg hover:bg-[#FAF9F6] transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(address.id)}
                                        className="flex-1 py-2 bg-[#EF4444] text-white text-[12px] font-bold rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* Empty Add New Card */}
                <button 
                    onClick={() => openModal()}
                    className="border-2 border-dashed border-[#EAE8E3] rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center hover:bg-[#FAF9F6] hover:border-[#C2AA92] transition-all duration-300 min-h-[240px] group animate-fade-in-up"
                    style={{ animationDelay: `${200 + addresses.length * 50}ms` }}
                >
                    <div className="w-12 h-12 rounded-full bg-[#F5F2E6] text-[#C2AA92] flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#C2AA92] group-hover:text-white transition-all duration-300">
                        <Plus size={24} />
                    </div>
                    <h3 className="text-[14px] font-bold text-[#333] mb-1 group-hover:text-[#3C3428] transition-colors">Add New Address</h3>
                    <p className="text-[11px] text-[#8C8578] max-w-[200px]">Save additional addresses for a quicker checkout experience.</p>
                </button>
            </div>

            {/* Address Modal (Glassmorphism Overlay) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={closeModal}
                    ></div>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-[#EAE8E3] flex items-center justify-between bg-[#FAF9F6]">
                            <h3 className="text-lg font-serif text-[#3C3428]">
                                {editingId ? 'Edit Address' : 'Add New Address'}
                            </h3>
                            <button onClick={closeModal} className="text-[#A89F91] hover:text-[#333] transition-colors p-1">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-semibold text-[#4A4A4A] mb-1.5">Address Label</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Home, Office, Apartment"
                                        className="w-full px-4 py-2.5 bg-white border border-[#EAE8E3] rounded-md text-[13px] text-[#333] focus:outline-none focus:border-[#C2AA92] focus:ring-1 focus:ring-[#C2AA92] transition-all" 
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-[#4A4A4A] mb-1.5">Recipient's Name</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-4 py-2.5 bg-white border border-[#EAE8E3] rounded-md text-[13px] text-[#333] focus:outline-none focus:border-[#C2AA92] focus:ring-1 focus:ring-[#C2AA92] transition-all" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-[#4A4A4A] mb-1.5">Phone Number</label>
                                        <input 
                                            type="tel" 
                                            className="w-full px-4 py-2.5 bg-white border border-[#EAE8E3] rounded-md text-[13px] text-[#333] focus:outline-none focus:border-[#C2AA92] focus:ring-1 focus:ring-[#C2AA92] transition-all" 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-[#4A4A4A] mb-1.5">Full Address</label>
                                    <textarea 
                                        rows={3}
                                        placeholder="Street name, building, house no."
                                        className="w-full px-4 py-2.5 bg-white border border-[#EAE8E3] rounded-md text-[13px] text-[#333] focus:outline-none focus:border-[#C2AA92] focus:ring-1 focus:ring-[#C2AA92] transition-all resize-none" 
                                    ></textarea>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-[#4A4A4A] mb-1.5">Province</label>
                                        <select className="w-full px-4 py-2.5 bg-white border border-[#EAE8E3] rounded-md text-[13px] text-[#333] focus:outline-none focus:border-[#C2AA92] focus:ring-1 focus:ring-[#C2AA92] transition-all">
                                            <option>Jawa Barat</option>
                                            <option>DKI Jakarta</option>
                                            <option>Jawa Tengah</option>
                                            <option>Jawa Timur</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-[#4A4A4A] mb-1.5">City</label>
                                        <select className="w-full px-4 py-2.5 bg-white border border-[#EAE8E3] rounded-md text-[13px] text-[#333] focus:outline-none focus:border-[#C2AA92] focus:ring-1 focus:ring-[#C2AA92] transition-all">
                                            <option>Bandung</option>
                                            <option>Jakarta Selatan</option>
                                            <option>Surabaya</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-[#4A4A4A] mb-1.5">Postal Code</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-2.5 bg-white border border-[#EAE8E3] rounded-md text-[13px] text-[#333] focus:outline-none focus:border-[#C2AA92] focus:ring-1 focus:ring-[#C2AA92] transition-all" 
                                    />
                                </div>
                                <div className="pt-2 flex items-center">
                                    <input 
                                        type="checkbox" 
                                        id="set-default" 
                                        className="w-4 h-4 text-[#3C3428] rounded border-[#EAE8E3] focus:ring-[#C2AA92]"
                                    />
                                    <label htmlFor="set-default" className="ml-2 text-[12px] font-medium text-[#4A4A4A] cursor-pointer">
                                        Set as default address
                                    </label>
                                </div>
                            </form>
                        </div>
                        <div className="px-6 py-4 border-t border-[#EAE8E3] bg-[#FAF9F6] flex justify-end gap-3">
                            <button 
                                onClick={closeModal}
                                className="px-6 py-2.5 border border-[#EAE8E3] text-[#4A4A4A] text-[12px] font-bold rounded-md hover:bg-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    closeModal();
                                    setShowAlert(true);
                                    setTimeout(() => setShowAlert(false), 3000);
                                }}
                                className="px-6 py-2.5 bg-[#3C3428] text-white text-[12px] font-bold rounded-md hover:bg-[#2D261C] transition-colors"
                            >
                                Save Address
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ProfileLayout>
    );
}
