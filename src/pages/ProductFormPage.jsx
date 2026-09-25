import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, addProduct, updateProduct } from '../api/productsApi';
import ProductForm from '../components/products/ProductForm';
import Loader from '../components/ui/Loader';
import ErrorState from '../components/ui/ErrorState';
import { ArrowLeft } from 'lucide-react';

/**
 * Product form page — handles both Add (`/products/new`) and Edit (`/products/:id/edit`).
 *
 * For edit mode, we fetch the existing product first to populate the form.
 * On successful submit, we navigate back to the list page. The local-state
 * overlay in ProductListPage will show the change until the next server fetch.
 */
export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(isEditMode); // only load in edit mode
  const [fetchError, setFetchError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // ── Fetch existing product data in edit mode ──
  useEffect(() => {
    if (!isEditMode) return;

    const controller = new AbortController();
    setLoading(true);

    getProductById(id, controller.signal)
      .then((data) => {
        setInitialData(data);
      })
      .catch((err) => {
        if (err.code === 'ERR_CANCELED') return;
        setFetchError(err.message);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [id, isEditMode]);

  async function handleSubmit(formData) {
    if (isSubmitting) return; // double-submit guard
    setIsSubmitting(true);
    setSubmitError('');

    try {
      let saved;
      if (isEditMode) {
        saved = await updateProduct(id, formData);
      } else {
        saved = await addProduct(formData);
      }
      // Navigate back to the product list with the saved product in router state.
      // The list page's local overlay will capture it and display it immediately.
      navigate('/products', {
        state: isEditMode
          ? { editedProduct: saved || { ...formData, id: Number(id) } }
          : { addedProduct: saved || { ...formData, id: Date.now() } },
      });
    } catch (err) {
      setSubmitError(err.message || 'Failed to save product.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) return <Loader />;
  if (fetchError) return <ErrorState message={fetchError} />;

  return (
    <div className="space-y-6">
      {/* ── Back link ── */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600
                   transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isEditMode
            ? 'Update the product details below.'
            : 'Fill in the details to create a new product.'}
        </p>
      </div>

      {/* ── Submit error ── */}
      {submitError && (
        <div className="px-4 py-3 text-sm text-danger-500 bg-red-50 rounded-xl border border-red-100">
          {submitError}
        </div>
      )}

      {/* ── Form ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <ProductForm
          initialData={isEditMode ? initialData : null}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel={isEditMode ? 'Update Product' : 'Create Product'}
        />
      </div>
    </div>
  );
}
