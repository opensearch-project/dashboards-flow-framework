/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useFormikContext, getIn } from 'formik';
import { isEmpty } from 'lodash';
import { useSelector } from 'react-redux';
import { flattie } from 'flattie';
import {
  IProcessorConfig,
  IConfigField,
  PROCESSOR_CONTEXT,
  WorkflowFormValues,
  ModelInterface,
  IndexMappings,
  REQUEST_PREFIX,
  REQUEST_PREFIX_WITH_JSONPATH_ROOT_SELECTOR,
} from '../../../../../../common';
import { MapArrayField } from '../../input_fields';
import { AppState, getMappings, useAppDispatch } from '../../../../../store';
import {
  getDataSourceId,
  parseModelInputs,
  sanitizeJSONPath,
} from '../../../../../utils';

interface ModelInputsProps {
  config: IProcessorConfig;
  baseConfigPath: string;
  context: PROCESSOR_CONTEXT;
}

/**
 * Base component to configure ML inputs.
 */
export function ModelInputs(props: ModelInputsProps) {
  const dispatch = useAppDispatch();
  const dataSourceId = getDataSourceId();
  const { models } = useSelector((state: AppState) => state.ml);
  const indices = useSelector((state: AppState) => state.opensearch.indices);
  const { values } = useFormikContext<WorkflowFormValues>();

  // get some current form & config values
  const modelField = props.config.fields.find(
    (field) => field.type === 'model'
  ) as IConfigField;
  const modelFieldPath = `${props.baseConfigPath}.${props.config.id}.${modelField.id}`;
  const inputMapFieldPath = `${props.baseConfigPath}.${props.config.id}.input_map`;

  // model interface state
  const [modelInterface, setModelInterface] = useState<
    ModelInterface | undefined
  >(undefined);

  // on initial load of the models, update model interface states
  useEffect(() => {
    if (!isEmpty(models)) {
      const modelId = getIn(values, modelFieldPath)?.id;
      if (modelId) {
        setModelInterface(models[modelId]?.interface);
      }
    }
  }, [models]);

  // persisting doc/query/index mapping fields to collect a list
  // of options to display in the dropdowns when configuring input / output maps
  const [docFields, setDocFields] = useState<{ label: string }[]>([]);
  const [queryFields, setQueryFields] = useState<{ label: string }[]>([]);
  const [indexMappingFields, setIndexMappingFields] = useState<
    { label: string }[]
  >([]);
  useEffect(() => {
    try {
      const docObjKeys = Object.keys(
        flattie((JSON.parse(values.ingest.docs) as {}[])[0])
      );
      if (docObjKeys.length > 0) {
        setDocFields(
          docObjKeys.map((key) => {
            return {
              label:
                // ingest inputs can handle dot notation, and hence don't need
                // sanitizing to handle JSONPath edge cases. The other contexts
                // only support JSONPath, and hence need some post-processing/sanitizing.
                props.context === PROCESSOR_CONTEXT.INGEST
                  ? key
                  : sanitizeJSONPath(key),
            };
          })
        );
      }
    } catch {}
  }, [values?.ingest?.docs]);
  useEffect(() => {
    try {
      const queryObjKeys = Object.keys(
        flattie(JSON.parse(values.search.request))
      );
      if (queryObjKeys.length > 0) {
        setQueryFields(
          queryObjKeys.map((key) => {
            return {
              label:
                // ingest inputs can handle dot notation, and hence don't need
                // sanitizing to handle JSONPath edge cases. The other contexts
                // only support JSONPath, and hence need some post-processing/sanitizing.
                props.context === PROCESSOR_CONTEXT.INGEST
                  ? key
                  : sanitizeJSONPath(key),
            };
          })
        );
      }
    } catch {}
  }, [values?.search?.request]);
  useEffect(() => {
    const indexName = values?.search?.index?.name as string | undefined;
    if (indexName !== undefined && indices[indexName] !== undefined) {
      dispatch(
        getMappings({
          index: indexName,
          dataSourceId,
        })
      )
        .unwrap()
        .then((resp: IndexMappings) => {
          const mappingsObjKeys = Object.keys(resp.properties);
          if (mappingsObjKeys.length > 0) {
            setIndexMappingFields(
              mappingsObjKeys.map((key) => {
                return {
                  label: key,
                  type: resp.properties[key]?.type,
                };
              })
            );
          }
        });
    }
  }, [values?.search?.index?.name]);

  return (
    <MapArrayField
      fieldPath={inputMapFieldPath}
      keyTitle="Name"
      keyPlaceholder="Name"
      keyOptions={parseModelInputs(modelInterface)}
      valueTitle={
        props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST
          ? 'Query field'
          : 'Document field'
      }
      valuePlaceholder={
        props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST
          ? 'Specify a query field'
          : 'Define a document field'
      }
      valueHelpText={`Specify a ${
        props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST
          ? 'query'
          : 'document'
      } field or define JSONPath to transform the ${
        props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST
          ? 'query'
          : 'document'
      } to map to a model input field.${
        props.context === PROCESSOR_CONTEXT.SEARCH_RESPONSE
          ? ` Or, if you'd like to include data from the the original query request, prefix your mapping with "${REQUEST_PREFIX}" or "${REQUEST_PREFIX_WITH_JSONPATH_ROOT_SELECTOR}" - for example, "_request.query.match.my_field"`
          : ''
      }`}
      valueOptions={
        props.context === PROCESSOR_CONTEXT.INGEST
          ? docFields
          : props.context === PROCESSOR_CONTEXT.SEARCH_REQUEST
          ? queryFields
          : indexMappingFields
      }
      addMapEntryButtonText="Add input"
      addMapButtonText="Add input group (Advanced)"
      mappingDirection="sortLeft"
    />
  );
}
