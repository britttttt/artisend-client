export async function getPostById(token, id) {
  const res = await fetch(`http://localhost:8000/posts/${id}`, {
    headers: { Authorization: `Token ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch post");
  return res.json();
}

export async function updatePost(token, id, data) {
  // Check if data is FormData (for file uploads) or regular object (for text-only updates)
  const isFormData = data instanceof FormData;
  
  const headers = {
    Authorization: `Token ${token}`,
  };
  
  // Only set Content-Type for JSON data, let browser set it for FormData
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`http://localhost:8000/posts/${id}`, {
    method: "PATCH",
    headers: headers,
    body: isFormData ? data : JSON.stringify(data),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Update failed:", errorText);
    throw new Error(`Failed to update post: ${errorText}`);
  }
  
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