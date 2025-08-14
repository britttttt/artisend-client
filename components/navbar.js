import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { useAppContext } from '../context/state'

export default function Navbar() {
  const { token, profile } = useAppContext()
  const hamburger = useRef()
  const navbar = useRef()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  console.log(profile)

  useEffect(() => {
    if (token) {
      setIsLoggedIn(true)
    }
  }, [token])

  const showMobileNavbar = () => {
    hamburger.current.classList.toggle('is-active')
    navbar.current.classList.toggle('is-active')
  }

  const getLoggedInButtons = () => {
    return (
      <div className="navbar-item has-dropdown is-hoverable">
        <a className="navbar-link">
          <span className="icon">
            <i className="fas fa-user-circle is-medium"></i>
          </span>
        </a>
        <div className="navbar-dropdown is-right">
          <Link href="/businessProfile" className="navbar-item"> Business Profile</Link>
          <Link href="/profile" className="navbar-item"> myProfile</Link>
          <hr className="navbar-divider"></hr>
          <a className="navbar-item" onClick={
            () => {
              localStorage.removeItem('token')
              setIsLoggedIn(false)
            }}
          >
            Log out
          </a>
        </div>
      </div>
    )
  }
  console.log(profile)
  const getLoggedOutButtons = () => {
    return (
      <div className="navbar-item">
        <div className="buttons">
          <Link href="/register" className="button is-primary">
              <strong>Sign up</strong>
          </Link>
          <Link href="/login" className="button is-light">
              Log in
          </Link>
        </div>
      </div>
    )
  }

  return (

    <nav className="navbar mb-3 is-warning px-5 is-fixed-top is-top" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">

          <Link href="/">
            <img src="/images/logo.png" alt="Logo" style={{ width:"4rem", height: "4rem"}} className="relative" />
          </Link>


        <a role="button" className="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample" ref={hamburger} onClick={showMobileNavbar}>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div className="navbar-menu" ref={navbar}>
        <div className="navbar-end">
          {
            isLoggedIn ? getLoggedInButtons() : getLoggedOutButtons()
          }
        </div>
      </div>
    </nav>
  )
}
