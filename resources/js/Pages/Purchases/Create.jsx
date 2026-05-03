import { Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Icon } from '@/Components/Icons';
import { Input, Select, Textarea } from '@/Components/Input';

export default function Create({ products = [], suppliers = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        supplier_id: '', purchase_date: new Date().toISOString().slice(0, 10), items: [], discount: 0, paid_amount: 0, payment_method: 'cash', notes: '',
    });

    const addItem = (productId) => {
        const product = products.find(p => Number(p.id) === Number(productId));
        if (!product) return;
        if (data.items.some(i => Number(i.product_id) === Number(product.id))) return;
        setData('items', [...data.items, { product_id: product.id, name: product.name, sku: product.sku, product_type: product.product_type, quantity: 1, unit_price: Number(product.purchase_price ?? 0), manufacture_date: '', expire_date: '' }]);
    };
    const updateItem = (index, key, value) => setData('items', data.items.map((item, i) => i === index ? { ...item, [key]: value } : item));
    const removeItem = index => setData('items', data.items.filter((_, i) => i !== index));

    const subtotal = data.items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unit_price || 0)), 0);
    const total = Math.max(0, subtotal - Number(data.discount || 0));
    const due = Math.max(0, total - Number(data.paid_amount || 0));

    const submit = e => {
        e.preventDefault();
        post('/shop-admin/purchases');
    };

    return (
        <AdminLayout title="New Purchase / Stock In">
            <div className="mb-5 flex justify-between gap-3">
                <Link href="/shop-admin/purchases" className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 font-semibold ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"><Icon name="x" /> Back</Link>
            </div>
            <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_380px]">
                <section className="space-y-5">
                    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                        <h2 className="mb-4 text-lg font-black">Purchase Information</h2>
                        <div className="grid gap-4 md:grid-cols-3">
                            <Select label="Supplier" value={data.supplier_id} onChange={e => setData('supplier_id', e.target.value)} error={errors.supplier_id}><option value="">Select supplier</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</Select>
                            <Input type="date" label="Purchase Date" value={data.purchase_date} onChange={e => setData('purchase_date', e.target.value)} error={errors.purchase_date} required />
                            <Select label="Add Product" value="" onChange={e => addItem(e.target.value)}><option value="">Choose product</option>{products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku}) - stock {p.stock_quantity}</option>)}</Select>
                        </div>
                    </div>

                    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                        <h2 className="mb-4 text-lg font-black">Items</h2>
                        <div className="space-y-3">
                            {data.items.map((item, index) => (
                                <div key={item.product_id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                                    <div className="mb-3 flex items-start justify-between gap-3">
                                        <div><div className="font-black">{item.name}</div><div className="text-xs text-slate-500">SKU: {item.sku} · {item.product_type}</div></div>
                                        <button type="button" onClick={() => removeItem(index)} className="rounded-xl border border-red-200 p-2 text-red-600"><Icon name="trash" /></button>
                                    </div>
                                    <div className="grid gap-3 md:grid-cols-5">
                                        <Input type="number" min="1" label="Qty" value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} />
                                        <Input type="number" step="0.01" min="0" label="Unit Price" value={item.unit_price} onChange={e => updateItem(index, 'unit_price', e.target.value)} />
                                        <Input label="Line Total" value={`৳ ${(Number(item.quantity || 0) * Number(item.unit_price || 0)).toFixed(2)}`} readOnly />
                                        <Input type="date" label="MFG Date" value={item.manufacture_date} onChange={e => updateItem(index, 'manufacture_date', e.target.value)} />
                                        <Input type="date" label="EXP Date" value={item.expire_date} onChange={e => updateItem(index, 'expire_date', e.target.value)} />
                                    </div>
                                </div>
                            ))}
                            {data.items.length === 0 && <div className="rounded-2xl bg-slate-50 p-8 text-center text-slate-500 dark:bg-slate-950">Select products to add stock.</div>}
                        </div>
                    </div>
                </section>

                <aside className="space-y-5">
                    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                        <h2 className="mb-4 text-lg font-black">Payment Summary</h2>
                        <div className="space-y-3">
                            <SummaryRow label="Subtotal" value={subtotal} />
                            <Input type="number" min="0" step="0.01" label="Discount" value={data.discount} onChange={e => setData('discount', e.target.value)} error={errors.discount} />
                            <SummaryRow label="Total" value={total} bold />
                            <Input type="number" min="0" step="0.01" label="Paid Amount" value={data.paid_amount} onChange={e => setData('paid_amount', e.target.value)} error={errors.paid_amount} />
                            <SummaryRow label="Due" value={due} danger />
                            <Select label="Payment Method" value={data.payment_method} onChange={e => setData('payment_method', e.target.value)}><option value="cash">Cash</option><option value="bkash">bKash</option><option value="nagad">Nagad</option><option value="bank">Bank</option><option value="card">Card</option></Select>
                            <Textarea label="Notes" rows="3" value={data.notes} onChange={e => setData('notes', e.target.value)} />
                            {errors.items && <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10">{errors.items}</div>}
                            <button disabled={processing || data.items.length === 0} className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-bold text-white shadow-lg shadow-blue-600/20 disabled:opacity-50"><Icon name="truck" className="mr-2 inline h-5 w-5" /> Save Purchase & Stock In</button>
                        </div>
                    </div>
                </aside>
            </form>
        </AdminLayout>
    );
}
function SummaryRow({ label, value, bold = false, danger = false }) { return <div className="flex justify-between rounded-2xl bg-slate-50 p-3 dark:bg-slate-950"><span className="text-slate-500">{label}</span><span className={`${bold ? 'text-xl font-black' : 'font-bold'} ${danger ? 'text-red-600' : ''}`}>৳ {Number(value).toFixed(2)}</span></div>; }
