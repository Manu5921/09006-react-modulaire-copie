'use client';

import { useState } from 'react';
import { FaqItem } from '../types/faq.types';

interface FaqItemProps {
  item: FaqItem;
}

export default function FaqItemComponent({ item }: FaqItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm">
      <button
        className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-t-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">{item.question}</h3>
          <span className="ml-6 flex-shrink-0">
            <svg
              className={`h-5 w-5 text-gray-500 transform transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
      </button>
      
      {isOpen && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <p className="text-gray-700 leading-relaxed">{item.answer}</p>
          {item.id === '1' && ( // Only show image for the first FAQ item for testing
            <div className="mt-4">
              <img
                src="/modules/faq/sample-image.png"
                alt="Sample FAQ Image"
                className="max-w-xs rounded-md shadow-md"
              />
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {item.tags.map((tag: string) => (
              <span
                key={tag}
                className="inline-block px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
