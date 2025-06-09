// src/modules/blog/pages/blog-detail/[slug]/page.tsx
import React from 'react';
import BlogPost from '../../../components/modules/blog/BlogPost';

const BlogDetailPage = ({ params }: { params: { slug: string } }) => {
  return (
    <div>
      <h1>Blog Detail Page (from Module)</h1>
      <p>Displaying post for slug: {params.slug}</p>
      <BlogPost slug={params.slug} />
    </div>
  );
};

export default BlogDetailPage;
