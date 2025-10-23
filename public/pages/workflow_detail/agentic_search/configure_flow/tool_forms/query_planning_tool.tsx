/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIn } from 'formik';
import { isEmpty } from 'lodash';
import {
  EuiAccordion,
  EuiSpacer,
  EuiButtonIcon,
  EuiText,
  EuiFormRow,
  EuiSmallButtonEmpty,
  EuiPanel,
  EuiSelect,
  EuiTextArea,
  EuiRadioGroup,
  EuiLink,
  EuiFlexItem,
} from '@elastic/eui';
import {
  Agent,
  AGENT_TYPE,
  Model,
  MODEL_STATE,
  QUERY_PLANNING_MODEL_DOCS_LINK,
  QUERY_PLANNING_TOOL_DOCS_LINK,
  Tool,
  TOOL_DESCRIPTION,
} from '../../../../../../common';
import { AppState } from '../../../../../store';
import { parseStringOrJson } from '../../../../../utils';
import {
  NoDeployedModelsCallout,
  NoSearchTemplatesCallout,
} from '../../components';
import { updateParameterValue } from './utils';

interface QueryPlanningToolProps {
  agentForm: Partial<Agent>;
  setAgentForm: (agentForm: Partial<Agent>) => void;
  toolIndex: number;
}

enum GENERATION_TYPE {
  LLM = 'llmGenerated',
  SEARCH_TEMPLATES = 'user_templates',
}
const GENERATION_TYPE_OPTIONS = [
  { value: GENERATION_TYPE.LLM, text: 'LLM-Generated' },
  { value: GENERATION_TYPE.SEARCH_TEMPLATES, text: 'Search Templates' },
];

interface SearchTemplateField {
  template_id: string;
  template_description: string;
}
const DEFAULT_SEARCH_TEMPLATE: SearchTemplateField = {
  template_id: '',
  template_description: '',
};

