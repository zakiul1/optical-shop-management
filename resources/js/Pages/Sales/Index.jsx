import { Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Icon } from '@/Components/Icons';
import ConfirmModal from '@/Components/ConfirmModal';
import AuditMeta from '@/Components/AuditMeta';
import { useState } from 'react';

function money(value) {
    return `৳ ${Number(value ?? 0).toFixed(2)}`;
}

function SummaryCard({ title, value, icon }) {
    return (
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500">{title}</p>
                    <p className="mt-2 text-2xl font-black">{value}</p>
                </div>
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"><Icon name={icon} /></div>
            </div>
        </div>
    );
}

export default function Index({ sales, filters = {}, summary = {} }) {
    const [deleteTarget, setDeleteTarget] = useState(null);
    const { delete: destroy, processing } = useForm();

    const applyFilter = (key, value) => {
        router.get('/shop-admin/sales', { ...filters, [key]: value }, { preserveState: true, replace: true });
    };

    const removeSale = () => {
        if (!deleteTarget) return;
        destroy(`/shop-admin/sales/${deleteTarget.id}`, { onSuccess: () => setDeleteTarget(null) });
    };

    return (
        <AdminLayout title="Sales & Invoices">
            <div className="grid gap-4 md:grid-cols-4">
                <SummaryCard title="Today's Sales" value={money(summary.today_total)} icon="receipt" />
                <SummaryCard title="Today's Paid" value={money(summary.today_paid)} icon="cart" />
                <SummaryCard title="Today's Due" value={money(summary.today_due)} icon="alert" />
                <SummaryCard title="Invoices Today" value={summary.today_count ?? 0} icon="box" />
            </div>

            <div className="my-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="grid gap-3 md:grid-cols-5">
                    <div className="relative md:col-span-2">
                        <Icon name="search" className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                        <input
                            defaultValue={filters.search ?? ''}
                            onKeyDown={e => e.key === 'Enter' && applyFilter('search', e.currentTarget.value)}
                            placeholder="Invoice, customer, phone..."
                            className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-10 pr-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900"
                        />
                    </div>
                    <select value={filters.payment_status ?? ''} onChange={e => applyFilter('payment_status', e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                        <option value="">All Status</option>
                        <option value="paid">Paid</option>
                        <option value="partial">Partial</option>
                        <option value="due">Due</option>
                    </select>
                    <input type="date" value={filters.from ?? ''} onChange={e => applyFilter('from', e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
                    <input type="date" value={filters.to ?? ''} onChange={e => applyFilter('to', e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
                </div>
                <Link href="/shop-admin/sales/create" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-600/20"><Icon name="plus" /> New Sale</Link>
            </div>

            <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950">
                            <tr>
                                <th className="px-5 py-4">Invoice</th>
                                <th className="px-5 py-4">Customer</th>
                                <th className="px-5 py-4">Items</th>
                                <th className="px-5 py-4">Total</th>
                                <th className="px-5 py-4">Paid</th>
                                <th className="px-5 py-4">Due</th>
                                <th className="px-5 py-4">Status</th>
                                <th className="px-5 py-4">Created / Updated By</th>
                                <th className="px-5 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {sales.data.map(sale => (
                                <tr key={sale.id}>
                                    <td className="px-5 py-4 font-bold">{sale.invoice_no}<p className="text-xs font-normal text-slate-500">{new Date(sale.sale_date).toLocaleString()}</p></td>
                                    <td className="px-5 py-4">{sale.customer?.name ?? 'Walk-in'}<p className="text-xs text-slate-500">{sale.customer?.phone ?? ''}</p></td>
                                    <td className="px-5 py-4">{sale.items_count}</td>
                                    <td className="px-5 py-4 font-bold">{money(sale.total)}</td>
                                    <td className="px-5 py-4">{money(sale.paid_amount)}</td>
                                    <td className="px-5 py-4">{money(sale.due_amount)}</td>
                                    <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${sale.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'}`}>{sale.payment_status}</span></td>
                                    <td className="px-5 py-4"><AuditMeta item={sale} compact /></td>
                                    <td className="px-5 py-4">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/shop-admin/sales/${sale.id}`} className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><Icon name="eye" /></Link>
                                            <Link href={`/shop-admin/sales/${sale.id}/invoice`} className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><Icon name="download" /></Link>
                                            <button disabled={processing} onClick={() => setDeleteTarget(sale)} className="rounded-xl border border-red-200 p-2 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"><Icon name="trash" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {sales.data.length === 0 && <div className="mt-4 rounded-3xl bg-white p-10 text-center text-slate-500 dark:bg-slate-900">No sale found.</div>}

            <div className="mt-6 flex flex-wrap gap-2">
                {sales.links.map((link, index) => (
                    <Link key={index} href={link.url ?? '#'} preserveScroll className={`rounded-xl px-4 py-2 text-sm ${link.active ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-800'} ${!link.url ? 'pointer-events-none opacity-50' : ''}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                ))}
            </div>
            <ConfirmModal
                show={Boolean(deleteTarget)}
                title="Delete invoice and return stock?"
                message={`Invoice ${deleteTarget?.invoice_no ?? ''} will be deleted and all sold quantities will be returned to stock.`}
                confirmText="Delete & Return Stock"
                processing={processing}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={removeSale}
            />
        </AdminLayout>
    );
}
