'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Trash2, BookOpen, Check, X } from 'lucide-react';
import { useCompare } from '@/store/use-compare';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ComparePage() {
  const { items, removeItem, clearAll } = useCompare();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="main-container py-8 md:py-12">
        <nav className="flex items-center gap-2 text-[12px] text-gray-400 mb-6">
          <button onClick={() => router.push('/')} className="hover:text-[#1D333B] flex items-center gap-1 transition-colors">
            <ArrowLeft className="h-3 w-3" />
            Home
          </button>
          <span>/</span>
          <span className="text-[#1D333B] font-medium">Compare Products</span>
        </nav>

        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen className="h-20 w-20 text-gray-200 mb-4" />
          <h2 className="text-[18px] font-semibold text-[#1D333B] mb-2">No products to compare</h2>
          <p className="text-[14px] text-gray-400 max-w-md mb-6">
            Add up to 4 products to compare their features side by side. Click the compare icon on any product.
          </p>
          <Link
            href="/shop"
            className="bg-[#1D333B] hover:bg-[#142229] text-white text-[14px] font-medium px-6 py-3 transition-colors"
          >
            Browse Books
          </Link>
        </div>
      </div>
    );
  }

  // Define comparison attributes
  const attributes = [
    { key: 'price', label: 'Price', render: (item: typeof items[0]) => (
      <span className="text-[18px] font-bold text-[#1D333B]">Rs. {item.price.toLocaleString('en-PK')}</span>
    )},
    { key: 'category', label: 'Category', render: (item: typeof items[0]) => item.category },
    { key: 'author', label: 'Author', render: (item: typeof items[0]) => item.author || 'N/A' },
    { key: 'language', label: 'Language', render: (item: typeof items[0]) => item.language },
    { key: 'stock', label: 'Availability', render: (item: typeof items[0]) => (
      item.stock > 0 ? (
        <span className="text-green-600 font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          In Stock ({item.stock})
        </span>
      ) : (
        <span className="text-red-500 font-medium">Out of Stock</span>
      )
    )},
    { key: 'sku', label: 'SKU', render: (item: typeof items[0]) => item.sku || 'N/A' },
    { key: 'weight', label: 'Weight', render: (item: typeof items[0]) => item.weight ? `${item.weight} kg` : 'N/A' },
    { key: 'description', label: 'Description', render: (item: typeof items[0]) => (
      <p className="text-[13px] text-gray-600 line-clamp-4">{item.description}</p>
    )},
  ];

  return (
    <div className="main-container py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[12px] text-gray-400 mb-6">
        <button onClick={() => router.push('/')} className="hover:text-[#1D333B] flex items-center gap-1 transition-colors">
          <ArrowLeft className="h-3 w-3" />
          Home
        </button>
        <span>/</span>
        <span className="text-[#1D333B] font-medium">Compare Products</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[22px] md:text-[26px] font-bold text-[#1D333B]">
          Compare Products
          <span className="text-[14px] text-gray-400 font-normal ml-2">
            ({items.length}/4)
          </span>
        </h1>
        <button
          onClick={clearAll}
          className="text-[13px] text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear All
        </button>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Product Headers */}
          <thead>
            <tr>
              <th className="w-[160px] text-left text-[13px] text-gray-400 uppercase tracking-wider font-medium p-3 border-b border-gray-100 sticky left-0 bg-white z-10">
                Product
              </th>
              {items.map((item) => (
                <th key={item.productId} className="text-center p-3 border-b border-gray-100 min-w-[200px] relative">
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition-colors"
                    aria-label="Remove"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <Link href={`/shop/${item.slug}`} className="block">
                    {item.image ? (
                      <div className="h-32 w-24 bg-gray-50 mx-auto mb-3 overflow-hidden relative">
                        <Image src={item.image} alt={item.title} fill className="object-cover" sizes="96px" />
                      </div>
                    ) : (
                      <div className="h-32 w-24 bg-gray-50 mx-auto mb-3 flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-gray-200" />
                      </div>
                    )}
                    <span className="text-[13px] font-medium text-[#1D333B] hover:text-[#C9A84C] transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </span>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {attributes.map((attr, idx) => (
              <tr key={attr.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                <td className="text-[13px] text-gray-500 font-medium p-3 border-b border-gray-50 sticky left-0 z-10 bg-inherit">
                  {attr.label}
                </td>
                {items.map((item) => (
                  <td key={item.productId} className="text-center p-3 border-b border-gray-50 text-[13px]">
                    {attr.render(item)}
                  </td>
                ))}
              </tr>
            ))}
            {/* Add to Cart row */}
            <tr className="bg-white">
              <td className="p-3 sticky left-0 bg-white z-10"></td>
              {items.map((item) => (
                <td key={item.productId} className="text-center p-3">
                  <Link
                    href={`/shop/${item.slug}`}
                    className="inline-block bg-[#1D333B] hover:bg-[#142229] text-white text-[12px] font-bold uppercase tracking-wider px-5 py-2.5 transition-colors"
                  >
                    View Details
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
