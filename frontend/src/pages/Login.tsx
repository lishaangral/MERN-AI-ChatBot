import React from 'react'
import CustomizedInput from '../components/shared/CustomizedInput'

const Login = () => {

  return (
    <div>
        Login
        <form>
            <div>
                <CustomizedInput type="email" name="email" label="Email" />
                <CustomizedInput type="password" name="password" label="Password" />
                <button type="submit">Submit</button>
            </div>
        </form>
    </div>
  )
}

export default Login