import React, { ReactNode, useState } from 'react';
import { isEmpty } from 'lodash';
import {
  EuiCodeBlock,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiAccordion,
  EuiBadge,
  EuiButtonIcon,
} from '@elastic/eui';

interface ConsoleProps {
  errorMessages: (string | ReactNode)[];
  errorCount: number;
  ingestResponse: string;
}

export function Console(props: ConsoleProps) {
  const hasErrors = props.errorMessages?.length > 0;
  const hasIngestResponse = !isEmpty(props.ingestResponse);
  const hasAnyContent = hasErrors || hasIngestResponse;

  // State for fullscreen modes
  const [fullscreenMode, setFullscreenMode] = useState<
    'errors' | 'responses' | null
  >(null);

  // Get theme-aware colors (moved to function to detect at runtime)
  const getThemeColors = () => {
    const bodyColor = window.getComputedStyle(document.body).color;
    const colorValues = bodyColor.match(/\d+/g);
    const isDarkMode = colorValues && parseInt(colorValues[0]) > 150;

    return {
      backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
      textColor: isDarkMode ? '#ffffff' : '#000000',
      isDarkMode,
    };
  };

  // Get current theme colors for use in component
  const themeColors = getThemeColors();

  // Utility functions for header hiding
  const hideHeader = () => {
    const style = document.createElement('style');
    style.id = 'console-fullscreen-hide-header';
    style.textContent = `
      header, nav, .euiHeader {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  };

  const showHeader = () => {
    const injectedStyle = document.getElementById(
      'console-fullscreen-hide-header'
    );
    if (injectedStyle) {
      injectedStyle.remove();
    }
  };

  const openErrorsFullscreen = () => {
    setFullscreenMode('errors');
    hideHeader();
  };

  const openResponsesFullscreen = () => {
    setFullscreenMode('responses');
    hideHeader();
  };

  const closeFullscreen = () => {
    setFullscreenMode(null);
    showHeader();
  };

  if (!hasAnyContent) {
    return (
      <EuiEmptyPrompt
        title={<h3>No console output</h3>}
        titleSize="s"
        body={
          <EuiText size="s" color="subdued">
            Errors and responses will appear here when you test your workflow.
          </EuiText>
        }
      />
    );
  }

  return (
    <>
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
        }}
      >
        <EuiFlexGroup
          direction="column"
          gutterSize="s"
          style={{
            height: '100%',
            overflow: 'hidden',
            width: '100%',
            maxWidth: '100%',
            minWidth: 0,
          }}
        >
          {hasErrors && (
            <EuiFlexItem grow={false}>
              <EuiAccordion
                id="console-errors"
                buttonContent={
                  <EuiFlexGroup
                    alignItems="center"
                    gutterSize="s"
                    responsive={false}
                  >
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <strong>Errors</strong>
                      </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiBadge color="danger">{props.errorCount}</EuiBadge>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                }
                extraAction={
                  <EuiFlexGroup
                    alignItems="center"
                    gutterSize="none"
                    responsive={false}
                    style={{ height: '32px' }}
                  >
                    <EuiFlexItem grow={false}>
                      <EuiButtonIcon
                        iconType="fullScreen"
                        onClick={openErrorsFullscreen}
                        aria-label="View errors in fullscreen"
                        size="s"
                      />
                    </EuiFlexItem>
                  </EuiFlexGroup>
                }
                initialIsOpen={true}
                paddingSize="s"
              >
                <div
                  style={{
                    maxHeight: hasIngestResponse ? '15vh' : '25vh',
                    minHeight: '100px',
                    overflow: hasErrors ? 'auto' : 'hidden',
                    width: '100%',
                    maxWidth: '100%',
                    minWidth: 0,
                  }}
                >
                  <EuiFlexGroup
                    direction="column"
                    gutterSize="s"
                    style={{ width: '100%', maxWidth: '100%', minWidth: 0 }}
                  >
                    {props.errorMessages.map((errorMessage, idx) => (
                      <EuiFlexItem grow={false} key={idx}>
                        <EuiCodeBlock
                          fontSize="s"
                          isCopyable={false}
                          paddingSize="s"
                          color="danger"
                          style={{
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            margin: 0,
                            maxHeight: 'none',
                            height: 'auto',
                            width: '100%',
                            maxWidth: '100%',
                            minWidth: 0,
                            overflowX: 'hidden',
                          }}
                          whiteSpace="pre-wrap"
                        >
                          {errorMessage}
                        </EuiCodeBlock>
                      </EuiFlexItem>
                    ))}
                  </EuiFlexGroup>
                </div>
              </EuiAccordion>
            </EuiFlexItem>
          )}

          {hasIngestResponse && (
            <EuiFlexItem grow={true} style={{ minHeight: 0 }}>
              <EuiAccordion
                id="console-responses"
                buttonContent={
                  <EuiFlexGroup
                    alignItems="center"
                    gutterSize="s"
                    responsive={false}
                  >
                    <EuiFlexItem grow={false}>
                      <EuiText size="s">
                        <strong>Responses</strong>
                      </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiBadge color="success">Success</EuiBadge>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                }
                extraAction={
                  <EuiFlexGroup
                    alignItems="center"
                    gutterSize="none"
                    responsive={false}
                    style={{ height: '32px' }}
                  >
                    <EuiFlexItem grow={false}>
                      <EuiButtonIcon
                        iconType="fullScreen"
                        onClick={openResponsesFullscreen}
                        aria-label="View responses in fullscreen"
                        size="s"
                      />
                    </EuiFlexItem>
                  </EuiFlexGroup>
                }
                initialIsOpen={true}
                paddingSize="s"
              >
                <div
                  style={{
                    height: hasErrors ? '12vh' : '22vh',
                    minHeight: '100px',
                    overflow: hasIngestResponse ? 'auto' : 'hidden',
                    width: '100%',
                    maxWidth: '100%',
                    minWidth: 0,
                  }}
                >
                  <EuiCodeBlock
                    language="json"
                    fontSize="s"
                    isCopyable={false}
                    paddingSize="s"
                    style={{
                      height: '100%',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      margin: 0,
                      width: '100%',
                      maxWidth: '100%',
                      minWidth: 0,
                      overflowX: 'hidden',
                    }}
                    whiteSpace="pre-wrap"
                  >
                    {props.ingestResponse}
                  </EuiCodeBlock>
                </div>
              </EuiAccordion>
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      </div>

      {fullscreenMode === 'responses' && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: themeColors.backgroundColor,
              color: themeColors.textColor,
              zIndex: 999999,
              padding: '20px',
              overflow: 'auto',
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <pre
              style={{
                marginTop: '0px',
                fontFamily: 'monospace',
                fontSize: '14px',
                lineHeight: '1.4',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                color: 'inherit',
                backgroundColor: 'transparent',
                border: 'none',
                padding: '0',
                margin: '0',
                outline: 'none',
              }}
            >
              {props.ingestResponse}
            </pre>
          </div>

          <div
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 2147483647,
            }}
          >
            <span
              onClick={closeFullscreen}
              style={{
                color: themeColors.textColor,
                fontSize: '24px',
                cursor: 'pointer',
                userSelect: 'none',
                display: 'block',
              }}
              title="Close fullscreen"
            >
              ✕
            </span>
          </div>
        </>
      )}

      {fullscreenMode === 'errors' && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: themeColors.backgroundColor,
              color: themeColors.textColor,
              zIndex: 999999,
              padding: '20px',
              overflow: 'auto',
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginTop: '0px' }}>
              {props.errorMessages.map((errorMessage, idx) => (
                <pre
                  key={idx}
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    lineHeight: '1.4',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    color: 'inherit',
                    backgroundColor: 'transparent',
                    border: 'none',
                    padding: '0',
                    margin: '0 0 16px 0',
                    outline: 'none',
                  }}
                >
                  {errorMessage}
                </pre>
              ))}
            </div>
          </div>

          <div
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 2147483647,
            }}
          >
            <span
              onClick={closeFullscreen}
              style={{
                color: themeColors.textColor,
                fontSize: '24px',
                cursor: 'pointer',
                userSelect: 'none',
                display: 'block',
              }}
              title="Close fullscreen"
            >
              ✕
            </span>
          </div>
        </>
      )}
    </>
  );
}
