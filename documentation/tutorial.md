The following tutorial is an accurate representation of the OpenSearch Flow OSD Plugin as of 12/30/2024, based on OSD 2.18.

Changelog:

- Initially created 11/18/2024
- Updated on 11/27/2024 after input/output transform design was overhauled. See PR #504

# Tutorial

For an overview of the plugin, please see [README](../README.md)

## 1. Provision ML resources

This plugin is not responsible for connector/model creation, this should be done separately. For several examples that cover a variety of vector search & RAG use cases, see the preset connector blueprints [here](https://opensearch.org/docs/latest/ml-commons-plugin/api/model-apis/register-model/#connector-model-interfaces). For more general information on the ML plugin, connectors, and models, see the [ML Commons plugin documentation](https://opensearch.org/docs/latest/ml-commons-plugin/). You should have deployed remote models with sufficient model interfaces available. These will be the models used for stitching together your ingest and search flows for different use cases.

## 2. Navigate to the plugin on OSD

The "OpenSearch Flow" plugin will be under "Search" in the side navigation on OSD. Click to enter the plugin home page.

![sidenav](./images/sidenav.png)

## 3. Select your use case

Start by selecting a preset template for your particular use case. If you want to first test out some basic use cases, you may choose one of the preset templates. You can fill out some initial information about your use case, such as the model, and some of the different input fields. It is all optional, but will help auto-populate some of the configuration if provided. If you anticipate a more advanced/custom use case, you can choose "Custom", which will provide a blank slate, letting you build out all of your configuration from scratch.

The below screenshots will illustrate a basic semantic search use case starting from scratch.

![presets-page](./images/presets-page.png)

## 4. Get familiar with the Workflow Details page

After selecting, you will enter the Workflow Details page. This page is broken down into 3 main sections:

1. The form. This is where you will spend most of your time, configuring your ingest and search pipelines. It is split into 2 main steps - first configuring your ingest flow, and secondly, configuring your search flow. We will go into more detail on these later.

![form](./images/form.png)

2. The preview workspace. This is a read-only workspace, provided as a visual helper to see how your data flows & is transformed across ingest & search. You can toggle to the JSON view to get more details on the underlying resource configurations as you build your flows out.

![workspace](./images/workspace.png)

3. The inspector. You can think of this similar to an IDE - it provides different information as you build out your flows, including the responses after running ingest / search, any errors seen while testing, and the list of underlying created resources for this particular workflow.

![inspector](./images/inspector.png)

4. Header buttons

These allow you to undo current changes, save your current form, export your workflow, or exit and return to the homepage. NOTE: depending on the OSD configuration `useNewHomePage` feature flag), these buttons may look different.

![buttons](./images/buttons.png)

## 5. Provide some sample data

Now we can begin building the use case! Let's start by providing some sample data. The data should be in a JSON array format. 3 options are provided for your convenience: manual input, importing from a file, or taking some sample data from an existing index. _Note if you already have sample data and are only interested in adding search functionality, you can skip this step entirely by un-checking the "Enabled" checkbox. This will let you navigate directly to the search flow_.

For this example, we will manually input some sample data containing various clothing items.

![import-data](./images/import-data.png)

![import-data-populated](./images/import-data-populated.png)

## 6. Enrich your data

You can now enrich your data by building out an ingest pipeline & chaining together different ingest processors. The current list of supported processors is visible in the dropdown when clicking "Add processor".

![enrich-data](./images/enrich-data.png)

Continuing with the semantic search example, you can now select and configure an ML inference processor to embed the input text. This cluster has a deployed Amazon Bedrock Titan text embedding model. The model has a defined interface, and expects a single input called `inputText`, and returns a single output called `embedding`.

