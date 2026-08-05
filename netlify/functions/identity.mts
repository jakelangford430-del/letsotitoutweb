import type { UserLoginEvent, UserSignupEvent } from '@netlify/functions'

const addMemberRole = (event: UserLoginEvent | UserSignupEvent) => {
  const existingRoles = Array.isArray(event.user.appMetadata?.roles) ? event.user.appMetadata.roles : []

  return {
    user: {
      ...event.user,
      appMetadata: {
        ...event.user.appMetadata,
        roles: Array.from(new Set([...existingRoles, 'member'])),
      },
    },
  }
}

export default {
  userSignup: addMemberRole,
  userLogin: addMemberRole,
}
