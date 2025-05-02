import React from 'react';

function Dropdown({ label, options, value, onChange }) {
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      marginBottom: '1rem',
    },
    label: {
      marginBottom: '0.5rem',
      fontWeight: 'bold',
      color: '#333',
    },
    select: {
      padding: '0.5rem 0.75rem',
      fontSize: '1rem',
      borderRadius: '6px',
      border: '1px solid #ccc',
      outline: 'none',
      backgroundColor: '#fff',
      transition: 'border-color 0.2s',
    },
  };

  return (
    <div style={styles.container}>
      <label style={styles.label}>{label}</label>
      <select style={styles.select} value={value} onChange={onChange}>
        <option value="">-- Select {label} --</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Dropdown;
