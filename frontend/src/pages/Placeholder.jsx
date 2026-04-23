import React from 'react';
const Placeholder = ({ title }) => (
  <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
    <h2>{title}</h2>
    <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Esta sección está en desarrollo y será habilitada próximamente.</p>
  </div>
);
export default Placeholder;