/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Prompt, RouteComponentProps, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ReactFlowProvider } from 'reactflow';
import { escape } from 'lodash';
import { Formik } from 'formik';
import * as yup from 'yup';
import {
  EuiSmallButton,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPage,
  EuiPageBody,
} from '@elastic/eui';
import {
  APP_PATH,
  BREADCRUMBS,
  USE_NEW_HOME_PAGE,
  uiConfigToFormik,
  uiConfigToSchema,
} from '../../utils';
import { getCore } from '../../services';
import { WorkflowDetailHeader } from './components';
import {
  AppState,
  catIndices,
  getWorkflow,
  searchConnectors,
  searchModels,
  setIngestPipelineErrors,
  setSearchPipelineErrors,
  useAppDispatch,
} from '../../store';
import { ResizableWorkspace } from './resizable_workspace';
import {
  CONFIG_STEP,
  CachedFormikState,
  ERROR_GETTING_WORKFLOW_MSG,
  FETCH_ALL_QUERY_LARGE,
  MAX_WORKFLOW_NAME_TO_DISPLAY,
  NO_TEMPLATES_FOUND_MSG,
  OMIT_SYSTEM_INDEX_PATTERN,
  WorkflowConfig,
  WorkflowFormValues,
  WorkflowSchema,
  getCharacterLimitedString,
} from '../../../common';
import { MountPoint } from '../../../../../src/core/public';
import {
  constructHrefWithDataSourceId,
  getDataSourceId,
} from '../../utils/utils';
import { getDataSourceEnabled } from '../../services';

// styling
import './workflow-detail-styles.scss';
import '../../global-styles.scss';

export interface WorkflowDetailRouterProps {
  workflowId: string;
}

interface WorkflowDetailProps
  extends RouteComponentProps<WorkflowDetailRouterProps> {
  setActionMenu: (menuMount?: MountPoint) => void;
}

/**
 * The workflow details page. This is where users will configure, create, and
 * test their created workflows. Additionally, can be used to load existing workflows
 * to view details and/or make changes to them.
 */

