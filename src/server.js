import axios from 'axios';
import express from 'express';
import morgan from 'morgan';
import { config } from './config.js';
import { embed, generateAnswer } from './gemini.js';
import { COLLECTION_NAME, connectToWeaviate } from './weaviate.js';

const app = express();
const port = Number(process.env.PORT || 3000);
const weaviateReadyUrl = `http://${config.weaviateHost}:${config.weaviateHttpPort}/v1/.well-known/ready`;

app.use(express.json());
app.use(morgan('dev'));

app.get('/health', async (_req, res, next) => {
  try {
    await axios.get(weaviateReadyUrl, { timeout: 3000 });
    res.json({ status: 'ok', weaviate: 'ready' });
  } catch (error) {
    next(error);
  }
});

app.post('/documents', async (req, res, next) => {
  try {
    const { text, source = 'API' } = req.body ?? {};
    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Provide non-empty document text.' });
    }
    if (typeof source !== 'string' || !source.trim()) {
      return res.status(400).json({ error: 'Source must be a non-empty string.' });
    }

    const document = { text: text.trim(), source: source.trim() };
    const vector = await embed(document.text, 'RETRIEVAL_DOCUMENT');
    const collection = app.locals.weaviate.collections.use(COLLECTION_NAME);
    const id = await collection.data.insert({
      properties: document,
      vectors: vector,
    });

    res.status(201).json({ id, ...document });
  } catch (error) {
    next(error);
  }
});

app.post('/ask', async (req, res, next) => {
  try {
    const question = req.body?.question;
    if (typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'Provide a non-empty question.' });
    }

    const vector = await embed(question.trim(), 'RETRIEVAL_QUERY');
    const collection = app.locals.weaviate.collections.use(COLLECTION_NAME);
    const searchResult = await collection.query.nearVector(vector, {
      limit: 3,
      returnProperties: ['text', 'source'],
    });
    const documents = searchResult.objects.map(({ properties }) => ({
      text: properties.text,
      source: properties.source,
    }));

    if (!documents.length) {
      return res.json({ question, answer: 'I could not find relevant documents.', sources: [] });
    }

    const answer = await generateAnswer(question.trim(), documents);
    res.json({ question, answer, sources: documents.map(({ source }) => source) });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'The request could not be completed.' });
});

const client = await connectToWeaviate();
app.locals.weaviate = client;

const server = app.listen(port, () => {
  console.log(`Weaviate + Gemini demo listening at http://localhost:${port}`);
});

function shutdown() {
  server.close(async () => {
    await client.close();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
