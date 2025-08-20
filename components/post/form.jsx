import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAppContext } from "../../context/state";
import { createPost, getCategories } from "../../data/auth";

export default function PostForm({
  defaultTitle = "",
  defaultContent = "",
  defaultDate = "",
}) {
  const router = useRouter();
  const { profile } = useAppContext();
  const profileData = profile?.[0];

  const [postalCode, setPostalCode] = useState("");
  const [title, setTitle] = useState(defaultTitle);
  const [content, setContent] = useState(defaultContent);
  const [image, setImage] = useState(null);
  const [datePosted, setDatePosted] = useState(
    defaultDate || new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);


  useEffect(() => {
    if (profileData?.postalCode) {
      setPostalCode(profileData.postalCode);
    }
  }, [profileData]);


  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);


    if (files.length > 5) {
      setError("Maximum 5 files allowed");
      return;
    }

    let videoCount = 0;
    let audioCount = 0;

    for (const file of files) {
      if (file.type.startsWith('video/')) videoCount++;
      if (file.type.startsWith('audio/')) audioCount++;
    }

    if (videoCount > 1) {
      setError("Only 1 video file allowed");
      return;
    }

    if (audioCount > 1) {
      setError("Only 1 audio file allowed");
      return;
    }



    
    mediaPreviews.forEach(preview => {
      if (preview.url) URL.revokeObjectURL(preview.url);
    });


    const previews = files.map(file => ({
      file,
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      type: file.type.split('/')[0], // 'image', 'video', or 'audio'
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(1) // Size in MB for display
    }));

    setMediaFiles(files);
    setMediaPreviews(previews);
  };


  const removeFile = (indexToRemove) => {
  if (mediaPreviews[indexToRemove]?.url) {
    URL.revokeObjectURL(mediaPreviews[indexToRemove].url);
  }

  useEffect(() => {
  return () => {
    mediaPreviews.forEach(preview => {
      if (preview.url) URL.revokeObjectURL(preview.url);
    });
  };
}, []);
  

  const newFiles = mediaFiles.filter((_, index) => index !== indexToRemove);
  const newPreviews = mediaPreviews.filter((_, index) => index !== indexToRemove);
  
  setMediaFiles(newFiles);
  setMediaPreviews(newPreviews);
  
  setError("");
};

  const getCoordinates = async (postalCode) => {
    const res = await fetch(`https://api.zippopotam.us/us/${postalCode}`);
    if (!res.ok) throw new Error("Invalid postal code");
    const data = await res.json();
    const { latitude, longitude } = data.places[0];
    return { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!profileData?.id) {
    setError("You must be logged in to create a post.");
    return;
  }

  setLoading(true);
  setError("");

  try {
    // Get coordinates (keep your existing geocoding logic)
    const coords = await getCoordinates(postalCode);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("category", categoryId);
    formData.append("postal_code", postalCode);
    formData.append("latitude", coords.latitude);
    formData.append("longitude", coords.longitude);
    
    // Append media files with the field name your backend expects
    mediaFiles.forEach(file => {
      formData.append("media", file);
    });

    await createPost(formData);
    
    // Clean up preview URLs before navigation
    mediaPreviews.forEach(preview => {
      if (preview.url) URL.revokeObjectURL(preview.url);
    });
    
    router.push("/posts");
  } catch (err) {
    setError(err.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};



  return (
    <form
      onSubmit={handleSubmit}
      style={{ maxWidth: "500px", margin: "0 auto" }}
    >
      <div>
        <label>Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: "100%" }}
          disabled={loading}
        />
      </div>

      <div>
        <label>Content:</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={4}
          style={{ width: "100%" }}
          disabled={loading}
        />
      </div>

      <div>
        <label>Postal Code:</label>
        <input
          type="text"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div>
        <label>Date Posted:</label>
        <input
          type="date"
          value={datePosted}
          onChange={(e) => setDatePosted(e.target.value)}
          required
          disabled={loading}
        />
      </div>

     <div>
  <label>Media Files (optional):</label>
  <input
    type="file"
    multiple
    accept="image/*,video/*,audio/*"
    onChange={handleFileChange}
    disabled={loading}
  />
  
  {mediaPreviews.length > 0 && (
    <div style={{ marginTop: "15px" }}>
      <p>Selected files ({mediaPreviews.length}/5):</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {mediaPreviews.map((preview, index) => (
          <div key={index} style={{ 
            border: "1px solid #ddd", 
            borderRadius: "8px", 
            padding: "10px",
            maxWidth: "200px"
          }}>
            {preview.type === 'image' && preview.url && (
              <img
                src={preview.url}
                alt={`Preview ${index + 1}`}
                style={{ width: "100%", borderRadius: "4px", marginBottom: "5px" }}
              />
            )}
            
            {preview.type === 'video' && (
              <div style={{ 
                backgroundColor: "#f0f0f0", 
                padding: "20px", 
                textAlign: "center",
                borderRadius: "4px",
                marginBottom: "5px"
              }}>
                🎥 Video
              </div>
            )}
            
            {preview.type === 'audio' && (
              <div style={{ 
                backgroundColor: "#f0f0f0", 
                padding: "20px", 
                textAlign: "center",
                borderRadius: "4px",
                marginBottom: "5px"
              }}>
                🎵 Audio
              </div>
            )}
            
            <div style={{ fontSize: "12px", color: "#666" }}>
              <div>{preview.name}</div>
              <div>{preview.size} MB</div>
            </div>
            
            <button
              type="button"
              onClick={() => removeFile(index)}
              style={{
                marginTop: "5px",
                padding: "2px 8px",
                fontSize: "12px",
                background: "#ff4444",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
              disabled={loading}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  )}
</div>
      <div>
        <label>Category:</label>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            marginTop: "5px",
          }}
        >
          {categories.map((cat) => (
            <label key={cat.id} style={{ display: "flex", alignItems: "center" }}>
              <input
                type="radio"
                name="category"
                value={cat.id}
                checked={categoryId === String(cat.id)}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                disabled={loading}
              />
              {cat.label}
            </label>
          ))}
        </div>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Posting..." : "Create Post"}
      </button>
    </form>
  );
}