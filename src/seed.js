import { embed } from './gemini.js';
import { COLLECTION_NAME, connectToWeaviate } from './weaviate.js';

const seedDocuments = [
  {
    source: 'Weaviate overview',
    text: 'Weaviate is a vector database that stores objects and their vector embeddings. Vector search finds objects with embeddings that are similar to a query embedding.',
  },
  {
    source: 'Gemini embeddings',
    text: 'Gemini embedding models convert text into numerical vectors. Texts with related meaning are represented by vectors that are close together in the embedding space.',
  },
  {
    source: 'Retrieval augmented generation',
    text: 'A RAG application embeds a user question, retrieves relevant documents from a vector database, and provides those documents as context to a language model to generate a grounded answer.',
  },
  {
    source: 'Semantic search',
    text: 'Semantic search uses the meaning of a query rather than exact keyword matches. For example, a search for a car repair may also find a document about fixing an automobile.',
  },
];

const client = await connectToWeaviate();

try {
  const collection = client.collections.use(COLLECTION_NAME);

  for (const document of seedDocuments) {
    const vector = await embed(document.text, 'RETRIEVAL_DOCUMENT');
    await collection.data.insert({
      properties: document,
      vectors: vector,
    });
    console.log(`Seeded: ${document.source}`);
  }
} finally {
  await client.close();
}
