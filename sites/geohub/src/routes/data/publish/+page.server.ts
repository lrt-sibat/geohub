import type { Actions, PageServerLoad } from './$types'
import { error, fail, redirect } from '@sveltejs/kit'
import type { DatasetFeature, PgtileservDetailJson, PgtileservIndexJson, Tag } from '$lib/types'
import {
  generateAzureBlobSasToken,
  generateHashKey,
  getRasterMetadata,
  getVectorMetadata,
  upsertDataset,
} from '$lib/server/helpers'
import { clean, removeSasTokenFromDatasetUrl, isRasterExtension } from '$lib/helper'
import { env } from '$env/dynamic/private'
import { Permission } from '$lib/config/AppConfig'

/**
 * Preload dataset metadata from either database (existing case) or titiler/pmtiles (new case)
 * to generate Feature geojson object for data updating.
 */
export const load: PageServerLoad = async (event) => {
  const { locals, url } = event
  const session = await locals.getSession()
  if (!session) return
  const user_email = session?.user.email

  let datasetUrl = url.searchParams.get('url')
  if (!datasetUrl) {
    throw redirect(301, '/data')
  }
  datasetUrl = datasetUrl.replace('pmtiles://', '')

  const datasetId = generateHashKey(datasetUrl)

  const names = new URL(datasetUrl).pathname.split('.')
  const extention = names[names.length - 1]
  const isPmtiles = extention.toLowerCase() === 'pmtiles' ? true : false

  const apiUrl = `/api/datasets/${datasetId}`
  const res = await event.fetch(apiUrl)
  if (!res.ok && res.status !== 404) throw error(500, { message: res.statusText })

  if (res.status === 404) {
    const isPgtileservData = datasetUrl.indexOf(env.PGTILESERV_API_ENDPOINT) === -1 ? false : true

    if (isPgtileservData) {
      // for new datasets in pgtileserv
      const layerId = datasetUrl.replace(`${env.PGTILESERV_API_ENDPOINT}/`, '').replace('/{z}/{x}/{y}.pbf', '')
      const indexJsonUrl = `${env.PGTILESERV_API_ENDPOINT}/index.json`
      const res = await event.fetch(indexJsonUrl)
      const indexJson: PgtileservIndexJson = await res.json()
      const layer = indexJson[layerId]
      const resDetail = await event.fetch(indexJson[layerId].detailurl)
      const detailJson: PgtileservDetailJson = await resDetail.json()

      const tags: Tag[] = [
        {
          key: 'type',
          value: 'pgtileserv',
        },
        {
          key: 'layertype',
          value: layer.type,
        },
        {
          key: 'schema',
          value: layer.schema,
        },
        {
          key: 'table',
          value: layer.name,
        },
        {
          key: 'id',
          value: layer.id,
        },
      ]

      if (detailJson.geometrytype) {
        tags?.push({
          key: 'geometrytype',
          value: detailJson.geometrytype,
        })
      }

      let bounds = detailJson.bounds
      if (!bounds) {
        bounds = [-180, -90, 180, 90]
      }

      const feature: DatasetFeature = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [bounds[0], bounds[1]],
              [bounds[2], bounds[1]],
              [bounds[2], bounds[3]],
              [bounds[0], bounds[3]],
              [bounds[0], bounds[1]],
            ],
          ],
        },
        properties: {
          id: datasetId,
          url: detailJson.tileurl,
          name: clean(layer.name),
          description: layer.description,
          is_raster: false,
          tags,
        },
      }
      return {
        feature,
        isNew: true,
      }
    }

    // for new datasets in Azure Blob container
    const isGeneralStorageAccount = datasetUrl.indexOf(env.AZURE_STORAGE_ACCOUNT) === -1 ? false : true
    const isUploadStorageAccount = datasetUrl.indexOf(env.AZURE_STORAGE_ACCOUNT_UPLOAD) === -1 ? false : true

    if (!isGeneralStorageAccount && !isUploadStorageAccount) {
      // if url does not contain either AZURE_STORAGE_ACCOUNT or AZURE_STORAGE_ACCOUNT_UPLOAD, it throw error
      throw error(400, { message: `This dataset (${datasetUrl}) is not supported for this page.` })
    } else if (isUploadStorageAccount) {
      const userHash = generateHashKey(user_email)
      const isLoginUserDataset = datasetUrl.indexOf(userHash) === -1 ? false : true
      if (!isLoginUserDataset) {
        throw error(403, { message: `No permission to access this dataset` })
      }
    }

    const is_raster = isRasterExtension(datasetUrl)
    const metadata = is_raster ? await getRasterMetadata(datasetUrl) : await getVectorMetadata(datasetUrl)
    const tags: Tag[] = []
    tags.push({
      key: 'type',
      value: 'azure',
    })
    if (metadata.source) {
      const sources = metadata.source.split(',')
      sources.forEach((src) => {
        tags.push({
          key: 'provider',
          value: src.trim(),
        })
      })
    }

    const sasToken = generateAzureBlobSasToken(datasetUrl)
    datasetUrl = `${datasetUrl}${sasToken}`

    const feature: DatasetFeature = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [metadata.bounds[0], metadata.bounds[1]],
            [metadata.bounds[2], metadata.bounds[1]],
            [metadata.bounds[2], metadata.bounds[3]],
            [metadata.bounds[0], metadata.bounds[3]],
            [metadata.bounds[0], metadata.bounds[1]],
          ],
        ],
      },
      properties: {
        id: datasetId,
        url: `${isPmtiles ? 'pmtiles://' : ''}${datasetUrl}`,
        name: metadata.name,
        description: metadata.description,
        is_raster,
        tags,
      },
    }

    return {
      feature,
      isNew: true,
    }
  }

  const feature: DatasetFeature = await res.json()

  // check write permission of login user for datasets
  if (!(feature.properties.permission > Permission.READ)) {
    throw redirect(301, '/data')
  }

  // only accept dataset on Azure blob container
  const type = feature.properties.tags?.find((t) => t.key === 'type' && ['azure', 'pgtileserv'].includes(t.value))
  if (!type) {
    throw error(400, { message: `This dataset (${datasetUrl}) is not supported for this page.` })
  }

  return {
    feature,
    isNew: false,
  }
}

