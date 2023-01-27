import type { RequestHandler } from './$types'
import pkg from 'pg'
const { Pool } = pkg

import { DATABASE_CONNECTION } from '$lib/server/variables/private'
import { getStyleById } from '$lib/server/helpers'
import { AccessLevel } from '$lib/constants'
const connectionString = DATABASE_CONNECTION

/**
 * Get style.json which is stored in PostgreSQL database
 * GET: ./api/style/{id}.json
 */
export const GET: RequestHandler = async ({ params, locals }) => {
  const session = await locals.getSession()

  const pool = new Pool({ connectionString })
  const client = await pool.connect()
  try {
    const styleId = Number(params.id)
    if (!styleId) {
      return new Response(JSON.stringify({ message: `id parameter is required.` }), {
        status: 400,
      })
    }
    const style = await getStyleById(styleId)

    if (!style) {
      return new Response(undefined, {
        status: 404,
      })
    }

    const email = session?.user?.email
    let domain: string
    if (email) {
      domain = email.split('@').pop()
    }

    const accessLevel: AccessLevel = style.access_level
    if (accessLevel === AccessLevel.PRIVATE) {
      if (!(email && email === style.created_user)) {
        return new Response(JSON.stringify({ message: 'Permission error' }), {
          status: 403,
        })
      }
    } else if (accessLevel === AccessLevel.ORGANIZATION) {
      if (!(domain && style.created_user?.indexOf(domain) > -1)) {
        return new Response(JSON.stringify({ message: 'Permission error' }), {
          status: 403,
        })
      }
    }

    return new Response(JSON.stringify(style.style))
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), {
      status: 400,
    })
  } finally {
    client.release()
    pool.end()
  }
}
