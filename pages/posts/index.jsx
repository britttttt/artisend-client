import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '../../context/state';
import { getBusinessProfileByUserId, getUserAccountById } from '../../data/auth';
import styles from "/styles/posts.module.css"

export default function NearbyPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { token } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!token) return;

    const fetchNearbyPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch('http://localhost:8000/posts/nearby?radius=25', {
          headers: { Authorization: `Token ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch nearby posts');

        const data = await res.json();
        const postsArray = Array.isArray(data) ? data : data.results || [];
        setPosts(postsArray);

      } catch (err) {
        console.error(err);
        setError('Could not fetch nearby posts.');
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyPosts();
  }, [token]);

  const goToPost = (id) => router.push(`/posts/${id}`);

  const renderMediaPreview = (mediaItems) => {
    if (!mediaItems || mediaItems.length === 0) {
      return (
        <div className={styles.noMediaPlaceholder}>
          No media
        </div>
      );
    }

    const primaryMedia = mediaItems[0];
    const remainingCount = mediaItems.length - 1;

    return (
      <div className={styles.mediaPreview}>
        {primaryMedia.media_type === 'image' && (
          <img 
            src={primaryMedia.file}
            alt="Post media"
            className={styles.mediaImage}
          />
        )}
        
        {primaryMedia.media_type === 'video' && (
          <div className={styles.mediaVideoPlaceholder}>
            <div className={styles.mediaPlaceholderContent}>
              <div className={styles.mediaIcon}>🎥</div>
              <div className={styles.mediaLabel}>Video</div>
            </div>
          </div>
        )}
        
        {primaryMedia.media_type === 'audio' && (
          <div className={styles.mediaAudioPlaceholder}>
            <div className={styles.mediaPlaceholderContent}>
              <div className={styles.mediaIcon}>🎵</div>
              <div className={styles.mediaLabel}>Audio</div>
            </div>
          </div>
        )}

        {remainingCount > 0 && (
          <div className={styles.mediaCountBadge}>
            +{remainingCount}
          </div>
        )}

        {mediaItems.length > 1 && (
          <div className={styles.mediaTypeIndicators}>
            {mediaItems.slice(0, 3).map((item, index) => (
              <div key={index} className={styles.mediaTypeIcon}>
                {item.media_type === 'image' && '📸'}
                {item.media_type === 'video' && '🎥'}
                {item.media_type === 'audio' && '🎵'}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) return <p className={styles.loadingMessage}>Loading posts...</p>;
  if (error) return <p className={styles.errorMessage}>{error}</p>;
  if (posts.length === 0) return <p className={styles.noPostsMessage}>No posts found nearby.</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Posts in Your Area</h1>
      {posts.map(post => {
        return (
          <div
            key={post.id}
            className={`${styles.box} ${styles.postCard}`}
            onClick={() => goToPost(post.id)}
          >
            {/* User info header */}
            <div className={styles.userHeader}>
              {post.user_profile?.profile_pic && (
                <img
                  src={post.user_profile.profile_pic}
                  alt={post.user_profile.username || 'User'}
                  width={50}
                  height={50}
                  className={styles.profilePic}
                />
              )}
              <div className={styles.userInfo}>
                <h4 className={styles.userName}>
                  {post.user_business?.display_name || 'Unknown User'}
                </h4>
                {post.created_at && (
                  <div className={styles.postDate}>
                    {new Date(post.created_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.postContent}>
              <h3 className={styles.postTitle}>{post.title}</h3>
              

              <div className={styles.mediaContainer}>
                {renderMediaPreview(post.media)}
              </div>


              {post.content && (
                <p className={styles.contentPreview}>
                  {post.content.length > 150 
                    ? `${post.content.substring(0, 150)}...` 
                    : post.content
                  }
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}