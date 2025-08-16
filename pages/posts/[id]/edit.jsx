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
  
  // Normalize profile data (handle array/object formats)
  const profileData = Array.isArray(profile) ? profile[0] : profile;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [post, setPost] = useState(null);

  useEffect(() => {
    if (!id || !token) return;

    const fetchPost = async () => {
      try {
        const postData = await getPostById(token, id);
        const normalizedPost = Array.isArray(postData) ? postData[0] : postData;
        
        // Check ownership
        const currentUserId = profileData?.user || profileData?.user_id || profileData?.id;
        const postUserId = normalizedPost.user_id || normalizedPost.user;
        
        if (currentUserId !== postUserId) {
          setError("You don't have permission to edit this post.");
          return;
        }

        setPost(normalizedPost);
        setTitle(normalizedPost.title || "");
        setContent(normalizedPost.content || "");
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load post.");
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, token, profileData]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await deletePost(token, id);
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
      const updateData = {
        title: title.trim(),
        content: content.trim()
      };
      
      await updatePost(token, id, updateData);
      router.push(`/posts/${id}`);
    } catch (err) {
      console.error(err);
      setError("Failed to update post.");
      setSubmitting(false);
    }
  };

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

  if (error) {
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