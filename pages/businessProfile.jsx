import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { Input, Textarea } from '../components/form-elements'
import Layout from '../components/layout'
import Navbar from '../components/navbar'
import { useAppContext } from '../context/state'
import { createUserBusiness, getMediums, getUserProfile } from '../data/auth'

export default function BusinessProfile() {
  const { profile, token } = useAppContext()
  const [bannerImg, setBannerImg] = useState(null)
  const [mediums, setMediums] = useState([])
  const [skills, setSkills] = useState([])
  const [availableMediums, setAvailableMediums] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  const displayName = useRef(null)
  const bio = useRef(null)
  const phone = useRef(null)
  const businessEmail = useRef(null)
  const businessAddress = useRef(null)
  const socialLink = useRef(null)

  const router = useRouter()

  // Normalize profile data (handle array/object formats)
  const profileData = Array.isArray(profile) ? profile[0] : profile;

  useEffect(() => {
    // Fetch available mediums
    getMediums()
      .then(data => setAvailableMediums(data))
      .catch(err => console.error('Error fetching mediums:', err))
  }, [])

  useEffect(() => {
    if (profileData) {
      // Pre-fill form with existing business profile data
      setIsEditing(true)
      
      // Set form values
      if (displayName.current) displayName.current.value = profileData.display_name || ''
      if (bio.current) bio.current.value = profileData.bio || ''
      if (phone.current) phone.current.value = profileData.phone || ''
      if (businessEmail.current) businessEmail.current.value = profileData.business_email || ''
      if (businessAddress.current) businessAddress.current.value = profileData.business_address || ''
      if (socialLink.current) socialLink.current.value = profileData.social_link || ''
      
      // Set mediums and skills if available
      setMediums(profileData.mediums || [])
      setSkills(profileData.skills || [])
      
      setLoading(false)
    } else if (token) {
      // No profile data - this is a new business profile
      setIsEditing(false)
      setLoading(false)
    }
  }, [profileData, token])

  const handleMediumChange = (e) => {
    const selectedId = parseInt(e.target.value)
    if (!mediums.includes(selectedId)) {
      setMediums([...mediums, selectedId])
    }
  }

  const handleSkillChange = (e) => {
    const selectedId = parseInt(e.target.value)
    if (!skills.includes(selectedId)) {
      setSkills([...skills, selectedId])
    }
  }

  const relatedSkills = Array.isArray(availableMediums)
    ? availableMediums
      .filter(m => mediums.includes(m.id))
      .flatMap(m => (m.skills || []).map(skill => ({
        ...skill,
        mediumLabel: m.label
      })))
    : []

  const submit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('display_name', displayName.current?.value || '');
    formData.append('bio', bio.current?.value || '');
    formData.append('business_email', businessEmail.current?.value || '');
    formData.append('phone', phone.current?.value || '');
    formData.append('business_address', businessAddress.current?.value || '');
    formData.append('social_link', socialLink.current?.value || '');
    if (bannerImg) {
      formData.append('banner_img', bannerImg);
    }

    if (!token) {
      alert('You must be logged in to create a business account.');
      return;
    }

    try {
      let res;
      
      if (isEditing) {
        // Update existing business profile
        res = await fetch(`http://localhost:8000/userbusiness/${profileData.id}`, {
          method: 'PATCH',
          headers: { Authorization: `Token ${token}` },
          body: formData,
        });
      } else {
        // Create new business profile
        res = await fetch('http://localhost:8000/userbusiness', {
          method: 'POST',
          headers: { Authorization: `Token ${token}` },
          body: formData,
        });
      }

      const businessData = await res.json();

      if (!res.ok) {
        console.error('Business operation failed:', businessData);
        alert(`Failed to ${isEditing ? 'update' : 'create'} business profile`);
        return;
      }

      console.log('Business profile created/updated:', businessData);

      // Now create user mediums and skills
      for (const mediumId of mediums) {
        try {
          // Find the medium object to get its label
          const mediumObj = availableMediums.find(m => m.id === mediumId);
          if (!mediumObj) {
            console.error(`Medium with ID ${mediumId} not found`);
            continue;
          }

          const mediumRes = await fetch('http://localhost:8000/usermedium', {
            method: 'POST',
            headers: {
              Authorization: `Token ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ medium: mediumObj.label }),
          });
          
          if (!mediumRes.ok) {
            const errorData = await mediumRes.json();
            console.error('Failed to create user medium:', errorData);
          } else {
            const createdMedium = await mediumRes.json();
            console.log(`Created user medium:`, createdMedium);
          }
        } catch (err) {
          console.error('Error creating user medium:', err);
        }
      }

      for (const skillId of skills) {
        try {
          // Find the skill object to get its label
          const skillObj = relatedSkills.find(s => s.id === skillId);
          if (!skillObj) {
            console.error(`Skill with ID ${skillId} not found`);
            continue;
          }

          const skillRes = await fetch('http://localhost:8000/userskill', {
            method: 'POST',
            headers: {
              Authorization: `Token ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ skill: skillObj.label }),
          });
          
          if (!skillRes.ok) {
            const errorData = await skillRes.json();
            console.error('Failed to create user skill:', errorData);
          } else {
            const createdSkill = await skillRes.json();
            console.log(`Created user skill:`, createdSkill);
          }
        } catch (err) {
          console.error('Error creating user skill:', err);
        }
      }

      alert(`Business profile ${isEditing ? 'updated' : 'created'} successfully!`);
      router.push('/profile');
    } catch (error) {
      console.error('Network or server error:', error);
      alert(`An error occurred while ${isEditing ? 'updating' : 'creating'} the business profile`);
    }
  };

  if (loading) {
    return (
      <div className="columns is-centered">
        <div className="column is-half">
          <div className="box has-text-centered">
            <p>Loading business profile...</p>
            <progress className="progress is-small is-primary" max="100">Loading</progress>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="columns is-centered">
      <div className="column is-half">
        <form className="box" onSubmit={submit}>
          <h1 className="title">
            {isEditing ? 'Edit Business Profile' : 'Create Business Profile'}
          </h1>

          <Input id="displayName" refEl={displayName} type="text" label="Display Name" required />
          <Input id="businessEmail" refEl={businessEmail} type="email" label="Business Email" required />
          <Input id="phone" refEl={phone} type="tel" label="Business Phone" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" />
          <Input id="businessAddress" refEl={businessAddress} type="text" label="Business Address" />
          <Input id="socialLink" refEl={socialLink} type="text" label="Social Media Link" />
          <Textarea id="bio" refEl={bio} label="Bio" />

          {/* Show current banner if editing */}
          {isEditing && profileData.banner_img && (
            <div className="field">
              <label className="label">Current Banner Image</label>
              <figure className="image is-16by9" style={{ maxWidth: '300px' }}>
                <img src={profileData.banner_img} alt="Current banner" />
              </figure>
            </div>
          )}

          <Input
            type="file"
            accept="image/*"
            label={isEditing ? "Upload New Banner Image (optional)" : "Upload Banner Image"}
            onChange={(e) => setBannerImg(e.target.files[0])}
          />

          <label className="label">Select Mediums</label>
          <select onChange={handleMediumChange}>
            <option value="">-- Select a Medium --</option>
            {availableMediums.map(medium => (
              <option
                key={medium.id}
                value={medium.id}
                disabled={mediums.includes(medium.id)}
              >
                {medium.label}
              </option>
            ))}
          </select>

          <div className="tags">
            {mediums.map(id => {
              const medium = availableMediums.find(m => m.id === id)
              return (
                <span key={id} className="tag is-info">{medium?.label}
                  <button
                    type="button"
                    className="delete is-small"
                    onClick={() => {
                      setMediums(mediums.filter(mid => mid !== id))
                    }}
                    aria-label={`Remove ${medium?.label}`}
                  >x</button>
                </span>
              )
            })}
          </div>

          {mediums.length > 0 && (
            <>
              <label className="label">Select Skills</label>
              <select
                multiple
                value={skills}
                onChange={handleSkillChange}
              >
                {relatedSkills.map(skill => (
                  <option key={skill.id} value={skill.id} disabled={skills.includes(skill.id)}>
                    {skill.mediumLabel} — {skill.label}
                  </option>
                ))}
              </select>

              <div className="tags">
                {skills.map(id => {
                  const skill = relatedSkills.find(s => s.id === id)
                  if (!skill) return null
                  return (
                    <span key={id} className="tag is-info">
                      {skill?.label} ({skill.mediumLabel})
                      <button
                        type="button"
                        className="delete is-small"
                        onClick={() => {
                          setSkills(skills.filter(sid => sid !== id))
                        }}
                        aria-label={`Remove ${skill.label}`}
                      >x</button>
                    </span>
                  )
                })}
              </div>
            </>
          )}

          <div className="field is-grouped">
            <div className="control">
              <button className="button is-link" type="submit">
                {isEditing ? 'Update Profile' : 'Create Profile'}
              </button>
            </div>
            <div className="control">
              <Link href="/profile">
                <button className="button is-light" type="button">Cancel</button>
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

BusinessProfile.getLayout = function getLayout(page) {
  return (
    <Layout>
      <Navbar />
      {page}
    </Layout>
  )
}