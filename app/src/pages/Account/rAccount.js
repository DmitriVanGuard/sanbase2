import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Message } from 'semantic-ui-react'
import AccountHeader from './AccountHeader'
import AccountEmailForm from './AccountEmailForm'
import AccountUsernameForm from './AccountUsernameForm'
import AccountEthKeyForm from './AccountEthKeyForm'
import AccountWallets from './AccountWallets'
import AccountSessions from './AccountSessions'
import { USER_LOGOUT_SUCCESS } from '../../actions/types'
import './Account.css'
const validate = require('validate.js')

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

class rAccount extends Component {
  constructor (props) {
    super(props)
    this.state = {
      email: {
        PENDING: false,
        ERROR: false,
        SUCCESS: false
      },
      username: {
        PENDING: false,
        ERROR: false,
        SUCCESS: false
      }
    }
  }

  setFormStatus (form) {
    return (status, value) => {
      this.setState(prevState => {
        const newFormState = { ...prevState[form] }
        newFormState[status] = value
        return {
          ...prevState,
          [form]: newFormState
        }
      })
    }
  }

  render () {
    const { user, loading, dispatchUserLogout, dispatchEmailChange, dispatchUsernameChange } = this.props
    const { email, username } = this.state
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

        {email.SUCCESS &&
          <Message
            className='account-message'
            positive
            content={`Email was changed to ${user.email}!`}
          />}
        {email.ERROR &&
          <Message
            className='account-message'
            negative
            header='Failed to change email!'
            list={['Try again later...']}
          />}
        {username.SUCCESS &&
          <Message
            className='account-message'
            positive
            content={`Username was changed to ${user.username}!`}
          />}
        {username.ERROR &&
          <Message
            className='account-message'
            negative
            header='Failed to change username!'
            list={['Try again later...']}
          />}

        <div className='panel'>
          <AccountEmailForm
            user={user}
            dispatchEmailChange={dispatchEmailChange}
            successValidator={successValidator}
            errorValidator={errorValidator}
            setFormStatus={this.setFormStatus('email')}
            isEmailPending={email.PENDING}
          />
          <AccountUsernameForm
            user={user}
            dispatchUsernameChange={dispatchUsernameChange}
            successValidator={successValidator}
            errorValidator={errorValidator}
            setFormStatus={this.setFormStatus('username')}
            isUsernamePending={username.PENDING}
          />
          <br />
          <AccountEthKeyForm user={user} loading={loading} />
          <AccountWallets user={user} />
          <AccountSessions onLogoutBtnClick={dispatchUserLogout} />
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  user: state.user.data,
  loading: state.user.isLoading
})

const mapDispatchToProps = dispatch => ({
  dispatchUserLogout: () => dispatch({ type: USER_LOGOUT_SUCCESS }),
  dispatchEmailChange: email => dispatch({
    type: 'CHANGE_EMAIL',
    email
  }),
  dispatchUsernameChange: username => dispatch({
    type: 'CHANGE_USERNAME',
    username
  })
})

export const UnwrappedAccount = rAccount
export default connect(mapStateToProps, mapDispatchToProps)(rAccount)
