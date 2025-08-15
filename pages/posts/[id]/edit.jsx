import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getPostById, updatePost } from "../../../data/posts"; // your API functions
import { useAppContext } from "../../../context/state";

export default function EditPost() {
  const router = useRouter();
  const { id } = router.query;
  const { token } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id || !token) return;

    getPostById(token, id)
      .then((post) => {
        setTitle(post.title);
        setContent(post.content);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load post.");
        setLoading(false);
      });
  }, [id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updatePost(token, id, { title, content });
      alert("Post updated successfully!");
      router.push(`/posts/${id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to update post.");
    }
  };

  if (loading) return <p>Loading post...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="column is-half is-offset-one-quarter">
      <h1 className="title">Edit Post</h1>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="label">Title</label>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label className="label">Content</label>
          <textarea
            className="textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <button className="button is-link" type="submit">Update Post</button>
      </form>
    </div>
  );
}