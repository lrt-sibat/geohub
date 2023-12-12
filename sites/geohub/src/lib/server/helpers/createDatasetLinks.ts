import { getBase64EncodedUrl } from '$lib/helper';
import type { DatasetFeature, Tag } from '$lib/types';
import { generateAzureBlobSasToken } from './generateAzureBlobSasToken';
import { StacProducts } from '$lib/config/AppConfig';

export const createDatasetLinks = (feature: DatasetFeature, origin: string, titilerUrl: string) => {
	const tags: Tag[] = feature.properties.tags;
	const type = tags?.find((tag) => tag.key === 'type');
	feature.properties.links = [
		{
			rel: 'self',
			type: 'application/json',
			href: `${origin}/api/datasets/${feature.properties.id}`
		},
		{
			rel: 'dataset',
			type: 'text/html',
			href: `${origin}/data/${feature.properties.id}`
		}
	];

	if (type && ['martin', 'pgtileserv'].includes(type.value)) {
		const id = tags?.find((tag) => tag.key === 'id');
		const layertype = tags?.find((tag) => tag.key === 'layertype');
		feature.properties.links.push({
			rel: 'metadatajson',
			type: 'application/json',
			href: `${origin}/api/vector/${type.value}/metadata.json?table=${id.value}${
				type.value === 'pgtileserv' ? `&type=${layertype.value}` : ''
			}`
		});
		feature.properties.links.push({
			rel: 'tilejson',
			type: 'application/json',
			href: `${origin}/api/vector/${type.value}/tile.json?table=${id.value}${
				type.value === 'pgtileserv' ? `&type=${layertype.value}` : ''
			}`
		});
		feature.properties.links.push({
			rel: 'pbf',
			type: 'application/vnd.mapbox-vector-tile',
			href: feature.properties.url
		});

		feature.properties.links.push({
			rel: 'preview',
			type: 'image/webp',
			href: `${origin}/api/datasets/${feature.properties.id}/preview/auto/{width}x{height}.webp`
		});
	} else if (type?.value === 'stac') {
		const stacType = tags?.find((tag) => tag.key === 'stacType')?.value;
		const product_id = tags?.find((t) => t.key === 'product')?.value;
		if (stacType === 'cog') {
			if (product_id) {
				const collection_id = tags.find((t) => t.key === 'collection').value;
				const b64EncodedUrl = getBase64EncodedUrl(feature.properties.url);
				const assetsParams = StacProducts.find((prod) => prod.collection_id === collection_id)
					.products.find((p) => p.name.toLowerCase() === product_id)
					.assets.join('&assets=');
				feature.properties.links.push({
					rel: 'info',
					type: 'application/json',
					href: `${titilerUrl}/info?url=${b64EncodedUrl}&assets=${assetsParams}`
				});
				feature.properties.links.push({
					rel: 'statistics',
					type: 'application/json',
					href: `${titilerUrl}/statistics?url=${b64EncodedUrl}&expression=${encodeURIComponent(
						StacProducts.find((prod) => prod.collection_id === collection_id).products.find(
							(p) => p.name.toLowerCase() === product_id
						).expression
					)}&asset_as_band=true&unscale=false&resampling=nearest&reproject=nearest&max_size=1024&categorical=false&histogram_bins=8`
				});
				feature.properties.links.push({
					rel: 'tiles',
					type: 'image/png',
					href: `${titilerUrl}/tiles/WebMercatorQuad/{z}/{x}/{y}.png?url=${encodeURIComponent(
						b64EncodedUrl
					)}&expression=${encodeURIComponent(
						StacProducts.find((prod) => prod.collection_id === collection_id).products.find(
							(p) => p.name.toLowerCase() === product_id
						).expression
					)}&asset_as_band=true&scale=1&bidx=1&resampling=nearest&return_mask=true`
				});
				feature.properties.links.push({
					rel: 'tilejson',
					type: 'application/json',
					href: `${titilerUrl}/WebMercatorQuad/tilejson.json?url=${encodeURIComponent(
						b64EncodedUrl
					)}&expression=${encodeURIComponent(
						StacProducts.find((prod) => prod.collection_id === collection_id).products.find(
							(p) => p.name.toLowerCase() === product_id
						).expression
					)}&scale=1&bidx=1&resampling=nearest&return_mask=true`
				});
			} else {
				const b64EncodedUrl = getBase64EncodedUrl(feature.properties.url);
				feature.properties.links.push({
					rel: 'download',
					type: 'image/tiff',
					href: feature.properties.url
				});
				feature.properties.links.push({
					rel: 'cog',
					type: 'application/json',
					href: `${titilerUrl}`
				});
				feature.properties.links.push({
					rel: 'info',
					type: 'application/json',
					href: `${titilerUrl}/info?url=${b64EncodedUrl}`
				});
				feature.properties.links.push({
					rel: 'statistics',
					type: 'application/json',
					href: `${titilerUrl}/statistics?url=${b64EncodedUrl}`
				});
				feature.properties.links.push({
					rel: 'tiles',
					type: 'image/png',
					href: `${titilerUrl}/tiles/WebMercatorQuad/{z}/{x}/{y}.png?url=${encodeURIComponent(
						b64EncodedUrl
					)}&scale=1&bidx=1&resampling=nearest&return_mask=true`
				});
				feature.properties.links.push({
					rel: 'tilejson',
					type: 'application/json',
					href: `${titilerUrl}/WebMercatorQuad/tilejson.json?url=${encodeURIComponent(
						b64EncodedUrl
					)}&scale=1&bidx=1&resampling=nearest&return_mask=true`
				});
			}
		} else if (stacType === 'mosaicjson') {
			const product_id = tags?.find((t) => t.key === 'product')?.value;
			const collection_id = tags.find((t) => t.key === 'collection').value;
			const itemUrls = tags.filter((t) => t.key === 'itemUrl');
			const b64EncodedUrl = getBase64EncodedUrl(itemUrls[0].value);
			feature.properties.links.push({
				rel: 'mosaicjson',
				type: 'application/json',
				href: `${titilerUrl.replace('cog', 'mosaicjson')}`
			});
			if (product_id) {
				const assetsParams = StacProducts.find((prod) => prod.collection_id === collection_id)
					.products.find((p) => p.name.toLowerCase() === product_id)
					.assets.join('&assets=');
				feature.properties.links.push({
					rel: 'info',
					type: 'application/json',
					href: `${titilerUrl}/info?url=${b64EncodedUrl}&assets=${assetsParams}`
				});
				feature.properties.links.push({
					rel: 'statistics',
					type: 'application/json',
					href: `${titilerUrl}/statistics?url=${b64EncodedUrl}&expression=${encodeURIComponent(
						StacProducts.find((prod) => prod.collection_id === collection_id).products.find(
							(p) => p.name.toLowerCase() === product_id
						).expression
					)}&asset_as_band=true&unscale=false&resampling=nearest&reproject=nearest&max_size=1024&categorical=false&histogram_bins=8`
				});
				feature.properties.links.push({
					rel: 'tilejson',
					type: 'application/json',
					href: `${titilerUrl}/WebMercatorQuad/tilejson.json?url=${encodeURIComponent(
						b64EncodedUrl
					)}&expression=${encodeURIComponent(
						StacProducts.find((prod) => prod.collection_id === collection_id).products.find(
							(p) => p.name.toLowerCase() === product_id
						).expression
					)}&scale=1&bidx=1&resampling=nearest&return_mask=true&asset_as_band=true`
				});
			} else {
				feature.properties.links.push({
					rel: 'info',
					type: 'application/json',
					href: `${titilerUrl}/info?url=${b64EncodedUrl}`
				});
				feature.properties.links.push({
					rel: 'statistics',
					type: 'application/json',
					href: `${titilerUrl}/statistics?url=${b64EncodedUrl}`
				});
				feature.properties.links.push({
					rel: 'tilejson',
					type: 'application/json',
					href: `${titilerUrl.replace('cog', 'mosaicjson')}/tilejson.json?url=${encodeURIComponent(
						feature.properties.url
					)}`
				});
			}
		}
	} else {
		if (feature.properties.url.split('?').length === 1) {
			const sasToken = generateAzureBlobSasToken(feature.properties.url);
			feature.properties.url = `${feature.properties.url}${sasToken}`;
		}
		const is_raster = feature.properties.is_raster;
		feature.properties.links.push({
			rel: 'download',
			type: is_raster ? 'image/tiff' : 'application/octet-stream',
			href: `${feature.properties.url.replace('pmtiles://', '')}`
		});

		feature.properties.links.push({
			rel: 'preview',
			type: 'image/webp',
			href: `${origin}/api/datasets/${feature.properties.id}/preview/auto/{width}x{height}.webp`
		});

		if (is_raster) {
			const b64EncodedUrl = getBase64EncodedUrl(feature.properties.url);
			feature.properties.links.push({
				rel: 'cog',
				type: 'application/json',
				href: `${titilerUrl}`
			});
			feature.properties.links.push({
				rel: 'info',
				type: 'application/json',
				href: `${titilerUrl}/info?url=${b64EncodedUrl}`
			});
			feature.properties.links.push({
				rel: 'statistics',
				type: 'application/json',
				href: `${titilerUrl}/statistics?url=${b64EncodedUrl}`
			});
			feature.properties.links.push({
				rel: 'tiles',
				type: 'image/png',
				href: `${titilerUrl}/tiles/WebMercatorQuad/{z}/{x}/{y}.png?url=${encodeURIComponent(
					b64EncodedUrl
				)}&scale=1&bidx=1&resampling=nearest&return_mask=true`
			});
			feature.properties.links.push({
				rel: 'tilejson',
				type: 'application/json',
				href: `${titilerUrl}/WebMercatorQuad/tilejson.json?url=${encodeURIComponent(
					b64EncodedUrl
				)}&scale=1&bidx=1&resampling=nearest&return_mask=true`
			});
		} else {
			let pbfUrl = feature.properties.url;
			if (!feature.properties.url.startsWith('pmtiles://')) {
				pbfUrl = pbfUrl.replace('/{z}/{x}/{y}', '/0/0/0');
			}
			feature.properties.links.push({
				rel: 'metadatajson',
				type: 'application/json',
				href: `${origin}/api/vector/azstorage/metadata.json?pbfpath=${encodeURIComponent(pbfUrl)}`
			});
		}
	}

	return feature.properties;
};
