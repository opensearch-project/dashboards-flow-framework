import React, { ReactNode, useState } from 'react';
import {
  EuiButtonIcon,
  EuiCodeBlock,
  EuiCodeEditor,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSpacer,
  EuiTab,
  EuiTabs,
  EuiText,
} from '@elastic/eui';

import { CONSOLE_TAB_ID, CONSOLE_TABS } from '../../../../common/constants';

interface ConsoleProps {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  errorMessages: (string | ReactNode)[];
  ingestResponse: string;
}

/**
 * The console component for displaying erros and ingest responses
 * with expandable/collapsible functionality.
 */
export function Console(props: ConsoleProps) {
  const { isVisible, setIsVisible, errorMessages, ingestResponse } = props;
  const [selectedTabId, setSelectedTabId] = useState<CONSOLE_TAB_ID>(
    CONSOLE_TAB_ID.ERRORS
  );

  // Auto-navigate to errors tab if new errors detected
  React.useEffect(() => {
    if (errorMessages.length > 0) {
      setSelectedTabId(CONSOLE_TAB_ID.ERRORS);
    }
  }, [errorMessages]);

  // Auto-navigate to responses tab if a new response is set
  React.useEffect(() => {
    if (ingestResponse.length > 0) {
      setSelectedTabId(CONSOLE_TAB_ID.RESPONSES);
    }
  }, [ingestResponse]);

  // Toggle console visibility
  const toggleConsole = () => {
    setIsVisible(!isVisible);
  };

  return (
    <EuiPanel
      paddingSize="m"
      borderRadius="none"
      className="console-panel"
      style={{
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: '8px',
        margin: 0,
        boxShadow: 'none',
      }}
    >
      <EuiFlexGroup
        direction="column"
        gutterSize="s"
        style={{
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <EuiFlexItem
          grow={false}
          style={{
            marginBottom: '0px',
          }}
        >
          <EuiFlexGroup alignItems="center" justifyContent="spaceBetween">
            <EuiFlexItem grow={false}>
              <EuiText size="s">
                <h3 style={{ margin: 0 }}>Console</h3>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButtonIcon
                iconType="unfold"
                onClick={toggleConsole}
                aria-label={isVisible ? 'Collapse console' : 'Expand console'}
                title={isVisible ? 'Collapse console' : 'Expand console'}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>

        {isVisible && (
          <>
            <EuiFlexItem grow={false}>
              <EuiTabs size="s" expand={false}>
                {CONSOLE_TABS.map((tab, idx) => (
                  <EuiTab
                    onClick={() => setSelectedTabId(tab.id as CONSOLE_TAB_ID)}
                    isSelected={tab.id === selectedTabId}
                    disabled={tab.disabled}
                    key={idx}
                  >
                    {tab.name}
                  </EuiTab>
                ))}
              </EuiTabs>
            </EuiFlexItem>
            <EuiFlexItem grow={true}>
              {selectedTabId === CONSOLE_TAB_ID.ERRORS && (
                <>
                  {errorMessages.length === 0 ? (
                    <EuiEmptyPrompt title={<h2>No errors</h2>} titleSize="s" />
                  ) : (
                    <>
                      {errorMessages.map((errorMessage, idx) => (
                        <EuiFlexItem grow={false} key={idx}>
                          <EuiSpacer size="m" />
                          <EuiCodeBlock
                            fontSize="m"
                            isCopyable={false}
                            paddingSize="s"
                          >
                            {errorMessage}
                          </EuiCodeBlock>
                        </EuiFlexItem>
                      ))}
                    </>
                  )}
                </>
              )}
              {selectedTabId === CONSOLE_TAB_ID.RESPONSES && (
                <>
                  {!ingestResponse || ingestResponse.length === 0 ? (
                    <EuiEmptyPrompt
                      title={<h2>No data</h2>}
                      titleSize="s"
                      body={
                        <>
                          <EuiText size="s">
                            Run ingest and view the response here.
                          </EuiText>
                        </>
                      }
                    />
                  ) : (
                    <EuiCodeEditor
                      mode="json"
                      theme="textmate"
                      width="100%"
                      height="100%"
                      value={ingestResponse}
                      readOnly={true}
                      setOptions={{
                        fontSize: '12px',
                        autoScrollEditorIntoView: true,
                        wrap: true,
                      }}
                      tabSize={2}
                    />
                  )}
                </>
              )}
            </EuiFlexItem>
          </>
        )}
      </EuiFlexGroup>
    </EuiPanel>
  );
}
