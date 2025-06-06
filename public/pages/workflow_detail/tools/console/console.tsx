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

/**
 * Console Component - Displays workflow errors and responses with fullscreen capability
 *
 * IMPLEMENTATION NOTES & DEBUGGING HISTORY:
 * ========================================
 *
 * FULLSCREEN CHALLENGES ENCOUNTERED:
 * 1. Theme Detection Issues:
 *    - Initial problem: Theme detection ran at component initialization, but fullscreen
 *      rendered later when theme might be different
 *    - Solution: Moved theme detection to runtime function getThemeColors()
 *    - Why: Ensures correct colors are detected when fullscreen actually opens
 *
 * 2. EUI Component Limitations:
 *    - Tried EuiFlyout: Slides in from side, not true fullscreen
 *    - Tried EuiModal: Creates grey header bars, doesn't cover entire viewport
 *    - Solution: Custom positioned divs with manual styling
 *    - Why: Only way to achieve true browser-wide fullscreen coverage
 *
 * 3. Close Button Styling Problems:
 *    - Tried <button>: Inherited EUI button styles (backgrounds, borders, fixed sizes)
 *    - Tried CSS overrides with !important: Still had residual styling
 *    - Solution: Used <span> element instead of <button>
 *    - Why: Span has no default styling, behaves exactly like text
 *
 * 4. Header/Navigation Interference:
 *    - Problem: Navigation elements appeared above fullscreen (z-index conflicts)
 *    - Tried higher z-index values: Didn't work, navigation still visible
 *    - Solution: Temporarily hide headers with CSS injection
 *    - Why: Non-destructive, preserves React component state, easily reversible
 *
 * 5. Color Inconsistency Between Modes:
 *    - Problem: X button had opposite colors (black bg in light mode, white bg in dark mode)
 *    - Root cause: Theme detection was cached at component mount, not updated at render
 *    - Solution: Runtime theme detection in getThemeColors() called on each render
 *    - Why: Ensures accurate theme detection when fullscreen actually opens
 *
 * DESIGN DECISIONS:
 * ================
 *
 * Theme Detection Strategy:
 * - Uses computed body text color to detect dark/light mode
 * - Logic: Light text (RGB > 150) = dark mode, Dark text (RGB < 150) = light mode
 * - Alternative approaches considered: CSS classes, media queries, localStorage
 * - Chosen approach works universally across different applications/frameworks
 *
 * Header Hiding Approach:
 * - Injects temporary <style> tag to hide navigation elements
 * - Targets multiple selectors: header, nav, .euiHeader (broad compatibility)
 * - Removes style tag on close to restore navigation
 * - Alternative: Direct DOM manipulation (rejected - breaks React, loses state)
 *
 * Fullscreen Layout:
 * - Two separate containers: one for content, one for close button
 * - Content starts at top-left (marginTop: 0) for maximum space usage
 * - Close button in separate overlay to avoid layout interference
 * - Alternative: Single container (rejected - positioning conflicts)
 *
 * Close Button Implementation:
 * - Uses <span> instead of <button> to avoid all default button styling
 * - Positioned with separate container for reliable top-right placement
 * - Color matches theme text color for consistency
 * - Alternative: Styled button (rejected - too many style overrides needed)
 */
