import Link from 'next/link'
import { useRouter } from 'next/router'
import { useRef, useState } from 'react'
import { Input, Textarea } from '../components/form-elements'
import Layout from '../components/layout'
import Navbar from '../components/navbar'
import { useAppContext } from '../context/state'
import { register, registerBusiness } from '../data/auth'
import { TagsInput } from '../components/form-elements/tagsinput'

export default function Register() {
  const { setToken } = useAppContext()
  const [isBusiness, setIsBusiness] = useState(false)
  const [banner_img, set_banner_img] = useState()
  const [tags, setTags] = useState([])

  const displayName = useRef(null)
  const bio = useRef(null)
  const phone = useRef(null)
  const businessEmail = useRef(null)
  const businessAddress = useRef(null)
  const socialLink = useRef(null)

  const router = useRouter()

  const submit = async (e) => {
    e.preventDefault()

    const business = {
      displayName: displayName.current?.value,
      bio: bio.current?.value,
      businessEmail: businessEmail.current?.value,
      phone: phone.current?.value,
      businessAddress: businessAddress.current?.value,
      socialLink: socialLink.current?.value
    }

    const res = await registerBusiness(business)
    if (res.token) {
      setToken(res.token)
      router.push('/myProfile')
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
          < Textarea id="bio" refEl={bio} label="Bio" />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => set_banner_img(e.target.files[0])}
          />


          
          <Input id="Mediums" type='text' label="Mediums" />
          <Input id="Skills" type="text" label="Skills" />

        <TagsInput />
          <div className="field">
            <label className="label">Account type</label>
            <div className="control">
              <label className="radio">
                <input
                  type="radio"
                  name="accountType"
                  checked={!isBusiness}
                  onChange={() => setIsBusiness(false)}
                />
                &nbsp;Personal/Individual
              </label>
              &nbsp;&nbsp;
              <label className="radio">
                <input
                  type="radio"
                  name="accountType"
                  checked={isBusiness}
                  onChange={() => setIsBusiness(true)}
                />
                &nbsp;Business
              </label>
            </div>
          </div>


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