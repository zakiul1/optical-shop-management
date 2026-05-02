import { router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Icon } from '@/Components/Icons';
import { Input, Textarea } from '@/Components/Input';
import ConfirmModal from '@/Components/ConfirmModal';
import AuditMeta from '@/Components/AuditMeta';
import { useEffect, useState } from 'react';

const blankSupplier = { name: '', phone: '', email: '', address: '', notes: '', is_active: true };

export default function Index({ suppliers, filters = {}, summary = {} }) {
    const [editing, setEditing] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const { data, setData, post, put, delete: destroy, reset, processing, errors } = useForm(blankSupplier);

    useEffect(() => {
        if (editing) {
            setData({
                name: editing.name ?? '',
                phone: editing.phone ?? '',
                email: editing.email ?? '',
                address: editing.address ?? '',
                notes: editing.notes ?? '',
                is_active: Boolean(editing.is_active),
            });
        } else {
            setData(blankSupplier);
        }
    }, [editing]);

    const submit = (e) => {
        e.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => { reset(); setEditing(null); } };
        if (editing) put(`/suppliers/${editing.id}`, options);
        else post('/suppliers', options);
    };

    const applyFilter = (key, value) => router.get('/suppliers', { ...filters, [key]: value }, { preserveState: true, replace: true });

    const removeSupplier = () => {
        if (!deleteTarget) return;
        destroy(`/suppliers/${deleteTarget.id}`, { preserveScroll: true, onSuccess: () => setDeleteTarget(null) });
    };

    return (
        <AdminLayout title="Suppliers">
            <div className="mb-6 grid gap-4 md:grid-cols-3">
                <Metric label="Total suppliers" value={summary.total ?? 0} icon="users" />
                <Metric label="Active" value={summary.active ?? 0} icon="check" tone="emerald" />
                <Metric label="Inactive" value={summary.inactive ?? 0} icon="x" tone="red" />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
                <section>
                    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="relative">
                            <Icon name="search" className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                            <input
                                defaultValue={filters.search ?? ''}
                                onKeyDown={e => e.key === 'Enter' && applyFilter('search', e.currentTarget.value)}
                                placeholder="Search supplier, phone, email..."
                                className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-10 pr-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 md:w-96"
                            />
                        </div>
                        <select value={filters.status ?? ''} onChange={e => applyFilter('status', e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                                <thead className="bg-slate-50 dark:bg-slate-950">
                                    <tr>
                                        <Th>Supplier</Th><Th>Contact</Th><Th>Purchases</Th><Th>Status</Th><Th>Created / Updated By</Th><Th>Actions</Th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {suppliers.data.map(supplier => (
                                        <tr key={supplier.id}>
                                            <Td><div className="font-black">{supplier.name}</div><div className="text-xs text-slate-500">{supplier.address ?? 'No address'}</div></Td>
                                            <Td><div>{supplier.phone ?? 'N/A'}</div><div className="text-xs text-slate-500">{supplier.email ?? 'N/A'}</div></Td>
                                            <Td><div className="font-bold">{supplier.purchases_count} orders</div><div className="text-xs text-slate-500">৳ {Number(supplier.total_purchase_amount ?? 0).toFixed(2)}</div></Td>
                                            <Td><span className={`rounded-full px-3 py-1 text-xs font-bold ${supplier.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300'}`}>{supplier.is_active ? 'Active' : 'Inactive'}</span></Td>
                                            <Td><AuditMeta item={supplier} compact /></Td>
                                            <Td>
                                                <div className="flex gap-2">
                                                    <button onClick={() => setEditing(supplier)} className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><Icon name="edit" /></button>
                                                    <button onClick={() => setDeleteTarget(supplier)} className="rounded-xl border border-red-200 p-2 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"><Icon name="trash" /></button>
                                                </div>
                                            </Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                        {suppliers.links.map((link, index) => (
                            <a key={index} href={link.url ?? '#'} className={`rounded-xl px-4 py-2 text-sm ${link.active ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-800'} ${!link.url ? 'pointer-events-none opacity-50' : ''}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                        ))}
                    </div>
                </section>

                <aside className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-black">{editing ? 'Edit Supplier' : 'Add Supplier'}</h2>
                        {editing && <button className="text-sm font-semibold text-blue-600" onClick={() => setEditing(null)}>New</button>}
                    </div>
                    <form onSubmit={submit} className="space-y-4">
                        <Input label="Supplier Name" value={data.name} onChange={e => setData('name', e.target.value)} error={errors.name} required />
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                            <Input label="Phone" value={data.phone} onChange={e => setData('phone', e.target.value)} error={errors.phone} />
                            <Input label="Email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} error={errors.email} />
                        </div>
                        <Textarea label="Address" value={data.address} onChange={e => setData('address', e.target.value)} error={errors.address} rows="3" />
                        <Textarea label="Notes" value={data.notes} onChange={e => setData('notes', e.target.value)} error={errors.notes} rows="3" />
                        <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} /> Active supplier</label>
                        <button disabled={processing} className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-bold text-white shadow-lg shadow-blue-600/20 disabled:opacity-50">{editing ? 'Update Supplier' : 'Save Supplier'}</button>
                    </form>
                </aside>
            </div>
            <ConfirmModal
                show={Boolean(deleteTarget)}
                title="Delete supplier?"
                message={`You are deleting ${deleteTarget?.name ?? 'this supplier'}. If this supplier has purchases or products, the system will block deletion and show a notification.`}
                confirmText="Delete Supplier"
                processing={processing}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={removeSupplier}
            />
        </AdminLayout>
    );
}

function Metric({ label, value, icon, tone = 'blue' }) {
    const tones = { blue: 'bg-blue-600', emerald: 'bg-emerald-600', red: 'bg-red-600' };
    return <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"><div className={`mb-4 grid h-11 w-11 place-items-center rounded-2xl text-white ${tones[tone]}`}><Icon name={icon} /></div><div className="text-2xl font-black">{value}</div><div className="text-sm text-slate-500">{label}</div></div>;
}
function Th({ children }) { return <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">{children}</th>; }
function Td({ children }) { return <td className="px-4 py-4 align-top">{children}</td>; }
