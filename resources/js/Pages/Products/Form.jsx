import { Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Input, Select, Textarea } from '@/Components/Input';
import ImageUpload from '@/Components/ImageUpload';
import { useI18n } from '@/i18n';

const baseForm = (type = 'medicine') => ({
    product_type: type, category_id: '', supplier_id: '', name: '', sku: '', barcode: '', brand: '', description: '', purchase_price: 0, sale_price: 0, stock_quantity: 0, minimum_stock_alert: 3, unit: 'pcs', is_active: true, show_on_website: false, is_featured: false, website_short_description: '', website_short_description_bn: '',
    images: [], remove_image_ids: [],
    generic_name: '', strength: '', dosage_form: '', manufacturer: '', batch_no: '', manufacture_date: '', expire_date: '', storage_note: '',
    glass_type: 'frame', model_no: '', frame_material: '', frame_color: '', size: '', lens_power: '', sph: '', cyl: '', axis: '', addition: '', lens_type: '', blue_cut: false, photochromic: false, anti_reflection: false, high_index: false,
});

function productToForm(product) {
    return {
        ...baseForm(product.product_type), ...product, category_id: product.category_id ?? '', supplier_id: product.supplier_id ?? '',
        ...product.medicine_detail, ...product.glass_detail,
        manufacture_date: product.medicine_detail?.manufacture_date ?? '', expire_date: product.medicine_detail?.expire_date ?? '',
        images: [], remove_image_ids: [], _method: 'put',
    };
}

