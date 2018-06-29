import React from 'react'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import Raven from 'raven-js'
import { Redirect } from 'react-router-dom'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { compose, withState, pure } from 'recompose'
import { Form, Input, Message, Divider, Button } from 'semantic-ui-react'
import { FadeIn } from 'animate-components'
import copy from 'copy-to-clipboard'
import Balance from '../../components/Balance'
import { EmailField, UsernameField } from '../../pages/Login/EmailLogin'
import { Form as ReactForm } from 'react-form'
import * as actions from '../../actions/types'
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

export const Account = ({
  user,
  loading,
  logout,
  changeEmail,
  changedEmail,
  changeUsername,
  changedUsername,
  isEmailError = false,
  isEmailSuccess = false,
  isEmailPending,
  onEmailSuccess,
  onEmailError,
  onEmailPending,
  isUsernameError = false,
  isUsernameSuccess = false,
  isUsernamePending,
  onUsernameSuccess,
  onUsernameError,
  onUsernamePending
}) => {
  if (user && !user.username) {
    return (
      <Redirect
        to={{
          pathname: '/'
        }}
      />
    )
  }
  return (
    <div className='page account'>
      <Helmet>
        <title>
          SANbase: Settings
        </title>
      </Helmet>
      <div className='page-head'>
        <h1>Account settings</h1>
      </div>
      {!user.email &&
        <Message
          className='account-message'
          warning
          header='Email is not added yet!'
          list={[
            'For acces your dashboard from mobile device, you should add email address.'
          ]}
        />}
      {isEmailSuccess &&
        <Message
          className='account-message'
          positive
          content={`Email was changed to ${user.email}!`}
        />}
      {isEmailError &&
        <Message
          className='account-message'
          negative
          header='Email is not changed!'
          list={['Try again later...']}
        />}
      {isUsernameSuccess &&
        <Message
          className='account-message'
          positive
          content={`Username was changed to ${user.username}!`}
        />}
      {isUsernameError &&
        <Message
          className='account-message'
          negative
          header='Failed to change username!'
          list={['Try again later...']}
        />}
      <div className='panel'>
        <ReactForm
          validateError={errorValidator}
          validateSuccess={successValidator}
          onSubmitFailure={(error, ...rest) => {
            onEmailError(true)
            Raven.captureException(`User try to change email: ${error} ${rest}`)
          }}
          onSubmit={(values, _, formApi) => {
            onEmailPending(true)
            console.log(changeEmail)
            changeEmail({ variables: { ...values } })
              .then(data => {
                onEmailPending(false)
                onEmailSuccess(true)
                onEmailError(false)
                changedEmail(values.email)
                formApi.resetAll()
              })
              .catch(error => {
                onEmailPending(false)
                onEmailError(true)
                Raven.captureException(`User try to change email: ${error}`)
              })
          }}
        >
          {formApi => (
            <form
              className='account-settings-email'
              onSubmit={formApi.submitForm}
              autoComplete='off'
            >
              <EmailField
                autoFocus={false}
                disabled={isEmailPending}
                placeholder={user.email || undefined}
                className='account-settings-email__input'
                formApi={formApi}
              />

              {formApi.getSuccess().email &&
                <FadeIn
                  className='account-settings-email__button-container'
                  duration='0.7s'
                  timingFunction='ease-in'
                  as='div'
                >
                  <Button
                    disabled={!formApi.getSuccess().email || isEmailPending}
                    positive={!!formApi.getSuccess().email}
                    type='submit'
                  >
                    {isEmailPending ? 'Waiting...' : 'Submit'}
                  </Button>
                </FadeIn>}
            </form>
          )}
        </ReactForm>
        <ReactForm
          validateError={errorValidator}
          validateSuccess={successValidator}
          onSubmitFailure={(error, ...rest) => {
            onUsernameError(true)
            Raven.captureException(`User try to change username: ${error} ${rest}`)
          }}
          onSubmit={(values, _, formApi) => {
            onUsernamePending(true)
            changeUsername({ variables: { ...values } })
              .then(data => {
                onUsernamePending(false)
                onUsernameSuccess(true)
                onUsernameError(false)
                changedUsername(values.username)
                formApi.resetAll()
              })
              .catch(error => {
                onUsernamePending(false)
                onUsernameError(true)
                Raven.captureException(`User try to change username: ${error}`)
              })
          }}
        >
          {formApi => (
            <form
              className='account-settings-email'
              onSubmit={formApi.submitForm}
              autoComplete='off'
            >
              <UsernameField
                autoFocus={false}
                disabled={isUsernamePending}
                placeholder={
                  user.username
                  // user.username !== user.ethAccounts[0].address ? user.username : undefined
                  /* TODO: Change user store schema */
                }
                className='account-settings-email__input'
                formApi={formApi}
              />

              {formApi.getSuccess().username &&
                <FadeIn
                  className='account-settings-email__button-container'
                  duration='0.7s'
                  timingFunction='ease-in'
                  as='div'
                >
                  <Button
                    disabled={!formApi.getSuccess().username || isUsernamePending}
                    positive={!!formApi.getSuccess().username}
                    type='submit'
                  >
                    {isUsernamePending ? 'Waiting...' : 'Submit'}
                  </Button>
                </FadeIn>}

            </form>
          )}
        </ReactForm>
        <br />
        <Form loading={loading}>
          <Form.Field>
            <label>Eth Public Key</label>
            <Input
              input={{ readOnly: true }}
              action={{
                color: 'teal',
                labelPosition: 'right',
                icon: 'copy',
                content: 'Copy',
                onClick: () => copy(user.ethAccounts && user.ethAccounts[0].address)
              }}
              defaultValue={user.ethAccounts && user.ethAccounts[0].address}
            />
          </Form.Field>
        </Form>
        <h3>Wallets</h3>
        <Divider />
        <Balance user={user} />
        <h3>Sessions</h3>
        <Divider />
        <div className='account-control'>
          <p>Your current session</p>
          <Button basic color='red' onClick={logout}>Log out</Button>
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = state => {
  return {
    user: state.user.data,
    loading: state.user.isLoading
  }
}

const mapDispatchToProps = dispatch => {
  return {
    logout: () => {
      dispatch({
        type: actions.USER_LOGOUT_SUCCESS
      })
    },
    changedEmail: email => {
      dispatch({
        type: 'CHANGE_EMAIL',
        email
      })
    },
    changedUsername: username => {
      dispatch({
        type: 'CHANGE_USERNAME',
        username
      })
    }
  }
}

const changeEmailGQL = gql`
  mutation changeEmail($email: String!) {
    changeEmail(email: $email) {
      email
    }
  }
`

const changeUsernameGQL = gql`
  mutation changeUsername($username: String!) {
    changeUsername(username: $username) {
      username
    }
  }
`

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withState('isEmailPending', 'onEmailPending', false),
  withState('isEmailError', 'onEmailError', false),
  withState('isEmailSuccess', 'onEmailSuccess', false),
  withState('isUsernamePending', 'onUsernamePending', false),
  withState('isUsernameError', 'onUsernameError', false),
  withState('isUsernameSuccess', 'onUsernameSuccess', false),
  graphql(changeEmailGQL, {
    name: 'changeEmail'
  }),
  graphql(changeUsernameGQL, {
    name: 'changeUsername'
  }),
  pure
)

export default enhance(Account)