This is where you can now map data to and from the model inputs and outputs, respectively. "Inputs" allows selecting and transforming the data to conform to the expected model inputs. "Outputs" allows selecting and transforming the model outputs to new fields. There are different types of transformations you can do, including field-level mapping (extracting out a document field value), expressions (more complex transformations using [JSONPath](https://en.wikipedia.org/wiki/JSONPath)), and others. For this example, you can just select the `item_text` field to map to the `inputText` model input, and map the output `embedding` field to a new document field called `my_embedding`. _(Behind the scenes, this is configuring the "input_map" and "output_map" configuration settings for [ML inference ingest processors](https://opensearch.org/docs/latest/ingest-pipelines/processors/ml-inference/))_

![ml-config-ingest](./images/ml-config-ingest.png)

Click "Save" to return to the form.

### Aside: advanced data transformations

Continuing with the above example, let's suppose the input data (the document) is more complex, and a simple field-level mapping is not sufficient. Maybe you need to parse out some nested field's value. This can be done by changing the transformation type to `Expression`

![expression-ingest](./images/expression-ingest.png)

From there, click "Configure" to open the "Configure JSONPath expression" modal. On the right-hand side, you can click "Run preview" to fetch the input data to this processor.

![expression-modal-ingest](./images/expression-modal-ingest.png)

On the left-hand side, you can define a [JSONPath](https://en.wikipedia.org/wiki/JSONPath) transform to parse out the data you want. Suppose it is the description, "red shoes". You can write some JSONPath to pull out this data - `$.item.description`. The transformed value will appear under the "Extracted data" box in the lower-right-hand corner as you define your JSONPath. For models with defined [JSON Schema](https://json-schema.org/) interfaces, you will see a marker indicating whether the transform is valid or invalid for that particular model field (in this case, `inputText`):

![expression-modal-ingest-validated](./images/expression-modal-ingest-validated.png)

## 7. Ingest data

Ensure your index configurations are up-to-date, and optionally enter an index name. For vector search use cases like in this example, ensure any vector fields are mapped as such, and with appropriate vector dimensions. Additionally, the index settings should ensure this is labeled as a knn index. Note that for preset use cases (non-"Custom" use cases), many of this will be automatically populated for your convenience.

![index-settings-updated](./images/index-settings-updated.png)

After configuring, click "Build and run ingestion". This will build out your index, ingest pipeline, and finally bulk ingest your sample documents. The OpenSearch response will be visible under the Inspector panel, as well as any errors if they should occur.

![build-and-run-ingestion-response](./images/build-and-run-ingestion-response.png)

You have now completed your ingest flow! Let's move on to configuring search by clicking the "Search pipeline >" button.

## 8. Configure query

The query is the starting point for your search flow. Note the index is already set to the one you've configured from the ingest flow _(NOTE: if you skipped ingest, a dropdown will be available to select from an existing index)_. You can select from some preset options as a starting point, and fully configure your query. Continuing with this semantic search example, we will follow this standard vector search pattern:

1. Provide a query containing the data you need to generate embeddings for

2. (Step 9 - see below) Configure an ML inference processor to parse the input data, generate vector embedding(s), and create a knn query using the generated vector(s)

So, we will provide a basic term query with the input data to be vectorized here:

![edit-query-term](./images/edit-query-term.png)

## 9. Enrich query request

Similar to Step 6 - Enrich data, this allows you to enrich the query request by configuring a series of processors - in this case, [search request processors](https://opensearch.org/docs/latest/search-plugins/search-pipelines/search-processors/#search-request-processors). Currently, only the ML inference processor is supported. Continuing with the semantic search example, we will configure an ML processor using the same Titan text embedding model. First, configure the input and output mappings to generate the vector, similar to what was done on the ingest side. Specifically, here we select the query value containing the text we want to embed, "shoes". And, we map the embedding to some field called "vector".

![enrich-query-request](./images/enrich-query-request.png)

Next, we need to update our query to use this generated vector embedding. Click "Override query" to open the modal. We can select a knn query preset to start.

![override-query-with-placeholders](./images/override-query-with-placeholders.png)

From there, populate any placeholder values, such as "${vector_field}" with the associated vector field you have in your index. In this case, "my_embedding" that we configured on ingest. To use the produced vector in the model output, we can see the list of available model outputs under "Model outputs". There is a utility copy button on the right-hand side to copy the template variable. Inject/paste this variable anywhere in the query to dynamically inject it into the query at runtime. In this example, it has already populated "${vector}" as the "vector" value for the knn query, so there is nothing left to do. The final query should have no placeholders, besides any model output dynamic variables that will be populated at runtime.

![override-query](./images/override-query.png)

## 10. Enrich query results

Similar to Step 9 - Enrich query request, we can configure a series of [search response processors](https://opensearch.org/docs/latest/search-plugins/search-pipelines/search-processors/#search-response-processors) to enrich/transform the returned matching documents. For this particular example, this is not needed. _For more examples using search response processors, see "More examples" below, including RAG & reranking use cases which involve processing & manipulating the search response._

![enrich-query-results](./images/enrich-query-results.png)

## 11. Execute search

We are finished configuring! Now click "Build and run query" to build out the search pipeline and execute the search request against the index. The final results will pop up in the "Inspector" panel. For this example, we see the top results pertaining to shoes.

![search-response](./images/search-response.png)

## 12. Export workflow

If you are satisfied with the final workflow and the results it is producing, you can click the "Export" button in the header. This will open a modal, showing you the end-to-end [workflow template](https://opensearch.org/docs/latest/automating-configurations/workflow-templates/) containing all of the configuration details for your index, ingest pipeline, and search pipeline, as well as associated UI metadata (for example, certain things like the search request are not concrete resources - we persist them here for ease-of-use if importing this template on the UI). It can be copied in JSON or YAML format. Note: any cluster-specific IDs, such as model IDs, will need to be updated, if importing into a different cluster.

![export-modal](./images/export-modal.png)

And that's it! If you have followed all of these steps, you now have a successful semantic search use case, with all of the required resources bundled up into a single template. You can import this template on the UI and rebuild for different clusters, or execute directly using the [Flow Framework Provision API](https://opensearch.org/docs/latest/automating-configurations/api/provision-workflow/).

# More examples

## 1. Semantic search

### ML resources

Create and deploy a [Bedrock Titan Text Embedding model](https://github.com/opensearch-project/dashboards-flow-framework/blob/main/documentation/models.md#amazon-bedrock-titan-text-embedding).

### Index

Ensure the index settings include `index.knn: true`, & mappings have a `knn_vector` field - something like the following:

```
"<embedding_field_name>": {
    "type": "knn_vector",
    "dimension": <embedding_size>
}
```

### Ingest pipeline

Single ML inference processor. Map your input text to the `inputText` model input field. Optionally map the output `embedding` to a new document field.

### Search pipeline

Single ML inference **search request** processor. Map the query field containing the input text to the `inputText` model input field. Optionally map the output `embedding` to a new field. Override the query to a knn query. For example:

```
{
    "_source": {
        "excludes": [
            "<embedding_field>"
        ]
    },
    "query": {
        "knn": {
            "<embedding_field>": {
                "vector": ${embedding},
                "k": 10
            }
        }
    }
}
```

---

## 2. Hybrid search (BM25 + k-NN)

### ML resources

Create and deploy a [Bedrock Titan Text Embedding model](https://github.com/opensearch-project/dashboards-flow-framework/blob/main/documentation/models.md#amazon-bedrock-titan-text-embedding).

### Index

Ensure the index settings include `index.knn: true`, & mappings have a `knn_vector` field - something like the following:

```
"<embedding_field_name>": {
    "type": "knn_vector",
    "dimension": <embedding_size>
}
```

### Ingest pipeline

Single ML inference processor. Map your input text to the `inputText` model input field. Optionally map the output `embedding` to a new document field.

### Search pipeline

An ML inference **search request** processor & normalization processor.

**For the ML inference processor:**

Map the query field containing the input text to the `inputText` model input field. Optionally map the output `embedding` to a new field. Override the query to a hybrid query. See example below. Ensure to set the `embedding_field`, `text_field`, & `text_field_input`:

```
{
    "_source": {
        "excludes": [
            "<embedding_field>"
        ]
    },
    "query": {
        "hybrid": {
            "queries": [
                {
                    "match": {
                        "<text_field>": {
                            "query": "<text_field_input>"
                        }
                    }
                },
                {
                    "knn": {
                        "<embedding_field>": {
                            "vector": ${embedding},
                            "k": 10
                        }
                    }
                }
            ]
        }
    }
}
```

**For the normalization processor:**

Configure weights for each sub-query. You may refer to the [hybrid search normalization processor example](https://opensearch.org/docs/latest/search-plugins/hybrid-search/#step-4-configure-a-search-pipeline) for reference.

---

## 3. Basic RAG (document summarization)

NOTE: the below connector blueprint & model interface may change over time. The following example uses a connector blueprint that abstracts a lot of the complexity around the [Claude v1 messages API](https://docs.anthropic.com/en/api/getting-started#examples), exposing only a single `prompt` field as input in the model. An example input may look like the following, with placeholders containing dynamically-fetched results:

```
{
  "prompt": "Human: You are a professional data analyst. You are given a list of document results. You will analyze the data and generate a human-readable summary of the results. If you don't know the answer, just say I don't know.\n\n Results: ${parameters.results.toString()}\n\n Human: Please summarize the results.\n\n Assistant:"
}
```

### ML resources

Create and deploy a [Claude 3 Sonnet model](https://github.com/opensearch-project/dashboards-flow-framework/blob/main/documentation/models.md#claude-3-sonnet-hosted-on-amazon-bedrock).

### Index

Nothing special needs to be configured.

### Ingest pipeline

Nothing special needs to be configured.

### Search pipeline

Single ML inference **search response** processor. Choose `Template` as the transformation type for the `prompt` input field. Open up the template configuration by clicking "Configure". Select a preset to start with for your convenience. Then, create an input variable that parses out the list of reviews, something like `review`. Inject the variable into the prompt by copying and pasting it. Click "Run preview" to test that the final transformed prompt with sample dynamic data looks as expected. Click "Save" to save and exit.

---

## 4. Multimodal search (text & image)

### ML resources

Create and deploy an [Amazon Titan Multimodal Embedding model](https://github.com/opensearch-project/dashboards-flow-framework/blob/main/documentation/models.md#amazon-bedrock-titan-multimodal-embedding).

### Index

Ensure the index settings include `index.knn: true`, & mappings have a `binary` field and `knn_vector` field to persist the image binaries and generated image embeddings, respectively. For example:

```
"image_base64": {
    "type": "binary"
},
"image_embedding": {
    "type": "knn_vector",
    "dimension": <dimension>
},
```

### Ingest pipeline

Single ML inference processor. Map your input text field and input image field to the `inputText` and `inputImage` model input fields, respectively. This is assuming both inputs are desired to generate a single embedding; alternatively, only one input (text or image) is technically required.

Optionally map the output `embedding` to a new document field.

### Search pipeline

Single ML inference **search request** processor. Map the input text field and input image field in the query, to the `inputText`and `inputImage` model input fields, respectively (again, assuming both inputs are desired, while only one or the other is required).

Override the query to a knn query, including the embedding output. For example:

```
{
    "_source": {
        "excludes": [
            "<embedding_field>"
        ]
    },
    "query": {
        "knn": {
            "<embedding_field>": {
                "vector": ${embedding},
                "k": 10
            }
        }
    }
}
```

---

## 5. Named entity recognition (NER)

### ML resources

Create and deploy an [Amazon Comprehend Entity Detection model](https://github.com/opensearch-project/dashboards-flow-framework/blob/main/documentation/models.md#amazon-comprehend---entity-detection).

### Index

Nothing special needs to be configured.

### Ingest pipeline

Single ML inference processor. Map your input text field to the `text` model input fields. Suppose you want to persist any found entities with each document. In this case, you can transform the output (an array of Entities), and persist them under an `entities_found` field. You may use the following output_map configuration as a reference.

```
"output_map": [
            {
              "entities_found": "$.response.Entities[*].Type"
            }
],
```

### Search pipeline

Nothing special needs to be configured.

---

## 6. Language detection / classification

### ML resources

Create and deploy an [Amazon Comprehend Language Detection model](https://github.com/opensearch-project/dashboards-flow-framework/blob/main/documentation/models.md#amazon-comprehend---language-detection).

### Index

Nothing special needs to be configured.

### Ingest pipeline

Single ML inference processor. Map your input text field to the `text` model input fields. Suppose you want to persist the most relevant / most likely language for each document. In this case, you can transform the output (an array of Languages), and persist them under a `detected_dominant_language` field. You may use the following output_map configuration as a reference.

```
"output_map": [
    {
              "detected_dominant_language": "response.Languages[0].LanguageCode"
    }
],
```

### Search pipeline

Nothing special needs to be configured.

---

## 7. Reranking results

Reranking can be achieved in many different ways. Typically, the models will take in at least 2 inputs; one with the original query/input, and one with the data to assign a relevance score to. Some models support batching, and take in a set of results to assign scores to, and return the reranked set of results in one inference call. When implementing in OpenSearch to rerank search results, this gives us 2 common patterns:

1. Batching enabled: collect all results => pass to single ML processor with batched results => return top n ranked results

2. Batching disabled: collect all results => { for each result: pass to ML processor and get a new relevancy score } => pass all results with newly-assigned relevancy scores to the rerank processor to handle re-sorting results => return top n ranked results.

To highlight the rerank processor, the below example follows Pattern 2 (batching disabled). _Note the model used (Cohere Rerank) DOES support batching if you want to follow Pattern 1 using this model._

### ML resources

Create and deploy a [Cohere Rerank model](https://github.com/opensearch-project/dashboards-flow-framework/blob/main/documentation/models.md#cohere-rerank).

### Index

Nothing special needs to be configured.

### Ingest pipeline

Nothing special needs to be configured.

### Search pipeline

ML inference **search response** processor, followed by a rerank **search response** processor. As described by Pattern 2, we will use the ML processor for processing the returned results and generating new scores, and then using the reranker to rerank the results based on these new scores.

ML processor config: map the document field containing the data you want to use for comparison, and map to the model's `documents` field. Map the original query that you want to use for comparison, and map to the model's `query` field. _Note: for accessing the query JSON, use JSONPath, and prefix with `_request.query`. The UI will be iteratively improved to make this more intuitive_. The final input map should look something like this:

```
"input_map": [
   {
      "documents": "description",
      "query": "$._request.query.term.value"
   }
],
```

Optionally store the rescored result in the model output under a new field. You can even parse out the score, and only persist that. For example:

```
"input_map": [
   {
      "new_score": "results[0].relevance_score"
   }
],
```

Rerank processor config: under target_field, select the model score field - continuing with this example, we set it to `new_score`.

---

## 8. Multimodal search (text or image) with custom CLIP model

The following example uses a custom CLIP model hosted on Sagemaker, that dynamically takes in text OR image URLs as input, and returns a vector embedding.

### ML resources

Create and deploy a [Custom CLIP Multimodal model](https://github.com/opensearch-project/dashboards-flow-framework/blob/main/documentation/models.md#custom-clip-multimodal-embedding).

### Index

Ensure the index settings include `index.knn: true`, & mappings have a `knn_vector` field - something like the following:

```
"<embedding_field_name>": {
    "type": "knn_vector",
    "dimension": <embedding_size>
}
```

### Ingest pipeline

Single ML inference processor. Map your image field to the `image_url` model input field, OR, your text field to the `text` model input field. This depends on what type of data you are ingesting/persisting in your index. _For example, if building an application that returns relevant images based on text or image input, you would likely persist images, and as such, should map to the `image_url` field accordingly_.

### Search pipeline

Single ML inference **search request** processor. Map the input image field OR the input text field in the query, to the `image_url` OR `text` model input fields, respectively. The CLIP model flexibly handles one or the other, so it just depends on the application your are trying to build, and what the expected initial user query looks like.

Override the query to a knn query, including the embedding output. For example:

```
{
    "_source": {
        "excludes": [
            "<embedding_field>"
        ]
    },
    "query": {
        "knn": {
            "<embedding_field>": {
                "vector": ${embedding},
                "k": 10
            }
        }
    }
}
```

---

## 9. Neural sparse search

### ML resources
Create and deploy a [Neural Sparse Encoding model](https://github.com/opensearch-project/dashboards-flow-framework/blob/main/documentation/models.md#neural-sparse-encoding).

### Index

Ensure the index mappings have a `rank_features` field - something like the following:

```
"<embedding_field_name>": {
    "type": "rank_features"
}
```

### Ingest pipeline

Single ML inference processor. Map your input text to the `text_doc` model input field. Optionally map the output `response` to a new document field. Transform the response if needed using JSONPath expression. 


### Search pipeline

Single ML inference **search request** processor. Map the query field containing the input text to the `text_doc` model input field. Optionally map the output `response` to a new field. Transform the response if needed using JSONPath expression. Override the query to a neural sparse query. For example:

```
{
    "_source": {
        "excludes": [
            "<embedding_field>"
        ]
    },
    "query": {
        "neural_sparse": {
            "<embedding_field>": {
                "query_tokens": ${response},
            }
        }
    }
}
```