export function WorkflowDetail(props: WorkflowDetailProps) {
  const dispatch = useAppDispatch();
  const history = useHistory();

  // last ingested state
  const [lastIngested, setLastIngested] = useState<number | undefined>(
    undefined
  );

  // On initial load:
  // - fetch workflow
  // - fetch available models & connectors as their IDs may be used when building flows
  // - fetch all indices
  // - clear any processor-level errors
  useEffect(() => {
    dispatch(getWorkflow({ workflowId, dataSourceId }));
    dispatch(searchModels({ apiBody: FETCH_ALL_QUERY_LARGE, dataSourceId }));
    dispatch(
      searchConnectors({ apiBody: FETCH_ALL_QUERY_LARGE, dataSourceId })
    );
    dispatch(catIndices({ pattern: OMIT_SYSTEM_INDEX_PATTERN, dataSourceId }));
    dispatch(setIngestPipelineErrors({ errors: {} }));
    dispatch(setSearchPipelineErrors({ errors: {} }));
  }, []);

  const [blockNavigation, setBlockNavigation] = useState<boolean>(false);

  // 1. Block page refreshes if unsaved changes.
  // Remove listeners on component unload.
  function preventPageRefresh(e: BeforeUnloadEvent) {
    e.preventDefault();
  }
  useEffect(() => {
    if (blockNavigation) {
      window.addEventListener('beforeunload', preventPageRefresh);
    } else {
      window.removeEventListener('beforeunload', preventPageRefresh);
    }
    return () => {
      window.removeEventListener('beforeunload', preventPageRefresh);
    };
  }, [blockNavigation]);

  // 2. Block navigation (externally-controlled buttons/links)
  // Remove listeners on component unload.
  const handleLinkClick = (e: Event) => {
    const confirmation = window.confirm(
      'You have unsaved changes. Are you sure you want to leave?'
    );
    if (!confirmation) {
      e.preventDefault();
    }
  };
  useEffect(() => {
    // try to catch as many external links as possible, particularly
    // ones that will go to the home page, or different plugins within
    // the side navigation.
    const links = document.querySelectorAll(`a[href*="app/"]`);
    if (blockNavigation) {
      links.forEach((link) => {
        link.addEventListener('click', handleLinkClick);
      });
    } else {
      links.forEach((link) => {
        link.removeEventListener('click', handleLinkClick);
      });
    }
    return () => {
      links.forEach((link) => {
        link.removeEventListener('click', handleLinkClick);
      });
    };
  }, [blockNavigation]);

  // data-source-related states
  const dataSourceEnabled = getDataSourceEnabled().enabled;
  const dataSourceId = getDataSourceId();
  const { workflows, errorMessage } = useSelector(
    (state: AppState) => state.workflows
  );

  const { indices } = useSelector((state: AppState) => state.opensearch);

  // selected workflow state
  const workflowId = escape(props.match?.params?.workflowId);
  const workflow = workflows[workflowId];
  const workflowName = getCharacterLimitedString(
    workflow?.name || '',
    MAX_WORKFLOW_NAME_TO_DISPLAY
  );

  // setting breadcrumbs based on data source enabled
  const {
    chrome: { setBreadcrumbs },
  } = getCore();
  useEffect(() => {
    setBreadcrumbs(
      USE_NEW_HOME_PAGE
        ? [
            BREADCRUMBS.TITLE_WITH_REF(
              dataSourceEnabled ? dataSourceId : undefined
            ),
            BREADCRUMBS.WORKFLOW_NAME(workflowName),
            { text: '' },
          ]
        : [
            BREADCRUMBS.PLUGIN_NAME,
            BREADCRUMBS.WORKFLOWS(dataSourceEnabled ? dataSourceId : undefined),
            { text: workflowName },
          ]
    );
  }, [USE_NEW_HOME_PAGE, dataSourceEnabled, dataSourceId, workflowName]);

  // form state
  const [formValues, setFormValues] = useState<WorkflowFormValues>(
    {} as WorkflowFormValues
  );
  const [formSchema, setFormSchema] = useState<WorkflowSchema>(yup.object({}));

  // ingest docs state. we need to persist here to update the form values.
  const [ingestDocs, setIngestDocs] = useState<string>('');

  // Temp UI config state. For persisting changes to the UI config that may
  // not be saved in the backend (e.g., adding / removing an ingest processor)
  const [uiConfig, setUiConfig] = useState<WorkflowConfig | undefined>(
    undefined
  );

  // We persist some cached formik state we may want to save, even when the form is reset. For example,
  // when adding a processor, the form needs to be re-generated. But, we should persist any known
  // values that are touched or have errors.
  const [cachedFormikState, setCachedFormikState] = useState<
    CachedFormikState | undefined
  >(undefined);

  // various form-related states. persisted here to pass down to the child's form and header components, particularly
  // to have consistency on the button states (enabled/disabled)
  const [isRunningIngest, setIsRunningIngest] = useState<boolean>(false);
  const [isRunningSearch, setIsRunningSearch] = useState<boolean>(false);
  const [selectedStep, setSelectedStep] = useState<CONFIG_STEP>(
    CONFIG_STEP.INGEST
  );
  const [unsavedIngestProcessors, setUnsavedIngestProcessors] = useState<
    boolean
  >(false);
  const [unsavedSearchProcessors, setUnsavedSearchProcessors] = useState<
    boolean
  >(false);

  // Initialize the UI config based on the workflow's config, if applicable.
  useEffect(() => {
    if (workflow?.ui_metadata?.config) {
      setUiConfig(workflow.ui_metadata.config);
    }
  }, [workflow]);

  // Initialize the form state based on the current UI config, if applicable
  useEffect(() => {
    if (uiConfig) {
      const initFormValues = uiConfigToFormik(uiConfig, ingestDocs);
      const initFormSchema = uiConfigToSchema(uiConfig, indices);
      setFormValues(initFormValues);
      setFormSchema(initFormSchema);
    }
  }, [uiConfig]);

  return (
    <>
      {/**
       * 3. Block navigation (internally-controlled buttons/links). <Prompt /> context is confined to navigation checks
       *    within the plugin-defined router.
       */}
      <Prompt
        when={blockNavigation}
        message={(location) => {
          const confirmation = window.confirm(
            'You have unsaved changes. Are you sure you want to leave?'
          );
          if (!confirmation) {
            setBlockNavigation(true);
            history.goBack();
            return false;
          } else {
            setBlockNavigation(false);
            return true;
          }
        }}
      />

      {errorMessage?.includes(ERROR_GETTING_WORKFLOW_MSG) ||
      errorMessage?.includes(NO_TEMPLATES_FOUND_MSG) ? (
        <EuiFlexGroup direction="column" alignItems="center">
          <EuiFlexItem grow={3}>
            <EuiEmptyPrompt
              iconType={'cross'}
              title={<h2>Oops! We couldn't find that workflow</h2>}
              titleSize="s"
            />
          </EuiFlexItem>
          <EuiFlexItem grow={7}>
            <EuiSmallButton
              style={{ width: '200px' }}
              fill={false}
              href={constructHrefWithDataSourceId(
                APP_PATH.WORKFLOWS,
                dataSourceId
              )}
            >
              Return to home
            </EuiSmallButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      ) : (
        <Formik
          enableReinitialize={true}
          initialValues={formValues}
          initialTouched={cachedFormikState?.touched}
          initialErrors={cachedFormikState?.errors}
          validationSchema={formSchema}
          onSubmit={(values) => {}}
          validate={(values) => {}}
        >
          <ReactFlowProvider>
            <EuiPage paddingSize="s">
              <EuiPageBody className="workflow-detail stretch-relative">
                <WorkflowDetailHeader
                  workflow={workflow}
                  uiConfig={uiConfig}
                  setUiConfig={setUiConfig}
                  isRunningIngest={isRunningIngest}
                  isRunningSearch={isRunningSearch}
                  selectedStep={selectedStep}
                  unsavedIngestProcessors={unsavedIngestProcessors}
                  setUnsavedIngestProcessors={setUnsavedIngestProcessors}
                  unsavedSearchProcessors={unsavedSearchProcessors}
                  setUnsavedSearchProcessors={setUnsavedSearchProcessors}
                  setActionMenu={props.setActionMenu}
                  setBlockNavigation={setBlockNavigation}
                />
                <EuiFlexGroup
                  direction="row"
                  gutterSize="xs"
                  style={{
                    marginTop: USE_NEW_HOME_PAGE ? '0' : '-24px',
                    height: '100%',
                    gap: '4px',
                  }}
                >
                  <EuiFlexItem>
                    <ResizableWorkspace
                      workflow={workflow}
                      uiConfig={uiConfig}
                      setUiConfig={setUiConfig}
                      ingestDocs={ingestDocs}
                      setIngestDocs={setIngestDocs}
                      isRunningIngest={isRunningIngest}
                      setIsRunningIngest={setIsRunningIngest}
                      isRunningSearch={isRunningSearch}
                      setIsRunningSearch={setIsRunningSearch}
                      selectedStep={selectedStep}
                      setSelectedStep={setSelectedStep}
                      setUnsavedIngestProcessors={setUnsavedIngestProcessors}
                      setUnsavedSearchProcessors={setUnsavedSearchProcessors}
                      setCachedFormikState={setCachedFormikState}
                      lastIngested={lastIngested}
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiPageBody>
            </EuiPage>
          </ReactFlowProvider>
        </Formik>
      )}
    </>
  );
}
