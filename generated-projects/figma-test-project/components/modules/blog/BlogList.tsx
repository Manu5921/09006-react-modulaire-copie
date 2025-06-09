// src/modules/blog/components/PostList.tsx
import React from 'react';
import Link from 'next/link';
import { BlogPost } from '../../../lib/modules/blog/data/posts'; // Assuming posts.ts is in ../data/

interface PostListProps {
  posts: BlogPost[];
}

const PostList: React.FC<PostListProps> = ({ posts }) => {
  if (!posts || posts.length === 0) {
    return <p className="text-gray-600">No posts available at the moment.</p>;
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <article key={post.id} className="p-6 bg-white shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
          <h2 className="text-3xl font-bold mb-2 text-indigo-700 hover:text-indigo-800">
            <Link href={`/blog/${post.slug}`} legacyBehavior>
              <a>{post.title}</a>
            </Link>
          </h2>
          {post.date && (
            <p className="text-sm text-gray-500 mb-3">
              Published on {new Date(post.date).toLocaleDateString()}
              {post.author && ` by ${post.author}`}
            </p>
          )}
          <div
            className="text-gray-700 prose prose-indigo lg:prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content.substring(0, 150) + (post.content.length > 150 ? '...' : '') }}
          />
          <Link href={`/blog/${post.slug}`} legacyBehavior>
            <a className="inline-block mt-4 text-indigo-600 hover:text-indigo-800 font-semibold hover:underline">
              Read more &rarr;
            </a>
          </Link>
        </article>
      ))}
    </div>
  );
};

export default PostList;
