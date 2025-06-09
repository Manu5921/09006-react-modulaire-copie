"use client";

import { useState } from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

const defaultFaqItems: FaqItem[] = [
  {
    question: "What is this FAQ module?",
    answer: "This is a placeholder FAQ item from the FAQ module. You can replace this with actual questions and answers."
  },
  {
    question: "How do I customize this?",
    answer: "You can edit the FaqAccordion.tsx component and the faq/page.tsx page within the src/modules/faq directory."
  },
  {
    question: "Is this a real accordion?",
    answer: "Not yet! This is a static list. A real accordion would require some JavaScript for interactivity, which can be added later."
  }
];

export default function FaqAccordion({ items = defaultFaqItems }: { items?: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center">FAQ Accordion (from FAQ Module)</h2>
      {items.map((item, index) => (
        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
          <button 
            onClick={() => toggleItem(index)}
            className="w-full flex justify-between items-center text-left p-4 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
          >
            <h3 className="font-medium text-lg text-gray-800">{item.question}</h3>
            <span>{openIndex === index ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-indigo-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            )}
            </span>
          </button>
          {openIndex === index && (
            <div className="p-4 bg-white border-t border-gray-200">
              <p className="text-gray-700 text-base leading-relaxed">{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
