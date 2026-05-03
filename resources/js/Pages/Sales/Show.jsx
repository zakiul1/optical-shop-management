import { Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Icon } from '@/Components/Icons';
import AuditMeta from '@/Components/AuditMeta';

function money(value) {
    return `৳ ${Number(value ?? 0).toFixed(2)}`;
}

function Field({ label, value }) {
    return <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950"><p className="text-xs text-slate-500">{label}</p><p className="font-bold">{value || 'N/A'}</p></div>;
}

export default function Show({ sale }) {
    return (
        <AdminLayout title={`Invoice ${sale.invoice_no}`}>
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:justify-between">
                <Link href="/shop-admin/sales" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-2 font-semibold dark:border-slate-700">Back to Sales</Link>
                <Link href={`/shop-admin/sales/${sale.id}/invoice`} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 font-semibold text-white"><Icon name="download" /> Download PDF</Link>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
                <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                    <h2 className="mb-4 text-lg font-bold">Sold Items</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="text-slate-500"><tr><th className="py-2">Product</th><th>Type</th><th>Qty</th><th>Unit Price</th><th>Discount</th><th>Total</th></tr></thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {sale.items.map(item => (
                                    <tr key={item.id}>
                                        <td className="py-3 font-bold">{item.product?.name}<p className="text-xs font-normal text-slate-500">SKU: {item.product?.sku}</p></td>
                                        <td>{item.product?.product_type}</td>
                                        <td>{item.quantity}</td>
                                        <td>{money(item.unit_price)}</td>
                                        <td>{money(item.discount)}</td>
                                        <td className="font-bold">{money(item.total_price)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                <div className="mt-4"><AuditMeta item={sale} /></div>
            </section>

                <aside className="space-y-6">
                    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                        <h2 className="mb-4 text-lg font-bold">Payment Summary</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between"><span>Subtotal</span><strong>{money(sale.subtotal)}</strong></div>
                            <div className="flex justify-between"><span>Discount</span><strong>{money(sale.discount)}</strong></div>
                            <div className="flex justify-between"><span>Tax</span><strong>{money(sale.tax)}</strong></div>
                            <div className="flex justify-between border-t border-slate-100 pt-3 text-xl dark:border-slate-800"><span>Total</span><strong>{money(sale.total)}</strong></div>
                            <div className="flex justify-between"><span>Paid</span><strong>{money(sale.paid_amount)}</strong></div>
                            <div className="flex justify-between rounded-2xl bg-amber-50 p-3 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"><span>Due</span><strong>{money(sale.due_amount)}</strong></div>
                            <Field label="Status" value={sale.payment_status} />
                            <Field label="Payment Method" value={sale.payment_method} />
                        </div>
                    </section>

                    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                        <h2 className="mb-4 text-lg font-bold">Customer</h2>
                        <div className="grid gap-3">
                            <Field label="Name" value={sale.customer?.name ?? 'Walk-in'} />
                            <Field label="Phone" value={sale.customer?.phone} />
                            <Field label="Age" value={sale.customer?.age} />
                            <Field label="Gender" value={sale.customer?.gender} />
                        </div>
                    </section>
                </aside>
            </div>

            {sale.prescription && (
                <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                    <h2 className="mb-4 text-lg font-bold">Prescription</h2>
                    <div className="grid gap-3 md:grid-cols-5">
                        <Field label="Right SPH" value={sale.prescription.right_sph} />
                        <Field label="Right CYL" value={sale.prescription.right_cyl} />
                        <Field label="Right Axis" value={sale.prescription.right_axis} />
                        <Field label="Right VA" value={sale.prescription.right_va} />
                        <Field label="IPD" value={sale.prescription.ipd} />
                        <Field label="Left SPH" value={sale.prescription.left_sph} />
                        <Field label="Left CYL" value={sale.prescription.left_cyl} />
                        <Field label="Left Axis" value={sale.prescription.left_axis} />
                        <Field label="Left VA" value={sale.prescription.left_va} />
                        <Field label="Near Addition" value={sale.prescription.near_addition} />
                    </div>
                </section>
            )}
        </AdminLayout>
    );
}
