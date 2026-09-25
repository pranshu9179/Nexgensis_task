import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, addProduct, updateProduct } from '../api/productsApi';
import ProductForm from '../components/products/ProductForm';
import Loader from '../components/ui/Loader';
import ErrorState from '../components/ui/ErrorState';
import { ArrowLeft } from 'lucide-react';

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(isEditMode);
  const [fetchError, setFetchError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

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
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError('');

    try {
      let saved;
      if (isEditMode) {
        saved = await updateProduct(id, formData);
      } else {
        saved = await addProduct(formData);
      }
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
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600
                   transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

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

      {submitError && (
        <div className="px-4 py-3 text-sm text-danger-500 bg-red-50 rounded-xl border border-red-100">
          {submitError}
        </div>
      )}

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
