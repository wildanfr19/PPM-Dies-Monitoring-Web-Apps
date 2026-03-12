import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function UserCreate({ auth, roles }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        nik: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'production',
        photo: null,
        is_active: true,
    });

    const photoInput = useRef();
    const [photoPreview, setPhotoPreview] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('users.store'), {
            forceFormData: true,
            onSuccess: () => reset(),
        });
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('photo', file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setPhotoPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearPhoto = () => {
        setData('photo', null);
        setPhotoPreview(null);
        if (photoInput.current) {
            photoInput.current.value = '';
        }
    };

    return (
        <AppLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Add New User
                </h2>
            }
        >
            <Head title="Add New User" />

            <div className="py-6 px-6">
                <div className="max-w-2xl mx-auto">
                    {/* Breadcrumb */}
                    <div className="mb-6">
                        <Link
                            href={route('users.index')}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-2"
                        >
                            ← Back to Users
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">

                            {/* Photo Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Profile Photo
                                </label>
                                <div className="flex items-center gap-6">
                                    <div className="flex-shrink-0">
                                        {photoPreview ? (
                                            <img
                                                src={photoPreview}
                                                alt="Preview"
                                                className="h-24 w-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
                                            />
                                        ) : (
                                            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-2xl">
                                                👤
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <input
                                            type="file"
                                            ref={photoInput}
                                            onChange={handlePhotoChange}
                                            accept="image/jpeg,image/png,image/jpg,image/gif"
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => photoInput.current.click()}
                                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                        >
                                            📷 Choose Photo
                                        </button>
                                        {photoPreview && (
                                            <button
                                                type="button"
                                                onClick={clearPhoto}
                                                className="px-4 py-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400"
                                            >
                                                Remove Photo
                                            </button>
                                        )}
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            JPG, PNG, GIF up to 2MB
                                        </p>
                                    </div>
                                </div>
                                {errors.photo && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.photo}</p>
                                )}
                            </div>

                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                                )}
                            </div>

                            {/* NIK */}
                            <div>
                                <label htmlFor="nik" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    NIK / ID Karyawan <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="nik"
                                    type="text"
                                    value={data.nik}
                                    onChange={(e) => {
                                        let val = e.target.value.replace(/[^0-9.]/g, '');
                                        const digits = val.replace(/\./g, '');
                                        if (digits.length <= 3) val = digits;
                                        else if (digits.length <= 5) val = digits.slice(0, 3) + '.' + digits.slice(3);
                                        else val = digits.slice(0, 3) + '.' + digits.slice(3, 5) + '.' + digits.slice(5, 7);
                                        setData('nik', val);
                                    }}
                                    placeholder="000.00.00"
                                    maxLength={9}
                                    className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                                {errors.nik && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nik}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">Format: 000.00.00</p>
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Confirm Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Role */}
                            <div>
                                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Role <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="role"
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                >
                                    {Object.entries(roles).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                                {errors.role && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.role}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Admin: Full access | Mtn Dies: Manage dies & PPM | PPIC: Schedule & alerts | Production: View & log production
                                </p>
                            </div>

                            {/* Active Status */}
                            <div>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Active User
                                    </span>
                                </label>
                                <p className="ml-6 text-xs text-gray-500 dark:text-gray-400">
                                    Inactive users cannot log in to the system
                                </p>
                            </div>

                            {/* Submit */}
                            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <Link
                                    href={route('users.index')}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {processing ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
