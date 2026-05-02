import AdminLayout from '@/Layouts/AdminLayout';
import { Icon } from '@/Components/Icons';
import { useI18n } from '@/i18n';

function money(value) { return `৳ ${Number(value ?? 0).toFixed(2)}`; }

function StatCard({ title, value, icon, tone = 'blue', subtitle }) {
    const tones = {
        blue: 'from-blue-600 to-indigo-600 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
        green: 'from-emerald-600 to-teal-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
        amber: 'from-amber-500 to-orange-500 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
        red: 'from-red-500 to-rose-500 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300',
        purple: 'from-purple-600 to-fuchsia-600 bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300',
    };

    const [gradient, badge] = tones[tone].split(' bg');

    return (
        <div className="group relative overflow-hidden rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-xl dark:bg-slate-900 dark:ring-slate-800">
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient}`} />
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{title}</p>
                    <p className="mt-3 break-words text-3xl font-black tracking-tight text-slate-950 dark:text-white">{value}</p>
                    {subtitle && <p className="mt-1 text-xs font-semibold text-slate-400">{subtitle}</p>}
                </div>
                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg${badge}`}><Icon name={icon} /></div>
            </div>
        </div>
    );
}

function Panel({ title, icon, children }) {
    return <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"><div className="mb-4 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"><Icon name={icon} /></div><h2 className="text-lg font-black">{title}</h2></div>{children}</section>;
}

export default function Dashboard({ stats = {}, lowStockProducts = [], expiringMedicines = [], recentStockMovements = [], recentSales = [], recentPurchases = [] }) {
    const { t } = useI18n();

    return (
        <AdminLayout title={t('dashboard')}>
            <section className="mb-6 overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 p-6 text-white shadow-xl shadow-blue-600/20">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="max-w-2xl text-2xl font-black md:text-4xl">{t('dashboardHeroTitle')}</h2>
                        <p className="mt-3 max-w-3xl text-sm font-medium text-blue-100 md:text-base">{t('dashboardHeroText')}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 rounded-3xl bg-white/10 p-4 ring-1 ring-white/20 sm:min-w-80">
                        <Mini label={t('todaySales')} value={money(stats.today_sales)} />
                        <Mini label={t('todayPurchase')} value={money(stats.today_purchases)} />
                    </div>
                </div>
            </section>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
                <StatCard title={t('totalProducts')} value={stats.total_products ?? 0} icon="box" subtitle={t('quickOverview')} />
                <StatCard title={t('medicines')} value={stats.medicine_products ?? 0} icon="box" tone="green" />
                <StatCard title={t('glassItems')} value={stats.glass_products ?? 0} icon="eye" tone="purple" />
                <StatCard title={t('lowStock')} value={stats.low_stock_products ?? 0} icon="alert" tone="amber" subtitle={t('inventoryHealth')} />
                <StatCard title={t('expiringSoon')} value={stats.expiring_medicines ?? 0} icon="clock" tone="red" />
                <StatCard title={t('todaySales')} value={money(stats.today_sales)} icon="receipt" tone="green" />
                <StatCard title={t('monthlySales')} value={money(stats.monthly_sales)} icon="cart" tone="blue" />
                <StatCard title={t('todayPurchase')} value={money(stats.today_purchases)} icon="truck" tone="amber" />
                <StatCard title={t('monthlyPurchase')} value={money(stats.monthly_purchases)} icon="truck" tone="red" />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <Panel title="Low Stock Alerts" icon="alert">
                    <div className="space-y-3">
                        {lowStockProducts.length === 0 && <Empty text={t('noLowStock')} />}
                        {lowStockProducts.map(product => <AlertRow key={product.id} title={product.name} subtitle={`${product.category?.name ?? 'No category'} · Alert at ${product.minimum_stock_alert}`} badge={`${product.stock_quantity} left`} tone="amber" />)}
                    </div>
                </Panel>
                <Panel title="Medicine Expiry Alerts" icon="clock">
                    <div className="space-y-3">
                        {expiringMedicines.length === 0 && <Empty text={t('noExpiring')} />}
                        {expiringMedicines.map(product => <AlertRow key={product.id} title={product.name} subtitle={`Batch: ${product.medicine_detail?.batch_no ?? 'N/A'}`} badge={product.medicine_detail?.expire_date} tone="red" />)}
                    </div>
                </Panel>
            </div>

            <div className="mt-6 grid gap-6 2xl:grid-cols-2">
                <TablePanel title={t('recentSales')} headers={[t('invoice'), t('customer'), t('total'), t('paid'), t('due'), t('status')]} empty={t('noSale')} rows={recentSales.map(sale => [sale.invoice_no, sale.customer?.name ?? 'Walk-in', money(sale.total), money(sale.paid_amount), money(sale.due_amount), sale.payment_status])} />
                <TablePanel title={t('recentPurchases')} headers={[t('purchase'), t('supplier'), t('total'), t('paid'), t('due'), t('status')]} empty={t('noPurchase')} rows={recentPurchases.map(purchase => [purchase.purchase_no, purchase.supplier?.name ?? 'Unknown', money(purchase.total), money(purchase.paid_amount), money(purchase.due_amount), purchase.payment_status])} />
            </div>

            <div className="mt-6">
                <TablePanel title={t('recentStockMovements')} headers={[t('product'), t('type'), t('qty'), t('before'), t('after')]} rows={recentStockMovements.map(item => [item.product?.name ?? 'N/A', item.movement_type, item.quantity, item.stock_before, item.stock_after])} />
            </div>
        </AdminLayout>
    );
}

function Mini({ label, value }) { return <div className="rounded-2xl bg-white/10 p-3"><p className="text-xs font-semibold text-blue-100">{label}</p><p className="mt-1 text-xl font-black">{value}</p></div>; }
function Empty({ text }) { return <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500 dark:bg-slate-950">{text}</div>; }
function AlertRow({ title, subtitle, badge, tone }) { const cls = tone === 'red' ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'; return <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-950"><div className="min-w-0"><p className="truncate font-bold">{title}</p><p className="truncate text-xs text-slate-500">{subtitle}</p></div><span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${cls}`}>{badge}</span></div>; }
function TablePanel({ title, headers, rows, empty }) { return <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"><h2 className="mb-4 text-lg font-black">{title}</h2><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="text-slate-500"><tr>{headers.map(h => <th key={h} className="whitespace-nowrap px-3 py-2 first:pl-0">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{rows.map((row, idx) => <tr key={idx}>{row.map((cell, i) => <td key={i} className="whitespace-nowrap px-3 py-3 first:pl-0 first:font-bold">{cell}</td>)}</tr>)}</tbody></table>{rows.length === 0 && <p className="py-4 text-sm font-semibold text-slate-500">{empty ?? 'No data found.'}</p>}</div></section>; }
