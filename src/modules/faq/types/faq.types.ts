export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

export interface FaqCategory {
  id: string;
  name: string;
  description: string;
}
