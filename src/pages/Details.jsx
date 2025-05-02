import { useLocation, useNavigate } from 'react-router-dom';
import pricebook from '../data/pricebook.json';

function Details() {
  const location = useLocation();
  const navigate = useNavigate();
  const { region, country } = location.state || {};

  const matchedRow = pricebook.find(
    item => item.Region === region && item.Country === country
  );

  const serviceKeys = ['L1', 'L2', 'L3', 'L4', 'L5'];
  const priceKeys = {
    L1: ['L1.2', 'L1.3'],
    L2: ['L2.3', 'L2.4'],
    L3: ['L3.3', 'L3.4'],
    L4: ['L4.1', 'L4.2'],
    L5: ['L5.1', 'L5.2'],
  };

  const labels = {
    'L1.2': 'L1 - Short Term',
    'L1.3': 'L1 - Long Term',
    'L2.3': 'L2 - Short Term',
    'L2.4': 'L2 - Long Term',
    'L3.3': 'L3 - Short Term',
    'L3.4': 'L3 - Long Term',
    'L4.1': 'L4 - Short Term',
    'L4.2': 'L4 - Long Term',
    'L5.1': 'L5 - Short Term',
    'L5.2': 'L5 - Long Term',
  };

  if (!matchedRow) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
        <h2>No data found for selected Region and Country.</h2>
        <button onClick={() => navigate('/')}>⬅️ Go Back</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1rem' }}>
        📊 Pricing Details - {region}, {country}
      </h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Service</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Price</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(priceKeys).flatMap(([level, keys]) =>
            keys.map((key) => (
              <tr key={key}>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
                  {labels[key]}
                </td>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
                  {matchedRow[key] ? `${matchedRow.Currency} ${matchedRow[key].toLocaleString()}` : '—'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <button
        onClick={() => navigate('/')}
        style={{
          marginTop: '2rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#2d6cdf',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        ⬅️ Back to Calculator
      </button>
    </div>
  );
}

export default Details;
