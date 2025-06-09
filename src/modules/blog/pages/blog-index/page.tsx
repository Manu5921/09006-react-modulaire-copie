// src/modules/blog/pages/blog-index/page.tsx
import React from 'react';
import BlogList from '../../../components/modules/blog/BlogList';

const BlogIndexPage = () => {
  return (
    <div>
      <h1>Blog Index Page (from Module)</h1>
      <BlogList />
      <p>This is the main blog page, generated from the blog module.</p>
    </div>
  );
};

export default BlogIndexPage;
