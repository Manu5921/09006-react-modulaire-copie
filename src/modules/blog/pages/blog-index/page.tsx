// src/modules/blog/pages/blog-index/page.tsx
"use client"; // Required if using hooks like useState, useEffect, or for event handlers

import React from 'react';
// Assuming BlogList is the component previously named PostList
import PostListComponent from '../../../components/modules/blog/BlogList';
import { getAllPosts, BlogPost } from '../../../lib/modules/blog/data/posts'; // Adjusted path

const BlogIndexPage = () => {
  // In a real app, you might fetch posts in a useEffect or use server components
  const posts: BlogPost[] = getAllPosts();

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
          Our Blog
        </h1>
        <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
          Welcome to our thoughts, stories, and updates.
        </p>
      </header>

      <main>
        <PostListComponent posts={posts} />
      </main>

      <footer className="mt-12 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} Your Awesome Company. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default BlogIndexPage;
