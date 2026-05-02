import { router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Icon } from '@/Components/Icons';
import { Input, Select } from '@/Components/Input';
import ConfirmModal from '@/Components/ConfirmModal';
import ImageUpload from '@/Components/ImageUpload';

const blankUser = { name: '', email: '', phone: '', photo: null, remove_photo: false, role: 'staff', password: '', is_active: true };

export default function Index({ users, filters = {}, summary = {} }) {
    const currentUser = usePage().props.auth?.user;
    const [editing, setEditing] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const { data, setData, post, delete: destroy, reset, processing, errors } = useForm(blankUser);

    useEffect(() => {
        if (editing) {
            setData({
                name: editing.name ?? '',
                email: editing.email ?? '',
                phone: editing.phone ?? '',
                photo: null,
                remove_photo: false,
                _method: 'put',
                role: editing.role ?? 'staff',
                password: '',
                is_active: Boolean(editing.is_active),
            });
        } else {
            setData(blankUser);
        }
    }, [editing]);

    const submit = (e) => {
        e.preventDefault();
        const options = { preserveScroll: true, forceFormData: true, onSuccess: () => { reset(); setEditing(null); } };
        editing ? post(`/users/${editing.id}`, options) : post('/users', options);
    };

    const applyFilter = (key, value) => router.get('/users', { ...filters, [key]: value }, { preserveState: true, replace: true });
    const remove = () => {
        if (!deleteTarget) return;
        destroy(`/users/${deleteTarget.id}`, { preserveScroll: true, onSuccess: () => setDeleteTarget(null) });
    };

    return (
        <AdminLayout title="User Access Control">
            <div className="mb-6 grid gap-4 md:grid-cols-4">
                <Metric label="Total Users" value={summary.total ?? 0} icon="users" />
                <Metric label="Active" value={summary.active ?? 0} icon="check" tone="emerald" />
                <Metric label="Inactive" value={summary.inactive ?? 0} icon="x" tone="red" />
                <Metric label="Admins" value={summary.admins ?? 0} icon="shield" tone="purple" />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
                <section>
                    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="relative">
                            <Icon name="search" className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                            <input defaultValue={filters.search ?? ''} onKeyDown={e => e.key === 'Enter' && applyFilter('search', e.currentTarget.value)} placeholder="Search name, email, phone..." className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-10 pr-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 md:w-96" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <select value={filters.role ?? ''} onChange={e => applyFilter('role', e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                                <option value="">All roles</option><option value="admin">Admin</option><option value="manager">Manager</option><option value="staff">Staff</option>
                            </select>
                            <select value={filters.status ?? ''} onChange={e => applyFilter('status', e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                                <option value="">All status</option><option value="active">Active</option><option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                                <thead className="bg-slate-50 dark:bg-slate-950"><tr><Th>User</Th><Th>Role</Th><Th>Status</Th><Th>Activity</Th><Th>Actions</Th></tr></thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {users.data.map(user => (
                                        <tr key={user.id}>
                                            <Td><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center overflow-hidden rounded-2xl bg-blue-600 text-sm font-black text-white">{user.photo_url ? <img src={user.photo_url} alt={user.name} className="h-full w-full object-cover" /> : user.name?.charAt(0)}</div><div><div className="font-black">{user.name}</div><div className="text-xs text-slate-500">{user.email}</div><div className="text-xs text-slate-500">{user.phone ?? 'No phone'}</div></div></div></Td>
                                            <Td><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{user.role}</span></Td>
                                            <Td><span className={`rounded-full px-3 py-1 text-xs font-bold ${user.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300'}`}>{user.is_active ? 'Active' : 'Inactive'}</span></Td>
                                            <Td>{user.activity_logs_count ?? 0} logs</Td>
                                            <Td><div className="flex gap-2"><button onClick={() => setEditing(user)} className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><Icon name="edit" /></button>{currentUser?.id !== user.id && <button onClick={() => setDeleteTarget(user)} className="rounded-xl border border-red-200 p-2 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"><Icon name="trash" /></button>}</div></Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                        {users.links.map((link, index) => <a key={index} href={link.url ?? '#'} className={`rounded-xl px-4 py-2 text-sm ${link.active ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-800'} ${!link.url ? 'pointer-events-none opacity-50' : ''}`} dangerouslySetInnerHTML={{ __html: link.label }} />)}
                    </div>
                </section>

                <aside className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                    <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-black">{editing ? 'Edit User' : 'Add User'}</h2>{editing && <button className="text-sm font-semibold text-blue-600" onClick={() => setEditing(null)}>New</button>}</div>
                    <form onSubmit={submit} className="space-y-4">
                        <Input label="Name" value={data.name} onChange={e => setData('name', e.target.value)} error={errors.name} required />
                        <Input label="Email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} error={errors.email} required />
                        <Input label="Phone" value={data.phone} onChange={e => setData('phone', e.target.value)} error={errors.phone} />
                        <ImageUpload label="Admin/User Photo" files={data.photo ? [data.photo] : []} onChange={file => setData('photo', file)} multiple={false} existing={editing?.photo_url && !data.remove_photo ? [{ id: editing.id, url: editing.photo_url }] : []} removeIds={data.remove_photo ? [editing?.id] : []} onToggleRemove={() => setData('remove_photo', !data.remove_photo)} error={errors.photo} />
                        <Select label="Role" value={data.role} onChange={e => setData('role', e.target.value)} error={errors.role}><option value="admin">Admin</option><option value="manager">Manager</option><option value="staff">Staff</option></Select>
                        <Input label={editing ? 'New Password (optional)' : 'Password'} type="password" value={data.password} onChange={e => setData('password', e.target.value)} error={errors.password} required={!editing} />
                        <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} /> Active user</label>
                        <button disabled={processing} className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-bold text-white shadow-lg shadow-blue-600/20 disabled:opacity-50">{editing ? 'Update User' : 'Save User'}</button>
                    </form>
                </aside>
            </div>
            <ConfirmModal
                show={Boolean(deleteTarget)}
                title="Delete user account?"
                message={`You are deleting ${deleteTarget?.name ?? 'this user'}. Their old activity logs will remain for audit history.`}
                confirmText="Delete User"
                processing={processing}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={remove}
            />
        </AdminLayout>
    );
}

function Metric({ label, value, icon, tone = 'blue' }) { const tones = { blue: 'bg-blue-600', emerald: 'bg-emerald-600', red: 'bg-red-600', purple: 'bg-purple-600' }; return <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"><div className={`mb-4 grid h-11 w-11 place-items-center rounded-2xl text-white ${tones[tone]}`}><Icon name={icon} /></div><div className="text-2xl font-black">{value}</div><div className="text-sm text-slate-500">{label}</div></div>; }
function Th({ children }) { return <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">{children}</th>; }
function Td({ children }) { return <td className="px-4 py-4 align-top">{children}</td>; }
