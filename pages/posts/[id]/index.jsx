import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAppContext } from "../../../context/state";
import { getPostById } from "../../../data/posts";
import Layout from "../../../components/layout";
import Navbar from "../../../components/navbar";

export default function PostDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { token, profile } = useAppContext();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const profileData = Array.isArray(profile) ? profile[0] : profile;

  const fetchPost = async () => {
    if (!id || !token) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getPostById(token, id);
      const normalizedPost = Array.isArray(data) ? data[0] : data;

      if (normalizedPost) {
        setPost(normalizedPost);
      }
    } catch (err) {
      console.error('Post fetch error:', err);
      setError(`Could not fetch post: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }; 

  useEffect(() => {
    if (id && token) {
      fetchPost();
    }
  }, [id, token]);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading post...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '15px', borderRadius: '5px' }}>
          <h4>{post ? 'Error' : 'Post Not Found'}</h4>
          <p>{error || "The post you're looking for doesn't exist."}</p>
          <button onClick={() => router.back()} style={{ marginRight: '10px' }}>
            Go Back
          </button>
          {error && (
            <button onClick={fetchPost}>
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentUserId = profileData?.user || profileData?.user_id || profileData?.id;
  const isOwner = currentUserId && (currentUserId === (post.user_id || post.user));
  const authorName = post.user_business?.display_name || post.user_profile?.username || `User ${post.user}`;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', backgroundColor:'white' }}>
      <h1>{post.title}</h1>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
        {post.user_profile?.profile_pic && (
          <img
            src={post.user_profile.profile_pic}
            alt={post.user_profile.username}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
        )}
        <div>
          <Link href={`/profile/${post.user}`}>
            <span style={{ color: '#007bff', cursor: 'pointer', fontWeight: 'bold' }}>
              {authorName}
            </span>
          </Link>
          {post.created_at && (
            <div style={{ color: '#666', fontSize: '14px' }}>
              {new Date(post.created_at).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>


      <div style={{ marginBottom: '20px' }}>
        {post.content ? (
          <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br>') }} />
        ) : (
          <p style={{ color: '#999' }}>No content available.</p>
        )}
      </div>

      {post.photo && (
        <div style={{ marginBottom: '20px' }}>
          <img
            src={post.photo}
            alt={post.title || 'Post image'}
            style={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '8px'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}


      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => router.back()} style={{ padding: '10px 20px' }}>
          ← Back
        </button>
        {isOwner && (
          <Link href={`/posts/${id}/edit`}>
            <button style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Edit Post
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}

PostDetail.getLayout = function getLayout(page) {
  return (
    <Layout>
      <Navbar />
      {page}
    </Layout>
  );
};