import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getPostById, updatePost, deletePost } from "../../../data/posts";
import { useAppContext } from "../../../context/state";
import Layout from "../../../components/layout";
import Navbar from "../../../components/navbar";

export default function EditPost() {
  const router = useRouter();
  const { id } = router.query;
  const { token, profile } = useAppContext();

  const profileData = Array.isArray(profile) ? profile[0] : profile;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [post, setPost] = useState(null);


  const [existingMedia, setExistingMedia] = useState([]);
  const [newMediaFiles, setNewMediaFiles] = useState([]);
  const [newMediaPreviews, setNewMediaPreviews] = useState([]);
  const [mediaToDelete, setMediaToDelete] = useState([]);

  useEffect(() => {
    if (!id || !token) return;

    const fetchPost = async () => {
      try {
        const postData = await getPostById(token, id);
        const normalizedPost = Array.isArray(postData) ? postData[0] : postData;

        const currentUserId = profileData?.user || profileData?.user_id || profileData?.id;
        const postUserId = normalizedPost.user_id || normalizedPost.user;

        if (currentUserId !== postUserId) {
          setError("You don't have permission to edit this post.");
          return;
        }

        setPost(normalizedPost);
        setTitle(normalizedPost.title || "");
        setContent(normalizedPost.content || "");

        if (normalizedPost.media && normalizedPost.media.length > 0) {
          setExistingMedia(normalizedPost.media.sort((a, b) => a.order - b.order));
        } else if (normalizedPost.photo) {
          setExistingMedia([{
            id: 'legacy-photo',
            file: normalizedPost.photo,
            media_type: 'image',
            order: 0
          }]);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load post.");
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, token, profileData]);


  const handleNewFileChange = (e) => {
    const files = Array.from(e.target.files);
    const totalFiles = existingMedia.length - mediaToDelete.length + newMediaFiles.length + files.length;

    if (totalFiles > 5) {
      setError("Maximum 5 files allowed per post");
      return;
    }


    const allFiles = [...newMediaFiles, ...files];
    let videoCount = allFiles.filter(f => f.type.startsWith('video/')).length;
    let audioCount = allFiles.filter(f => f.type.startsWith('audio/')).length;

    const remainingExisting = existingMedia.filter(m => !mediaToDelete.includes(m.id));
    videoCount += remainingExisting.filter(m => m.media_type === 'video').length;
    audioCount += remainingExisting.filter(m => m.media_type === 'audio').length;

    if (videoCount > 1) {
      setError("Only 1 video file allowed per post");
      return;
    }

    if (audioCount > 1) {
      setError("Only 1 audio file allowed per post");
      return;
    }

    setError("");


    newMediaPreviews.forEach(preview => {
      if (preview.url) URL.revokeObjectURL(preview.url);
    });

    const previews = files.map(file => ({
      file,
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      type: file.type.split('/')[0],
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(1)
    }));

    setNewMediaFiles([...newMediaFiles, ...files]);
    setNewMediaPreviews([...newMediaPreviews, ...previews]);
  };


  const removeExistingMedia = (mediaId) => {
    if (!mediaToDelete.includes(mediaId)) {
      setMediaToDelete([...mediaToDelete, mediaId]);
    }
  };

  const restoreExistingMedia = (mediaId) => {
    setMediaToDelete(mediaToDelete.filter(id => id !== mediaId));
  };


  const removeNewMedia = (index) => {
    if (newMediaPreviews[index]?.url) {
      URL.revokeObjectURL(newMediaPreviews[index].url);
    }

    const newFiles = newMediaFiles.filter((_, i) => i !== index);
    const newPreviews = newMediaPreviews.filter((_, i) => i !== index);

    setNewMediaFiles(newFiles);
    setNewMediaPreviews(newPreviews);
    setError("");
  };


  const renderExistingMedia = (media, index) => {
    const isMarkedForDeletion = mediaToDelete.includes(media.id);

    return (
      <div
        key={media.id}
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "10px",
          maxWidth: "200px",
          opacity: isMarkedForDeletion ? 0.5 : 1,
          backgroundColor: isMarkedForDeletion ? '#ffebee' : 'white'
        }}
      >
        {media.media_type === 'image' && (
          <img
            src={media.file}
            alt={`Existing media ${index + 1}`}
            style={{
              width: "100%",
              borderRadius: "4px",
              marginBottom: "5px"
            }}
          />
        )}

        {media.media_type === 'video' && (
          <div style={{
            backgroundColor: "#000",
            padding: "20px",
            textAlign: "center",
            borderRadius: "4px",
            color: "white",
            marginBottom: "5px"
          }}>
            🎥 Video
          </div>
        )}

        {media.media_type === 'audio' && (
          <div style={{
            backgroundColor: "#4a5568",
            padding: "20px",
            textAlign: "center",
            borderRadius: "4px",
            color: "white",
            marginBottom: "5px"
          }}>
            🎵 Audio
          </div>
        )}

        <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>
          <div>Existing {media.media_type}</div>
        </div>

        {isMarkedForDeletion ? (
          <button
            type="button"
            onClick={() => restoreExistingMedia(media.id)}
            style={{
              padding: "2px 8px",
              fontSize: "12px",
              background: "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
            disabled={submitting || deleting}
          >
            Restore
          </button>
        ) : (
          <button
            type="button"
            onClick={() => removeExistingMedia(media.id)}
            style={{
              padding: "2px 8px",
              fontSize: "12px",
              background: "#ff4444",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
            disabled={submitting || deleting}
          >
            Remove
          </button>
        )}
      </div>
    );
  };

  // Render new media preview
  const renderNewMediaPreview = (preview, index) => {
    return (
      <div
        key={index}
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "10px",
          maxWidth: "200px",
          backgroundColor: '#f0f8ff'
        }}
      >
        {preview.type === 'image' && preview.url && (
          <img
            src={preview.url}
            alt={`New preview ${index + 1}`}
            style={{
              width: "100%",
              borderRadius: "4px",
              marginBottom: "5px"
            }}
          />
        )}

        {preview.type === 'video' && (
          <div style={{
            backgroundColor: "#000",
            padding: "20px",
            textAlign: "center",
            borderRadius: "4px",
            color: "white",
            marginBottom: "5px"
          }}>
            🎥 Video
          </div>
        )}

        {preview.type === 'audio' && (
          <div style={{
            backgroundColor: "#4a5568",
            padding: "20px",
            textAlign: "center",
            borderRadius: "4px",
            color: "white",
            marginBottom: "5px"
          }}>
            🎵 Audio
          </div>
        )}

        <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>
          <div>{preview.name}</div>
          <div>{preview.size} MB (New)</div>
        </div>

        <button
          type="button"
          onClick={() => removeNewMedia(index)}
          style={{
            padding: "2px 8px",
            fontSize: "12px",
            background: "#ff4444",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
          disabled={submitting || deleting}
        >
          Remove
        </button>
      </div>
    );
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await deletePost(token, id);

      newMediaPreviews.forEach(preview => {
        if (preview.url) URL.revokeObjectURL(preview.url);
      });

      router.push("/posts");
    } catch (err) {
      console.error(err);
      setError("Failed to delete post.");
      setDeleting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("content", content.trim());


      if (mediaToDelete.length > 0) {
        formData.append("delete_media_ids", JSON.stringify(mediaToDelete));
      }

      newMediaFiles.forEach(file => {
        formData.append("media", file);
      });

      await updatePost(token, id, formData);

      newMediaPreviews.forEach(preview => {
        if (preview.url) URL.revokeObjectURL(preview.url);
      });

      router.push(`/posts/${id}`);
    } catch (err) {
      console.error(err);
      setError("Failed to update post.");
      setSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      newMediaPreviews.forEach(preview => {
        if (preview.url) URL.revokeObjectURL(preview.url);
      });
    };
  }, []);

  if (loading) {
    return (
      <div className="column is-half is-offset-one-quarter">
        <div className="has-text-centered">
          <p>Loading post...</p>
          <progress className="progress is-small is-primary" max="100">Loading</progress>
        </div>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="column is-half is-offset-one-quarter">
        <div className="notification is-danger">
          <h4 className="title is-5">Error</h4>
          <p>{error}</p>
          <div className="buttons">
            <button
              className="button is-light"
              onClick={() => router.back()}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalMediaCount = existingMedia.length - mediaToDelete.length + newMediaFiles.length;

  return (
    <div className="column is-half is-offset-one-quarter">
      <h1 className="title">Edit Post</h1>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="label">Title</label>
          <div className="control">
            <input
              className="input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={submitting}
            />
          </div>
        </div>

        <div className="field">
          <label className="label">Content</label>
          <div className="control">
            <textarea
              className="textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows="6"
              disabled={submitting}
            />
          </div>
        </div>


        <div className="field">
          <label className="label">Media Files ({totalMediaCount}/5)</label>


          {existingMedia.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <h6 style={{ fontWeight: "bold", marginBottom: "10px" }}>Current Media:</h6>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {existingMedia.map((media, index) => renderExistingMedia(media, index))}
              </div>
            </div>
          )}


          {newMediaPreviews.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <h6 style={{ fontWeight: "bold", marginBottom: "10px" }}>New Media to Add:</h6>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {newMediaPreviews.map((preview, index) => renderNewMediaPreview(preview, index))}
              </div>
            </div>
          )}


          {totalMediaCount < 5 && (
            <div className="control">
              <input
                type="file"
                multiple
                accept="image/*,video/*,audio/*"
                onChange={handleNewFileChange}
                disabled={submitting || deleting}
                style={{ marginBottom: "10px" }}
              />
              <p className="help">
                You can add {5 - totalMediaCount} more file(s).
                Maximum 1 video and 1 audio file per post.
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="notification is-danger" style={{ marginBottom: "20px" }}>
            {error}
          </div>
        )}

        <div className="field is-grouped">
          <div className="control">
            <button
              className="button is-link"
              type="submit"
              disabled={submitting || deleting}
            >
              {submitting ? "Updating..." : "Update Post"}
            </button>
          </div>
          <div className="control">
            <button
              className="button is-light"
              type="button"
              onClick={() => router.back()}
              disabled={submitting || deleting}
            >
              Cancel
            </button>
          </div>
          <div className="control">
            <button
              className="button is-danger"
              type="button"
              onClick={handleDelete}
              disabled={submitting || deleting}
            >
              {deleting ? "Deleting..." : "Delete Post"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

EditPost.getLayout = function getLayout(page) {
  return (
    <Layout>
      <Navbar />
      {page}
    </Layout>
  );
};