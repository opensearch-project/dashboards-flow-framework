/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { isEmpty } from 'lodash';
import {
  EuiAccordion,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
} from '@elastic/eui';
import { JsonField } from '../input_fields';
import { getIn, useFormikContext } from 'formik';
import { WorkflowFormValues } from '../../../../../common';
import { AppState } from '../../../../store';
import {
  getEmbeddingField,
  getEmbeddingModelDimensions,
  getUpdatedIndexMappings,
  getUpdatedIndexSettings,
  isKnnIndex,
  removeVectorFieldFromIndexMappings,
} from '../../../../utils';

interface AdvancedSettingsProps {}

/**
 * Input component for configuring ingest-side advanced settings
 */
export function AdvancedSettings(props: AdvancedSettingsProps) {
  const { values, setFieldValue } = useFormikContext<WorkflowFormValues>();
  const { models, connectors } = useSelector((state: AppState) => state.ml);
  const ingestMLProcessors = (Object.values(
    values?.ingest?.enrich
  ) as any[]).filter((ingestProcessor) => ingestProcessor?.model !== undefined);
  const ingestProcessorModelIds = ingestMLProcessors
    .map((ingestProcessor) => ingestProcessor?.model?.id as string | undefined)
    .filter((modelId) => !isEmpty(modelId));
  const indexMappingsPath = 'ingest.index.mappings';
  const indexSettingsPath = 'ingest.index.settings';
  const curMappings = getIn(values, indexMappingsPath);
  const curSettings = getIn(values, indexSettingsPath);

  // listen on when processor with models are added / removed. dynamically update index
  // settings to be knn-enabled or knn-disabled.
  useEffect(() => {
    if (ingestProcessorModelIds.length > 0) {
      ingestProcessorModelIds.forEach((ingestProcessorModelId) => {
        const processorModel = Object.values(models).find(
          (model) => model.id === ingestProcessorModelId
        );
        if (processorModel?.connectorId !== undefined) {
          const processorConnector = connectors[processorModel?.connectorId];
          const dimension = getEmbeddingModelDimensions(processorConnector);

          // If a dimension is found, it is a known embedding model.
          // Ensure the index is configured to be knn-enabled.
          if (dimension !== undefined) {
            if (!isKnnIndex(curSettings)) {
              setFieldValue(
                indexSettingsPath,
                getUpdatedIndexSettings(curSettings, true)
              );
            }
          }
        }
      });
    } else {
      if (isKnnIndex(curSettings)) {
        setFieldValue(
          indexSettingsPath,
          getUpdatedIndexSettings(curSettings, false)
        );
      }
    }
  }, [ingestProcessorModelIds.length]);

  // listener on when there are updates to any ingest processors. Try to update
  // any index mappings accordingly, such as setting the knn_vector mappings
  // for models that output vector embeddings, or removing any mappings, if no ML
  // processor defined.
  useEffect(() => {
    if (ingestMLProcessors.length > 0) {
      ingestMLProcessors.forEach((ingestMLProcessor) => {
        const processorModel = Object.values(models).find(
          (model) => model.id === ingestMLProcessor?.model?.id
        );
        if (processorModel?.connectorId !== undefined) {
          const processorConnector = connectors[processorModel?.connectorId];
          const dimension = getEmbeddingModelDimensions(processorConnector);
          const embeddingFieldName = getEmbeddingField(
            processorConnector,
            ingestMLProcessor
          );
          if (embeddingFieldName !== undefined && dimension !== undefined) {
            setFieldValue(
              indexMappingsPath,
              getUpdatedIndexMappings(
                curMappings,
                embeddingFieldName,
                dimension
              )
            );
          }
        }
      });
    } else {
      setFieldValue(
        indexMappingsPath,
        removeVectorFieldFromIndexMappings(curMappings)
      );
    }
  }, [getIn(values, 'ingest.enrich')]);

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem grow={false}>
        <EuiAccordion id="advancedSettings" buttonContent="Advanced settings">
          <EuiSpacer size="s" />
          <EuiFlexGroup direction="column">
            <EuiFlexItem>
              <JsonField label="Index mappings" fieldPath={indexMappingsPath} />
            </EuiFlexItem>
            <EuiFlexItem>
              <JsonField label="Index settings" fieldPath={indexSettingsPath} />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiAccordion>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
