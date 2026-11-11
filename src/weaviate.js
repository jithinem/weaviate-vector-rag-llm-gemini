import weaviate from 'weaviate-client';
import { config } from './config.js';

export const COLLECTION_NAME = 'DemoDocument';

export async function connectToWeaviate() {
  const client = await weaviate.connectToLocal({
    host: config.weaviateHost,
    port: config.weaviateHttpPort,
    grpcPort: config.weaviateGrpcPort,
  });

  const exists = await client.collections.exists(COLLECTION_NAME);
  if (!exists) {
    await client.collections.create({
      name: COLLECTION_NAME,
      properties: [
        { name: 'text', dataType: 'text' },
        { name: 'source', dataType: 'text' },
      ],
      vectorizers: weaviate.configure.vectors.selfProvided(),
    });
  }

  return client;
}
