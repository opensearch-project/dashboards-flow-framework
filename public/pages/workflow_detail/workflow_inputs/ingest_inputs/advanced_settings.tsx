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
  getEmbeddingDimensions,
  getUpdatedIndexSettings,
  isKnnIndex,
} from '../../../../utils';

interface AdvancedSettingsProps {}

/**
 * Input component for configuring ingest-side advanced settings
 */
export function AdvancedSettings(props: AdvancedSettingsProps) {
  const { values, setFieldValue } = useFormikContext<WorkflowFormValues>();
  const { models, connectors } = useSelector((state: AppState) => state.ml);
  const ingestProcessors = Object.values(values?.ingest?.enrich) as [];
  const ingestProcessorModelIds = ingestProcessors
    .map((ingestProcessor) => ingestProcessor?.model?.id as string | undefined)
    .filter((modelId) => !isEmpty(modelId));
  const indexMappingsPath = 'ingest.index.mappings';
  const indexSettingsPath = 'ingest.index.settings';
  const curMappings = getIn(values, indexMappingsPath);
  const curSettings = getIn(values, indexSettingsPath);

  // listen on when processor with models are added / removed. dynamically update index
  // mappings and settings, if applicable.
  useEffect(() => {
    if (ingestProcessorModelIds.length > 0) {
      ingestProcessorModelIds.forEach((ingestProcessorModelId) => {
        const processorModel = Object.values(models).find(
          (model) => model.id === ingestProcessorModelId
        );
        if (processorModel?.connectorId !== undefined) {
          const processorConnector = connectors[processorModel?.connectorId];
          const dimension = getEmbeddingDimensions(processorConnector);
          if (dimension !== undefined) {
            // TODO: update mappings
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
      // TODO: update mappings
      if (isKnnIndex(curSettings)) {
        setFieldValue(
          indexSettingsPath,
          getUpdatedIndexSettings(curSettings, false)
        );
      }
    }
  }, [ingestProcessorModelIds.length]);

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
