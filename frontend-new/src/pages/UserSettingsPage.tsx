import { Avatar, Button, Stack, TextField } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/auth/AuthContext'
import { FormActions } from '@/components/FormActions'
import { PageHeader } from '@/components/PageHeader'
import { SectionCard } from '@/components/SectionCard'
import { changeCurrentUserPassword, updateCurrentUser } from '@/services/userSettingsService'
import { notifyError, notifySuccess } from '@/services/toastService'

type ProfileFormValues = {
  name: string
  email: string
  avatar: FileList
}

type PasswordFormValues = {
  current_password: string
  new_password: string
  new_password_repeat: string
}

export function UserSettingsPage() {
  const { user, refreshUser } = useAuth()
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const avatarUrl = useMemo(() => {
    if (!user?.avatar) {
      return undefined
    }

    const base = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
    return `${base.replace(/\/$/, '')}/storage/${user.avatar}`
  }, [user?.avatar])

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { isValid: isProfileValid, errors: profileErrors },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
    },
    mode: 'onChange',
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    watch: watchPassword,
    formState: { isValid: isPasswordValid, errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    defaultValues: {
      current_password: '',
      new_password: '',
      new_password_repeat: '',
    },
    mode: 'onChange',
  })

  const nextPasswordValue = watchPassword('new_password')

  useEffect(() => {
    resetProfile({
      name: user?.name ?? '',
      email: user?.email ?? '',
    })
  }, [resetProfile, user?.email, user?.name])

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="Settings"
        title="User settings"
        description="Update your profile details and change your password."
      />

      <SectionCard title="Profile" description="Name, email, and avatar">
        <Stack component="form" spacing={2} onSubmit={handleProfileSubmit(async (values) => {
          setSavingProfile(true)
          try {
            await updateCurrentUser({
              name: values.name,
              email: values.email,
              avatar: values.avatar?.[0] ?? null,
            })
            await refreshUser()
            notifySuccess('Profile updated successfully.')
          } catch {
            notifyError('Failed to update profile.')
          } finally {
            setSavingProfile(false)
          }
        })}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Avatar src={avatarUrl} sx={{ width: 56, height: 56 }} />
            <TextField
              type="file"
              label="Avatar"
              slotProps={{ inputLabel: { shrink: true } }}
              {...registerProfile('avatar')}
            />
          </Stack>

          <TextField
            label="Name"
            error={Boolean(profileErrors.name)}
            helperText={profileErrors.name?.message}
            {...registerProfile('name', { required: 'Name is required' })}
          />
          <TextField
            label="Email"
            error={Boolean(profileErrors.email)}
            helperText={profileErrors.email?.message}
            {...registerProfile('email', {
              required: 'Email is required',
              pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email address' },
            })}
          />

          <FormActions>
            <Button type="submit" variant="contained" disabled={!isProfileValid || savingProfile}>
              {savingProfile ? 'Saving...' : 'Save profile'}
            </Button>
          </FormActions>
        </Stack>
      </SectionCard>

      <SectionCard title="Change password" description="Use your current password to set a new one.">
        <Stack component="form" spacing={2} onSubmit={handlePasswordSubmit(async (values) => {
          setSavingPassword(true)
          try {
            await changeCurrentUserPassword(values)
            notifySuccess('Password updated successfully.')
            resetPassword()
          } catch {
            notifyError('Failed to update password.')
          } finally {
            setSavingPassword(false)
          }
        })}>
          <TextField
            type="password"
            label="Current password"
            error={Boolean(passwordErrors.current_password)}
            helperText={passwordErrors.current_password?.message}
            {...registerPassword('current_password', { required: 'Current password is required' })}
          />
          <TextField
            type="password"
            label="New password"
            error={Boolean(passwordErrors.new_password)}
            helperText={passwordErrors.new_password?.message}
            {...registerPassword('new_password', {
              required: 'New password is required',
              minLength: { value: 7, message: 'New password must be at least 7 characters' },
            })}
          />
          <TextField
            type="password"
            label="Repeat new password"
            error={Boolean(passwordErrors.new_password_repeat)}
            helperText={passwordErrors.new_password_repeat?.message}
            {...registerPassword('new_password_repeat', {
              required: 'Please confirm your new password',
              minLength: { value: 7, message: 'Password confirmation must be at least 7 characters' },
              validate: (value) => value === nextPasswordValue || 'Passwords do not match',
            })}
          />

          <FormActions>
            <Button type="submit" variant="contained" disabled={!isPasswordValid || savingPassword}>
              {savingPassword ? 'Saving...' : 'Change password'}
            </Button>
          </FormActions>
        </Stack>
      </SectionCard>
    </Stack>
  )
}


