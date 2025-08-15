export async function getPostById(token, id) {
  const res = await fetch(`http://localhost:8000/posts/${id}/`, {
    headers: { Authorization: `Token ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch post");
  return res.json();
}

export async function updatePost(token, id, data) {
  const res = await fetch(`http://localhost:8000/posts/${id}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update post");
  return res.json();
}
