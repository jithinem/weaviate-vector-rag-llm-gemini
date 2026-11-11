import 'dotenv/config';

export const config = {
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
  geminiEmbeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001',
  geminiEmbeddingDimensions: Number(process.env.GEMINI_EMBEDDING_DIMENSIONS || 768),
  weaviateHost: process.env.WEAVIATE_HOST || 'localhost',
  weaviateHttpPort: Number(process.env.WEAVIATE_HTTP_PORT || 8080),
  weaviateGrpcPort: Number(process.env.WEAVIATE_GRPC_PORT || 50051),
};

export function requireGeminiApiKey() {
  if (!config.geminiApiKey) {
    throw new Error('GEMINI_API_KEY is missing. Add it to your .env file.');
  }
}
