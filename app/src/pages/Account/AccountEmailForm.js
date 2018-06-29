import React from 'react'
import { Form as ReactForm } from 'react-form'
import Raven from 'raven-js'
import { EmailField } from '../../pages/Login/EmailLogin'
import { FadeIn } from 'animate-components'
import { Button } from 'semantic-ui-react'

const AccountEmailForm = ({ user, changeEmail, dispatchEmailChange, isEmailPending, setFormStatus, errorValidator, successValidator }) => {
  return (
    <ReactForm
      validateError={errorValidator}
      validateSuccess={successValidator}
      onSubmitFailure={(error, ...rest) => {
        // onEmailError(true)
        setFormStatus('ERROR', true)
        Raven.captureException(`User try to change email: ${error} ${rest}`)
      }}
      onSubmit={(values, _, formApi) => {
        // onEmailPending(true)
        setFormStatus('PENDING', true)
        changeEmail({ variables: { ...values } })
          .then(data => {
            setFormStatus('PENDING', false)
            setFormStatus('ERROR', false)
            setFormStatus('SUCCESS', true)
            // onEmailPending(false)
            // onEmailSuccess(true)
            // onEmailError(false)
            dispatchEmailChange(values.email)
            formApi.resetAll()
          })
          .catch(error => {
            setFormStatus('PENDING', false)
            setFormStatus('ERROR', true)
            // onEmailPending(false)
            // onEmailError(true)
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
  )
}

export default AccountEmailForm
