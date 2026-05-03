import { Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Icon } from '@/Components/Icons';
import ConfirmModal from '@/Components/ConfirmModal';
import AuditMeta from '@/Components/AuditMeta';
import { useState } from 'react';

export default function Index({ purchases, filters = {}, summary = {} }) {
    const [deleteTarget, setDeleteTarget] = useState(null);
    const { delete: destroy, processing } = useForm();
    const applyFilter = (key, value) => router.get('/shop-admin/purchases', { ...filters, [key]: value }, { preserveState: true, replace: true });
    const removePurchase = () => {
        if (!deleteTarget) return;
        destroy(`/shop-admin/purchases/${deleteTarget.id}`, { onSuccess: () => setDeleteTarget(null) });
    };

    return (
        <AdminLayout title="Purchases / Stock In">
            <div className="mb-6 grid gap-4 md:grid-cols-4">
                <Metric label="Today Purchase" value={`৳ ${Number(summary.today_total ?? 0).toFixed(2)}`} icon="truck" />
                <Metric label="Today Paid" value={`৳ ${Number(summary.today_paid ?? 0).toFixed(2)}`} icon="money" tone="emerald" />
                <Metric label="Today Due" value={`৳ ${Number(summary.today_due ?? 0).toFixed(2)}`} icon="alert" tone="red" />
                <Metric label="Orders Today" value={summary.today_count ?? 0} icon="file" tone="purple" />
            </div>

            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-3 md:flex-row">
                    <div className="relative">
                        <Icon name="search" className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                        <input defaultValue={filters.search ?? ''} onKeyDown={e => e.key === 'Enter' && applyFilter('search', e.currentTarget.value)} placeholder="Search purchase/supplier..." className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-10 pr-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 md:w-80" />
                    </div>
                    <select value={filters.payment_status ?? ''} onChange={e => applyFilter('payment_status', e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                        <option value="">All Payments</option><option value="paid">Paid</option><option value="partial">Partial</option><option value="due">Due</option>
                    </select>
                    <input type="date" value={filters.from ?? ''} onChange={e => applyFilter('from', e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
                    <input type="date" value={filters.to ?? ''} onChange={e => applyFilter('to', e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
                </div>
                <Link href="/shop-admin/purchases/create" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white shadow-lg shadow-blue-600/20"><Icon name="plus" /> New Purchase</Link>
            </div>

            <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                        <thead className="bg-slate-50 dark:bg-slate-950"><tr><Th>Purchase</Th><Th>Supplier</Th><Th>Items</Th><Th>Total</Th><Th>Paid/Due</Th><Th>Status</Th><Th>Created / Updated By</Th><Th>Actions</Th></tr></thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {purchases.data.map(purchase => (
                                <tr key={purchase.id}>
                                    <Td><Link href={`/shop-admin/purchases/${purchase.id}`} className="font-black text-blue-600">{purchase.purchase_no}</Link><div className="text-xs text-slate-500">{purchase.purchase_date}</div></Td>
                                    <Td>{purchase.supplier?.name ?? 'Walk-in/Unknown'}<div className="text-xs text-slate-500">{purchase.supplier?.phone ?? ''}</div></Td>
                                    <Td><span className="font-bold">{purchase.items_count}</span> line items</Td>
                                    <Td><span className="font-black">৳ {Number(purchase.total).toFixed(2)}</span><div className="text-xs text-slate-500">Discount: ৳ {Number(purchase.discount).toFixed(2)}</div></Td>
                                    <Td><div>Paid: ৳ {Number(purchase.paid_amount).toFixed(2)}</div><div className="text-xs text-red-500">Due: ৳ {Number(purchase.due_amount).toFixed(2)}</div></Td>
                                    <Td><Status status={purchase.payment_status} /></Td>
                                    <Td><AuditMeta item={purchase} compact /></Td>
                                    <Td><div className="flex gap-2"><Link href={`/shop-admin/purchases/${purchase.id}`} className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><Icon name="eye" /></Link><button disabled={processing} onClick={() => setDeleteTarget(purchase)} className="rounded-xl border border-red-200 p-2 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"><Icon name="trash" /></button></div></Td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
                {purchases.links.map((link, index) => <Link key={index} href={link.url ?? '#'} className={`rounded-xl px-4 py-2 text-sm ${link.active ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-800'} ${!link.url ? 'pointer-events-none opacity-50' : ''}`} dangerouslySetInnerHTML={{ __html: link.label }} />)}
            </div>
            <ConfirmModal
                show={Boolean(deleteTarget)}
                title="Delete purchase and reverse stock?"
                message={`Purchase ${deleteTarget?.purchase_no ?? ''} will be deleted and all stock-in quantities from this purchase will be reversed.`}
                confirmText="Delete & Reverse Stock"
                processing={processing}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={removePurchase}
            />
        </AdminLayout>
    );
}
function Metric({ label, value, icon, tone = 'blue' }) { const tones = { blue: 'bg-blue-600', emerald: 'bg-emerald-600', red: 'bg-red-600', purple: 'bg-violet-600' }; return <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"><div className={`mb-4 grid h-11 w-11 place-items-center rounded-2xl text-white ${tones[tone]}`}><Icon name={icon} /></div><div className="text-xl font-black md:text-2xl">{value}</div><div className="text-sm text-slate-500">{label}</div></div>; }
function Status({ status }) { const cls = status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : status === 'partial' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300'; return <span className={`rounded-full px-3 py-1 text-xs font-bold ${cls}`}>{status}</span>; }
function Th({ children }) { return <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">{children}</th>; }
function Td({ children }) { return <td className="px-4 py-4 align-top">{children}</td>; }
