// src/modules/blog/components/BlogPost.tsx
import React from 'react';

const BlogPost = ({ slug }: { slug?: string }) => {
  return (
    <div>
      <h2>Blog Post: {slug || 'N/A'} (from Module)</h2>
      <p>Content of the blog post will appear here.</p>
    </div>
  );
};

export default BlogPost;
