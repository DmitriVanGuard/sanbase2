import React from 'react'
import { Form as ReactForm } from 'react-form'
import Raven from 'raven-js'
import { EmailField } from './../pages/Login/EmailLogin'
import { FadeIn } from 'animate-components'
import { Button } from 'semantic-ui-react'

const AccountUsernameForm = () => (<ReactForm
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
</ReactForm>)

export default AccountUsernameForm
