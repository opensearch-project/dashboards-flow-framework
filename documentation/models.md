## Overview

Leveraging models with sufficient model interfaces significantly reduces the amount of user input required when building and testing use cases integrated with ML processors. A list of suggested models with full model interfaces are provided below.

Some helpful links for more information:

- [ML commons remote models](https://opensearch.org/docs/latest/ml-commons-plugin/remote-models/index/)
- [Amazon Bedrock Titan Models](https://docs.aws.amazon.com/bedrock/latest/userguide/titan-models.html)
- [Amazon Comprehend](https://aws.amazon.com/comprehend/)
- [Cohere Rerank](https://cohere.com/rerank)

## Embedding models

### Amazon Bedrock Titan Text Embedding

Connector:

```
POST /_plugins/_ml/connectors/_create
{
    "name": "Amazon Bedrock - Titan Text Embedding",
    "description": "Connector for Amazon Bedrock - Titan Text Embedding",
    "version": 1,
    "protocol": "aws_sigv4",
    "credential": {
        "access_key": "",
        "secret_key": "",
        "session_token": ""
    },
    "parameters": {
        "region": "<region>",
        "service_name": "bedrock",
        "model": "amazon.titan-embed-text-v1"
    },
    "actions": [
        {
            "action_type": "predict",
            "method": "POST",
            "url": "https://bedrock-runtime.${parameters.region}.amazonaws.com/model/${parameters.model}/invoke",
            "headers": {
                "content-type": "application/json",
                "x-amz-content-sha256": "required"
            },
            "request_body": "{ \"inputText\": \"${parameters.inputText}\" }"
        }
    ]
}
```

Model:

```
POST /_plugins/_ml/models/_register
{
    "name": "Amazon Bedrock - Titan Text Embedding",
    "version": "1.0.1",
    "function_name": "remote",
    "description": "",
    "connector_id": "<connector-id>",
    "interface": {
        "input": {
            "type": "object",
            "properties": {
                "parameters": {
                    "type": "object",
                    "properties": {
                        "inputText": {
                            "type": "string"
                        }
                    },
                    "additionalProperties": true,
                    "required": [
                        "inputText"
                    ]
                }
            }
        },
        "output": {
            "type": "object",
            "properties": {
                "inference_results": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "output": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "name": {
                                            "type": "string"
                                        },
                                        "dataAsMap": {
                                            "type": "object",
                                            "properties": {
                                                "embedding": {
                                                    "type": "array"
                                                }
                                            },
                                            "required": [
                                                "embedding"
                                            ]
                                        }
                                    },
                                    "required": [
                                        "name",
                                        "dataAsMap"
                                    ]
                                }
                            },
                            "status_code": {
                                "type": "integer"
                            }
                        },
                        "required": [
                            "output",
                            "status_code"
                        ]
                    }
                }
            },
            "required": [
                "inference_results"
            ]
        }
    }
}
```

### Amazon Bedrock Titan Multimodal Embedding

Connector:

```
POST /_plugins/_ml/connectors/_create
{
    "name": "Amazon Bedrock - Titan Multimodal Embedding",
    "description": "Connector for Amazon Bedrock - Titan Multimodal Embedding",
    "version": 1,
    "protocol": "aws_sigv4",
    "parameters": {
        "region": "<region>",
        "service_name": "bedrock",
        "model": "amazon.titan-embed-image-v1",
        "input_docs_processed_step_size": 2
    },
    "credential": {
        "access_key": "",
        "secret_key": "",
        "session_token": ""
    },
    "actions": [
        {
            "action_type": "predict",
            "method": "POST",
            "url": "https://bedrock-runtime.${parameters.region}.amazonaws.com/model/${parameters.model}/invoke",
            "headers": {
                "content-type": "application/json",
                "x-amz-content-sha256": "required"
            },
            "request_body": "{\"inputText\": \"${parameters.inputText:-null}\", \"inputImage\": \"${parameters.inputImage:-null}\"}"
        }
    ]
}
```

Model:

```
POST /_plugins/_ml/models/_register
{
    "name": "Amazon Bedrock - Titan Multimodal Embedding",
    "version": "1.0.1",
    "function_name": "remote",
    "description": "",
    "connector_id": "<connector_id>",
    "interface": {
        "input": {
            "type": "object",
            "properties": {
                "parameters": {
                    "type": "object",
                    "properties": {
                        "inputImage": {
                            "type": "string"
                        },
                        "inputText": {
                            "type": "string"
                        }
                    },
                    "additionalProperties": true,
                    "required": []
                }
            }
        },
        "output": {
            "type": "object",
            "properties": {
                "inference_results": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "output": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "name": {
                                            "type": "string"
                                        },
                                        "dataAsMap": {
                                            "type": "object",
                                            "properties": {
                                                "embedding": {
                                                    "type": "array"
                                                }
                                            },
                                            "required": [
                                                "embedding"
                                            ]
                                        }
                                    },
                                    "required": [
                                        "name",
                                        "dataAsMap"
                                    ]
                                }
                            },
                            "status_code": {
                                "type": "integer"
                            }
                        },
                        "required": [
                            "output",
                            "status_code"
                        ]
                    }
                }
            },
            "required": [
                "inference_results"
            ]
        }
    }
}
```

### Custom CLIP Multimodal Embedding

Connector:

```
POST /_plugins/_ml/connectors/_create
{
    "name": "Custom CLIP Multimodal Embedding",
    "description": "Connector for Custom CLIP Multimodal Embedding model hosted on Sagemaker",
    "version": 1,
    "protocol": "aws_sigv4",
    "parameters": {
        "region": "<region>",
        "service_name": "sagemaker"
    },
    "credential": {
        "access_key": "",
        "secret_key": "",
        "session_token": ""
    },
    "actions": [
        {
            "action_type": "predict",
            "method": "POST",
            "url": "<sagemaker_invocation_endpoint>",
            "headers": {
                "content-type": "application/json"
            },
            "request_body": "{ \"image_url\": \"${parameters.image_url:-null}\", \"text\": \"${parameters.text:-null}\"}"
        }
    ]
}
```

Model:

```
POST /_plugins/_ml/models/_register
{
    "name": "Custom CLIP Multimodal Embedding",
    "version": "1.0.1",
    "function_name": "remote",
    "description": "",
    "connector_id": "<connector_id>",
    "interface": {
        "input": {
            "type": "object",
            "properties": {
                "parameters": {
                    "type": "object",
                    "properties": {
                        "text": {
                            "type": "string"
                        },
                        "image_url": {
                            "type": "string"
                        }
                    },
                    "additionalProperties": true,
                    "required": []
                }
            }
        },
        "output": {
            "type": "object",
            "properties": {
                "inference_results": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "output": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "name": {
                                            "type": "string"
                                        },
                                        "dataAsMap": {
                                            "type": "object",
                                            "properties": {
                                                "response": {
                                                    "type": "array",
                                                    "items": {
                                                        "type": "number"
                                                    }
                                                }
                                            },
                                            "required": [
                                                "response"
                                            ],
                                            "additionalProperties": true
                                        }
                                    },
                                    "required": [
                                        "name",
                                        "dataAsMap"
                                    ]
                                }
                            },
                            "status_code": {
                                "type": "integer"
                            }
                        },
                        "required": [
                            "output",
                            "status_code"
                        ]
                    }
                }
            },
            "required": [
                "inference_results"
            ]
        }
    }
}
```

## Generative models

### Claude 3 Sonnet (hosted on Amazon Bedrock)

Connector:

```
POST /_plugins/_ml/connectors/_create
{
    "name": "Amazon Bedrock - Claude 3 Sonnet",
    "description": "Connector for Amazon Bedrock - Claude 3 Sonnet",
    "version": 1,
    "protocol": "aws_sigv4",
    "credential": {
      "access_key": "",
      "secret_key": "",
      "session_token": ""
    },
    "parameters": {
        "region": "<region>",
        "service_name": "bedrock",
        "auth": "Sig_V4",
        "response_filter": "$.content[0].text",
        "max_tokens_to_sample": "8000",
        "anthropic_version": "bedrock-2023-05-31",
        "model": "anthropic.claude-3-sonnet-20240229-v1:0",
        "prompt": ""
    },
    "actions": [
        {
            "action_type": "predict",
            "method": "POST",
            "headers": {
                "content-type": "application/json"
            },
            "url": "https://bedrock-runtime.${parameters.region}.amazonaws.com/model/${parameters.model}/invoke",
            "request_body": "{\"messages\":[{\"role\":\"user\",\"content\":[{\"type\":\"text\",\"text\":\"${parameters.prompt}\"}]}],\"anthropic_version\":\"${parameters.anthropic_version}\",\"max_tokens\":${parameters.max_tokens_to_sample}}"
        }
    ]
}
```

Model:

```
POST /_plugins/_ml/models/_register
{
    "name": "Amazon Bedrock - Claude 3 Sonnet",
    "version": "1.0.1",
    "function_name": "remote",
    "description": "",
    "connector_id": "<connector_id>",
    "interface": {
        "input": {
            "type": "object",
            "properties": {
                "parameters": {
                    "type": "object",
                    "properties": {
                        "prompt": {
                            "type": "string",
                            "description": "The prompt."
                        }
                    },
                    "additionalProperties": true,
                    "required": [
                        "prompt"
                    ]
                }
            }
        },
        "output": {
            "type": "object",
            "properties": {
                "inference_results": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "output": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "name": {
                                            "type": "string"
                                        },
                                        "dataAsMap": {
                                            "type": "object",
                                            "properties": {
                                                "response": {
                                                    "type": "string"
                                                }
                                            },
                                            "required": [
                                                "response"
                                            ]
                                        }
                                    },
                                    "required": [
                                        "name",
                                        "dataAsMap"
                                    ]
                                }
                            },
                            "status_code": {
                                "type": "integer"
                            }
                        },
                        "required": [
                            "output",
                            "status_code"
                        ]
                    }
                }
            },
            "required": [
                "inference_results"
            ]
        }
    }
}
```

## Reranking

### Cohere ReRank

Connector:

```
POST /_plugins/_ml/connectors/_create
{
    "name": "Cohere - Rerank",
    "description": "The connector to Cohere - Rerank",
    "version": "1",
    "protocol": "http",
    "credential": {
        "cohere_key": "<api_key>"
    },
    "parameters": {
        "model": "rerank-english-v3.0",
        "top_n": 1000,
        "return_documents": true
    },
    "actions": [
        {
            "action_type": "predict",
            "method": "POST",
            "url": "https://api.cohere.ai/v1/rerank",
            "headers": {
                "Authorization": "Bearer ${credential.cohere_key}"
            },
            "request_body": "{ \"documents\": ${parameters.documents}, \"query\": \"${parameters.query}\", \"model\": \"${parameters.model}\", \"top_n\": ${parameters.top_n}, \"return_documents\": ${parameters.return_documents}}"
        }
    ]
}
```

Model:

```
POST /_plugins/_ml/models/_register
{
  "name": "Cohere - Rerank English",
  "version": "1.0.1",
  "function_name": "remote",
  "description": "",
  "connector_id": "<connector_id>",
    "interface": {
    "input": {
      "type": "object",
      "properties": {
        "parameters": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string"
            },
            "documents": {
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          },
          "additionalProperties": true,
          "required": ["query", "documents"]
        }
      }
    },
    "output": {
      "type": "object",
      "properties": {
          "inference_results": {
              "type": "array",
              "items": {
                  "type": "object",
                  "properties": {
                      "output": {
                          "type": "array",
                          "items": {
                              "type": "object",
                              "properties": {
                                  "name": {
                                      "type": "string"
                                  },
                                  "dataAsMap": {
                                      "type": "object",
                                      "properties": {
                                        "results": {
                                          "type": "array",
                                          "items": {
                                            "properties": {
                                              "index": {
                                                "type": "number"
                                              },
                                              "relevance_score": {
                                                "type": "number"
                                              },
                                              "document": {
                                                "type": "object",
                                                "properties": {
                                                  "text": {
                                                    "type": "string"
                                                  }
                                                },
                                                "required": ["text"],
                                                "additionalProperties": true
                                              }
                                        },
                                        "required": [
                                            "index", "relevance_score", "document"
                                        ],
                                        "additionalProperties": true
                                      }
                                          }
                                        }
                                  },
                                  "required": ["results"],
                                  "additionalProperties": true
                              },
                              "required": [
                                  "name",
                                  "dataAsMap"
                              ]
                          }
                      },
                      "status_code": {
                          "type": "integer"
                      }
                  },
                  "required": [
                      "output",
                      "status_code"
                  ]
              }
          }
      },
      "required": [
        "inference_results"
    ]
  }
  }
}
```

## Other

### Amazon Comprehend - Entity Detection

Connector:

```
POST /_plugins/_ml/connectors/_create
{
    "name": "Amazon Comprehend - Entity Detection",
    "description": "Connector for Amazon Comprehend - Entity Detection",
    "version": 1,
    "protocol": "aws_sigv4",
    "credential": {
        "access_key": "",
        "secret_key": "",
        "session_token": ""
    },
    "parameters": {
        "service_name": "comprehend",
        "region": "<region>",
        "api_version": "20171127",
        "api_name": "DetectEntities",
        "api": "Comprehend_${parameters.api_version}.${parameters.api_name}",
        "response_filter": "$",
        "language_code": "en"
    },
    "actions": [
        {
            "action_type": "predict",
            "method": "POST",
            "url": "https://${parameters.service_name}.${parameters.region}.amazonaws.com",
            "headers": {
                "X-Amz-Target": "${parameters.api}",
                "content-type": "application/x-amz-json-1.1"
            },
            "request_body": "{ \"Text\": \"${parameters.text}\", \"LanguageCode\": \"${parameters.language_code}\"}"
        }
    ]
}
```

Model:

```
POST /_plugins/_ml/models/_register
{
    "name": "Amazon Comprehend - Entity Detection",
    "version": "1.0.1",
    "function_name": "remote",
    "description": "",
    "connector_id": "<connector_id>",
    "interface": {
        "input": {
            "type": "object",
            "properties": {
                "parameters": {
                    "type": "object",
                    "properties": {
                        "text": {
                            "type": "string"
                        }
                    },
                    "additionalProperties": true,
                    "required": [
                        "text"
                    ]
                }
            }
        },
        "output": {
            "type": "object",
            "properties": {
                "inference_results": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "output": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "name": {
                                            "type": "string"
                                        },
                                        "dataAsMap": {
                                            "type": "object",
                                            "properties": {
                                                "response": {
                                                    "type": "object",
                                                    "properties": {
                                                        "Entities": {
                                                            "type": "array",
                                                            "items": {
                                                                "type": "object",
                                                                "properties": {
                                                                    "BeginOffset": {
                                                                        "type": "integer"
                                                                    },
                                                                    "EndOffset": {
                                                                        "type": "integer"
                                                                    },
                                                                    "Score": {
                                                                        "type": "number"
                                                                    },
                                                                    "Text": {
                                                                        "type": "string"
                                                                    },
                                                                    "Type": {
                                                                        "type": "string"
                                                                    }
                                                                },
                                                                "required": [
                                                                    "BeginOffset",
                                                                    "EndOffset",
                                                                    "Score",
                                                                    "Text",
                                                                    "Type"
                                                                ],
                                                                "additionalProperties": true
                                                            }
                                                        }
                                                    },
                                                    "required": [
                                                        "Entities"
                                                    ],
                                                    "additionalProperties": true
                                                }
                                            }
                                        }
                                    },
                                    "required": [
                                        "name",
                                        "dataAsMap"
                                    ]
                                }
                            },
                            "status_code": {
                                "type": "integer"
                            }
                        },
                        "required": [
                            "output",
                            "status_code"
                        ]
                    }
                }
            },
            "required": [
                "inference_results"
            ]
        }
    }
}
```

### Amazon Comprehend - Language Detection

Connector:

```
POST /_plugins/_ml/connectors/_create
{
    "name": "Amazon Comprehend - Language Detection",
    "description": "Connector for Amazon Comprehend - Language Detection",
    "version": 1,
    "protocol": "aws_sigv4",
    "credential": {
        "access_key": "",
        "secret_key": "",
        "session_token": ""
    },
    "parameters": {
        "service_name": "comprehend",
        "region": "<region>",
        "api_version": "20171127",
        "api_name": "DetectDominantLanguage",
        "api": "Comprehend_${parameters.api_version}.${parameters.api_name}",
        "response_filter": "$"
    },
    "actions": [
        {
            "action_type": "predict",
            "method": "POST",
            "url": "https://${parameters.service_name}.${parameters.region}.amazonaws.com",
            "headers": {
                "X-Amz-Target": "${parameters.api}",
                "content-type": "application/x-amz-json-1.1"
            },
            "request_body": "{ \"Text\": \"${parameters.text}\"}"
        }
    ]
}
```

Model:

```
POST /_plugins/_ml/models/_register
{
    "name": "Amazon Comprehend - Language Detection",
    "version": "1.0.1",
    "function_name": "remote",
    "description": "",
    "connector_id": "<connector_id",
    "interface": {
        "input": {
            "type": "object",
            "properties": {
                "parameters": {
                    "type": "object",
                    "properties": {
                        "text": {
                            "type": "string"
                        }
                    },
                    "additionalProperties": true,
                    "required": [
                        "text"
                    ]
                }
            }
        },
        "output": {
            "type": "object",
            "properties": {
                "inference_results": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "output": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "name": {
                                            "type": "string"
                                        },
                                        "dataAsMap": {
                                            "type": "object",
                                            "properties": {
                                                "response": {
                                                    "type": "object",
                                                    "properties": {
                                                        "Languages": {
                                                            "type": "array",
                                                            "items": {
                                                                "type": "object",
                                                                "properties": {
                                                                    "LanguageCode": {
                                                                        "type": "string"
                                                                    },
                                                                    "Score": {
                                                                        "type": "number"
                                                                    }
                                                                },
                                                                "required": [
                                                                    "LanguageCode",
                                                                    "Score"
                                                                ],
                                                                "additionalProperties": true
                                                            }
                                                        }
                                                    },
                                                    "required": [
                                                        "Languages"
                                                    ],
                                                    "additionalProperties": true
                                                }
                                            }
                                        }
                                    },
                                    "required": [
                                        "name",
                                        "dataAsMap"
                                    ]
                                }
                            },
                            "status_code": {
                                "type": "integer"
                            }
                        },
                        "required": [
                            "output",
                            "status_code"
                        ]
                    }
                }
            },
            "required": [
                "inference_results"
            ]
        }
    }
}
```
