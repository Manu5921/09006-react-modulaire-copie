import FaqList from '../../components/modules/faq/FaqList';
import { faqItems, faqCategories } from '../../lib/modules/faq/data/faq-data';

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our service. Can't find what you're looking for?
            Contact our support team for help.
          </p>
        </div>

        <FaqList items={faqItems} categories={faqCategories} />
      </div>
    </div>
  );
}
