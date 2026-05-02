import { router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Icon } from '@/Components/Icons';
import { Input, Select, Textarea } from '@/Components/Input';
import AuditMeta from '@/Components/AuditMeta';

export default function Index({ movements, products = [], filters = {}, summary = {} }) {
    const { data, setData, post, processing, errors, reset } = useForm({ product_id: '', adjustment_type: 'increase', quantity: 0, note: '' });
    const selected = products.find(p => Number(p.id) === Number(data.product_id));
    const applyFilter = (key, value) => router.get('/stock-adjustments', { ...filters, [key]: value }, { preserveState: true, replace: true });
    const submit = e => {
        e.preventDefault();
        post('/stock-adjustments', { preserveScroll: true, onSuccess: () => reset() });
    };

    return (
        <AdminLayout title="Stock Adjustments">
            <div className="mb-6 grid gap-4 md:grid-cols-4">
                <Metric label="Today Stock In" value={summary.stock_in ?? 0} icon="truck" />
                <Metric label="Today Stock Out" value={summary.stock_out ?? 0} icon="cart" tone="red" />
                <Metric label="Today Adjusted" value={summary.adjustment ?? 0} icon="swap" tone="amber" />
                <Metric label="Today Returned" value={summary.returns ?? 0} icon="trend" tone="emerald" />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
                <section>
                    <div className="mb-4 flex flex-col gap-3 md:flex-row">
                        <div className="relative">
                            <Icon name="search" className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                            <input defaultValue={filters.search ?? ''} onKeyDown={e => e.key === 'Enter' && applyFilter('search', e.currentTarget.value)} placeholder="Search product/SKU..." className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-10 pr-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 md:w-80" />
                        </div>
                        <select value={filters.type ?? ''} onChange={e => applyFilter('type', e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                            <option value="">All Movements</option><option value="stock_in">Stock In</option><option value="stock_out">Stock Out</option><option value="adjustment">Adjustment</option><option value="return">Return</option>
                        </select>
                    </div>

                    <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                                <thead className="bg-slate-50 dark:bg-slate-950"><tr><Th>Date</Th><Th>Product</Th><Th>Type</Th><Th>Qty</Th><Th>Before</Th><Th>After</Th><Th>Created By</Th><Th>Note</Th></tr></thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {movements.data.map(m => (
                                        <tr key={m.id}>
                                            <Td>{new Date(m.created_at).toLocaleString()}</Td>
                                            <Td><div className="font-bold">{m.product?.name}</div><div className="text-xs text-slate-500">{m.product?.sku}</div></Td>
                                            <Td><Movement type={m.movement_type} /></Td>
                                            <Td className="font-black">{m.quantity}</Td>
                                            <Td>{m.stock_before}</Td>
                                            <Td>{m.stock_after}</Td>
                                            <Td><AuditMeta item={m} compact /></Td>
                                            <Td>{m.note ?? 'N/A'}</Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <aside className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                    <h2 className="mb-4 text-lg font-black">Manual Adjustment</h2>
                    <form onSubmit={submit} className="space-y-4">
                        <Select label="Product" value={data.product_id} onChange={e => setData('product_id', e.target.value)} error={errors.product_id} required>
                            <option value="">Select product</option>{products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku}) - {p.stock_quantity} {p.unit}</option>)}
                        </Select>
                        {selected && <div className="rounded-2xl bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">Current stock: <b>{selected.stock_quantity} {selected.unit}</b></div>}
                        <Select label="Adjustment Type" value={data.adjustment_type} onChange={e => setData('adjustment_type', e.target.value)} error={errors.adjustment_type}>
                            <option value="increase">Increase stock</option><option value="decrease">Decrease stock</option><option value="set">Set exact stock</option>
                        </Select>
                        <Input type="number" min="0" label={data.adjustment_type === 'set' ? 'New Stock Quantity' : 'Quantity'} value={data.quantity} onChange={e => setData('quantity', e.target.value)} error={errors.quantity} required />
                        <Textarea label="Reason / Note" rows="4" value={data.note} onChange={e => setData('note', e.target.value)} error={errors.note} required />
                        <button disabled={processing} className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-bold text-white shadow-lg shadow-blue-600/20 disabled:opacity-50"><Icon name="swap" className="mr-2 inline h-5 w-5" /> Save Adjustment</button>
                    </form>
                </aside>
            </div>
        </AdminLayout>
    );
}
function Metric({ label, value, icon, tone = 'blue' }) { const tones = { blue: 'bg-blue-600', emerald: 'bg-emerald-600', red: 'bg-red-600', amber: 'bg-amber-600' }; return <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"><div className={`mb-4 grid h-11 w-11 place-items-center rounded-2xl text-white ${tones[tone]}`}><Icon name={icon} /></div><div className="text-2xl font-black">{value}</div><div className="text-sm text-slate-500">{label}</div></div>; }
function Movement({ type }) { const cls = type === 'stock_in' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : type === 'stock_out' ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300' : type === 'return' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'; return <span className={`rounded-full px-3 py-1 text-xs font-bold ${cls}`}>{type}</span>; }
function Th({ children }) { return <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">{children}</th>; }
function Td({ children, className = '' }) { return <td className={`px-4 py-4 align-top ${className}`}>{children}</td>; }
