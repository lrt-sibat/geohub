import type { RequestHandler } from './$types'
import type { TileJson } from '$lib/types/TileJson'
import type { VectorTileMetadata } from '$lib/types/VectorTileMetadata'
import {
  getStaticPbfMetadataJson,
  getMartinTileJson,
  generateMetadataJson,
  getPgtileservTileJson,
} from '$lib/server/helpers'
import { PUBLIC_MARTIN_API_ENDPOINT, PUBLIC_PGTILESERV_API_ENDPOINT } from '$lib/variables/public'

/**
 * /api/vector/[source]/metadata.json?table={table}&type={type}&pbfpath={pbfpath}
 * @param params.source source name either pgtileserv or martin or azstorage
 * @param params.table schemaname and table name (e.g., zambia.poverty)
 * @returns return metadata.json v1.3.0 (https://github.com/mapbox/mbtiles-spec/blob/master/1.3/spec.md)
 */
export const GET: RequestHandler = async ({ url, params }) => {
  const source = params.source
  const table = url.searchParams.get('table')
  const type = url.searchParams.get('type')
  const pbfpath = url.searchParams.get('pbfpath')

  let tilejson: TileJson
  let metadatajson: VectorTileMetadata
  switch (source) {
    case 'azstorage':
      if (!pbfpath) {
        return new Response(JSON.stringify({ message: `'pbfpath' is required.` }), {
          status: 400,
        })
      }
      metadatajson = await getStaticPbfMetadataJson(url.origin, pbfpath)
      break
    case 'martin':
      tilejson = await getMartinTileJson(table, PUBLIC_MARTIN_API_ENDPOINT)
      if (!tilejson) {
        return new Response(JSON.stringify({ message: `table: ${table} not found.` }), {
          status: 404,
        })
      }
      metadatajson = await generateMetadataJson(tilejson)
      break
    case 'pgtileserv':
      tilejson = await getPgtileservTileJson(table, type, PUBLIC_PGTILESERV_API_ENDPOINT)
      metadatajson = await generateMetadataJson(tilejson)
      break
    default:
      return new Response(JSON.stringify({ message: `Invalid source parameter.` }), {
        status: 400,
      })
  }

  return new Response(JSON.stringify(metadatajson))
}
