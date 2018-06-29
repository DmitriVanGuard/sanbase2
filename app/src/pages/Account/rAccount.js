import React from 'react'
import { connect } from 'react-redux'
import { Message } from 'semantic-ui-react'
import AccountHeader from './AccountHeader'
import AccountEmailForm from './AccountEmailForm'
import AccountUsernameForm from './AccountUsernameForm'
import AccountEthKeyForm from './AccountEthKeyForm'
import AccountWallets from './AccountWallets'
import AccountSessions from './AccountSessions'
// import { changeEmailGQL, changeUsernameGQL } from './accountGQL'
import { USER_LOGOUT_SUCCESS } from '../../actions/types'

const dispatchUserLogout = () => ({ type: USER_LOGOUT_SUCCESS })

const dispatchEmailChange = (email) => ({
  type: 'CHANGE_EMAIL',
  email
})

const dispatchUsernameChange = (username) => ({
  type: 'CHANGE_USERNAME',
  username
})

const rAccount = ({ user, loading }) => {
  return (
    <div className='page account'>
      <AccountHeader />
      {!user.email &&
        <Message
          className='account-message'
          warning
          header='Email is not added yet!'
          list={[
            'For acces your dashboard from mobile device, you should add email address.'
          ]}
        />}
      <div className='panel'>
        <AccountEmailForm />
        <AccountUsernameForm />
        <br />
        <AccountEthKeyForm user={user} loading={loading} />
        <AccountWallets user={user} />
        <AccountSessions onLogoutBtnClick={dispatchUserLogout} />
      </div>
    </div>
  )
}

const mapStateToProps = state => ({
  user: state.user.data,
  loading: state.user.isLoading
})

export default connect(mapStateToProps)(rAccount)
