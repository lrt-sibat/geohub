import type { RequestHandler } from './$types'
import pkg from 'pg'
const { Pool } = pkg

import { env } from '$env/dynamic/private'
import { getStarCount } from '$lib/server/helpers'
const connectionString = env.DATABASE_CONNECTION

export const POST: RequestHandler = async ({ locals, params }) => {
  const session = await locals.getSession()
  if (!session) {
    return new Response(JSON.stringify({ message: 'Permission error' }), {
      status: 403,
    })
  }

  const dataset_id = params.id
  const user_email = session.user.email
  const now = new Date().toISOString()

  const pool = new Pool({ connectionString })
  const client = await pool.connect()
  try {
    const query = {
      text: `
        INSERT INTO geohub.dataset_favourite (
            dataset_id, user_email, savedat
        ) values (
            $1,
            $2,
            $3::timestamptz
        )
        ON CONFLICT (dataset_id, user_email)
        DO
        UPDATE
        SET
        savedat=$3::timestamptz
        `,
      values: [dataset_id, user_email, now],
    }

    await client.query(query)

    const stars = await getStarCount(client, dataset_id)

    const res = {
      dataset_id,
      user_email,
      savedat: now,
      no_stars: stars,
    }

    return new Response(JSON.stringify(res))
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), {
      status: 400,
    })
  } finally {
    client.release()
    pool.end()
  }
}

export const DELETE: RequestHandler = async ({ locals, params }) => {
  const session = await locals.getSession()
  if (!session) {
    return new Response(JSON.stringify({ message: 'Permission error' }), {
      status: 403,
    })
  }

  const dataset_id = params.id
  const user_email = session.user.email

  const pool = new Pool({ connectionString })
  const client = await pool.connect()
  try {
    const query = {
      text: `DELETE FROM geohub.dataset_favourite WHERE dataset_id=$1 and user_email=$2`,
      values: [dataset_id, user_email],
    }

    await client.query(query)

    const stars = await getStarCount(client, dataset_id)

    const res = {
      dataset_id,
      no_stars: stars,
    }

    return new Response(JSON.stringify(res))
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), {
      status: 400,
    })
  } finally {
    client.release()
    pool.end()
  }
}
