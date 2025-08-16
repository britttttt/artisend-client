import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAppContext } from "../../../context/state";
import { getPostById } from "../../../data/posts";
import { getBusinessProfileByUserId } from "../../../data/auth";
import Layout from "../../../components/layout";
import Navbar from "../../../components/navbar";

export default function PostDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { token, profile } = useAppContext();

  const [post, setPost] = useState(null);
  const [postAuthor, setPostAuthor] = useState(null);
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
        
        // Fetch author profile
        const authorId = normalizedPost.user_id || normalizedPost.user;
        if (authorId) {
          try {
            const authorData = await getBusinessProfileByUserId(authorId, token);
            setPostAuthor(Array.isArray(authorData) ? authorData[0] : authorData);
          } catch (err) {
            console.error('Failed to fetch author:', err);
          }
        }
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
      <div className="box has-text-centered">
        <p>Loading post...</p>
        <progress className="progress is-small is-primary" max="100">Loading</progress>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="box">
        <div className="notification is-danger">
          <h4 className="title is-5">{post ? 'Error' : 'Post Not Found'}</h4>
          <p>{error || "The post you're looking for doesn't exist."}</p>
          <div className="buttons">
            <button className="button is-light" onClick={() => router.back()}>
              Go Back
            </button>
            {error && (
              <button className="button is-primary" onClick={fetchPost}>
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentUserId = profileData?.user || profileData?.user_id || profileData?.id;
  const isOwner = currentUserId && (currentUserId === (post.user_id || post.user));
  const authorName = postAuthor?.display_name || `User ${post.user_id || post.user}`;

  return (
    <div className="box">
      <div className="content">
        <h1 className="title">{post.title}</h1>
        
        <div className="field is-grouped is-grouped-multiline mb-4">
          <div className="control">
            <div className="tags has-addons">
              <span className="tag is-light">Posted by</span>
              <Link href={`/profile/${post.user_id || post.user}`}>
                <span className="tag is-info is-clickable" style={{ cursor: 'pointer' }}>
                  {authorName}
                </span>
              </Link>
              {postAuthor && <span className="tag is-success is-light">✓</span>}
            </div>
          </div>
          
          {post.created_at && (
            <div className="control">
              <div className="tags has-addons">
                <span className="tag is-light">Posted</span>
                <span className="tag is-dark">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="content">
          {post.content ? (
            <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br>') }} />
          ) : (
            <p className="has-text-grey">No content available.</p>
          )}
        </div>

        {post.photo && (
          <div className="mb-5">
            <figure className="image">
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
            </figure>
          </div>
        )}

        <div className="field is-grouped mt-5">
          <div className="control">
            <button className="button is-light" onClick={() => router.back()}>
              ← Back
            </button>
          </div>

          {isOwner && (
            <div className="control">
              <Link href={`/posts/${id}/edit`}>
                <button className="button is-primary">
                  <span className="icon is-small">
                    <i className="fas fa-edit"></i>
                  </span>
                  <span>Edit Post</span>
                </button>
              </Link>
            </div>
          )}
        </div>
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