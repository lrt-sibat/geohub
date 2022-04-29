import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} from '@azure/storage-blob'

import azure from '@azure/storage-blob'
import type { Tree, TreeNode } from '$lib/types'
import { AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY } from '$lib/variables'

const account = AZURE_STORAGE_ACCOUNT
const accountKey = AZURE_STORAGE_ACCESS_KEY
const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey)

const isRasterExtension = (name: string) => {
  const splitAt = name.lastIndexOf('.')
  const ext = name.slice(splitAt, name.length)
  const extensions = ['.tif', '.tiff', '.vrt', '.jpg', '.jpeg', '.img', '.nc']
  const v = extensions.includes(ext.toLowerCase())
  return v
}

const listContainer = async (containerName: string, relPath: string) => {
  // create storage container
  const blobServiceClient = new BlobServiceClient(`https://${account}.blob.core.windows.net`, sharedKeyCredential)

  // generate account SAS token for vector tiles. This is needed because the
  // blob level SAS tokens have the blob name encoded inside the SAS token and the
  // adding a vector tile to mapbox requires adding a template/pattern not one file and reading many more files as well.

  const ACCOUNT_SAS_TOKEN_URI = blobServiceClient.generateAccountSasUrl(
    new Date(new Date().valueOf() + 86400000),
    azure.AccountSASPermissions.parse('r'),
    'o',
  )
  const ACCOUNT_SAS_TOKEN_URL = new URL(ACCOUNT_SAS_TOKEN_URI)

  let treeLabel: string = containerName
  if (relPath) {
    treeLabel = relPath
  }
  const treePath = `${containerName}/${relPath}`

  if (treeLabel.endsWith('/')) {
    treeLabel = treeLabel.slice(0, -1)
  }

  if (treeLabel.includes('/')) {
    treeLabel = treeLabel.split('/').pop()
  }

  const tree = { label: treeLabel, children: [], path: treePath, url: null }
  const cclient = blobServiceClient.getContainerClient(containerName)
  
  const containerChildren: Array<TreeNode> = []
  // tests if the relPath is a vector tile...
  // const bclient = cclient.getBlobClient(`${relPath}metadata.json`)
  // const isVectorTile:boolean = await bclient.exists()
  // if (isVectorTile) {
  //   tree.url = `${bclient.url.replace('metadata.json', '{z}/{x}/{y}.pbf')}${ACCOUNT_SAS_TOKEN_URL.search}`
  //   console.log(tree.url)
  // }
  // else {
    for await (const item of cclient.listBlobsByHierarchy('/', { prefix: relPath })) {
      let childLabel: string
  
      const path = `${containerName}/${item.name}`
      if (item.kind === 'prefix') {
        const label = item.name.slice(0, -1)
        if (label.includes('/')) {
          childLabel = label.split('/').pop()
        } else {
          childLabel = label
        }
        const bclient = cclient.getBlobClient(`${path}metadata.json`)
        const isVectorTile:boolean = await bclient.exists()
        console.log(item, isVectorTile, `${path}metadata.json`)
        const url = isVectorTile ? `${bclient.url.replace('metadata.json', '{z}/{x}/{y}.pbf')}${ACCOUNT_SAS_TOKEN_URL.search}` : null
        
        containerChildren.push({ label: childLabel, children: [], path: path, url: url, isRaster: false })
      } else {
        const blockBlobClient = cclient.getBlockBlobClient(item.name)
        const sasToken = generateBlobSASQueryParameters(
          {
            containerName: containerName,
            blobName: item.name,
            expiresOn: new Date(new Date().valueOf() + 86400000),
            permissions: BlobSASPermissions.parse('r'),
          },
          sharedKeyCredential,
        )
  
        const sasUrl = `${blockBlobClient.url}?${sasToken}`
        const label = item.name
        if (label.includes('/')) {
          childLabel = label.split('/').pop()
        } else {
          childLabel = label
        }
        const isRaster = isRasterExtension(childLabel)
        
        if (isRaster) {
          containerChildren.push({ label: childLabel, path: path, url: sasUrl, isRaster: isRaster })
        }
        
      }
    }
  //}

  tree.children = containerChildren

  return {
    tree,
  }
}

const listContainers = async (prefix = '/') => {
  const blobServiceClient = new BlobServiceClient(`https://${account}.blob.core.windows.net`, sharedKeyCredential)
  const tree: TreeNode = {
    label: 'GeoHub Storage',
    children: <TreeNode[]>[],
    path: prefix,
    url: null,
    isRaster: false,
  }

  for await (const container of blobServiceClient.listContainers()) {
    tree.children.push({ label: container.name, children: [], path: `${container.name}/`, url: null, isRaster: false })
  }

  return {
    tree,
  }
}

export async function get(query: any) {
  let path = '/'
  if (query.url.searchParams.has('path')) {
    path = !path.endsWith('/') ? `${path}/` : query.url.searchParams.get('path')
  }

  let tree: Tree

  if (path === '/') {
    tree = await listContainers()
  } else {
    const [containerName, ...containerPath] = path.split('/')
    tree = await listContainer(
      containerName,
      Array.isArray(containerPath) && !!containerPath[0] ? containerPath.join('/') : '',
    )
  }

  return {
    body: tree,
  }
}
