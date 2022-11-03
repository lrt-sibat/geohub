import type { RequestHandler } from './$types'
import { error } from '@sveltejs/kit'
import { VectorTile } from '@mapbox/vector-tile'
import Pbf from 'pbf'
import arraystat from 'arraystat'
import { ErrorMessages } from '$lib/constants'
import { mean, std, median } from 'mathjs'

const propsObj = {}

let pbf: Pbf
let tile: VectorTile

// fetch vector tiles info from
const fetchVectorTileInfo = async (path: string, layerName: string) => {
  let attributesArray = []

  await fetch(`${path}`)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    .then((response) => (response?.path ? response.json() : response.arrayBuffer()))
    .then((arrayBuffer) => (pbf = new Pbf(arrayBuffer)))
    .catch((error) => (attributesArray = error))

    try {
      tile = new VectorTile(pbf)
    } catch (err) {
      throw error(500, { message: err})
    }

    const layer = tile.layers[layerName]
    if (!layer) {
      // layerName doesn't exist in layers
      throw error(400, { message: ErrorMessages.NO_LAYER_WITH_THAT_NAME})
    }

      // since we are pushing values, we need to force the attributesArray to be empty at this point

      if (attributesArray.length > 0) {
        attributesArray = []
      }
      // The layer._keys is a list with all the available attributes in the layer.
      // Mapping through the attributes to get the attributeArray object
      layer['_keys'].map((property) => {
        propsObj[property] = []

        for (let featureIndex = 0; featureIndex < layer.length; featureIndex++) {
          const feature = layer.feature(featureIndex)
          if (!feature.properties[property]) continue
          layer['_keys'][property] = propsObj[property].push(feature.properties[property])
        }

        if (isNaN(propsObj[property][0])) {
          // The first value is not a number, mathematical operations will result in NaN
          const attribute = {
            attribute: property,
            type: String(typeof propsObj[property][0]),
            count: propsObj[property].length,
            values: propsObj[property].slice(0, 100),
          }
          // Add the attribute to the attributes array
          attributesArray.push(attribute)
        } else {
          const attribute = {
            attribute: property,
            type: String(typeof propsObj[property][0]),
            count: propsObj[property].length,
            min: Math.min(...propsObj[property]),
            max: Math.max(...propsObj[property]),
            mean: mean(propsObj[property]),
            median: median(propsObj[property]),
            std: std(propsObj[property]),
          }

          // The first value is a number, so assume all values as number
          // Look for the unique values, if the number of unique values is less/equal to 25,
          // this is a unique value attribute
          const uniqueValues = [...new Set(propsObj[property])]
          if (uniqueValues.length <= 25) {
            attribute['values'] = [...new Set(propsObj[property])].sort((previous: number, after: number) => {
              return previous - after
            })
            attribute['mean'] = mean(propsObj[property])
            attribute['median'] = median(propsObj[property])
            attribute['std'] = std(propsObj[property])
          } else {
            // There are too many values, this is not a unique values
            // Need to generate the histogram here
            const histogram = { count: [], bins: [] }
            arraystat(propsObj[property]).histogram.map((item) => {
              histogram.bins.push(item.max), histogram.count.push(item.nb)
            })
            histogram.bins.unshift(Math.min(...propsObj[property]))

            attribute['histogram'] = histogram
          }

          attributesArray.push(attribute)
        }
      })

  return attributesArray
}

export const GET: RequestHandler = async ({ url }) => {
  if (
    url === undefined ||
    url.searchParams === undefined ||
    !url.searchParams.has('path') ||
    !url.searchParams.has('layer_name')
  ) {
    throw error(400, JSON.stringify({ message: ErrorMessages.VECTOR_INFO_BAD_REQUEST }))
  }

  const path = url.searchParams.get('path')
  const layer_name = url.searchParams.get('layer_name')

  // fetch vector tiles values
  const response = await fetchVectorTileInfo(path, layer_name)

  return new Response(JSON.stringify(response))
}