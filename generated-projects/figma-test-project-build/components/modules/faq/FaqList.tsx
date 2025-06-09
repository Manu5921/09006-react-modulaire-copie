'use client';

import { useState, useMemo } from 'react';
import FaqItemComponent from './FaqItem';
import FaqSearch from './FaqSearch';
import { FaqItem, FaqCategory } from '../../../lib/modules/faq/types/faq.types';

interface FaqListProps {
  items: FaqItem[];
  categories: FaqCategory[];
}

export default function FaqList({ items, categories }: FaqListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredItems = useMemo(() => {
    let filtered = items;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        item.tags.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [items, searchQuery, selectedCategory]);

  return (
    <div>
      <FaqSearch
        onSearch={setSearchQuery}
        onCategoryFilter={setSelectedCategory}
        categories={categories}
      />

      <div className="space-y-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <FaqItemComponent key={item.id} item={item} />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No FAQ items found</div>
            <p className="text-gray-400 mt-2">
              Try adjusting your search terms or category filter
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
