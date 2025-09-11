/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
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
  AGENT_MAIN_DOCS_LINK,
  AGENTIC_SEARCH_DOCS_LINK,
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
    name: 'Configure index',
  },
  {
    id: INTRO_TAB_ID.AGENT,
    name: 'Configure agent',
  },
  {
    id: INTRO_TAB_ID.QUERY,
    name: 'Configure query',
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
                      <EuiTitle size="s">
                        <h4>1. Configure index</h4>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>Select an index to search against.</p>
                      </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h4>2. Configure agent</h4>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>
                          Select an existing agent, or create a new agent, to
                          use in your search flow.
                        </p>
                      </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h4>3. Configure query</h4>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>
                          Configure an agentic search query to run against your
                          index.
                        </p>
                      </EuiText>
                    </EuiFlexItem>
                  </>
                )}
                {selectedTabId === INTRO_TAB_ID.INDEX && (
                  <>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>
                          Select any index in your datasource, or ingest
                          documents to a new index.
                        </p>
                        <p style={{ marginTop: '-16px' }}>
                          You can always change this later.
                        </p>
                      </EuiText>
                    </EuiFlexItem>
                  </>
                )}
                {selectedTabId === INTRO_TAB_ID.AGENT && (
                  <>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>
                          Select an existing agent, or create a new one.
                          Configure the type of agent, and what tools it can
                          access. Toggle between a simple form-based view, or
                          edit the agent configuration JSON directly for more
                          flexibility.
                        </p>
                        <p style={{ marginTop: '-16px' }}>
                          <EuiLink target="_blank" href={AGENT_MAIN_DOCS_LINK}>
                            Learn more about agents
                          </EuiLink>
                        </p>
                      </EuiText>
                    </EuiFlexItem>
                  </>
                )}
                {selectedTabId === INTRO_TAB_ID.QUERY && (
                  <>
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <p>
                          Configure your agentic search query. A working query
                          will be generated for you automatically using your
                          configured agent. Optionally add query fields for the
                          agent to focus on when generating the final query.
                          Toggle between a simple form-based view, or edit the
                          search query JSON directly for more flexibility.
                        </p>
                        <p style={{ marginTop: '-16px' }}>
                          <EuiLink
                            target="_blank"
                            href={AGENTIC_SEARCH_DOCS_LINK}
                          >
                            Learn more about agentic search
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
