import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Icon } from '@/Components/Icons';
import { Input, Select } from '@/Components/Input';

export default function Index({ logs, filters = {}, users = [], actions = [], summary = {} }) {
    const applyFilter = (key, value) => router.get('/shop-admin/activity-logs', { ...filters, [key]: value }, { preserveState: true, replace: true });
    const resetFilters = () => router.get('/shop-admin/activity-logs');

    return (
        <AdminLayout title="Activity Logs">
            <div className="mb-6 grid gap-4 md:grid-cols-4">
                <Metric label="Total logs" value={summary.total ?? 0} icon="file" />
                <Metric label="Today" value={summary.today ?? 0} icon="calendar" tone="emerald" />
                <Metric label="Updates" value={summary.updates ?? 0} icon="edit" tone="amber" />
                <Metric label="Deletes" value={summary.deletes ?? 0} icon="trash" tone="red" />
            </div>

            <div className="mb-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                <div className="grid gap-4 md:grid-cols-6">
                    <div className="md:col-span-2"><Input label="Search" defaultValue={filters.search ?? ''} onKeyDown={e => e.key === 'Enter' && applyFilter('search', e.currentTarget.value)} placeholder="Action, user, IP..." /></div>
                    <Select label="Action" value={filters.action ?? ''} onChange={e => applyFilter('action', e.target.value)}><option value="">All actions</option>{actions.map(action => <option key={action} value={action}>{action}</option>)}</Select>
                    <Select label="User" value={filters.user_id ?? ''} onChange={e => applyFilter('user_id', e.target.value)}><option value="">All users</option>{users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}</Select>
                    <Input label="From" type="date" value={filters.date_from ?? ''} onChange={e => applyFilter('date_from', e.target.value)} />
                    <Input label="To" type="date" value={filters.date_to ?? ''} onChange={e => applyFilter('date_to', e.target.value)} />
                </div>
                <button onClick={resetFilters} className="mt-4 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-bold dark:border-slate-700">Reset filters</button>
            </div>

            <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                        <thead className="bg-slate-50 dark:bg-slate-950"><tr><Th>Date</Th><Th>User</Th><Th>Action</Th><Th>Target</Th><Th>IP</Th><Th>Changes</Th></tr></thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {logs.data.map(log => (
                                <tr key={log.id}>
                                    <Td><div className="font-bold">{new Date(log.created_at).toLocaleDateString()}</div><div className="text-xs text-slate-500">{new Date(log.created_at).toLocaleTimeString()}</div></Td>
                                    <Td><div className="font-black">{log.user?.name ?? 'System'}</div><div className="text-xs text-slate-500">{log.user?.email ?? 'N/A'}</div></Td>
                                    <Td><span className={actionBadge(log.action)}>{log.action}</span></Td>
                                    <Td><div className="max-w-[260px] truncate font-semibold">{shortClass(log.loggable_type)}</div><div className="text-xs text-slate-500">ID: {log.loggable_id ?? 'N/A'}</div></Td>
                                    <Td><div>{log.ip_address ?? 'N/A'}</div><div className="max-w-[220px] truncate text-xs text-slate-500">{log.user_agent ?? 'N/A'}</div></Td>
                                    <Td><ChangeBox oldValues={log.old_values} newValues={log.new_values} /></Td>
                                </tr>
                            ))}
                            {logs.data.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-500">No activity logs found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
                {logs.links.map((link, index) => <a key={index} href={link.url ?? '#'} className={`rounded-xl px-4 py-2 text-sm ${link.active ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-800'} ${!link.url ? 'pointer-events-none opacity-50' : ''}`} dangerouslySetInnerHTML={{ __html: link.label }} />)}
            </div>
        </AdminLayout>
    );
}

function ChangeBox({ oldValues, newValues }) {
    const changed = diffKeys(oldValues, newValues);
    if (!changed.length) return <span className="text-slate-500">No field diff</span>;
    return <details><summary className="cursor-pointer font-bold text-blue-600">{changed.length} field(s)</summary><div className="mt-2 max-h-44 min-w-[280px] overflow-auto rounded-2xl bg-slate-50 p-3 text-xs dark:bg-slate-950">{changed.map(key => <div key={key} className="mb-2"><div className="font-black">{key}</div><div className="text-red-600">Old: {formatValue(oldValues?.[key])}</div><div className="text-emerald-600">New: {formatValue(newValues?.[key])}</div></div>)}</div></details>;
}

function diffKeys(oldValues, newValues) {
    const oldObj = oldValues ?? {};
    const newObj = newValues ?? {};
    const keys = [...new Set([...Object.keys(oldObj), ...Object.keys(newObj)])];
    return keys.filter(key => JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])).slice(0, 12);
}
function formatValue(value) { if (value === null || value === undefined || value === '') return 'N/A'; if (typeof value === 'object') return JSON.stringify(value); return String(value); }
function shortClass(value) { return value ? value.split('\\').pop() : 'N/A'; }
function actionBadge(action) { const base = 'rounded-full px-3 py-1 text-xs font-bold '; if (action.includes('deleted')) return base + 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300'; if (action.includes('updated')) return base + 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'; if (action.includes('login')) return base + 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'; return base + 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300'; }
function Metric({ label, value, icon, tone = 'blue' }) { const tones = { blue: 'bg-blue-600', emerald: 'bg-emerald-600', amber: 'bg-amber-600', red: 'bg-red-600' }; return <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"><div className={`mb-4 grid h-11 w-11 place-items-center rounded-2xl text-white ${tones[tone]}`}><Icon name={icon} /></div><div className="text-2xl font-black">{value}</div><div className="text-sm text-slate-500">{label}</div></div>; }
function Th({ children }) { return <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">{children}</th>; }
function Td({ children }) { return <td className="px-4 py-4 align-top">{children}</td>; }
