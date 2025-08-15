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
  const [avatar, setAvatar] = useState(null)

  const firstName = useRef(null)
  const lastName = useRef(null)
  const email = useRef(null)
  const postalCode = useRef(null)
  const username = useRef(null)
  const password = useRef(null)

  const router = useRouter()

  const submit = (e) => {
  e.preventDefault();

  const user = {
    username: username.current?.value,
    password: password.current?.value,
    first_name: firstName.current?.value,
    last_name: lastName.current?.value,
    email: email.current?.value,
    postal_code: postalCode.current?.value,
    avatar,
    is_business: false,
    is_admin: false
  };

  register(user)
  .then((res) => {
    console.log('Register response:', res);
    if (res && res.token) {
      setToken(res.token);
      if (isBusiness) {
        router.push('/businessProfile');
      } else {
        router.push('/');
      }
    } else {
      alert(res?.error || 'Registration failed.');
    }
  })
  .catch((err) => {
    console.error('Register failed:', err);
    alert('An error occurred during registration.');
  });
};

  return (
    <div className="columns is-centered">
      <div className="column is-half">
        <form className="box" onSubmit={submit}>
          <h1 className="title">Welcome!</h1>

          <Input id="firstName" refEl={firstName} type="text" label="First Name (optional)" />
          <Input id="lastName" refEl={lastName} type="text" label="Last Name (optional)" />
          <Input id="email" refEl={email} type="email" label="Email" required />
          <Input id="postalCode" refEl={postalCode} type="text" label="Postal/Zip Code" pattern="[0-9]{5}" required />
          <Input id="username" refEl={username} type="text" label="Username" />
          <Input id="password" refEl={password} type="password" label="Password" />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatar(e.target.files[0])}
          />
          {avatar && (
          <div style={{ marginTop: "10px" }}>
            <img
              src={URL.createObjectURL(avatar)}
              alt="Preview"
              style={{ maxWidth: "100px", borderRadius: "8px" }}
            />
          </div>
        )}

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