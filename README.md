# Weaviate + Gemini vector search demo

## Run locally

1. Start a local Weaviate instance on ports `8080` (HTTP) and `50051` (gRPC).
2. Copy `.env.example` to `.env` and set `GEMINI_API_KEY`.
3. Install dependencies with `npm install`.
4. Add the sample documents and their Gemini embeddings to Weaviate with `npm run seed`.
5. Start the API with `npm run dev`.

Import `postman.json` into Postman. `POST /documents` accepts a `text` field and an optional `source`, embeds the text, and saves both with its vector in Weaviate. `POST /ask` embeds a question, searches the collection, and generates an answer grounded in the matching documents.

The demo expects Weaviate to be running without authentication. Its local host and ports can be changed in `.env`.
