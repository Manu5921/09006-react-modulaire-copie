// src/modules/blog/components/PostDetail.tsx
import React from 'react';
import Link from 'next/link';
import { BlogPost } from '../../../lib/modules/blog/data/posts'; // Assuming posts.ts is in ../data/

interface PostDetailProps {
  post: BlogPost | undefined;
}

const PostDetail: React.FC<PostDetailProps> = ({ post }) => {
  if (!post) {
    return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Post Not Found</h1>
        <p className="text-gray-700 mb-6">
          Sorry, we couldn't find the post you're looking for.
        </p>
        <Link href="/blog" legacyBehavior>
          <a className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
            Back to Blog
          </a>
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto p-6 md:p-8 bg-white shadow-xl rounded-lg">
      <header className="mb-8 border-b pb-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
          {post.title}
        </h1>
        {post.date && (
          <p className="text-md text-gray-500">
            Published on {new Date(post.date).toLocaleDateString()}
            {post.author && (
              <>
                {' by '}
                <span className="font-semibold text-gray-700">{post.author}</span>
              </>
            )}
          </p>
        )}
      </header>
      <div
        className="prose prose-indigo lg:prose-xl max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      <div className="mt-12 pt-6 border-t">
        <Link href="/blog" legacyBehavior>
          <a className="text-indigo-600 hover:text-indigo-800 hover:underline transition-colors">
            &larr; Back to all posts
          </a>
        </Link>
      </div>
    </article>
  );
};

export default PostDetail;
