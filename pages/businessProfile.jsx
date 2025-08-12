import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { Input, Textarea } from '../components/form-elements'
import Layout from '../components/layout'
import Navbar from '../components/navbar'
import { useAppContext } from '../context/state'
import { createUserBusiness, getMediums } from '../data/auth'

export default function Register() {
  const { setToken } = useAppContext()
  const [bannerImg, setBannerImg] = useState(null)
  const [mediums, setMediums] = useState([])
  const [skills, setSkills] = useState([])
  const [availableMediums, setAvailableMediums] = useState([])

  const displayName = useRef(null)
  const bio = useRef(null)
  const phone = useRef(null)
  const businessEmail = useRef(null)
  const businessAddress = useRef(null)
  const socialLink = useRef(null)

  const router = useRouter()

  useEffect(() => {
    getMediums()
      .then(data => setAvailableMediums(data))
      .catch(err => console.error('Error fetching mediums:', err))
  }, [])

  const handleMediumChange = (e) => {
    const selectedId = parseInt(e.target.value)
    if (!mediums.includes(selectedId)) {
      setMediums([...mediums, selectedId])
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
    e.preventDefault()

    const formData = new FormData()
    formData.append('display_name', displayName.current?.value || '')
    formData.append('bio', bio.current?.value || '')
    formData.append('business_email', businessEmail.current?.value || '')
    formData.append('phone', phone.current?.value || '')
    formData.append('business_address', businessAddress.current?.value || '')
    formData.append('social_link', socialLink.current?.value || '')

    if (bannerImg) {
      formData.append('banner_img', bannerImg)
    }

    formData.append('mediums', JSON.stringify(mediums))
    formData.append('skills', JSON.stringify(skills))

    const token = localStorage.getItem('token')

    try {
      const res = await createUserBusiness(formData, token)
      if (res.token) {
        setToken(res.token)
        router.push('/myProfile')
      } else {
        alert('Failed to register business')
      }
    } catch (error) {
      console.error(error)
      alert('An error occurred while registering the business')
    }
  }

  return (
    <div className="columns is-centered">
      <div className="column is-half">
        <form className="box" onSubmit={submit}>
          <h1 className="title">Welcome!</h1>

          <Input id="businessAddress" refEl={businessAddress} type="text" label="Business Address" />
          <Input id="businessEmail" refEl={businessEmail} type="email" label="Business Email" required />
          <Input id="phone" refEl={phone} type="tel" label="Business Phone" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" />
          <Input id="displayName" refEl={displayName} type="text" label="Display Name" />
          <Input id="socialLink" refEl={socialLink} type="text" label="Social Media Link" />
          <Textarea id="bio" refEl={bio} label="Bio" />

          <Input
            type="file"
            accept="image/*"
            label="Upload Banner Image"
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
                        aria-label={`Remove ${medium.label}`}
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
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, opt => parseInt(opt.value))
                  setSkills(selected)
                }}
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
              <button className="button is-link" type="submit">Submit</button>
            </div>
            <div className="control">
              <Link href="/myProfile">
                <button className="button is-link" type="button">Cancel</button>
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

Register.getLayout = function getLayout(page) {
  return (
    <Layout>
      <Navbar />
      {page}
    </Layout>
  )
}