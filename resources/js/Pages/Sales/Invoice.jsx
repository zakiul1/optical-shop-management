import { Link, usePage } from '@inertiajs/react';
import { Icon } from '@/Components/Icons';
import { label } from '@/i18n';
import AuditMeta from '@/Components/AuditMeta';

function money(value) { return `৳ ${Number(value ?? 0).toFixed(2)}`; }
function tx(key, locale) { return label(key, locale); }

export default function Invoice({ sale, shop }) {
    const locale = usePage().props.locale || 'en';
    return (
        <div className="min-h-screen bg-slate-100 p-4 text-slate-900 print:bg-white print:p-0">
            <div className="mx-auto mb-4 flex max-w-4xl flex-wrap justify-between gap-2 print:hidden">
                <Link href={`/shop-admin/sales/${sale.id}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 font-semibold">{tx('back', locale)}</Link>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 font-semibold text-white"><Icon name="download" /> {tx('downloadPdf', locale)}</button>
                    <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 font-semibold text-white"><Icon name="print" /> {tx('printSavePdf', locale)}</button>
                </div>
            </div>
            <main className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-sm print:max-w-none print:rounded-none print:p-6 print:shadow-none">
                <header className="flex flex-col gap-5 border-b border-slate-200 pb-6 md:flex-row md:items-start md:justify-between">
                    <div><h1 className="text-3xl font-black">{shop.name}</h1><p className="mt-1 text-slate-500">{shop.tagline}</p><p className="mt-2 text-sm">{shop.address}</p><p className="text-sm">Phone: {shop.phone}</p></div>
                    <div className="rounded-2xl bg-slate-50 p-4 text-right"><p className="text-sm text-slate-500">{tx('invoice', locale)} No</p><p className="text-xl font-black">{sale.invoice_no}</p><p className="mt-2 text-sm text-slate-500">Date</p><p className="font-bold">{new Date(sale.sale_date).toLocaleString(locale === 'bn' ? 'bn-BD' : undefined)}</p></div>
                </header>
                <section className="grid gap-4 border-b border-slate-200 py-6 md:grid-cols-2">
                    <div><h2 className="mb-2 font-bold">{tx('billTo', locale)}</h2><p className="font-semibold">{sale.customer?.name ?? 'Walk-in Customer'}</p><p className="text-sm text-slate-500">{sale.customer?.phone ?? ''}</p><p className="text-sm text-slate-500">{sale.customer?.address ?? ''}</p></div>
                    {sale.prescription && <div><h2 className="mb-2 font-bold">{tx('prescription', locale)}</h2><div className="grid grid-cols-2 gap-2 text-sm"><p>R: SPH {sale.prescription.right_sph ?? '-'}, CYL {sale.prescription.right_cyl ?? '-'}, AX {sale.prescription.right_axis ?? '-'}</p><p>L: SPH {sale.prescription.left_sph ?? '-'}, CYL {sale.prescription.left_cyl ?? '-'}, AX {sale.prescription.left_axis ?? '-'}</p><p>ADD: {sale.prescription.near_addition ?? '-'}</p><p>IPD: {sale.prescription.ipd ?? '-'}</p></div></div>}
                </section>
                <section className="py-6"><table className="w-full text-left text-sm"><thead className="border-b border-slate-200 text-slate-500"><tr><th className="py-3">#</th><th>{tx('product', locale)}</th><th>{tx('qty', locale)}</th><th>Price</th><th>{tx('discount', locale)}</th><th className="text-right">{tx('total', locale)}</th></tr></thead><tbody className="divide-y divide-slate-100">{sale.items.map((item, index) => <tr key={item.id}><td className="py-3">{index + 1}</td><td className="font-semibold">{item.product?.name}<p className="text-xs font-normal text-slate-500">SKU: {item.product?.sku}</p></td><td>{item.quantity}</td><td>{money(item.unit_price)}</td><td>{money(item.discount)}</td><td className="text-right font-bold">{money(item.total_price)}</td></tr>)}</tbody></table></section>
                <section className="ml-auto max-w-sm space-y-2 border-t border-slate-200 pt-5"><div className="flex justify-between"><span>{tx('subtotal', locale)}</span><strong>{money(sale.subtotal)}</strong></div><div className="flex justify-between"><span>{tx('discount', locale)}</span><strong>{money(sale.discount)}</strong></div><div className="flex justify-between"><span>{tx('tax', locale)}</span><strong>{money(sale.tax)}</strong></div><div className="flex justify-between border-t border-slate-200 pt-2 text-xl"><span>{tx('total', locale)}</span><strong>{money(sale.total)}</strong></div><div className="flex justify-between"><span>{tx('paid', locale)}</span><strong>{money(sale.paid_amount)}</strong></div><div className="flex justify-between"><span>{tx('due', locale)}</span><strong>{money(sale.due_amount)}</strong></div></section>
                <div className="mt-6 print:text-xs"><AuditMeta item={sale} /></div>
                <footer className="mt-10 border-t border-slate-200 pt-5 text-center text-sm text-slate-500"><p>{tx('thankYou', locale)}</p><p className="mt-1">{tx('pdfHint', locale)}</p></footer>
            </main>
        </div>
    );
}
