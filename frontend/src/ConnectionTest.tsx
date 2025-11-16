import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ConnectionTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Testing connection...');
  const [details, setDetails] = useState<any>(null);

  const testConnection = async () => {
    try {
      setStatus('Testing direct connection...');
      
      // Test direct connection
      const directResponse = await axios.get('http://localhost:5000/api/health', {
        timeout: 5000
      });
      
      setStatus('✅ Direct connection works! Testing proxy...');
      
      // Test proxy connection (relative URL)
      const proxyResponse = await axios.get('/api/health', {
        timeout: 5000
      });
      
      setStatus('✅ Both direct and proxy connections work!');
      setDetails({
        direct: directResponse.data,
        proxy: proxyResponse.data
      });
      
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        setStatus('❌ Connection refused - Backend not running on port 5000');
      } else if (error.message.includes('Network Error')) {
        setStatus('❌ Network error - CORS issue or backend down');
      } else if (error.response) {
        setStatus(`❌ Server error: ${error.response.status}`);
      } else {
        setStatus(`❌ Error: ${error.message}`);
      }
      console.error('Connection test failed:', error);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1>🔧 Connection Debugger</h1>
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        margin: '20px auto',
        maxWidth: '600px'
      }}>
        <h2>Status: {status}</h2>
        
        <button 
          onClick={testConnection}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            margin: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Retest Connection
        </button>

        {details && (
          <div style={{ textAlign: 'left', marginTop: '20px' }}>
            <h3>Connection Details:</h3>
            <pre style={{ 
              background: '#f8f9fa', 
              padding: '15px', 
              borderRadius: '5px',
              overflow: 'auto'
            }}>
              {JSON.stringify(details, null, 2)}
            </pre>
          </div>
        )}

        <div style={{ marginTop: '30px', textAlign: 'left' }}>
          <h3>Debug Information:</h3>
          <ul>
            <li><strong>Frontend URL:</strong> {window.location.href}</li>
            <li><strong>Backend URL:</strong> http://localhost:5000</li>
            <li><strong>Using Proxy:</strong> Yes (configured in package.json)</li>
            <li><strong>React Version:</strong> {React.version}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTest;
