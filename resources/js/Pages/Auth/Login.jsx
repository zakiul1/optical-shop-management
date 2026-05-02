import { Head, useForm } from '@inertiajs/react';
import { Icon } from '@/Components/Icons';
import { Input } from '@/Components/Input';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({ email: '', password: '', remember: false });

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <>
            <Head title="Login" />
            <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
                <div className="grid min-h-screen lg:grid-cols-[1.1fr_.9fr]">
                    <section className="hidden items-center justify-center bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-950 p-10 text-white lg:flex">
                        <div className="max-w-xl">
                            <div className="mb-8 grid h-20 w-20 place-items-center rounded-3xl bg-white/15 shadow-2xl backdrop-blur"><Icon name="eye" className="h-10 w-10" /></div>
                            <h1 className="text-5xl font-black leading-tight">Madina Chokh Seba & Optical</h1>
                            <p className="mt-5 text-lg text-blue-100">Modern shop management for medicine, glasses, invoice, stock, purchase, reports and audit security.</p>
                            <div className="mt-10 grid grid-cols-3 gap-4 text-sm">
                                <Badge icon="box" label="Stock" />
                                <Badge icon="receipt" label="Invoice" />
                                <Badge icon="chart" label="Reports" />
                            </div>
                        </div>
                    </section>

                    <section className="flex items-center justify-center p-5">
                        <form onSubmit={submit} className="w-full max-w-md rounded-[2rem] bg-white p-7 shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                            <div className="mb-7 text-center">
                                <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-blue-600 text-white shadow-lg shadow-blue-600/30"><Icon name="eye" className="h-8 w-8" /></div>
                                <h2 className="text-3xl font-black">Admin Login</h2>
                                <p className="mt-2 text-sm text-slate-500">Sign in to manage your optical shop.</p>
                            </div>
                            <div className="space-y-4">
                                <Input label="Email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} error={errors.email} required autoFocus />
                                <Input label="Password" type="password" value={data.password} onChange={e => setData('password', e.target.value)} error={errors.password} required />
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                                    <input type="checkbox" checked={data.remember} onChange={e => setData('remember', e.target.checked)} /> Remember me
                                </label>
                                <button disabled={processing} className="w-full rounded-2xl bg-blue-600 px-5 py-3 font-black text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:opacity-60">{processing ? 'Signing in...' : 'Login'}</button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </>
    );
}

function Badge({ icon, label }) {
    return <div className="rounded-2xl bg-white/10 p-4 backdrop-blur"><Icon name={icon} /><div className="mt-2 font-bold">{label}</div></div>;
}
