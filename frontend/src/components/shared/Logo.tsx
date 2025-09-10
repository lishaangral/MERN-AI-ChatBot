import {Link} from 'react-router-dom'

const Logo = () => {
  return (
    <div>
        <Link to="/">
        <div className="avatar">🤖</div>
            {/* <img src="vite.svg" alt="Logo" /> */}
        </Link>
    </div>
  )
}

export default Logo