import { useState, useEffect } from "react";
import { useAppContext } from "../context/state";
import { getUserProfile } from "../data/auth";
import UserPosts from "../components/user-posts";
import Layout from "../components/layout";
import Navbar from "../components/navbar";
import { getBusinessSkillsByUserId } from "../data/skills-mediums";

export default function Profile() {
  const { profile, setProfile, token, loadingProfile } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const profileData = await getUserProfile();
      
      
      if (profileData) {
        const normalizedProfile = Array.isArray(profileData) ? profileData[0] : profileData;
        console.log('Fetched fresh profile from API:', normalizedProfile);
        setProfile(normalizedProfile);
        // Save to localStorage immediately after successful fetch
        localStorage.setItem('userProfile', JSON.stringify(normalizedProfile));
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError("Could not fetch profile: " + err.message);
      // Don't clear localStorage on fetch error - keep the cached version
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    if (token) {
      if (profile) {
        // Ensure we're saving the normalized object, not an array
        const profileToSave = Array.isArray(profile) ? profile[0] : profile;
        localStorage.setItem('userProfile', JSON.stringify(profileToSave));
      } else {
        // Try to restore from localStorage first
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
          try {
            const parsedProfile = JSON.parse(savedProfile);
            // Ensure we always set a normalized object, not an array
            const normalizedProfile = Array.isArray(parsedProfile) ? parsedProfile[0] : parsedProfile;
            console.log('Restored profile from localStorage:', normalizedProfile);
            setProfile(normalizedProfile);
          } catch (e) {
            console.error('Failed to parse saved profile:', e);
            localStorage.removeItem('userProfile'); // Clean up corrupted data
            fetchProfile();
          }
        } else {
          console.log('No saved profile found, fetching from API');
          fetchProfile();
        }
      }
    }
  }, [token, profile]);

  // Show loading state from context
  if (loadingProfile) {
    return <p>Loading user session...</p>;
  }

  // Show if no token
  if (!token) {
    return (
      <div>
        <h1>Profile</h1>
        <p>You must be logged in and cool to view this page.</p>
        <p><a href="/login">Click here to log in</a></p>
      </div>
    );
  }

  if (loading) return <p>Loading profile data...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  if (!profile) {
    return <p>No profile data available.</p>;
  }

  // Handle both array and object formats
  const profileData = Array.isArray(profile) ? profile[0] : profile;

  const formatSocialLink = (link) => {
    if (!link) return null;
    return link.startsWith('http') ? link : `https://${link}`;
  };

  const socialLink = formatSocialLink(profileData?.social_link);

  return (
    <div>
      <h1>Profile</h1>

      <section>
        <h2>{profileData?.display_name || profileData?.name || 'User'}</h2>
        
        <h3>Business Information</h3>
        
        {profileData?.banner_img && (
          <img
            src={profileData.banner_img}
            alt={`${profileData.display_name} banner`}
            style={{ 
              width: '100%', 
              maxHeight: '200px', 
              objectFit: 'cover',
              marginBottom: '20px',
              borderRadius: '8px'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}

        <div style={{ marginBottom: '20px' }}>
          <p><strong>Display Name:</strong> {profileData?.display_name || 'Not provided'}</p>
          <p><strong>Business Email:</strong> {profileData?.business_email || 'Not provided'}</p>
          <p><strong>Phone:</strong> {profileData?.phone || 'Not provided'}</p>
          {profileData?.business_address && (
            <p><strong>Address:</strong> {profileData.business_address}</p>
          )}
          <p><strong>Bio:</strong> {profileData?.bio || 'No bio available'}</p>
          <p><strong>Commissions:</strong> {profileData?.commissions_open ? 'Open' : 'Closed'}</p>

          
          {socialLink && (
            <p>
              <strong>Social Link:</strong>{" "}
              <a 
                href={socialLink} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#007bff', textDecoration: 'underline' }}
              >
                {profileData.social_link}
              </a>
            </p>
          )}
          
          {profileData?.mediums && profileData.mediums.length > 0 && (
            <p><strong>Mediums:</strong> {profileData.mediums.join(', ')}</p>
          )}
          
          {profileData?.skills && profileData.skills.length > 0 && (
            <p><strong>Skills:</strong> {profileData.skills.join(', ')}</p>
          )}
        </div>
      </section>


     
      {/* Posts section */}
      <section style={{ marginTop: '30px' }}>
        <h3>Recent Posts</h3>
        {profileData?.user ? (
          <UserPosts userId={profileData.user} token={token} />
        ) : (
          <div style={{ 
            background: '#fff3cd', 
            padding: '15px', 
            borderRadius: '5px',
            border: '1px solid #ffeaa7'
          }}>
            <p>Unable to load posts: User ID not found in profile data.</p>
          </div>
        )}
      </section>
    </div>
  );
}

Profile.getLayout = function getLayout(page) {
  return (
    <Layout>
      <Navbar />
      {page}
    </Layout>
  );
};