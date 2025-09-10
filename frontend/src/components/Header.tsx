import Logo from './shared/Logo'
import { useAuth } from '../context/AuthContext'
import NavigationLink from './shared/NavigationLink';

const Header = () => {
    const auth = useAuth();
  return (
    <div>
        {/* LOGO */}
        <Logo />
        {/* HEADER CONTENT */}
        <div>{auth?.isLoggedIn ? (
            <>
                <NavigationLink bg="#00ffcc" to="/chat" text="Go To Chat" textColor="white"/>
                <NavigationLink bg="#595fffff" textColor="white" to="/" text="Logout" onClick={auth.logout} />
            </>
            ) : (
            <>
                <NavigationLink bg="#00ffcc" to="/login" text="Login" textColor="white"/>
                <NavigationLink bg="#595fffff" textColor="white" to="/signup" text="Signup" />
            </>
            )}</div>
    </div>
  )
}

export default Header