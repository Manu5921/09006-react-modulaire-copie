export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  date?: string; // Optional for now
  author?: string; // Optional for now
}

export const posts: BlogPost[] = [
  {
    id: "1",
    slug: "first-post",
    title: "My First Blog Post",
    content: "<p>This is the content of my very first blog post. It's exciting to share my thoughts!</p><p>Stay tuned for more updates.</p>",
    date: "2023-10-26",
    author: "Admin User"
  },
  {
    id: "2",
    slug: "tailwind-css-rocks",
    title: "Why Tailwind CSS Rocks",
    content: "<p>Tailwind CSS makes styling so much easier and faster. Here are a few reasons why:</p><ul><li>Utility-first approach</li><li>Highly customizable</li><li>Great performance</li></ul>",
    date: "2023-10-27",
    author: "Dev Team"
  },
  {
    id: "3",
    slug: "getting-started-nextjs",
    title: "Getting Started with Next.js",
    content: "<p>Next.js is a fantastic framework for building React applications. This post will guide you through the initial setup and basic concepts.</p><p>Follow along to create your first Next.js app.</p>",
    date: "2023-10-28",
    author: "Jane Doe"
  }
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find(post => post.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  return posts;
}
