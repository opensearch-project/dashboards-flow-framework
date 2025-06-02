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

  const openErrorsFullscreen = () => {
    setFullscreenMode('errors');
    const style = document.createElement('style');
    style.id = 'console-fullscreen-hide-header';
    style.textContent = `
      .euiHeader,
      [data-test-subj="headerGlobalNav"],
      #globalHeaderBars,
      .osd-top-nav,
      .chrome-nav,
      .application-header,
      .kibana-header,
      .opensearch-header,
      header[role="banner"],
      .global-header,
      .top-nav,
      nav[aria-label*="primary"],
      nav[aria-label*="global"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        z-index: -1 !important;
        height: 0 !important;
        overflow: hidden !important;
      }
    `;
    document.head.appendChild(style);
  };

  const openResponsesFullscreen = () => {
    setFullscreenMode('responses');
    const style = document.createElement('style');
    style.id = 'console-fullscreen-hide-header';
    style.textContent = `
      .euiHeader,
      [data-test-subj="headerGlobalNav"],
      #globalHeaderBars,
      .osd-top-nav,
      .chrome-nav,
      .application-header,
      .kibana-header,
      .opensearch-header,
      header[role="banner"],
      .global-header,
      .top-nav,
      nav[aria-label*="primary"],
      nav[aria-label*="global"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        z-index: -1 !important;
        height: 0 !important;
        overflow: hidden !important;
      }
    `;
    document.head.appendChild(style);
  };

  const closeFullscreen = () => {
    setFullscreenMode(null);
    const injectedStyle = document.getElementById(
      'console-fullscreen-hide-header'
    );
    if (injectedStyle) {
      injectedStyle.remove();
    }
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
              backgroundColor: 'rgba(0,0,0,0.8)',
              zIndex: 999999,
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'white',
              zIndex: 1000000,
              padding: '20px',
              overflow: 'auto',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                zIndex: 1000001,
                alignItems: 'center',
              }}
            >
              <button
                onClick={closeFullscreen}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  color: '#666',
                  width: '32px',
                  height: '32px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  padding: '0',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#333';
                  e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#666';
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                title="Close fullscreen"
              >
                ✕
              </button>
            </div>

            <h2
              style={{
                margin: '0 0 20px 0',
                color: 'black',
                paddingRight: '100px',
                fontSize: '24px',
              }}
            >
              Console Response
            </h2>

            <pre
              style={{
                backgroundColor: '#f8f9fa',
                padding: '20px',
                borderRadius: '8px',
                overflow: 'auto',
                fontSize: '13px',
                color: '#212529',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                border: '1px solid #dee2e6',
                lineHeight: '1.4',
                margin: 0,
                maxHeight: 'calc(100vh - 100px)',
              }}
            >
              {props.ingestResponse}
            </pre>
          </div>
        </>
      )}

      {fullscreenMode === 'errors' && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'white',
            zIndex: 2147483647,
            padding: '60px 20px 20px 20px',
            overflow: 'auto',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              display: 'flex',
              gap: '8px',
              zIndex: 2147483647,
            }}
          >
            <button
              onClick={closeFullscreen}
              style={{
                backgroundColor: '#dc3545',
                border: '2px solid #dc3545',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                color: 'white',
                width: '40px',
                height: '40px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#c82333';
                e.currentTarget.style.borderColor = '#c82333';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#dc3545';
                e.currentTarget.style.borderColor = '#dc3545';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title="Close fullscreen"
            >
              ✕
            </button>
          </div>

          <h2
            style={{
              margin: '0 0 20px 0',
              color: 'black',
              paddingRight: '100px',
              fontSize: '24px',
            }}
          >
            Console Errors
          </h2>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              maxHeight: 'calc(100vh - 140px)',
              overflow: 'auto',
            }}
          >
            {props.errorMessages.map((errorMessage, idx) => (
              <pre
                key={idx}
                style={{
                  backgroundColor: '#fef2f2',
                  padding: '16px',
                  borderRadius: '8px',
                  overflow: 'auto',
                  fontSize: '13px',
                  color: '#dc2626',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  border: '1px solid #fecaca',
                  lineHeight: '1.4',
                  margin: 0,
                }}
              >
                {errorMessage}
              </pre>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
