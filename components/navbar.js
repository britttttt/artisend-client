import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { useAppContext } from '../context/state'

export default function Navbar() {
  const { token, profile } = useAppContext()
  const hamburger = useRef()
  const navbar = useRef()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

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
        <a className="navbar-link flex items-center">
          {profile?.avatar || profile?.profile_image ? (
            <img
              src={profile.avatar || profile.profile_image}
              alt={profile.display_name || "User"}
              className="rounded-full mr-2"
              style={{ width: "32px", height: "32px", objectFit: "cover" }}
            />
          ) : (
            <span className="icon">
              <i className="fas fa-user-circle is-medium"></i>
            </span>
          )}
          <span>{profile?.display_name || profile?.username || "User"}</span>
        </a>
        <div className="navbar-dropdown is-right">
          <Link href="/businessProfile" className="navbar-item">
            Business Profile
          </Link>
          <Link href="/profile" className="navbar-item">
            My Profile
          </Link>
          <hr className="navbar-divider" />
          <a
            className="navbar-item"
            onClick={() => {
              localStorage.removeItem('token')
              setIsLoggedIn(false)
              window.location.href = "/"
            }}
          >
            Log out
          </a>
        </div>
      </div>
    )
  }

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
    <nav
      className="navbar mb-3 is-warning px-5 is-fixed-top is-top"
      role="navigation"
      aria-label="main navigation"
    >
      <div className="navbar-brand">
        <Link href="/">
         Home
        </Link>

        <Link href="/edit-profile" className="button is-light">
            Edit User
          </Link>

        <a
          role="button"
          className="navbar-burger"
          aria-label="menu"
          aria-expanded="false"
          data-target="navbarBasicExample"
          ref={hamburger}
          onClick={showMobileNavbar}
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div className="navbar-menu" ref={navbar}>
        <div className="navbar-end">
          {isLoggedIn ? getLoggedInButtons() : getLoggedOutButtons()}
        </div>
      </div>
    </nav>
  )
}