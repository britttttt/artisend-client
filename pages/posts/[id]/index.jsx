import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppContext } from "../../../context/state";
import { getPostById } from "../../../data/posts";

export default function PostDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { token, user } = useAppContext() // user is the logged-in user
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !token) return;

    getPostById(token, id)
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id, token]);

  if (loading) return <p>Loading post...</p>;
  if (!post) return <p>Post not found</p>;

  const isOwner = user?.id === post.user_id; // check if logged-in user owns the post

  return (
    <div className="box">
      <h1 className="title">{post.title}</h1>
      <p>{post.content}</p>

      {isOwner && (
        <Link href={`/posts/${id}/edit`}>
          <button className="button is-link mt-3">Edit Post</button>
        </Link>
      )}
    </div>
  );
}