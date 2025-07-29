import React from 'react'
import {Link} from 'react-router-dom'

const Logo = () => {
  return (
    <div>
        <Link to="/">
            <img src="vite.svg" alt="Logo" />
        </Link>
        Logo
    </div>
  )
}

export default Logo