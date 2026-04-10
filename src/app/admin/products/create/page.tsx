'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  createProductSchema,
  type CreateProductInput,
} from '@/lib/validations/admin';
import { generateSlug } from '@/lib/slug';

interface Category {
  id: string;
  name: string;
}

function ProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditing = !!editId;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);

  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema) as any,
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      price: 0,
      stock: 0,
      sku: '',
      authorId: '',
      language: 'URDU',
      categoryId: '',
      imageUrl: '',
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const watchTitle = watch('title');

  // Auto-generate slug from title
  useEffect(() => {
    if (watchTitle && !isEditing) {
      setValue('slug', generateSlug(watchTitle));
    }
  }, [watchTitle, setValue, isEditing]);

  // Fetch categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await fetch('/api/admin/categories');
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.data || []);
        }
      } catch {
        toast.error('Failed to load form data');
      }
    };
    fetchData();
  }, []);

  // Fetch product data if editing
  useEffect(() => {
    if (!editId) return;

    const fetchProduct = async () => {
      setFetchingData(true);
      try {
        const res = await fetch('/api/admin/products');
        if (!res.ok) throw new Error('Failed to fetch product');
        const data = await res.json();
        const product = data.data?.find((p: { id: string }) => p.id === editId);
        if (!product) {
          toast.error('Product not found');
          router.push('/admin/products');
          return;
        }
        setValue('title', product.title);
        setValue('slug', product.slug);
        setValue('description', product.description);
        setValue('price', product.price);
        setValue('stock', product.stock);
        setValue('sku', product.sku || '');
        setValue('authorId', product.authorId || '');
        setValue('language', product.language);
        setValue('categoryId', product.categoryId);
        setValue('imageUrl', product.images?.[0]?.url || '');
      } catch {
        toast.error('Failed to load product');
      } finally {
        setFetchingData(false);
      }
    };
    fetchProduct();
  }, [editId, router, setValue]);

  const onSubmit = async (data: CreateProductInput) => {
    setLoading(true);
    try {
      const url = isEditing
        ? `/api/admin/products/${editId}`
        : '/api/admin/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save product');
      }

      toast.success(
        isEditing
          ? 'Product updated successfully'
          : 'Product created successfully'
      );
      router.push('/admin/products');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Edit Product' : 'Create Product'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? 'Update product information'
              : 'Add a new product to your inventory'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Product title, slug, and description
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Sahih Bukhari — Complete Set"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-destructive text-sm">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                placeholder="e.g., sahih-bukhari-complete-set"
                {...register('slug')}
              />
              <p className="text-xs text-muted-foreground">
                Auto-generated from title. URL-friendly identifier.
              </p>
              {errors.slug && (
                <p className="text-destructive text-sm">
                  {errors.slug.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Detailed product description..."
                {...register('description')}
              />
              {errors.description && (
                <p className="text-destructive text-sm">
                  {errors.description.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Inventory */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Inventory</CardTitle>
            <CardDescription>Price, stock levels, and SKU</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('price', { valueAsNumber: true })}
                />
                {errors.price && (
                  <p className="text-destructive text-sm">
                    {errors.price.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="0"
                  {...register('stock', { valueAsNumber: true })}
                />
                {errors.stock && (
                  <p className="text-destructive text-sm">
                    {errors.stock.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  placeholder="e.g., BF-001"
                  {...register('sku')}
                />
                {errors.sku && (
                  <p className="text-destructive text-sm">
                    {errors.sku.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Classification */}
        <Card>
          <CardHeader>
            <CardTitle>Classification</CardTitle>
            <CardDescription>Category, language, and author</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={watch('categoryId')}
                onValueChange={(val) => setValue('categoryId', val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-destructive text-sm">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={watch('language')}
                onValueChange={(val: string) =>
                  setValue(
                    'language',
                    val as CreateProductInput['language']
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="URDU">Urdu</SelectItem>
                  <SelectItem value="ARABIC">Arabic</SelectItem>
                  <SelectItem value="ENGLISH">English</SelectItem>
                  <SelectItem value="PUNJABI">Punjabi</SelectItem>
                  <SelectItem value="SPANISH">Spanish</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="authorId">Author ID</Label>
              <Input
                id="authorId"
                placeholder="Author UUID (optional)"
                {...register('authorId')}
              />
              {errors.authorId && (
                <p className="text-destructive text-sm">
                  {errors.authorId.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Image */}
        <Card>
          <CardHeader>
            <CardTitle>Product Image</CardTitle>
            <CardDescription>
              CDN image URL for the product (image upload coming soon)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                placeholder="https://cdn.example.com/image.jpg"
                {...register('imageUrl')}
              />
              {errors.imageUrl && (
                <p className="text-destructive text-sm">
                  {errors.imageUrl.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="submit"
            className="bg-brand hover:bg-brand-light"
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditing ? 'Update Product' : 'Create Product'}
          </Button>
          <Link href="/admin/products">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function CreateProductPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      }
    >
      <ProductForm />
    </Suspense>
  );
}
