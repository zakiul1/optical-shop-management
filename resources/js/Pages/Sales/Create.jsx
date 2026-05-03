import { Link, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Input, Select, Textarea } from '@/Components/Input';
import { Icon } from '@/Components/Icons';

const blankCustomer = { name: '', phone: '', age: '', gender: '', address: '' };
const blankPrescription = { right_sph: '', right_cyl: '', right_axis: '', right_va: '', left_sph: '', left_cyl: '', left_axis: '', left_va: '', near_addition: '', ipd: '', complaints: '', remarks: '' };

function money(value) {
    return `৳ ${Number(value ?? 0).toFixed(2)}`;
}

export default function Create({ products = [] }) {
    const [selectedProductId, setSelectedProductId] = useState('');
    const [search, setSearch] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        customer: blankCustomer,
        prescription: blankPrescription,
        items: [],
        discount: 0,
        tax: 0,
        paid_amount: '',
        payment_method: 'cash',
        notes: '',
    });

    const productMap = useMemo(() => Object.fromEntries(products.map(product => [String(product.id), product])), [products]);
    const filteredProducts = useMemo(() => {
        const term = search.toLowerCase();
        return products.filter(product => !term || product.name.toLowerCase().includes(term) || product.sku?.toLowerCase().includes(term) || product.brand?.toLowerCase().includes(term));
    }, [products, search]);

    const subtotal = data.items.reduce((sum, item) => sum + Math.max(0, (Number(item.quantity) * Number(item.unit_price)) - Number(item.discount || 0)), 0);
    const total = Math.max(0, subtotal - Number(data.discount || 0) + Number(data.tax || 0));
    const paid = data.paid_amount === '' ? total : Number(data.paid_amount || 0);
    const due = Math.max(0, total - paid);

    const setNested = (group, field, value) => setData(group, { ...data[group], [field]: value });

    const addProduct = () => {
        if (!selectedProductId) return;
        const product = productMap[String(selectedProductId)];
        if (!product) return;
        const existingIndex = data.items.findIndex(item => String(item.product_id) === String(product.id));
        if (existingIndex >= 0) {
            const nextItems = [...data.items];
            const nextQty = Math.min(Number(nextItems[existingIndex].quantity) + 1, Number(product.stock_quantity));
            nextItems[existingIndex] = { ...nextItems[existingIndex], quantity: nextQty };
            setData('items', nextItems);
        } else {
            setData('items', [...data.items, { product_id: product.id, name: product.name, sku: product.sku, type: product.product_type, stock_quantity: product.stock_quantity, quantity: 1, unit_price: product.sale_price, discount: 0 }]);
        }
        setSelectedProductId('');
        setSearch('');
    };

    const updateItem = (index, field, value) => {
        const nextItems = [...data.items];
        const current = nextItems[index];
        if (field === 'quantity') {
            value = Math.max(1, Math.min(Number(value || 1), Number(current.stock_quantity)));
        }
        nextItems[index] = { ...current, [field]: value };
        setData('items', nextItems);
    };

    const removeItem = index => setData('items', data.items.filter((_, itemIndex) => itemIndex !== index));

    const submit = (e) => {
        e.preventDefault();
        post('/shop-admin/sales');
    };

    return (
        <AdminLayout title="Create Sale">
            <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_380px]">
                <div className="space-y-6">
                    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                        <div className="mb-4 flex items-center gap-2"><Icon name="user" /><h2 className="text-lg font-bold">Customer Information</h2></div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Input label="Customer Name" value={data.customer.name} onChange={e => setNested('customer', 'name', e.target.value)} error={errors['customer.name']} />
                            <Input label="Phone" value={data.customer.phone} onChange={e => setNested('customer', 'phone', e.target.value)} error={errors['customer.phone']} />
                            <Input label="Age" type="number" value={data.customer.age} onChange={e => setNested('customer', 'age', e.target.value)} error={errors['customer.age']} />
                            <Select label="Gender" value={data.customer.gender} onChange={e => setNested('customer', 'gender', e.target.value)} error={errors['customer.gender']}>
                                <option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                            </Select>
                        </div>
                        <Textarea label="Address" rows="2" className="mt-4" value={data.customer.address} onChange={e => setNested('customer', 'address', e.target.value)} error={errors['customer.address']} />
                    </section>

                    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                        <h2 className="mb-4 text-lg font-bold">Eye Prescription Optional</h2>
                        <div className="grid gap-4 md:grid-cols-4">
                            <Input label="Right SPH" value={data.prescription.right_sph} onChange={e => setNested('prescription', 'right_sph', e.target.value)} error={errors['prescription.right_sph']} />
                            <Input label="Right CYL" value={data.prescription.right_cyl} onChange={e => setNested('prescription', 'right_cyl', e.target.value)} error={errors['prescription.right_cyl']} />
                            <Input label="Right Axis" value={data.prescription.right_axis} onChange={e => setNested('prescription', 'right_axis', e.target.value)} error={errors['prescription.right_axis']} />
                            <Input label="Right VA" value={data.prescription.right_va} onChange={e => setNested('prescription', 'right_va', e.target.value)} error={errors['prescription.right_va']} />
                            <Input label="Left SPH" value={data.prescription.left_sph} onChange={e => setNested('prescription', 'left_sph', e.target.value)} error={errors['prescription.left_sph']} />
                            <Input label="Left CYL" value={data.prescription.left_cyl} onChange={e => setNested('prescription', 'left_cyl', e.target.value)} error={errors['prescription.left_cyl']} />
                            <Input label="Left Axis" value={data.prescription.left_axis} onChange={e => setNested('prescription', 'left_axis', e.target.value)} error={errors['prescription.left_axis']} />
                            <Input label="Left VA" value={data.prescription.left_va} onChange={e => setNested('prescription', 'left_va', e.target.value)} error={errors['prescription.left_va']} />
                            <Input label="Near Addition" value={data.prescription.near_addition} onChange={e => setNested('prescription', 'near_addition', e.target.value)} error={errors['prescription.near_addition']} />
                            <Input label="IPD" value={data.prescription.ipd} onChange={e => setNested('prescription', 'ipd', e.target.value)} error={errors['prescription.ipd']} />
                        </div>
                        <Textarea label="Complaints" rows="2" className="mt-4" value={data.prescription.complaints} onChange={e => setNested('prescription', 'complaints', e.target.value)} />
                        <Textarea label="Remarks" rows="2" className="mt-4" value={data.prescription.remarks} onChange={e => setNested('prescription', 'remarks', e.target.value)} />
                    </section>

                    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                        <div className="mb-4 flex items-center gap-2"><Icon name="cart" /><h2 className="text-lg font-bold">Sale Items</h2></div>
                        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search product..." className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900" />
                            <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900">
                                <option value="">Choose product</option>
                                {filteredProducts.map(product => <option key={product.id} value={product.id}>{product.name} · {product.product_type} · Stock {product.stock_quantity} · {money(product.sale_price)}</option>)}
                            </select>
                            <button type="button" onClick={addProduct} className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white">Add</button>
                        </div>
                        {errors.items && <p className="mt-2 text-sm text-red-500">{errors.items}</p>}

                        <div className="mt-4 overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="text-left text-slate-500"><tr><th className="py-2">Product</th><th>Qty</th><th>Price</th><th>Discount</th><th>Total</th><th></th></tr></thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {data.items.map((item, index) => {
                                        const lineTotal = Math.max(0, (Number(item.quantity) * Number(item.unit_price)) - Number(item.discount || 0));
                                        return (
                                            <tr key={item.product_id}>
                                                <td className="py-3"><p className="font-bold">{item.name}</p><p className="text-xs text-slate-500">{item.type} · Stock {item.stock_quantity}</p></td>
                                                <td><input type="number" min="1" max={item.stock_quantity} value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} className="w-20 rounded-xl border border-slate-200 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900" /></td>
                                                <td><input type="number" min="0" step="0.01" value={item.unit_price} onChange={e => updateItem(index, 'unit_price', e.target.value)} className="w-28 rounded-xl border border-slate-200 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900" /></td>
                                                <td><input type="number" min="0" step="0.01" value={item.discount} onChange={e => updateItem(index, 'discount', e.target.value)} className="w-28 rounded-xl border border-slate-200 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900" /></td>
                                                <td className="font-bold">{money(lineTotal)}</td>
                                                <td><button type="button" onClick={() => removeItem(index)} className="rounded-xl border border-red-200 p-2 text-red-600"><Icon name="trash" /></button></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                <aside className="h-fit rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 xl:sticky xl:top-24">
                    <h2 className="text-lg font-bold">Invoice Summary</h2>
                    <div className="mt-4 space-y-3">
                        <div className="flex justify-between"><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
                        <Input label="Invoice Discount" type="number" step="0.01" value={data.discount} onChange={e => setData('discount', e.target.value)} error={errors.discount} />
                        <Input label="Tax / VAT" type="number" step="0.01" value={data.tax} onChange={e => setData('tax', e.target.value)} error={errors.tax} />
                        <div className="flex justify-between border-t border-slate-100 pt-3 text-xl dark:border-slate-800"><span>Total</span><strong>{money(total)}</strong></div>
                        <Input label="Paid Amount" type="number" step="0.01" value={data.paid_amount} placeholder={String(total.toFixed(2))} onChange={e => setData('paid_amount', e.target.value)} error={errors.paid_amount} />
                        <div className="flex justify-between rounded-2xl bg-amber-50 p-3 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"><span>Due</span><strong>{money(due)}</strong></div>
                        <Select label="Payment Method" value={data.payment_method} onChange={e => setData('payment_method', e.target.value)} error={errors.payment_method}>
                            <option value="cash">Cash</option><option value="bkash">bKash</option><option value="nagad">Nagad</option><option value="card">Card</option><option value="bank">Bank</option>
                        </Select>
                        <Textarea label="Notes" rows="3" value={data.notes} onChange={e => setData('notes', e.target.value)} error={errors.notes} />
                    </div>
                    <div className="mt-5 grid gap-3">
                        <button disabled={processing} className="rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 disabled:opacity-60">{processing ? 'Saving...' : 'Complete Sale'}</button>
                        <Link href="/shop-admin/sales" className="rounded-2xl border border-slate-200 px-5 py-3 text-center font-semibold dark:border-slate-700">Cancel</Link>
                    </div>
                </aside>
            </form>
        </AdminLayout>
    );
}
