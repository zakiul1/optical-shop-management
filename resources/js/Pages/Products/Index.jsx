import { Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Icon } from '@/Components/Icons';
import ConfirmModal from '@/Components/ConfirmModal';
import AuditMeta from '@/Components/AuditMeta';
import { useState } from 'react';

export default function Index({ products, filters = {} }) {
    const [deleteTarget, setDeleteTarget] = useState(null);
    const { delete: destroy, processing } = useForm();

    const applyFilter = (key, value) => {
        router.get('/products', { ...filters, [key]: value }, { preserveState: true, replace: true });
    };

    const removeProduct = () => {
        if (!deleteTarget) return;
        destroy(`/products/${deleteTarget.id}`, { onSuccess: () => setDeleteTarget(null) });
    };

    return (
        <AdminLayout title="Products">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-3 md:flex-row">
                    <div className="relative">
                        <Icon name="search" className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                        <input
                            defaultValue={filters.search ?? ''}
                            onKeyDown={e => e.key === 'Enter' && applyFilter('search', e.currentTarget.value)}
                            placeholder="Search product, SKU, brand..."
                            className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-10 pr-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 md:w-80"
                        />
                    </div>
                    <select value={filters.type ?? ''} onChange={e => applyFilter('type', e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                        <option value="">All Types</option>
                        <option value="medicine">Medicine</option>
                        <option value="glass">Glass</option>
                    </select>
                    <select value={filters.stock ?? ''} onChange={e => applyFilter('stock', e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                        <option value="">All Stock</option>
                        <option value="low">Low Stock</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    <Link href="/products/create?type=medicine" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 font-semibold text-white shadow-lg shadow-emerald-600/20"><Icon name="plus" /> Medicine</Link>
                    <Link href="/products/create?type=glass" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 font-semibold text-white shadow-lg shadow-blue-600/20"><Icon name="plus" /> Glass</Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {products.data.map(product => (
                    <article key={product.id} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900 dark:ring-slate-800">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${product.product_type === 'medicine' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300'}`}>{product.product_type}</span>
                                    {product.stock_quantity <= product.minimum_stock_alert && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">Low stock</span>}
                                </div>
                                <h2 className="mt-3 text-lg font-black">{product.name}</h2>
                                <p className="mt-1 text-sm text-slate-500">SKU: {product.sku}</p>
                            </div>
                            <div className="flex gap-2">
                                <Link href={`/products/${product.id}/edit`} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"><Icon name="edit" /></Link>
                                <button disabled={processing} onClick={() => setDeleteTarget(product)} className="rounded-xl border border-red-200 p-2 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"><Icon name="trash" /></button>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950"><p className="text-slate-500">Purchase</p><p className="font-bold">৳ {product.purchase_price}</p></div>
                            <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950"><p className="text-slate-500">Sale</p><p className="font-bold">৳ {product.sale_price}</p></div>
                            <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950"><p className="text-slate-500">Stock</p><p className="font-bold">{product.stock_quantity} {product.unit}</p></div>
                            <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950"><p className="text-slate-500">Category</p><p className="font-bold">{product.category?.name ?? 'N/A'}</p></div>
                        </div>

                        {product.product_type === 'medicine' && product.medicine_detail && (
                            <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">Expire Date: {product.medicine_detail.expire_date ?? 'N/A'} · Batch: {product.medicine_detail.batch_no ?? 'N/A'}</p>
                        )}
                        {product.product_type === 'glass' && product.glass_detail && (
                            <p className="mt-4 rounded-2xl bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">Model: {product.glass_detail.model_no ?? 'N/A'} · Power: {product.glass_detail.lens_power ?? 'N/A'}</p>
                        )}
                        <div className="mt-4"><AuditMeta item={product} /></div>
                    </article>
                ))}
            </div>

            {products.data.length === 0 && <div className="rounded-3xl bg-white p-10 text-center text-slate-500 dark:bg-slate-900">No product found.</div>}

            <div className="mt-6 flex flex-wrap gap-2">
                {products.links.map((link, index) => (
                    <Link key={index} href={link.url ?? '#'} preserveScroll className={`rounded-xl px-4 py-2 text-sm ${link.active ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-800'} ${!link.url ? 'pointer-events-none opacity-50' : ''}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                ))}
            </div>
            <ConfirmModal
                show={Boolean(deleteTarget)}
                title="Delete product?"
                message={`You are deleting ${deleteTarget?.name ?? 'this product'}. Related sales or purchase records may prevent deletion to protect history.`}
                confirmText="Delete Product"
                processing={processing}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={removeProduct}
            />
        </AdminLayout>
    );
}
