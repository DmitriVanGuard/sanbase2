import React from 'react'
import { connect } from 'react-redux'
import { Message } from 'semantic-ui-react'
import { graphql } from 'react-apollo'
import AccountHeader from './AccountHeader'
import AccountEmailForm from './AccountEmailForm'
import AccountUsernameForm from './AccountUsernameForm'
import AccountEthKeyForm from './AccountEthKeyForm'
import AccountWallets from './AccountWallets'
import AccountSessions from './AccountSessions'
import { changeEmailGQL, changeUsernameGQL } from './accountGQL'
import { USER_LOGOUT_SUCCESS } from '../../actions/types'
const validate = require('validate.js')

const dispatchUserLogout = () => ({ type: USER_LOGOUT_SUCCESS })

const dispatchEmailChange = (email) => ({
  type: 'CHANGE_EMAIL',
  email
})

const dispatchUsernameChange = (username) => ({
  type: 'CHANGE_USERNAME',
  username
})

const validateFields = (email, username) => {
  var constraints = {
    email: {
      email: true
    },
    username: {
      length: { minimum: 3 }
    }
  }
  return validate({ email, username }, constraints)
}

const errorValidator = ({ email, username }) => {
  const validation = validateFields(email, username)
  return {
    email: validation && validation.email,
    username: validation && validation.username
  }
}

const successValidator = ({ email, username }) => {
  const validation = validateFields(email, username)
  return {
    email: typeof validation === 'undefined' || !validation.email,
    username: typeof validation === 'undefined' || !validation.username
  }
}

const setFormStatus = (form) => (status, value) => { form[status] = value }

// const formStatus = {
//   email: {
//     set: setCurrentFormStatus
//   },
//   username: {
//     set: setCurrentFormStatus
//   }
// }

const emailForm = {
  PENDING: false,
  ERROR: false,
  SUCCESS: false
}

const usernameForm = {
  PENDING: false,
  ERROR: false,
  SUCCESS: false
}

const rAccount = ({ user, loading, emailForm, usernameForm, setEmailFormStatus, setUsernameFormStatus }) => {
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

      {emailForm.SUCCESS &&
        <Message
          className='account-message'
          positive
          content={`Email was changed to ${user.email}!`}
        />}
      {emailForm.ERROR &&
        <Message
          className='account-message'
          negative
          header='Email is not changed!'
          list={['Try again later...']}
        />}
      {usernameForm.SUCCESS &&
        <Message
          className='account-message'
          positive
          content={`Username was changed to ${user.username}!`}
        />}
      {usernameForm.ERROR &&
        <Message
          className='account-message'
          negative
          header='Failed to change username!'
          list={['Try again later...']}
        />}

      <div className='panel'>
        <AccountEmailForm
          user={user}
          changeEmail={graphql(changeEmailGQL, { name: 'changeEmail' })}
          dispatchEmailChange={dispatchEmailChange}
          successValidator={successValidator}
          errorValidator={errorValidator}
          setFormStatus={setEmailFormStatus}
          isEmailPending={emailForm.PENDING}
          />
        <AccountUsernameForm
          user={user}
          changeUsername={graphql(changeUsernameGQL, { name: 'changeUsername' })}
          dispatchUsernameChange={dispatchUsernameChange}
          successValidator={successValidator}
          errorValidator={errorValidator}
          setFormStatus={setUsernameFormStatus}
          isUsernamePending={usernameForm.PENDING}
        />
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
  loading: state.user.isLoading,
  emailForm,
  usernameForm
})

const mapDispatchToProps = dispatch => ({
  setEmailFormStatus: setFormStatus(emailForm),
  setUsernameFormStatus: setFormStatus(usernameForm)
})

export default connect(mapStateToProps, mapDispatchToProps)(rAccount)
