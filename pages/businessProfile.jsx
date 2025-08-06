import Link from 'next/link'
import { useRouter } from 'next/router'
import { useRef, useState } from 'react'
import { Input } from '../components/form-elements'
import Layout from '../components/layout'
import Navbar from '../components/navbar'
import { useAppContext } from '../context/state'
import { register } from '../data/auth'

export default function Register() {
  const { setToken } = useAppContext()
  const [isBusiness, setIsBusiness] = useState(false)

  const displayName = useRef(null)
  const phoneNum = useRef(null)
  const lastName = useRef(null)
  const email = useRef(null)
  const password = useRef(null)

  const router = useRouter()

  const submit = async (e) => {
    e.preventDefault()

    const business = {
      displayName: displayName.current?.value,
      phoneNum: phoneNum.current?.value,
      businessEmail: businessEmail.current?.value,
      password: password.current?.value,
      last_name: lastName.current?.value,
      isBusiness,
      isAdmin: false
    }

    const res = await register(business)
    if (res.token) {
      setToken(res.token)
      if (isBusiness) {
        router.push('/businessProfile')
      } else {
        router.push('/')
      }
    }
  }

  return (
    <div className="columns is-centered">
      <div className="column is-half">
        <form className="box" onSubmit={submit}>
          <h1 className="title">Welcome!</h1>

          <Input id="phoneNum" refEl={phoneNum} type="text" label="Phone Number" />
          <Input id="lastName" refEl={lastName} type="text" label="Last Name" />
          <Input id="businessEmail" refEl={businessEmail} type="email" label="business email" required />
          <Input id="displayName" refEl={displayName} type="text" label="DisplayName" />
          <Input id="password" refEl={password} type="password" label="Password" />

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
              <Link href="/login">
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