import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '../../context/state';
import { getBusinessProfileByUserId, getUserAccountById } from '../../data/auth';

import styles from "/styles/posts.module.css"
import PostFilter from '../../components/filterbar/filterbar';

export default function NearbyPosts() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { token, profile } = useAppContext();
  const router = useRouter();

  const profileData = Array.isArray(profile) ? profile[0] : profile;
  const userLocation = profileData ? {
    latitude: profileData.latitude,
    longitude: profileData.longitude
  } : null;

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
        setFilteredPosts(postsArray);
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

  const handleFilteredPostsChange = (newFilteredPosts) => {
    setFilteredPosts(newFilteredPosts);
  };

  const renderMediaPreview = (mediaItems) => {
    if (!mediaItems || mediaItems.length === 0) {
      return (
        <div className={styles.noMediaPlaceholder}>
          No media
        </div>
      );
    }

    const primaryMedia = mediaItems[0];
    const additionalMedia = mediaItems.slice(1);

    return (
      <div className={styles.mediaPreview}>
        {/* Primary media */}
        <div className={styles.primaryMediaContainer}>
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
        </div>

        {/* Additional media cards that fan out on hover */}
        {additionalMedia.length > 0 && (
          <div className={styles.additionalMediaCards}>
            {additionalMedia.map((media, index) => (
              <div 
                key={index}
                className={`${styles.mediaCard} ${styles[`mediaCard${index + 1}`]}`}
                style={{ '--card-index': index + 1 }}
              >
                {media.media_type === 'image' && (
                  <img
                    src={media.file}
                    alt={`Additional media ${index + 1}`}
                    className={styles.additionalMediaImage}
                  />
                )}
                {media.media_type === 'video' && (
                  <div className={styles.additionalMediaPlaceholder}>
                    <div className={styles.mediaIcon}>🎥</div>
                  </div>
                )}
                {media.media_type === 'audio' && (
                  <div className={styles.additionalMediaPlaceholder}>
                    <div className={styles.mediaIcon}>🎵</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Media count badge */}
        {additionalMedia.length > 0 && (
          <div className={styles.mediaCountBadge}>
            +{additionalMedia.length}
          </div>
        )}
      </div>
    );
  };

  if (loading) return <p className={styles.loadingMessage}>Loading posts...</p>;
  if (error) return <p className={styles.errorMessage}>{error}</p>;

  return (
    <div className={styles.container}>
      <h1>Community Posts</h1>
      {posts.length > 0 && (
        <PostFilter
          posts={posts}
          onFilteredPostsChange={handleFilteredPostsChange}
          userLocation={userLocation}
        />
      )}

      {filteredPosts.length === 0 ? (
        <p className={styles.noPostsMessage}>
          {posts.length === 0 ? "No posts found nearby." : "No posts match your current filters."}
        </p>
      ) : (
        filteredPosts.map(post => {
          return (
            <div
              key={post.id}
              className={`${styles.box} ${styles.postCard}`}
              onClick={() => goToPost(post.id)}
            >
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
                <h2 className={styles.userName}>
                  {post.user_business?.display_name || 'Unknown User'}
                </h2>
                <div className={styles.userInfo}>
                </div>
                <h3 className={styles.postTitle}>{post.title}</h3>
              </div>

              <div className={styles.postContent}>
                <div className={styles.mediaContainer}>
                  {renderMediaPreview(post.media)}
                </div>

                {post.created_at && (
                  <div className={styles.postDate}>
                    {new Date(post.created_at).toLocaleDateString()}
                  </div>
                )}

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
        })
      )}
      {posts.length > 0 && (
        <div style={{
          textAlign: 'center',
          marginBottom: '20px',
          color: '#666',
          fontSize: '14px'
        }}>
          Showing {filteredPosts.length} of {posts.length} posts
        </div>
      )}
    </div>
  );
}