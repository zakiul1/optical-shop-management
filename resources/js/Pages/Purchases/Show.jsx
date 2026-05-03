import { Link, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Icon } from '@/Components/Icons';
import ConfirmModal from '@/Components/ConfirmModal';
import { useState } from 'react';
import { label } from '@/i18n';
import AuditMeta from '@/Components/AuditMeta';

export default function Show({ purchase }) {
    const locale = usePage().props.locale || 'en';
    const tr = (key) => label(key, locale);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const { delete: destroy, processing } = useForm();
    const removePurchase = () => destroy(`/shop-admin/purchases/${purchase.id}`, { onSuccess: () => setDeleteOpen(false) });

    return (
        <AdminLayout title={`${tr('purchase')} ${purchase.purchase_no}`}>
            <div className="mb-5 flex flex-wrap gap-3 print:hidden">
                <Link href="/shop-admin/purchases" className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 font-semibold ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"><Icon name="x" /> {tr('back')}</Link>
                <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 font-semibold text-white"><Icon name="download" /> {tr('downloadPdf')}</button>
                <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 font-semibold text-white"><Icon name="print" /> {tr('printSavePdf')}</button>
                <button disabled={processing} onClick={() => setDeleteOpen(true)} className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2 font-semibold text-white"><Icon name="trash" /> Delete & Reverse</button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_360px] print:block">
                <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 print:shadow-none print:ring-0">
                    <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-6 dark:border-slate-800 md:flex-row md:items-start md:justify-between">
                        <div><h2 className="text-2xl font-black">{locale === 'bn' ? 'ক্রয় রসিদ' : 'Purchase Receipt'}</h2><p className="text-slate-500">{purchase.purchase_no}</p><p className="text-sm text-slate-500">Date: {purchase.purchase_date}</p></div>
                        <div className="text-left md:text-right"><div className="font-black">{tr('supplier')}</div><div>{purchase.supplier?.name ?? 'Unknown'}</div><div className="text-sm text-slate-500">{purchase.supplier?.phone ?? ''}</div><div className="text-sm text-slate-500">{purchase.supplier?.address ?? ''}</div></div>
                    </div>
                    <div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800"><thead><tr><Th>{tr('product')}</Th><Th>{tr('type')}</Th><Th>{tr('qty')}</Th><Th>Unit Price</Th><Th>MFG/EXP</Th><Th>{tr('total')}</Th></tr></thead><tbody className="divide-y divide-slate-200 dark:divide-slate-800">{purchase.items.map(item => <tr key={item.id}><Td><div className="font-bold">{item.product?.name}</div><div className="text-xs text-slate-500">{item.product?.sku}</div></Td><Td>{item.product?.product_type}</Td><Td>{item.quantity}</Td><Td>৳ {Number(item.unit_price).toFixed(2)}</Td><Td><div>{item.manufacture_date ?? 'N/A'}</div><div className="text-xs text-red-500">{item.expire_date ?? 'N/A'}</div></Td><Td className="font-bold">৳ {Number(item.total_price).toFixed(2)}</Td></tr>)}</tbody></table></div>
                <div className="mt-4"><AuditMeta item={purchase} /></div>
            </section>
                <aside className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 print:mt-6 print:shadow-none print:ring-0"><h2 className="mb-4 text-lg font-black">{locale === 'bn' ? 'পেমেন্ট সারাংশ' : 'Payment Summary'}</h2><Summary label={tr('subtotal')} value={purchase.subtotal} /><Summary label={tr('discount')} value={purchase.discount} /><Summary label={tr('total')} value={purchase.total} bold /><Summary label={tr('paid')} value={purchase.paid_amount} /><Summary label={tr('due')} value={purchase.due_amount} danger /><div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm dark:bg-slate-950"><div className="text-slate-500">Payment</div><div className="font-bold capitalize">{purchase.payment_status} · {purchase.payment_method ?? 'N/A'}</div></div>{purchase.notes && <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm dark:bg-slate-950"><div className="text-slate-500">Notes</div>{purchase.notes}</div>}</aside>
            </div>
            <ConfirmModal show={deleteOpen} title="Delete purchase and reverse stock?" message={`Purchase ${purchase.purchase_no} will be deleted and all stock-in quantities from this purchase will be reversed.`} confirmText="Delete & Reverse Stock" processing={processing} onCancel={() => setDeleteOpen(false)} onConfirm={removePurchase} />
        </AdminLayout>
    );
}
function Summary({ label, value, bold = false, danger = false }) { return <div className="mb-2 flex justify-between rounded-2xl bg-slate-50 p-3 dark:bg-slate-950"><span className="text-slate-500">{label}</span><span className={`${bold ? 'text-xl font-black' : 'font-bold'} ${danger ? 'text-red-600' : ''}`}>৳ {Number(value).toFixed(2)}</span></div>; }
function Th({ children }) { return <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">{children}</th>; }
function Td({ children, className = '' }) { return <td className={`px-4 py-4 align-top ${className}`}>{children}</td>; }
