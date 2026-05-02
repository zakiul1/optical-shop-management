import { useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Icon } from '@/Components/Icons';
import { label } from '@/i18n';

function money(value) { return `৳ ${Number(value ?? 0).toFixed(2)}`; }
function dateTime(value) { return value ? new Date(value).toLocaleString() : ''; }
function tx(key, locale) { return label(key, locale); }

function Card({ label, value }) { return <div className="rounded-xl border border-slate-200 p-3"><p className="text-xs uppercase text-slate-500">{label}</p><p className="mt-1 text-lg font-black">{value}</p></div>; }
function Table({ headers, rows, empty }) { return <div className="overflow-x-auto"><table className="w-full border-collapse text-left text-xs"><thead><tr className="bg-slate-100">{headers.map(header => <th key={header} className="border border-slate-300 px-2 py-2">{header}</th>)}</tr></thead><tbody>{rows.length === 0 && <tr><td className="border border-slate-300 px-2 py-3 text-center text-slate-500" colSpan={headers.length}>{empty}</td></tr>}{rows.map((row, index) => <tr key={index}>{row.map((cell, i) => <td key={i} className="border border-slate-300 px-2 py-2">{cell}</td>)}</tr>)}</tbody></table></div>; }
function Section({ title, children }) { return <section className="mt-6 break-inside-avoid"><h2 className="mb-2 border-b border-slate-300 pb-1 text-base font-black">{title}</h2>{children}</section>; }

