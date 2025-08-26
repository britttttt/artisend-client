import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAppContext } from "../../../context/state";
import { getPostById } from "../../../data/posts";
import Layout from "../../../components/layout";
import Navbar from "../../../components/navbar";
import { getBusinessProfileByUserId } from "../../../data/auth";

export default function PostDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { token, profile } = useAppContext();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  getBusinessProfileByUserId

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

  const getMediaItems = (post) => {
    if (post.media && post.media.length > 0) {
      return post.media.sort((a, b) => a.order - b.order);
    }


    if (post.photo) {
      return [{
        file: post.photo,
        media_type: 'image',
        order: 0
      }];
    }

    return [];
  };


  const renderMediaItem = (mediaItem, index) => {
    const { file, media_type } = mediaItem;

    switch (media_type) {
      case 'image':
        return (
          <img
            key={index}
            src={file}
            alt={`${post.title} - Image ${index + 1}`}
            style={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        );

      case 'video':
        return (
          <video
            key={index}
            controls
            style={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <source src={file} type="video/mp4" />
            <source src={file} type="video/webm" />
            <source src={file} type="video/ogg" />
            Your browser does not support the video tag.
          </video>
        );

      case 'audio':
        return (
          <div key={index} style={{
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              marginBottom: '15px'
            }}>
              <div style={{
                fontSize: '24px',
                backgroundColor: '#4a5568',
                color: 'white',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                🎵
              </div>
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  Audio File {index + 1}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Click play to listen
                </div>
              </div>
            </div>
            <audio
              controls
              style={{ width: '100%' }}
            >
              <source src={file} type="audio/mpeg" />
              <source src={file} type="audio/wav" />
              <source src={file} type="audio/ogg" />
              Your browser does not support the audio tag.
            </audio>
          </div>
        );

      default:
        return (
          <div key={index} style={{
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>📎</div>
            <div>Unknown media type</div>
            <a
              href={file}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#007bff', textDecoration: 'underline' }}
            >
              Download file
            </a>
          </div>
        );
    }
  };


  const renderMediaGallery = (mediaItems) => {
    if (mediaItems.length === 0) return null;

    if (mediaItems.length === 1) {
      return (
        <div style={{ marginBottom: '20px' }}>
          {renderMediaItem(mediaItems[0], 0)}
        </div>
      );
    }

    return (
      <div style={{ marginBottom: '20px' }}>

        <div style={{ marginBottom: '15px' }}>
          {renderMediaItem(mediaItems[selectedMediaIndex], selectedMediaIndex)}
        </div>


        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          padding: '10px 0'
        }}>
          {mediaItems.map((item, index) => (
            <div
              key={index}
              onClick={() => setSelectedMediaIndex(index)}
              style={{
                minWidth: '80px',
                height: '60px',
                cursor: 'pointer',
                border: selectedMediaIndex === index ? '3px solid #007bff' : '2px solid #ddd',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8f9fa',
                position: 'relative'
              }}
            >
              {item.media_type === 'image' && (
                <img
                  src={item.file}
                  alt={`Thumbnail ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              )}

              {item.media_type === 'video' && (
                <div style={{ color: '#666', fontSize: '20px' }}>🎥</div>
              )}

              {item.media_type === 'audio' && (
                <div style={{ color: '#666', fontSize: '20px' }}>🎵</div>
              )}


              <div style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'white',
                fontSize: '10px',
                padding: '2px 4px',
                borderRadius: '3px'
              }}>
                {index + 1}
              </div>
            </div>
          ))}
        </div>


        <div style={{
          textAlign: 'center',
          color: '#666',
          fontSize: '14px',
          marginTop: '10px'
        }}>
          {selectedMediaIndex + 1} of {mediaItems.length}
        </div>
      </div>
    );
  };

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
  const mediaItems = getMediaItems(post);

  return (
    <div
      style={{
        padding: '20px',
        maxWidth: '800px',
        margin: '40px auto 0',
        backgroundColor: 'white',
      }}
    >
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


      {renderMediaGallery(mediaItems)}


      {mediaItems.length > 0 && (
        <div style={{
          marginBottom: '20px',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          fontSize: '14px',
          color: '#666'
        }}>
          📎 {mediaItems.length} media file{mediaItems.length !== 1 ? 's' : ''} attached
          {mediaItems.length > 1 && (
            <span> - {mediaItems.filter(m => m.media_type === 'image').length} image(s), {mediaItems.filter(m => m.media_type === 'video').length} video(s), {mediaItems.filter(m => m.media_type === 'audio').length} audio file(s)</span>
          )}
        </div>
      )}


      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => router.back()} style={{ padding: '10px 20px' }}>
          ← Back
        </button>
        {isOwner && (
          <Link href={`/posts/${id}/edit`}>
            <button style={{
              padding: '10px 20px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
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