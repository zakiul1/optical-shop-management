import { router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Input, Select } from '@/Components/Input';
import { Icon } from '@/Components/Icons';
import ConfirmModal from '@/Components/ConfirmModal';
import AuditMeta from '@/Components/AuditMeta';
import { useState } from 'react';

export default function Index({ categories = [] }) {
    const [deleteTarget, setDeleteTarget] = useState(null);
    const { data, setData, post, delete: destroy, processing, errors, reset } = useForm({ name: '', type: 'medicine', is_active: true });

    const submit = (e) => {
        e.preventDefault();
        post('/shop-admin/categories', { onSuccess: () => reset() });
    };

    const remove = () => {
        if (!deleteTarget) return;
        destroy(`/shop-admin/categories/${deleteTarget.id}`, { preserveScroll: true, onSuccess: () => setDeleteTarget(null) });
    };

    return (
        <AdminLayout title="Categories">
            <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
                <form onSubmit={submit} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                    <h2 className="mb-4 text-lg font-bold">Add Category</h2>
                    <div className="space-y-4">
                        <Input label="Category Name" value={data.name} onChange={e => setData('name', e.target.value)} error={errors.name} />
                        <Select label="Type" value={data.type} onChange={e => setData('type', e.target.value)} error={errors.type}>
                            <option value="medicine">Medicine</option>
                            <option value="glass">Glass</option>
                            <option value="general">General</option>
                        </Select>
                        <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} /> Active</label>
                        <button disabled={processing} className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-600/20">Save Category</button>
                    </div>
                </form>

                <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                    <h2 className="mb-4 text-lg font-bold">Category List</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="text-slate-500"><tr><th className="py-2">Name</th><th>Type</th><th>Products</th><th>Status</th><th>Created / Updated By</th><th className="text-right">Action</th></tr></thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {categories.map(category => (
                                    <tr key={category.id}>
                                        <td className="py-3 font-semibold">{category.name}</td>
                                        <td>{category.type}</td>
                                        <td>{category.products_count}</td>
                                        <td>{category.is_active ? 'Active' : 'Inactive'}</td>
                                        <td><AuditMeta item={category} compact /></td>
                                        <td className="text-right"><button onClick={() => setDeleteTarget(category)} className="rounded-xl border border-red-200 p-2 text-red-600 dark:border-red-900"><Icon name="trash" /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
            <ConfirmModal
                show={Boolean(deleteTarget)}
                title="Delete category?"
                message={`You are deleting ${deleteTarget?.name ?? 'this category'}. This will fail safely if related products still use it.`}
                confirmText="Delete Category"
                processing={processing}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={remove}
            />
        </AdminLayout>
    );
}
