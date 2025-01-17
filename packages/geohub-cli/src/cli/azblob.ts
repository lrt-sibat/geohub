import { Command } from 'commander';
import { BlobServiceAccountManager, DatabaseManager, Datasets } from '../util';
import fs from 'fs';
import path from 'path';
import type { Storage } from '../interfaces';

const program = new Command();
program
	.name('azblob')
	.description('scan azure blob containers to register metadata into PostgreSQL database.')
	.requiredOption('-d, --database <dsn>', 'PostgreSQL database connection string')
	.requiredOption('-a, --azaccount <azure_storage_account>', 'Azure Storage Account')
	.requiredOption('-k, --azaccountkey <azure_storage_access_key>', 'Azure Storage Access Key')
	.option(
		'-n, --name [container_name...]',
		'Targeted Azure Blob Container name to scan. It will scan all containers if it is not specified.'
	)
	.option(
		'-f, --file [file_name]',
		'Targeted Azure Blob file name to scan. if this parameter is used container_name parameter will be ignored.'
	)
	.option('-o, --output [output]', 'Output directory for temporary working folder', 'tmp')
	.option(
		'-t, --titiler-url [titiler-url]',
		'base URL for titiler',
		'https://titiler.undpgeohub.org'
	)
	.action(async () => {
		console.time('azblob');
		const options = program.opts();
		const database: string = options.database;
		const azaccount: string = options.azaccount;
		const azaccountkey: string = options.azaccountkey;
		const containerNames: string[] = options.name;
		const file: string = options.file;
		const outputDir: string = path.resolve(options.output);
		const titilerUrl: string = options.titilerUrl;
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir);
		}

		const blobManager = new BlobServiceAccountManager(azaccount, azaccountkey, titilerUrl);

		if (file) {
			// scan file to register
			const dbManager = new DatabaseManager(database);

			const res = await blobManager.scanBlob(file);
			if (!res.dataset) {
				await dbManager.deleteDataset(file);
				throw new Error(
					`The blob of '${file}' does not exist and it was deleted from the database.`
				);
			}
			const datasets = new Datasets([res.dataset], outputDir);
			await dbManager.register(datasets);
		} else {
			// scan containers
			let storages: Storage[];
			if (containerNames) {
				const promises = containerNames.map((name) => blobManager.listContainers(name));
				console.debug(`loaded ${promises.length} containers.`);
				const storagesList = await Promise.all(promises);
				storages = storagesList.flat();
			} else {
				storages = await blobManager.listContainers();
			}

			console.debug(`generated ${storages.length} container objects`);
			const _datasets = await blobManager.scanContainers(storages);
			const datasets = new Datasets(_datasets, outputDir);
			console.debug(`generated ${datasets.getDatasets().length} dataset objects`);

			const dbManager = new DatabaseManager(database);
			await dbManager.registerAll(datasets);
		}

		console.timeEnd('azblob');
	});

export default program;
