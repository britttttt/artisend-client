import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import Layout from '../components/layout'
import Navbar from '../components/navbar'
import { useAppContext } from '../context/state'
import { createUserBusiness, getMediums, getUserProfile } from '../data/auth'
import styles from '/styles/BusinessProfile.module.css'

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


  const profileData = Array.isArray(profile) ? profile[0] : profile;

  useEffect(() => {
    getMediums()
      .then(data => setAvailableMediums(data))
      .catch(err => console.error('Error fetching mediums:', err))
  }, [])

  useEffect(() => {
  return () => {
    if (bannerImg) URL.revokeObjectURL(bannerImg);
  };
}, [bannerImg]);

  useEffect(() => {
    if (profileData) {
      setIsEditing(true)
      
      if (displayName.current) displayName.current.value = profileData.display_name || ''
      if (bio.current) bio.current.value = profileData.bio || ''
      if (phone.current) phone.current.value = profileData.phone || ''
      if (businessEmail.current) businessEmail.current.value = profileData.business_email || ''
      if (businessAddress.current) businessAddress.current.value = profileData.business_address || ''
      if (socialLink.current) socialLink.current.value = profileData.social_link || ''
      
      setMediums(profileData.mediums || [])
      setSkills(profileData.skills || [])
      
      setLoading(false)
    } else if (token) {
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
  const selectedValues = Array.from(e.target.selectedOptions, option => parseInt(option.value));
  setSkills(selectedValues);
};

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
      console.log('Banner image to upload:', {
        name: bannerImg.name,
        size: bannerImg.size,
        type: bannerImg.type
      });
      formData.append('banner_img', bannerImg);
    } else {
      console.log('No banner image selected');
    }

    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    if (!token) {
      alert('You must be logged in to create a business account.');
      return;
    }

    try {
      let res;
      
      if (isEditing) {

        res = await fetch(`http://localhost:8000/userbusiness/${profileData.id}`, {
          method: 'PATCH',
          headers: { Authorization: `Token ${token}` },
          body: formData,
        });
      } else {

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


      for (const mediumId of mediums) {
        try {
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
      <div className={styles.loadingContainer}>
        <div className={styles.loadingColumn}>
          <div className={styles.loadingBox}>
            <p className={styles.loadingText}>Loading business profile...</p>
            <div className={styles.progress}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.column}>
        <form className={styles.form} onSubmit={submit}>
          <h1 className={styles.title}>
            {isEditing ? 'Edit Business Profile' : 'Create Business Profile'}
          </h1>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="displayName">Display Name</label>
            <input
              id="displayName"
              ref={displayName}
              type="text"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="businessEmail">Business Email</label>
            <input
              id="businessEmail"
              ref={businessEmail}
              type="email"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="phone">Business Phone</label>
            <input
              id="phone"
              ref={phone}
              type="tel"
              className={styles.input}
              pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="businessAddress">Business Address</label>
            <input
              id="businessAddress"
              ref={businessAddress}
              type="text"
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="socialLink">Social Media Link</label>
            <input
              id="socialLink"
              ref={socialLink}
              type="text"
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              ref={bio}
              className={styles.textarea}
            />
          </div>

          {/* Show current banner if editing */}
          {isEditing && profileData.banner_img && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Current Banner Image</label>
              <div className={styles.currentBanner}>
                <img 
                  src={profileData.banner_img} 
                  alt="Current banner"
                  className={styles.bannerImage}
                />
              </div>
            </div>
          )}

          <div className={styles.inputGroup}>
            <label className={styles.label}>
              {isEditing ? "Upload New Banner Image (optional)" : "Upload Banner Image"}
            </label>
            <input
              className={styles.fileInput}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                console.log('File selected:', file);
                setBannerImg(file);
              }}
            />
            {bannerImg && (
              <div className={styles.previewContainer}>
                <p className={styles.previewText}>Selected: {bannerImg.name}</p>
                <img
                  src={URL.createObjectURL(bannerImg)}
                  alt="Banner preview"
                  className={styles.previewImage}
                />
              </div>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Select Mediums</label>
            <select onChange={handleMediumChange} className={styles.select}>
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

            <div className={styles.tags}>
              {mediums.map(id => {
                const medium = availableMediums.find(m => m.id === id)
                return (
                  <span key={id} className={styles.tag}>
                    {medium?.label}
                    <button
                      type="button"
                      className={styles.tagButton}
                      onClick={() => {
                        setMediums(mediums.filter(mid => mid !== id))
                      }}
                      aria-label={`Remove ${medium?.label}`}
                    >
                      ×
                    </button>
                  </span>
                )
              })}
            </div>
          </div>

          {mediums.length > 0 && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Select Skills</label>
              <select
                multiple
                value={skills}
                onChange={handleSkillChange}
                className={styles.multiSelect}
              >
                {relatedSkills.map(skill => (
                  <option key={skill.id} value={skill.id} disabled={skills.includes(skill.id)}>
                    {skill.mediumLabel} — {skill.label}
                  </option>
                ))}
              </select>

              <div className={styles.tags}>
                {skills.map(id => {
                  const skill = relatedSkills.find(s => s.id === id)
                  if (!skill) return null
                  return (
                    <span key={id} className={styles.tag}>
                      {skill?.label} ({skill.mediumLabel})
                      <button
                        type="button"
                        className={styles.tagButton}
                        onClick={() => {
                          setSkills(skills.filter(sid => sid !== id))
                        }}
                        aria-label={`Remove ${skill.label}`}
                      >
                        ×
                      </button>
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          <div className={styles.buttonGroup}>
            <button className={styles.submitButton} type="submit">
              {isEditing ? 'Update Profile' : 'Create Profile'}
            </button>
            <Link href="/profile" className={styles.cancelButton}>
              Cancel
            </Link>
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