import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Icon } from '@/Components/Icons';

function money(value) {
    return `৳ ${Number(value ?? 0).toFixed(2)}`;
}

function labelDate(value) {
    if (!value) return '';
    return new Date(value).toLocaleString();
}

function StatCard({ title, value, icon, note, tone = 'blue' }) {
    const tones = {
        blue: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
        green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
        amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
        red: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300',
        violet: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',
    };

    return (
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
                    <p className="mt-2 text-2xl font-black md:text-3xl">{value}</p>
                    {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
                </div>
                <div className={`rounded-2xl p-3 ${tones[tone]}`}><Icon name={icon} /></div>
            </div>
        </div>
    );
}

function Section({ title, children, action }) {
    return (
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold">{title}</h2>
                {action}
            </div>
            {children}
        </section>
    );
}

function ReportFilters({ filters }) {
    const apply = (next) => {
        router.get('/reports', { ...filters, ...next }, { preserveState: true, replace: true });
    };

    return (
        <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
                <select value={filters.report_type} onChange={e => apply({ report_type: e.target.value })} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950">
                    <option value="daily">Daily Report</option>
                    <option value="monthly">Monthly Report</option>
                    <option value="yearly">Yearly Report</option>
                    <option value="custom">Custom Range</option>
                </select>

                {filters.report_type === 'daily' && (
                    <input type="date" value={filters.date ?? ''} onChange={e => apply({ date: e.target.value })} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
                )}

                {filters.report_type === 'monthly' && (
                    <input type="month" value={filters.month ?? ''} onChange={e => apply({ month: e.target.value })} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
                )}

                {filters.report_type === 'yearly' && (
                    <input type="number" min="2000" max="2100" value={filters.year ?? ''} onChange={e => apply({ year: e.target.value })} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
                )}

                {filters.report_type === 'custom' && (
                    <>
                        <input type="date" value={filters.start_date ?? ''} onChange={e => apply({ start_date: e.target.value })} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
                        <input type="date" value={filters.end_date ?? ''} onChange={e => apply({ end_date: e.target.value })} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
                    </>
                )}

                <Link
                    href={`/reports/print?${new URLSearchParams(filters).toString()}`}
                    target="_blank"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 font-semibold text-white shadow-lg shadow-blue-600/20 xl:col-start-7"
                >
                    <Icon name="download" /> Download PDF
                </Link>
            </div>
            <p className="mt-3 text-sm text-slate-500">Showing: <span className="font-semibold text-slate-700 dark:text-slate-200">{filters.label}</span></p>
        </div>
    );
}

function SalesChart({ rows }) {
    const max = Math.max(...rows.map(row => Number(row.total ?? 0)), 1);

    return (
        <div className="space-y-3">
            {rows.length === 0 && <p className="text-sm text-slate-500">No sales data found for this date range.</p>}
            {rows.map(row => {
                const width = Math.max(5, (Number(row.total ?? 0) / max) * 100);
                return (
                    <div key={row.period} className="grid gap-2 md:grid-cols-[170px_1fr_120px] md:items-center">
                        <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">{row.period}</div>
                        <div className="h-4 rounded-full bg-slate-100 dark:bg-slate-800">
                            <div className="h-4 rounded-full bg-blue-600" style={{ width: `${width}%` }} />
                        </div>
                        <div className="text-sm font-bold md:text-right">{money(row.total)}</div>
                    </div>
                );
            })}
        </div>
    );
}

function SalesTable({ sales }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-500">
                    <tr><th className="py-3">Invoice</th><th>Customer</th><th>Items</th><th>Total</th><th>Paid</th><th>Due</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {sales.map(sale => (
                        <tr key={sale.id}>
                            <td className="py-3 font-bold">{sale.invoice_no}</td>
                            <td>{sale.customer?.name ?? 'Walk-in'}<p className="text-xs text-slate-500">{sale.customer?.phone ?? ''}</p></td>
                            <td>{sale.items_count}</td>
                            <td className="font-bold">{money(sale.total)}</td>
                            <td>{money(sale.paid_amount)}</td>
                            <td>{money(sale.due_amount)}</td>
                            <td><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize dark:bg-slate-800">{sale.payment_status}</span></td>
                            <td>{labelDate(sale.sale_date)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {sales.length === 0 && <p className="py-4 text-sm text-slate-500">No invoice found.</p>}
        </div>
    );
}

export default function Index({ filters, summary, salesByPeriod = [], sales = [], topProducts = [], paymentBreakdown = [], lowStockProducts = [], expiryReports = {}, stockMovements = [] }) {
    const expiringSoon = expiryReports.expiring_soon ?? [];
    const expired = expiryReports.expired ?? [];

    return (
        <AdminLayout title="Reports">
            <ReportFilters filters={filters} />

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard title="Total Sales" value={money(summary.total)} icon="money" tone="green" note={`${summary.invoice_count} invoices`} />
                <StatCard title="Paid Amount" value={money(summary.paid)} icon="receipt" tone="blue" note={`${summary.items_sold} items sold`} />
                <StatCard title="Due Amount" value={money(summary.due)} icon="alert" tone="amber" note="Customer payable" />
                <StatCard title="Estimated Profit" value={money(summary.estimated_profit)} icon="trend" tone="violet" note="Sales minus purchase cost" />
                <StatCard title="Discount" value={money(summary.discount)} icon="tag" tone="amber" />
                <StatCard title="Tax" value={money(summary.tax)} icon="file" tone="blue" />
                <StatCard title="Average Invoice" value={money(summary.average_invoice)} icon="chart" tone="green" />
                <StatCard title="Purchase Cost" value={money(summary.purchase_cost)} icon="box" tone="red" />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <Section title="Sales Trend">
                    <SalesChart rows={salesByPeriod} />
                </Section>

                <Section title="Payment Method Breakdown">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="text-xs uppercase text-slate-500"><tr><th className="py-3">Method</th><th>Invoices</th><th>Total</th><th>Paid</th></tr></thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {paymentBreakdown.map(row => (
                                    <tr key={row.payment_method}><td className="py-3 font-semibold">{row.payment_method}</td><td>{row.invoice_count}</td><td>{money(row.total)}</td><td className="font-bold">{money(row.paid)}</td></tr>
                                ))}
                            </tbody>
                        </table>
                        {paymentBreakdown.length === 0 && <p className="py-4 text-sm text-slate-500">No payment data found.</p>}
                    </div>
                </Section>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <Section title="Top Selling Products">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="text-xs uppercase text-slate-500"><tr><th className="py-3">Product</th><th>Type</th><th>Qty</th><th>Sales</th></tr></thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {topProducts.map(item => (
                                    <tr key={item.id}><td className="py-3 font-semibold">{item.name}<p className="text-xs text-slate-500">{item.sku}</p></td><td className="capitalize">{item.product_type}</td><td>{item.quantity_sold}</td><td className="font-bold">{money(item.sales_amount)}</td></tr>
                                ))}
                            </tbody>
                        </table>
                        {topProducts.length === 0 && <p className="py-4 text-sm text-slate-500">No product sales found.</p>}
                    </div>
                </Section>

                <Section title="Recent Stock Movements">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="text-xs uppercase text-slate-500"><tr><th className="py-3">Product</th><th>Type</th><th>Qty</th><th>Before</th><th>After</th></tr></thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {stockMovements.map(item => (
                                    <tr key={item.id}><td className="py-3 font-semibold">{item.product?.name}</td><td>{item.movement_type}</td><td>{item.quantity}</td><td>{item.stock_before}</td><td>{item.stock_after}</td></tr>
                                ))}
                            </tbody>
                        </table>
                        {stockMovements.length === 0 && <p className="py-4 text-sm text-slate-500">No stock movement found.</p>}
                    </div>
                </Section>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <Section title="Low Stock Report">
                    <div className="space-y-3">
                        {lowStockProducts.map(product => (
                            <div key={product.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">
                                <div><p className="font-semibold">{product.name}</p><p className="text-xs text-slate-500">{product.category?.name ?? 'No category'} · minimum {product.minimum_stock_alert}</p></div>
                                <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">{product.stock_quantity} left</span>
                            </div>
                        ))}
                        {lowStockProducts.length === 0 && <p className="text-sm text-slate-500">No low stock products.</p>}
                    </div>
                </Section>

                <Section title="Medicine Expiry Report">
                    <div className="space-y-3">
                        {[...expired, ...expiringSoon].map(product => {
                            const isExpired = expired.some(item => item.id === product.id);
                            return (
                                <div key={`${isExpired ? 'expired' : 'soon'}-${product.id}`} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">
                                    <div><p className="font-semibold">{product.name}</p><p className="text-xs text-slate-500">Batch: {product.medicine_detail?.batch_no ?? 'N/A'} · Stock: {product.stock_quantity}</p></div>
                                    <span className={`rounded-full px-3 py-1 text-sm font-bold ${isExpired ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'}`}>{product.medicine_detail?.expire_date}</span>
                                </div>
                            );
                        })}
                        {expired.length + expiringSoon.length === 0 && <p className="text-sm text-slate-500">No expired or 1-month expiry medicine found.</p>}
                    </div>
                </Section>
            </div>

            <Section title="Invoice Details" action={<span className="text-sm text-slate-500">Latest {sales.length} invoices</span>}>
                <SalesTable sales={sales} />
            </Section>
        </AdminLayout>
    );
}
