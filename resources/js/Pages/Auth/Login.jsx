import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        nik: '',
        password: '',
        remember: false,
    });

    const handleNikChange = (e) => {
        let val = e.target.value.replace(/[^0-9.]/g, '');
        // Auto-format: 000.00.00
        const digits = val.replace(/\./g, '');
        if (digits.length <= 3) {
            val = digits;
        } else if (digits.length <= 5) {
            val = digits.slice(0, 3) + '.' + digits.slice(3);
        } else {
            val = digits.slice(0, 3) + '.' + digits.slice(3, 5) + '.' + digits.slice(5, 7);
        }
        setData('nik', val);
    };

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                <p className="text-gray-400 mt-1">Sign in to your account</p>
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="nik" value="NIK / Employee ID" className="text-white" />

                    <TextInput
                        id="nik"
                        type="text"
                        name="nik"
                        value={data.nik}
                        className="mt-1 block w-full bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                        autoComplete="username"
                        isFocused={true}
                        placeholder="000.00.00"
                        maxLength={9}
                        onChange={handleNikChange}
                    />

                    <InputError message={errors.nik} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" className="text-white" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                            className="bg-white/10 border-white/20 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="ms-2 text-sm text-gray-300">
                            Remember me
                        </span>
                    </label>
                </div>

                <div className="mt-6">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition duration-300 shadow-lg shadow-blue-500/30 disabled:opacity-50"
                    >
                        {processing ? 'Signing in...' : 'Sign in'}
                    </button>
                </div>

                {canResetPassword && (
                    <div className="mt-4 text-center">
                        <Link
                            href={route('password.request')}
                            className="text-sm text-gray-400 hover:text-blue-400 transition duration-300"
                        >
                            Forgot your password?
                        </Link>
                    </div>
                )}
            </form>
        </GuestLayout>
    );
}
