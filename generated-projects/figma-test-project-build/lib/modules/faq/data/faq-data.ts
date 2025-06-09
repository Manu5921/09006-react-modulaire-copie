import { FaqItem, FaqCategory } from '../types/faq.types';

export const faqCategories: FaqCategory[] = [
  {
    id: 'general',
    name: 'General',
    description: 'General questions about our service'
  },
  {
    id: 'billing',
    name: 'Billing',
    description: 'Questions about pricing and payments'
  },
  {
    id: 'technical',
    name: 'Technical',
    description: 'Technical support and troubleshooting'
  }
];

export const faqItems: FaqItem[] = [
  {
    id: '1',
    question: 'How do I get started?',
    answer: 'Getting started is easy! Simply sign up for an account, complete your profile, and you can begin using our services immediately. We also offer a comprehensive onboarding guide to help you through the process.',
    category: 'general',
    tags: ['getting started', 'onboarding', 'setup']
  },
  {
    id: '2',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. All payments are processed securely through our encrypted payment system.',
    category: 'billing',
    tags: ['payment', 'credit card', 'paypal', 'billing']
  },
  {
    id: '3',
    question: 'How can I contact support?',
    answer: 'You can reach our support team through multiple channels: email us at support@example.com, use our live chat feature, or call us at +1 (555) 123-4567. Our team is available 24/7 to assist you.',
    category: 'general',
    tags: ['support', 'contact', 'help']
  },
  {
    id: '4',
    question: 'Is there a free trial available?',
    answer: 'Yes! We offer a 14-day free trial for all new users. You can access all premium features during the trial period without any commitment. No credit card required to start.',
    category: 'billing',
    tags: ['free trial', 'pricing', 'trial period']
  },
  {
    id: '5',
    question: 'How do I reset my password?',
    answer: 'To reset your password, go to the login page and click \"Forgot Password\". Enter your email address, and we\'ll send you a secure link to create a new password. The link expires in 1 hour for security.',
    category: 'technical',
    tags: ['password', 'reset', 'security', 'login']
  },
  {
    id: '6',
    question: 'Can I cancel my subscription anytime?',
    answer: 'Absolutely! You can cancel your subscription at any time from your account settings. There are no cancellation fees, and you\'ll continue to have access until the end of your current billing period.',
    category: 'billing',
    tags: ['cancellation', 'subscription', 'billing']
  }
];
