import type { ClassificationMethodTypes } from '$lib/config/AppConfig';
import type { RasterLayerSpecification, SourceSpecification } from 'maplibre-gl';
import type { VectorLayerSpecification } from './VectorLayerSpecification';

export interface DatasetDefaultLayerStyle {
	dataset_id: string;
	layer_id: string;
	layer_type: 'raster' | 'fill' | 'line' | 'symbol' | 'circle' | 'heatmap';
	source: SourceSpecification;
	style: RasterLayerSpecification | VectorLayerSpecification;
	colormap_name?: string;
	classification_method?: ClassificationMethodTypes;
	created_user?: string;
	createdat?: string;
	updated_user?: string;
	updatedat?: string;
}