export function QueryPlanningTool(props: QueryPlanningToolProps) {
  const { models } = useSelector((state: AppState) => state.ml);
  const { searchTemplates } = useSelector(
    (state: AppState) => state.opensearch
  );
  const [modelOptions, setModelOptions] = useState<
    { value: string; text: string }[]
  >([]);
  useEffect(() => {
    setModelOptions(
      Object.values(models || {})
        .filter((model) => model.state === MODEL_STATE.DEPLOYED)
        .map((model) => ({
          value: model.id,
          text: model.name || model.id,
        }))
    );
  }, [models]);
  const agentType = getIn(props.agentForm, 'type', '').toLowerCase() as string;
  const toolForm = getIn(props.agentForm, `tools.${props.toolIndex}`) as Tool;
  const generationType =
    toolForm?.parameters?.generation_type || GENERATION_TYPE.LLM;
  const searchTemplatesForm = parseStringOrJson(
    toolForm?.parameters?.search_templates || []
  ) as SearchTemplateField[];
  const generationTypeRadios = GENERATION_TYPE_OPTIONS.map((option) => ({
    id: option.value,
    label: option.text,
  }));
  const selectedModelId = toolForm?.parameters?.model_id;
  const selectedModel = getIn(models, selectedModelId) as Model | undefined;
  const modelFound = selectedModel !== undefined;
  const modelEmpty = isEmpty(selectedModelId);

  /**
   * Search template helper fns
   */
  const addSearchTemplate = () => {
    const updatedTemplates = [
      ...searchTemplatesForm,
      { ...DEFAULT_SEARCH_TEMPLATE },
    ];
    updateParameterValue(
      props.agentForm,
      props.setAgentForm,
      props.toolIndex,
      'search_templates',
      JSON.stringify(updatedTemplates)
    );
    setOpenTemplateAccordionIndex(updatedTemplates.length - 1);
  };
  const updateSearchTemplate = (
    templateIndex: number,
    field: string,
    value: string
  ) => {
    const updatedTemplates = [...searchTemplatesForm];
    updatedTemplates[templateIndex] = {
      ...updatedTemplates[templateIndex],
      [field]: value,
    };
    updateParameterValue(
      props.agentForm,
      props.setAgentForm,
      props.toolIndex,
      'search_templates',
      JSON.stringify(updatedTemplates)
    );
  };
  const removeSearchTemplate = (templateIndex: number) => {
    const updatedTemplates = searchTemplatesForm.filter(
      (_: SearchTemplateField, i: number) => i !== templateIndex
    );
    updateParameterValue(
      props.agentForm,
      props.setAgentForm,
      props.toolIndex,
      'search_templates',
      JSON.stringify(updatedTemplates)
    );
  };

  // Persist state for each search template accordion. Only support one at a time
  const [openTemplateAccordionIndex, setOpenTemplateAccordionIndex] = useState<
    number | undefined
  >(undefined);

  return (
    <>
      <EuiFlexItem grow={false}>
        <EuiText size="xs" color="subdued">
          <i>{TOOL_DESCRIPTION.QUERY_PLANNING}</i>
        </EuiText>
      </EuiFlexItem>
      <EuiSpacer size="s" />
      {agentType === AGENT_TYPE.FLOW && (
        <EuiFormRow
          label="Model"
          data-testid="queryPlanningModelField"
          labelAppend={
            <EuiText size="xs">
              <EuiLink href={QUERY_PLANNING_MODEL_DOCS_LINK} target="_blank">
                Learn more
              </EuiLink>
            </EuiText>
          }
          fullWidth
          isInvalid={!modelFound && !modelEmpty}
        >
          <>
            {modelOptions.length === 0 ? (
              <NoDeployedModelsCallout />
            ) : (
              <EuiSelect
                options={
                  modelFound || modelEmpty
                    ? modelOptions
                    : [
                        ...modelOptions,
                        {
                          value: selectedModelId,
                          text: `Unknown model (ID: ${selectedModelId})`,
                        },
                      ]
                }
                value={selectedModelId}
                onChange={(e) => {
                  updateParameterValue(
                    props.agentForm,
                    props.setAgentForm,
                    props.toolIndex,
                    'model_id',
                    e.target.value
                  );
                }}
                aria-label="Select model"
                placeholder="Select a model"
                hasNoInitialSelection={true}
                isInvalid={!modelFound && !modelEmpty}
                fullWidth
                compressed
              />
            )}
          </>
        </EuiFormRow>
      )}
      <EuiFormRow
        label="Generation type"
        data-testid="generationTypeField"
        labelAppend={
          <EuiText size="xs">
            <EuiLink href={QUERY_PLANNING_TOOL_DOCS_LINK} target="_blank">
              Learn more
            </EuiLink>
          </EuiText>
        }
        fullWidth
      >
        <EuiRadioGroup
          options={generationTypeRadios}
          idSelected={generationType}
          onChange={(id) => {
            updateParameterValue(
              props.agentForm,
              props.setAgentForm,
              props.toolIndex,
              'generation_type',
              id
            );
          }}
          compressed
          data-testid="generationTypeRadioGroup"
        />
      </EuiFormRow>
      {generationType === GENERATION_TYPE.SEARCH_TEMPLATES && (
        <>
          <EuiSpacer size="s" />
          <div>
            {searchTemplatesForm.length === 0 && <NoSearchTemplatesCallout />}
            {searchTemplatesForm.length > 0 &&
              searchTemplatesForm.map(
                (template: SearchTemplateField, templateIndex: number) => (
                  <div key={templateIndex} style={{ marginBottom: '8px' }}>
                    <EuiPanel color="transparent" paddingSize="s">
                      <EuiAccordion
                        id={`search-template-${templateIndex}`}
                        forceState={
                          openTemplateAccordionIndex === templateIndex
                            ? 'open'
                            : 'closed'
                        }
                        onToggle={(isOpen) => {
                          setOpenTemplateAccordionIndex(
                            isOpen ? templateIndex : undefined
                          );
                        }}
                        buttonContent={
                          <EuiText size="s">
                            {template.template_id ||
                              `Template ${templateIndex + 1}`}
                          </EuiText>
                        }
                        extraAction={
                          <EuiButtonIcon
                            aria-label="Remove template"
                            iconType="trash"
                            color="danger"
                            onClick={(e: any) => {
                              e.stopPropagation(); // Prevent accordion toggle
                              removeSearchTemplate(templateIndex);
                            }}
                          />
                        }
                        paddingSize="s"
                      >
                        <EuiPanel
                          color="subdued"
                          paddingSize="s"
                          hasBorder={false}
                        >
                          <EuiFormRow label="Template ID" fullWidth>
                            <EuiSelect
                              options={[
                                ...Object.keys(searchTemplates || {}).map(
                                  (templateId) => ({
                                    value: templateId,
                                    text: templateId,
                                  })
                                ),
                              ]}
                              value={template.template_id}
                              onChange={(e) => {
                                const selectedTemplateId = e.target.value;
                                updateSearchTemplate(
                                  templateIndex,
                                  'template_id',
                                  selectedTemplateId
                                );
                              }}
                              placeholder="Select a template"
                              fullWidth
                              compressed
                              hasNoInitialSelection={isEmpty(
                                template.template_id
                              )}
                            />
                          </EuiFormRow>
                          <EuiSpacer size="s" />
                          <EuiFormRow label="Description" fullWidth>
                            <EuiTextArea
                              value={template.template_description}
                              onChange={(e) => {
                                updateSearchTemplate(
                                  templateIndex,
                                  'description',
                                  e.target.value
                                );
                              }}
                              placeholder="Enter description"
                              fullWidth
                              compressed
                            />
                          </EuiFormRow>
                        </EuiPanel>
                      </EuiAccordion>
                    </EuiPanel>
                  </div>
                )
              )}
            <EuiSmallButtonEmpty
              style={{ marginLeft: '-8px' }}
              iconType="plusInCircle"
              onClick={addSearchTemplate}
              data-testid="addTemplateButton"
            >
              Add template
            </EuiSmallButtonEmpty>
          </div>
        </>
      )}
    </>
  );
}
