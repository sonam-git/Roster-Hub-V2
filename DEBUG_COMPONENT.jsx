// TEMPORARY DEBUG COMPONENT
// Add this to GameFeedback/index.jsx temporarily to diagnose the issue

import React, { useEffect } from "react";

const FeedbackDebugPanel = ({ gameId, currentOrganization, variables }) => {
  useEffect(() => {
    console.log("=== FEEDBACK DEBUG INFO ===");
    console.log("Game ID:", gameId);
    console.log("Current Organization:", currentOrganization);
    console.log("Organization ID:", currentOrganization?._id);
    console.log("Variables that will be sent:", variables);
    console.log("========================");
  }, [gameId, currentOrganization, variables]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(0,0,0,0.9)',
      color: 'lime',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '400px',
      fontFamily: 'monospace'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '10px', color: 'yellow' }}>
        🐛 Feedback Debug Panel
      </div>
      <div><strong>Game ID:</strong> {gameId || '❌ Missing'}</div>
      <div><strong>Org ID:</strong> {currentOrganization?._id || '❌ Missing'}</div>
      <div><strong>Org Name:</strong> {currentOrganization?.name || '❌ Missing'}</div>
      <div style={{ marginTop: '10px', borderTop: '1px solid #444', paddingTop: '10px' }}>
        <strong>Variables to send:</strong>
        <pre style={{ margin: '5px 0', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {variables ? JSON.stringify(variables, null, 2) : '❌ No variables'}
        </pre>
      </div>
    </div>
  );
};

// HOW TO USE:
// 1. Import this component in GameFeedback/index.jsx:
//    import FeedbackDebugPanel from './FeedbackDebugPanel';
//
// 2. Add state to track the variables:
//    const [debugVariables, setDebugVariables] = useState(null);
//
// 3. Update handleSubmit to set debug variables:
//    const variables = { 
//      gameId, 
//      comment: comment.trim(), 
//      rating,
//      organizationId: currentOrganization._id
//    };
//    setDebugVariables(variables); // Add this line
//
// 4. Add the debug panel before the closing div of GameFeedback:
//    <FeedbackDebugPanel 
//      gameId={gameId} 
//      currentOrganization={currentOrganization}
//      variables={debugVariables}
//    />
//
// 5. Try to submit feedback and check the debug panel
//
// 6. REMOVE THIS COMPONENT after debugging!

export default FeedbackDebugPanel;