export default function Print({ shop, filters, summary, salesByPeriod = [], sales = [], topProducts = [], paymentBreakdown = [], lowStockProducts = [], expiryReports = {}, stockMovements = [] }) {
    const locale = usePage().props.locale || 'en';
    useEffect(() => { document.title = `${tx('report', locale)} - ${filters.label}`; }, [filters.label, locale]);
    const expiringSoon = expiryReports.expiring_soon ?? [];
    const expired = expiryReports.expired ?? [];
    const reportUrl = `/reports?report_type=${filters.report_type}&date=${filters.date}&month=${filters.month}&year=${filters.year}&start_date=${filters.start_date}&end_date=${filters.end_date}`;

    return (
        <div className="min-h-screen bg-slate-100 p-4 text-slate-950 print:bg-white print:p-0">
            <style>{`@media print { .no-print { display: none !important; } body { background: white !important; } @page { size: A4; margin: 12mm; } }`}</style>
            <div className="no-print mx-auto mb-4 flex max-w-5xl flex-wrap justify-end gap-2">
                <Link href={reportUrl} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold"><Icon name="x" /> {tx('back', locale)}</Link>
                <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white"><Icon name="download" /> {tx('downloadPdf', locale)}</button>
                <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white"><Icon name="print" /> {tx('printSavePdf', locale)}</button>
            </div>
            <main className="mx-auto max-w-5xl bg-white p-8 shadow-sm print:max-w-none print:p-0 print:shadow-none">
                <header className="flex flex-col gap-3 border-b-2 border-slate-900 pb-4 md:flex-row md:items-start md:justify-between">
                    <div><h1 className="text-2xl font-black">{shop.name}</h1><p className="text-sm text-slate-600">{shop.tagline}</p><p className="mt-1 text-sm">{shop.address}</p><p className="text-sm">Phone: {shop.phone}</p></div>
                    <div className="text-left md:text-right"><h2 className="text-xl font-black uppercase">{filters.report_type} {tx('report', locale)}</h2><p className="text-sm font-semibold">{filters.label}</p><p className="text-xs text-slate-500">{tx('generated', locale)}: {new Date().toLocaleString(locale === 'bn' ? 'bn-BD' : undefined)}</p></div>
                </header>
                <section className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <Card label={tx('total', locale)} value={money(summary.total)} /><Card label={tx('paid', locale)} value={money(summary.paid)} /><Card label={tx('due', locale)} value={money(summary.due)} /><Card label={tx('invoice', locale)} value={summary.invoice_count} /><Card label="Items Sold" value={summary.items_sold} /><Card label="Purchase Cost" value={money(summary.purchase_cost)} /><Card label="Estimated Profit" value={money(summary.estimated_profit)} /><Card label="Average Invoice" value={money(summary.average_invoice)} />
                </section>
                <Section title={locale === 'bn' ? 'সময় অনুযায়ী বিক্রয় সারাংশ' : 'Sales Summary by Period'}><Table empty={tx('noDataFound', locale)} headers={['Period', 'Invoices', 'Total', 'Paid', 'Due']} rows={salesByPeriod.map(row => [row.period, row.invoice_count, money(row.total), money(row.paid), money(row.due)])} /></Section>
                <Section title={locale === 'bn' ? 'পেমেন্ট পদ্ধতি অনুযায়ী সারাংশ' : 'Payment Method Breakdown'}><Table empty={tx('noDataFound', locale)} headers={['Payment Method', 'Invoices', 'Total', 'Paid']} rows={paymentBreakdown.map(row => [row.payment_method, row.invoice_count, money(row.total), money(row.paid)])} /></Section>
                <Section title={locale === 'bn' ? 'সর্বাধিক বিক্রিত পণ্য' : 'Top Selling Products'}><Table empty={tx('noDataFound', locale)} headers={['Product', 'SKU', 'Type', 'Qty Sold', 'Sales Amount']} rows={topProducts.map(item => [item.name, item.sku, item.product_type, item.quantity_sold, money(item.sales_amount)])} /></Section>
                <Section title={locale === 'bn' ? 'ইনভয়েস বিস্তারিত' : 'Invoice Details'}><Table empty={tx('noDataFound', locale)} headers={['Invoice', 'Customer', 'Items', 'Total', 'Paid', 'Due', 'Status', 'Date']} rows={sales.map(sale => [sale.invoice_no, sale.customer?.name ?? 'Walk-in', sale.items_count, money(sale.total), money(sale.paid_amount), money(sale.due_amount), sale.payment_status, dateTime(sale.sale_date)])} /></Section>
                <Section title={locale === 'bn' ? 'কম স্টক রিপোর্ট' : 'Low Stock Report'}><Table empty={tx('noDataFound', locale)} headers={['Product', 'Type', 'Category', 'Current Stock', 'Minimum Alert']} rows={lowStockProducts.map(product => [product.name, product.product_type, product.category?.name ?? 'N/A', product.stock_quantity, product.minimum_stock_alert])} /></Section>
                <Section title={locale === 'bn' ? 'ওষুধ মেয়াদ রিপোর্ট' : 'Medicine Expiry Report'}><Table empty={tx('noDataFound', locale)} headers={['Status', 'Medicine', 'Batch', 'Stock', 'Expire Date']} rows={[...expired.map(product => ['Expired', product.name, product.medicine_detail?.batch_no ?? 'N/A', product.stock_quantity, product.medicine_detail?.expire_date]), ...expiringSoon.map(product => ['Expiring Soon', product.name, product.medicine_detail?.batch_no ?? 'N/A', product.stock_quantity, product.medicine_detail?.expire_date])]} /></Section>
                <Section title={locale === 'bn' ? 'স্টক মুভমেন্ট রিপোর্ট' : 'Stock Movement Report'}><Table empty={tx('noDataFound', locale)} headers={['Date', 'Product', 'Movement', 'Qty', 'Before', 'After']} rows={stockMovements.map(item => [dateTime(item.created_at), item.product?.name ?? 'N/A', item.movement_type, item.quantity, item.stock_before, item.stock_after])} /></Section>
                <footer className="mt-8 border-t border-slate-300 pt-4 text-center text-xs text-slate-500">{locale === 'bn' ? 'এই রিপোর্ট মদিনা চক্ষু সেবা ও অপটিক্যাল ম্যানেজমেন্ট সিস্টেম থেকে তৈরি হয়েছে।' : 'This report is generated from Madina Chokh Seba & Optical management system.'}</footer>
            </main>
        </div>
    );
}
