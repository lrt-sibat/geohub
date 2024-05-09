<script lang="ts">
	import { onMount } from 'svelte';
	import { loadAdmin, reloadAdmin } from '../utils/adminLayer';

	let expression;
	let showLegend = true;
	const maxValue = 1;
	const defaultColor = 'hsla(0, 0%, 100%, 0)';
	const colorGrid = [
		['#F3618C', '#CE5495', '#A9469E', '#8339A6', '#5E2BAF'],
		['#F689A9', '#B679A9', '#916CB2', '#6C5EBB', '#4750C3'],
		['#F9B0C6', '#B9A1C6', '#7A91C6', '#5583CE', '#2F76D7'],
		['#FCD8E2', '#BDC8E3', '#7DB8E2', '#3DA8E2', '#189BEB'],
		['#FFFFFF', '#BFEFFF', '#80E0FF', '#40D0FF', '#00C0FF']
	];
	let propertyA = `hrea_2020`;
	let propertyB = `hrea_2012`;
	let selectedRow = null,
		selectedCol = null;

	const updateColorExpression = (propertyA, propertyB, selectedRow, selectedCol) => {
		let expression;
		expression = ['step', ['get', propertyA]];
		for (let row = 0; row < colorGrid.length; row++) {
			if (row !== 0 && row !== colorGrid.length) {
				expression.push((row / colorGrid.length) * maxValue);
			}

			let subexpression;
			subexpression = ['step', ['get', propertyB]];
			for (let col = 0; col < colorGrid[row].length; col++) {
				if (col !== 0 && col !== colorGrid[row].length) {
					subexpression.push((col / colorGrid[row].length) * maxValue);
				}

				if (
					(selectedRow === null && selectedCol === null) ||
					(selectedRow === colorGrid.length - 1 - row && selectedCol === col)
				) {
					subexpression.push(colorGrid[colorGrid.length - 1 - row][col]);
				} else {
					subexpression.push(defaultColor);
				}
			}
			expression.push(subexpression);
		}

		reloadAdmin({
			loadAdminLabels: true,
			newColorExpression: [
				'case',
				['any', ['==', ['get', propertyA], null], ['==', ['get', propertyB], null]],
				defaultColor,
				expression
			]
		});
		return expression;
	};

	$: expression = updateColorExpression(propertyA, propertyB, selectedRow, selectedCol);

	const gridSelectHandler = (rowIndex, colIndex) => {
		if (selectedRow === rowIndex && selectedCol === colIndex) {
			selectedRow = null;
			selectedCol = null;
		} else {
			selectedRow = rowIndex;
			selectedCol = colIndex;
		}
	};

	onMount(() => {
		loadAdmin(true);
		reloadAdmin({
			loadAdminLabels: true,
			newColorExpression: [
				'case',
				['any', ['==', ['get', propertyA], null], ['==', ['get', propertyB], null]],
				'hsla(0, 0%, 100%, 0)',
				expression
			]
		});
	});
</script>

<div class="a-legend__wrapper has-background-white p-4">
	<button
		class="a-reset a-legend__button is-flex is-justify-content-space-between {showLegend
			? 'mb-4 clicked'
			: ''}"
		type="button"
		on:click={() => (showLegend = !showLegend)}>Legend</button
	>

	{#if showLegend}
		<div>
			<div class="is-flex is-flex-wrap-wrap is-justify-content-space-between mb-2">
				<div class="is-size-7"><strong>Wealth</strong> <br /> 100%</div>
				<div class="a-legend__container is-flex is-flex-wrap-wrap">
					{#each colorGrid as row, rowIndex}
						{#each row as color, colIndex}
							<button
								class="a-legend__item"
								class:selected={selectedRow === rowIndex && selectedCol === colIndex}
								style="background-color: {color}; {color === '#FFFFFF' &&
									'border: 1px solid #d4d6d8;'} "
								on:click={() => gridSelectHandler(rowIndex, colIndex)}
							></button>
						{/each}
					{/each}
				</div>
			</div>

			<div class="is-flex is-flex-wrap-wrap is-justify-content-space-between">
				<div></div>
				<div class="a-legend__container is-justify-content-space-between is-flex is-flex-wrap-wrap">
					<p class="is-size-7">
						0%
						<br />
						<strong>Energy access</strong>
					</p>
					<p class="is-size-7">100%</p>
				</div>
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	.a {
		&-reset {
			all: unset;
		}

		&-legend {
			&__wrapper {
				width: 300px;
				top: 165px;
				left: 367px;
			}

			&__container {
				width: calc(100% - 65px);
			}

			&__item {
				width: 39px;
				height: 39px;
				margin: 0.5px;
				background-color: #f9f9f9;
				border: 1px solid #f9f9f9;
				cursor: pointer;

				&:hover {
					border-width: 2px;
					border-color: #edeff0;
				}

				&.selected {
					border-width: 2px;
					border-color: #232e3d;
				}
			}

			&__button {
				width: 100%;
				cursor: pointer;

				&:after {
					content: '\f077';
					font-family: 'Font Awesome 5 Free';
					font-weight: 900;
				}

				&.clicked:after {
					content: '\f078';
					font-family: 'Font Awesome 5 Free';
					font-weight: 900;
				}
			}
		}
	}
</style>
