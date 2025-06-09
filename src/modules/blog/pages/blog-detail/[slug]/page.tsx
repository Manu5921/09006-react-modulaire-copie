// src/modules/blog/pages/blog-detail/[slug]/page.tsx
"use client"; // Can be a client component if we use hooks, or a server component if data fetching is done appropriately

import React from 'react';
// Assuming BlogPost is the component previously named PostDetail
import PostDetailComponent from '../../../../components/modules/blog/BlogPost';
import { getPostBySlug, BlogPost as BlogPostType } from '../../../../lib/modules/blog/data/posts'; // Adjusted path

// This function can be used for Next.js's generateStaticParams if we want to pre-render these pages at build time
// For dynamic server-side rendering, it's not strictly necessary for this page to work,
// but good for performance in a static/SSG setup.
// export async function generateStaticParams() {
//   const { getAllPosts } = await import('../../../../lib/modules/blog/data/posts');
//   const posts = getAllPosts();
//   return posts.map((post) => ({
//     slug: post.slug,
//   }));
// }

const BlogDetailPage = ({ params }: { params: { slug: string } }) => {
  const { slug } = params;
  // In a real app, data fetching might be more complex (e.g., async, server-side)
  const post: BlogPostType | undefined = getPostBySlug(slug);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <main className="my-8">
        <PostDetailComponent post={post} />
      </main>
    </div>
  );
};

export default BlogDetailPage;
