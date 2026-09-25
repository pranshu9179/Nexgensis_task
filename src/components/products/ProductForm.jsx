import { useState, useEffect } from 'react';
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { validateProductForm, hasErrors } from '../../utils/validators';
import { getCategories } from '../../api/productsApi';

/**
 * Reusable product form shared by the Add and Edit flows.
 *
 * Receives `initialData` (empty for add, populated for edit) and calls
 * `onSubmit` with the validated form data. The parent page handles the
 * actual API call and navigation.
 *
 * Supports adding product images via either direct URL or local file upload
 * (converted to base64 Data URL for instant preview and local overlay display).
 */
export default function ProductForm({ initialData, onSubmit, isSubmitting, submitLabel = 'Save' }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: initialData?.title || '',
    price: initialData?.price ?? '',
    stock: initialData?.stock ?? '',
    category: initialData?.category || '',
    description: initialData?.description || '',
    // Product image: initialized from existing thumbnail or first image
    thumbnail: initialData?.thumbnail || initialData?.images?.[0] || '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Fetch categories for the dropdown
  useEffect(() => {
    const controller = new AbortController();
    getCategories(controller.signal)
      .then(setCategories)
      .catch(() => {}); // silent fail — the dropdown just stays empty
    return () => controller.abort();
  }, []);

  // Re-populate the form when initialData arrives (edit mode loads async)
  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        price: initialData.price ?? '',
        stock: initialData.stock ?? '',
        category: initialData.category || '',
        description: initialData.description || '',
        thumbnail: initialData.thumbnail || initialData.images?.[0] || '',
      });
    }
  }, [initialData]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Re-validate touched fields live so errors disappear as the user fixes them
    if (touched[field]) {
      const newErrors = validateProductForm({ ...form, [field]: value });
      setErrors((prev) => ({ ...prev, [field]: newErrors[field] }));
    }
  }

  function handleBlur(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const newErrors = validateProductForm(form);
    setErrors((prev) => ({ ...prev, [field]: newErrors[field] }));
  }

  // ── Handle local image file upload ──
  // Converts the selected image file to a base64 Data URL using FileReader.
  // This allows instant preview and offline/mock-API persistence without needing a storage backend.
  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WebP, etc.).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      handleChange('thumbnail', uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  }

  // ── Remove current image ──
  function handleRemoveImage() {
    handleChange('thumbnail', '');
  }

  function handleSubmit(e) {
    e.preventDefault();

    // Validate all fields on submit
    const newErrors = validateProductForm(form);
    setErrors(newErrors);
    setTouched({ title: true, price: true, stock: true, category: true });

    if (hasErrors(newErrors)) return;

    // Convert price and stock to numbers for the API and include image thumbnail
    onSubmit({
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      thumbnail: form.thumbnail || '',
      images: form.thumbnail ? [form.thumbnail] : [],
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      {/* ── Title ── */}
      <FormField label="Title" error={errors.title} touched={touched.title}>
        <input
          type="text"
          value={form.title}
          onChange={(e) => handleChange('title', e.target.value)}
          onBlur={() => handleBlur('title')}
          placeholder="Product title"
          className={inputClasses(errors.title && touched.title)}
        />
      </FormField>

      {/* ── Price ── */}
      <FormField label="Price ($)" error={errors.price} touched={touched.price}>
        <input
          type="number"
          step="0.01"
          min="0"
          value={form.price}
          onChange={(e) => handleChange('price', e.target.value)}
          onBlur={() => handleBlur('price')}
          placeholder="0.00"
          className={inputClasses(errors.price && touched.price)}
        />
      </FormField>

      {/* ── Stock ── */}
      <FormField label="Stock" error={errors.stock} touched={touched.stock}>
        <input
          type="number"
          step="1"
          min="0"
          value={form.stock}
          onChange={(e) => handleChange('stock', e.target.value)}
          onBlur={() => handleBlur('stock')}
          placeholder="0"
          className={inputClasses(errors.stock && touched.stock)}
        />
      </FormField>

      {/* ── Category ── */}
      <FormField label="Category" error={errors.category} touched={touched.category}>
        <select
          value={form.category}
          onChange={(e) => handleChange('category', e.target.value)}
          onBlur={() => handleBlur('category')}
          className={inputClasses(errors.category && touched.category) + ' cursor-pointer'}
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </FormField>

      {/* ── Product Image (optional: paste URL or upload file) ── */}
      <FormField label="Product Image (optional)">
        <div className="space-y-3">
          {/* Direct URL input */}
          <input
            type="url"
            value={form.thumbnail}
            onChange={(e) => handleChange('thumbnail', e.target.value)}
            placeholder="Paste image URL (https://…)"
            className={inputClasses(false)}
          />

          {/* Local file upload option */}
          <div className="flex items-center gap-3">
            <label
              htmlFor="product-image-upload"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium
                         text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl cursor-pointer
                         transition-colors border border-gray-200"
            >
              <Upload className="w-3.5 h-3.5 text-gray-500" />
              Upload Image File
            </label>
            <input
              id="product-image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <span className="text-xs text-gray-400">PNG, JPG, WebP, or GIF</span>
          </div>

          {/* Live Preview with remove button */}
          {form.thumbnail && (
            <div className="relative inline-block mt-1">
              <img
                src={form.thumbnail}
                alt="Product preview"
                className="w-24 h-24 object-cover rounded-xl border border-gray-200 shadow-xs bg-gray-50"
                onError={(e) => {
                  e.target.style.opacity = '0.5';
                }}
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600
                           text-white rounded-full shadow-md transition-transform
                           hover:scale-110 cursor-pointer"
                title="Remove image"
                aria-label="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </FormField>

      {/* ── Description (optional) ── */}
      <FormField label="Description (optional)">
        <textarea
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Product description…"
          rows={4}
          className={inputClasses(false) + ' resize-y'}
        />
      </FormField>

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold
                   text-white bg-brand-500 rounded-xl hover:bg-brand-600 active:scale-[0.98]
                   transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving…
          </>
        ) : (
          submitLabel
        )}
      </button>
    </form>
  );
}

/**
 * Small wrapper for consistent form field layout + error display.
 */
function FormField({ label, error, touched, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      {children}
      {error && touched && (
        <p className="mt-1 text-xs text-danger-500">{error}</p>
      )}
    </div>
  );
}

/**
 * Shared input class string. The `hasError` param toggles the red border.
 */
function inputClasses(hasError) {
  return `w-full px-4 py-2.5 text-sm bg-white border rounded-xl
          focus:outline-none focus:ring-2 transition-colors
          ${
            hasError
              ? 'border-danger-500 focus:ring-red-200'
              : 'border-gray-200 focus:ring-brand-300 focus:border-brand-400'
          }`;
}