export const actions = {
  /**
   * An action to update / register dataset metadata
   */
  publish: async (event) => {
    const { request, locals } = event
    try {
      const session = await locals.getSession()
      if (!session) {
        return fail(403, { message: 'No permission' })
      }
      const data = await request.formData()

      const name = data.get('name') as string
      if (!name) {
        return fail(400, { type: 'danger', message: 'Dataset name is required' })
      }

      const license = data.get('license') as string
      if (!license) {
        return fail(400, { type: 'warning', message: 'License is required' })
      }

      const description = data.get('description') as string
      if (!description) {
        return fail(400, { type: 'warning', message: 'Dataset description is required' })
      }

      const tagsStr = data.get('tags') as string
      const tags: Tag[] = tagsStr ? JSON.parse(tagsStr) : ''

      if (tags.filter((t) => t.key === 'provider').length === 0) {
        return fail(400, { type: 'warning', message: 'Data provider is required' })
      }

      const featureString = data.get('feature') as string
      const dataset: DatasetFeature = JSON.parse(featureString)
      dataset.properties.name = name
      dataset.properties.license = license
      dataset.properties.description = description
      dataset.properties.tags = tags

      const user_email = session?.user.email
      const now = new Date().toISOString()
      if (!dataset.properties.created_user) {
        dataset.properties.created_user = user_email
        dataset.properties.createdat = now
      }
      dataset.properties.updated_user = user_email
      dataset.properties.updatedat = now

      // delete SAS token from URL
      dataset.properties.url = removeSasTokenFromDatasetUrl(dataset.properties.url)
      dataset.properties.url = decodeURI(dataset.properties.url)

      await upsertDataset(dataset)

      // if the dataset is under data-upload storage account, delete .ingesting file after registering metadata
      const azaccount = env.AZURE_STORAGE_ACCOUNT_UPLOAD
      if (dataset.properties.url.indexOf(azaccount) > -1) {
        const ingestingFileUrl = `${dataset.properties.url.replace('pmtiles://', '')}.ingesting`
        const ingestingUrlWithSasUrl = `${ingestingFileUrl}${generateAzureBlobSasToken(ingestingFileUrl, 60000, 'rwd')}`
        const res = await event.fetch(ingestingUrlWithSasUrl)
        if (res.ok) {
          // if exists, delete file
          const resDelete = await event.fetch(ingestingUrlWithSasUrl, {
            method: 'DELETE',
          })
          if (resDelete.ok) {
            console.debug(`Deleted ${ingestingUrlWithSasUrl}`)
          }
        }
      }

      return dataset
    } catch (error) {
      return fail(500, { status: error.status, message: 'error:' + error.message })
    }
  },
} satisfies Actions
