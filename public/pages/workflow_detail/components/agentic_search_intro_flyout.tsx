/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EuiCodeBlock,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiLink,
  EuiTab,
  EuiTabs,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import {
  BULK_API_DOCS_LINK,
  CREATE_WORKFLOW_LINK,
  ML_REMOTE_MODEL_LINK,
  SEARCH_PIPELINE_DOCS_LINK,
} from '../../../../common';

interface AgenticSearchIntroFlyoutProps {
  onClose: () => void;
}

enum INTRO_TAB_ID {
  OVERVIEW = 'overview',
  INDEX = 'index',
  AGENT = 'agent',
  QUERY = 'query',
}

const INTRO_TABS = [
  {
    id: INTRO_TAB_ID.OVERVIEW,
    name: 'Overview',
  },
  {
    id: INTRO_TAB_ID.INDEX,
    name: 'Select your index',
  },
  {
    id: INTRO_TAB_ID.AGENT,
    name: 'Select your agent',
  },
  {
    id: INTRO_TAB_ID.QUERY,
    name: 'Run your query',
  },
];

/**
 * Basic introduction flyout describing how agentic search works. Contains just static content.
 */
export function AgenticSearchIntroFlyout(props: AgenticSearchIntroFlyoutProps) {
  const [selectedTabId, setSelectedTabId] = useState<INTRO_TAB_ID>(
    INTRO_TAB_ID.OVERVIEW
  );

  return (
    <EuiFlyout onClose={props.onClose}>
      <EuiFlyoutHeader>
        <EuiTitle>
          <h2>{`How it works`}</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiFlexGroup direction="column" gutterSize="m">
          <EuiFlexItem grow={false}>
            <EuiTabs size="s" expand={false}>
              {INTRO_TABS.map((tab, idx) => {
                return (
                  <EuiTab
                    onClick={() => setSelectedTabId(tab.id)}
                    isSelected={tab.id === selectedTabId}
                    disabled={false}
                    key={idx}
                  >
                    {tab.name}
                  </EuiTab>
                );
              })}
            </EuiTabs>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup direction="column" gutterSize="s">
              <>
                {selectedTabId === INTRO_TAB_ID.OVERVIEW && (
                  <>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="m">
                        <h3>Use the following steps to build your workflow</h3>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h4>1. Configure index</h4>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>Configure an index to search against.</p>
                        <p style={{ marginTop: '-16px' }}>
                          <EuiLink href={ML_REMOTE_MODEL_LINK} target="_blank">
                            TODO
                          </EuiLink>
                        </p>
                      </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h4>2. Configure agent</h4>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>Configure and agent to generate query DSL.</p>
                        <p style={{ marginTop: '-16px' }}>TODO.</p>
                      </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h4>3. Configure query</h4>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>Configure an agentic search query.</p>
                      </EuiText>
                    </EuiFlexItem>
                  </>
                )}
                {selectedTabId === INTRO_TAB_ID.INDEX && (
                  <>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="m">
                        <h3>Select your index</h3>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h4>Select the index to search against</h4>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>TODO</p>
                        <p style={{ marginTop: '-16px' }}>TODO</p>
                      </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h4>TODO</h4>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>TODO.</p>
                      </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h4>TODO</h4>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>
                          TODO.{' '}
                          <EuiLink href={BULK_API_DOCS_LINK} target="_blank">
                            TODO
                          </EuiLink>
                        </p>
                      </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiCodeBlock fontSize="m" isCopyable={true}>
                        {`TODO`}
                      </EuiCodeBlock>
                    </EuiFlexItem>
                  </>
                )}
                {selectedTabId === INTRO_TAB_ID.AGENT && (
                  <>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="m">
                        <h3>Select your agent</h3>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h4>
                          Select your agent to generate or enhance your search
                          query.
                        </h4>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>TODO.</p>
                      </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h4>TODO</h4>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>TODO.</p>
                      </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h4>TODO</h4>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>
                          TODO.{' '}
                          <EuiLink
                            href={SEARCH_PIPELINE_DOCS_LINK}
                            target="_blank"
                          >
                            TODO
                          </EuiLink>
                        </p>
                      </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiCodeBlock fontSize="m" isCopyable={true}>
                        {`TODO`}
                      </EuiCodeBlock>
                    </EuiFlexItem>
                  </>
                )}
                {selectedTabId === INTRO_TAB_ID.QUERY && (
                  <>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="m">
                        <h3>Run your query</h3>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h4>Configure and run your agentic search query</h4>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>TODO.</p>
                      </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h4>TODO</h4>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>TODO.</p>
                        <p style={{ marginTop: '-16px' }}>TODO.</p>
                        <p style={{ marginTop: '-16px' }}>
                          <EuiLink href={CREATE_WORKFLOW_LINK} target="_blank">
                            TODO
                          </EuiLink>
                        </p>
                      </EuiText>
                    </EuiFlexItem>
                  </>
                )}
              </>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
}
