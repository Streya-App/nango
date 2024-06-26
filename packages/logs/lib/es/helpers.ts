import { logger } from '../utils.js';
import { client } from './client.js';
import { indices } from './schema.js';

export async function start() {
    logger.info('🔄 Elasticsearch service starting...');

    await migrateMapping();

    logger.info('✅ Elasticsearch');
}

export async function migrateMapping() {
    try {
        await Promise.all(
            indices.map(async (index) => {
                const exists = await client.indices.exists({ index: index.index });
                if (!exists) {
                    await client.indices.create({ index: index.index });
                }

                return await client.indices.putMapping({ index: index.index, ...index.mappings }, { ignore: [404] });
            })
        );
    } catch (err) {
        logger.error(err);
        throw new Error('failed_to_init_elasticsearch');
    }
}

export async function deleteIndex() {
    try {
        await Promise.all(
            indices.map(async (index) => {
                await client.indices.delete({
                    index: index.index,
                    ignore_unavailable: true
                });
            })
        );
    } catch (err) {
        logger.error(err);
        throw new Error('failed_to_deleteIndex');
    }
}
