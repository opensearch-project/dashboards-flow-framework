/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexItem, EuiSpacer } from '@elastic/eui';
import {
  IProcessorConfig,
  PROCESSOR_CONTEXT,
  PROCESSOR_TYPE,
  WorkflowConfig,
} from '../../../../../common';
import { MLProcessorInputs } from './ml_processor_inputs';

/**
 * Base component for rendering processor form inputs based on the processor type
 */

interface ProcessorInputsProps {
  uiConfig: WorkflowConfig;
  config: IProcessorConfig;
  baseConfigPath: string; // the base path of the nested config, if applicable. e.g., 'ingest.enrich'
  onFormChange: () => void;
  context: PROCESSOR_CONTEXT;
}

const PROCESSOR_INPUTS_SPACER_SIZE = 'm';

export function ProcessorInputs(props: ProcessorInputsProps) {
  const configType = props.config.type;
  return (
    <EuiFlexItem grow={false}>
      {(() => {
        let el;
        switch (configType) {
          case PROCESSOR_TYPE.ML: {
            el = (
              <EuiFlexItem>
                <MLProcessorInputs
                  uiConfig={props.uiConfig}
                  config={props.config}
                  baseConfigPath={props.baseConfigPath}
                  onFormChange={props.onFormChange}
                  context={props.context}
                />
                <EuiSpacer size={PROCESSOR_INPUTS_SPACER_SIZE} />
              </EuiFlexItem>
            );
            break;
          }
        }
        return el;
      })()}
    </EuiFlexItem>
  );
}