export default function ProductForm({ mode, product, categories = [], suppliers = [], defaultType = 'medicine' }) {
    const { t } = useI18n();
    const { data, setData, post, processing, errors } = useForm(product ? productToForm(product) : baseForm(defaultType));

    const submit = (e) => {
        e.preventDefault();
        if (mode === 'edit') {
            post(`/shop-admin/products/${product.id}`, { forceFormData: true });
        } else {
            post('/shop-admin/products', { forceFormData: true });
        }
    };

    const toggleRemoveImage = (id) => {
        const ids = data.remove_image_ids || [];
        setData('remove_image_ids', ids.includes(id) ? ids.filter(item => item !== id) : [...ids, id]);
    };

    const filteredCategories = categories.filter(category => category.type === data.product_type || category.type === 'general');

    return (
        <AdminLayout title={mode === 'edit' ? t('editProduct') : t('addProduct')}>
            <form onSubmit={submit} className="space-y-6">
                <section className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                    <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white p-5 dark:border-slate-800 dark:from-blue-500/10 dark:to-slate-900">
                        <h2 className="text-lg font-black">{t('productInformation')}</h2>
                        <p className="mt-1 text-sm text-slate-500">Medicine and optical glass products support optional multiple images.</p>
                    </div>
                    <div className="p-5">
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            <Select label="Product Type" value={data.product_type} onChange={e => setData('product_type', e.target.value)} error={errors.product_type}><option value="medicine">Medicine</option><option value="glass">Glass</option></Select>
                            <Select label="Category" value={data.category_id} onChange={e => setData('category_id', e.target.value)} error={errors.category_id}><option value="">Select category</option>{filteredCategories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</Select>
                            <Select label="Supplier" value={data.supplier_id} onChange={e => setData('supplier_id', e.target.value)} error={errors.supplier_id}><option value="">Select supplier</option>{suppliers.map(supplier => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</Select>
                            <Input label="Product Name" value={data.name} onChange={e => setData('name', e.target.value)} error={errors.name} />
                            <Input label="SKU" value={data.sku} onChange={e => setData('sku', e.target.value)} error={errors.sku} />
                            <Input label="Barcode" value={data.barcode ?? ''} onChange={e => setData('barcode', e.target.value)} error={errors.barcode} />
                            <Input label="Brand" value={data.brand ?? ''} onChange={e => setData('brand', e.target.value)} error={errors.brand} />
                            <Input label="Purchase Price" type="number" step="0.01" value={data.purchase_price} onChange={e => setData('purchase_price', e.target.value)} error={errors.purchase_price} />
                            <Input label="Sale Price" type="number" step="0.01" value={data.sale_price} onChange={e => setData('sale_price', e.target.value)} error={errors.sale_price} />
                            <Input label="Stock Quantity" type="number" value={data.stock_quantity} onChange={e => setData('stock_quantity', e.target.value)} error={errors.stock_quantity} />
                            <Input label="Minimum Stock Alert" type="number" value={data.minimum_stock_alert} onChange={e => setData('minimum_stock_alert', e.target.value)} error={errors.minimum_stock_alert} />
                            <Input label="Unit" value={data.unit} onChange={e => setData('unit', e.target.value)} error={errors.unit} />
                        </div>
                        <div className="mt-4"><Textarea label="Description" rows="3" value={data.description ?? ''} onChange={e => setData('description', e.target.value)} error={errors.description} /></div>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <Textarea label="Website Short Description" rows="3" value={data.website_short_description ?? ''} onChange={e => setData('website_short_description', e.target.value)} error={errors.website_short_description} />
                            <Textarea label="Website Short Description (Bangla)" rows="3" value={data.website_short_description_bn ?? ''} onChange={e => setData('website_short_description_bn', e.target.value)} error={errors.website_short_description_bn} />
                        </div>
                        <div className="mt-5"><ImageUpload label={t('uploadImages')} files={data.images} multiple existing={product?.images ?? []} removeIds={data.remove_image_ids ?? []} onToggleRemove={toggleRemoveImage} onChange={files => setData('images', files)} error={errors.images || errors['images.0']} /></div>
                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                            <label className="flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-sm font-medium dark:bg-slate-950"><input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} /> Active product</label>
                            <label className="flex items-center gap-2 rounded-2xl bg-blue-50 p-3 text-sm font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"><input type="checkbox" checked={Boolean(data.show_on_website)} onChange={e => setData('show_on_website', e.target.checked)} /> Show on website</label>
                            <label className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-3 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"><input type="checkbox" checked={Boolean(data.is_featured)} onChange={e => setData('is_featured', e.target.checked)} /> Featured on website</label>
                        </div>
                    </div>
                </section>

                {data.product_type === 'medicine' ? (
                    <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                        <h2 className="mb-4 text-lg font-black">{t('medicineDetails')}</h2>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            <Input label="Generic Name" value={data.generic_name ?? ''} onChange={e => setData('generic_name', e.target.value)} error={errors.generic_name} />
                            <Input label="Strength" value={data.strength ?? ''} onChange={e => setData('strength', e.target.value)} error={errors.strength} />
                            <Input label="Dosage Form" value={data.dosage_form ?? ''} onChange={e => setData('dosage_form', e.target.value)} error={errors.dosage_form} />
                            <Input label="Manufacturer" value={data.manufacturer ?? ''} onChange={e => setData('manufacturer', e.target.value)} error={errors.manufacturer} />
                            <Input label="Batch No" value={data.batch_no ?? ''} onChange={e => setData('batch_no', e.target.value)} error={errors.batch_no} />
                            <Input label="Manufacture Date" type="date" value={data.manufacture_date ?? ''} onChange={e => setData('manufacture_date', e.target.value)} error={errors.manufacture_date} />
                            <Input label="Expire Date" type="date" value={data.expire_date ?? ''} onChange={e => setData('expire_date', e.target.value)} error={errors.expire_date} />
                        </div>
                        <div className="mt-4"><Textarea label="Storage Note" rows="3" value={data.storage_note ?? ''} onChange={e => setData('storage_note', e.target.value)} /></div>
                    </section>
                ) : (
                    <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                        <h2 className="mb-4 text-lg font-black">{t('glassDetails')}</h2>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            <Select label="Glass Type" value={data.glass_type} onChange={e => setData('glass_type', e.target.value)} error={errors.glass_type}><option value="frame">Frame</option><option value="lens">Lens</option><option value="sunglass">Sunglass</option><option value="reading_glass">Reading Glass</option><option value="contact_lens">Contact Lens</option></Select>
                            <Input label="Model No" value={data.model_no ?? ''} onChange={e => setData('model_no', e.target.value)} error={errors.model_no} />
                            <Input label="Frame Material" value={data.frame_material ?? ''} onChange={e => setData('frame_material', e.target.value)} error={errors.frame_material} />
                            <Input label="Frame Color" value={data.frame_color ?? ''} onChange={e => setData('frame_color', e.target.value)} error={errors.frame_color} />
                            <Input label="Size" value={data.size ?? ''} onChange={e => setData('size', e.target.value)} error={errors.size} />
                            <Input label="Lens Power" value={data.lens_power ?? ''} onChange={e => setData('lens_power', e.target.value)} error={errors.lens_power} />
                            <Input label="SPH" type="number" step="0.01" value={data.sph ?? ''} onChange={e => setData('sph', e.target.value)} error={errors.sph} />
                            <Input label="CYL" type="number" step="0.01" value={data.cyl ?? ''} onChange={e => setData('cyl', e.target.value)} error={errors.cyl} />
                            <Input label="Axis" type="number" value={data.axis ?? ''} onChange={e => setData('axis', e.target.value)} error={errors.axis} />
                            <Input label="Addition" type="number" step="0.01" value={data.addition ?? ''} onChange={e => setData('addition', e.target.value)} error={errors.addition} />
                            <Input label="Lens Type" value={data.lens_type ?? ''} onChange={e => setData('lens_type', e.target.value)} error={errors.lens_type} />
                        </div>
                        <div className="mt-5 grid gap-3 md:grid-cols-4">
                            {['blue_cut', 'photochromic', 'anti_reflection', 'high_index'].map(key => <label key={key} className="flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-sm font-semibold dark:bg-slate-950"><input type="checkbox" checked={Boolean(data[key])} onChange={e => setData(key, e.target.checked)} /> {key.replace('_', ' ')}</label>)}
                        </div>
                    </section>
                )}

                <div className="flex flex-wrap justify-end gap-3">
                    <Link href="/shop-admin/products" className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold dark:border-slate-700 dark:bg-slate-900">Cancel</Link>
                    <button disabled={processing} className="rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-600/20 disabled:opacity-50">{processing ? 'Saving...' : (mode === 'edit' ? 'Update Product' : 'Save Product')}</button>
                </div>
            </form>
        </AdminLayout>
    );
}
