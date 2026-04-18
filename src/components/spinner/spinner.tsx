export function Spinner() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh'
    }}>
      <div className="custom-spinner" />
      <style>{`
        .custom-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #E2E8F0;
          border-top: 4px solid #3B82F6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}