export function Console(props: ConsoleProps) {
  const hasErrors = props.errorMessages?.length > 0;
  const hasIngestResponse = !isEmpty(props.ingestResponse);
  const hasAnyContent = hasErrors || hasIngestResponse;

  // State for fullscreen modes
  const [fullscreenMode, setFullscreenMode] = useState<
    'errors' | 'responses' | null
  >(null);

  /**
   * Runtime Theme Detection Function
   *
   * WHY RUNTIME DETECTION:
   * - Initial implementation used theme detection at component mount
   * - Problem: Fullscreen renders later, theme might change between mount and fullscreen
   * - Solution: Detect theme when fullscreen actually opens
   *
   * HOW IT WORKS:
   * - Reads computed body text color using getComputedStyle
   * - Extracts RGB values and checks first value (red component)
   * - Logic: RGB > 150 = light text = dark mode, RGB < 150 = dark text = light mode
   *
   * RETURN VALUES:
   * - backgroundColor: Dark background for dark mode, white for light mode
   * - textColor: White text for dark mode, black text for light mode
   * - isDarkMode: Boolean flag for conditional logic
   */
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
  // Called on each render to ensure accurate theme detection
  const themeColors = getThemeColors();

  /**
   * Header Hiding Utilities
   *
   * WHY CSS INJECTION INSTEAD OF DOM MANIPULATION:
   * - DOM removal: Destroys elements permanently, breaks React, loses state
   * - CSS classes: Requires predefined styles, less flexible
   * - CSS injection: Non-destructive, reversible, preserves component state
   *
   * TARGETED SELECTORS:
   * - header: HTML5 semantic headers
   * - nav: Navigation elements
   * - .euiHeader: EUI framework specific header
   * - Simple selectors chosen for broad compatibility across different applications
   *
   * PROCESS:
   * 1. hideHeader(): Creates <style> tag with display:none rules, injects into <head>
   * 2. showHeader(): Finds and removes the injected <style> tag
   * 3. Headers instantly reappear when style is removed
   */
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

  /**
   * Fullscreen Control Functions
   *
   * WORKFLOW:
   * 1. Set fullscreen mode state (triggers React re-render)
   * 2. Hide headers to prevent navigation interference
   * 3. React renders fullscreen JSX based on state
   *
   * STATE MANAGEMENT:
   * - 'errors': Shows error fullscreen
   * - 'responses': Shows response fullscreen
   * - null: Normal view, no fullscreen
   */
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

  // Early return for empty state
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
      {/* 
        MAIN CONSOLE INTERFACE 
        Standard EUI layout with accordion sections for errors and responses
      */}
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
          {/* ERROR SECTION */}
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
                      {/* Fullscreen button for errors */}
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

          {/* RESPONSE SECTION */}
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
                      {/* Fullscreen button for responses */}
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

      {/* 
        FULLSCREEN OVERLAY FOR RESPONSES
        
        DESIGN DECISIONS:
        - Two separate containers: content + close button
        - Reason: Prevents layout conflicts between text positioning and button positioning
        - Content container: Full viewport coverage with padding for readability
        - Button container: Separate overlay for reliable top-right positioning
        
        STYLING APPROACH:
        - Uses custom CSS instead of EUI components for true fullscreen control
        - Theme-aware colors from runtime detection
        - Pure text display (marginTop: 0) for maximum content space
      */}
      {fullscreenMode === 'responses' && (
        <>
          {/* Main fullscreen content container */}
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
            {/* 
              Pure text display - no margins to maximize space usage
              Uses <pre> to preserve formatting and line breaks
            */}
            <pre
              style={{
                marginTop: '0px', // Start at very top for maximum space
                fontFamily: 'monospace',
                fontSize: '14px',
                lineHeight: '1.4',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                color: 'inherit', // Inherit from parent container
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

          {/* 
            CLOSE BUTTON OVERLAY
            
            IMPLEMENTATION NOTES:
            - Separate container prevents interference with content layout
            - Uses <span> instead of <button> to avoid default button styling
            - Maximum z-index ensures visibility above all other elements
            - Color matches theme text color for consistency
            
            WHY SPAN INSTEAD OF BUTTON:
            - <button>: Inherits EUI framework styles (backgrounds, borders, padding)
            - CSS overrides: Complex and often incomplete
            - <span>: No default styling, behaves exactly like text
            - Event handling: onClick works the same on span as button
          */}
          <div
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 2147483647, // Maximum z-index for visibility
            }}
          >
            <span
              onClick={closeFullscreen}
              style={{
                color: themeColors.textColor, // Match theme text color
                fontSize: '24px',
                cursor: 'pointer',
                userSelect: 'none', // Prevent text selection
                display: 'block',
              }}
              title="Close fullscreen"
            >
              ✕
            </span>
          </div>
        </>
      )}

      {/* 
        FULLSCREEN OVERLAY FOR ERRORS
        
        IDENTICAL IMPLEMENTATION TO RESPONSES:
        - Same dual-container approach
        - Same theme-aware styling
        - Same close button implementation
        - Different content: Maps through error messages instead of single response
      */}
      {fullscreenMode === 'errors' && (
        <>
          {/* Main fullscreen content container */}
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
            {/* 
              Error messages display
              Maps through errorMessages array to show multiple errors
            */}
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
                    margin: '0 0 16px 0', // Small margin between errors
                    outline: 'none',
                  }}
                >
                  {errorMessage}
                </pre>
              ))}
            </div>
          </div>

          {/* Close button overlay - identical to responses */}
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
