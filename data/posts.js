export async function getPostById(token, id) {
  const res = await fetch(`http://localhost:8000/posts/${id}`, {
    headers: { Authorization: `Token ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch post");
  return res.json();
}

export async function updatePost(token, id, data) {
  const res = await fetch(`http://localhost:8000/posts/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update post");
  return res.json();
}

export async function getUserPosts(token, userId) {
  try {
    const res = await fetch(`http://localhost:8000/posts?user=${userId}`, {
      headers: { Authorization: `Token ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch posts");
    const data = await res.json();
    return data.posts || data;
  } catch (err) {
    console.error(err);
    return [];
  }
}



export async function deletePost(token, id) {
  const res = await fetch(`http://localhost:8000/posts/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to delete post");
}