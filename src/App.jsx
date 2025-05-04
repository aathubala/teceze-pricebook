import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dropdown from './components/Dropdown';
import pricebook from './data/pricebook.json';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function App() {
  const [selectedMode, setSelectedMode] = useState('Project');
  const [region, setRegion] = useState('');
  const [country, setCountry] = useState('');
  const [serviceLevel, setServiceLevel] = useState('');
  const [engagementType, setEngagementType] = useState('');
  const [termLength, setTermLength] = useState('');
  const [dayLength, setDayLength] = useState('');
  const [bdResolution, setBdResolution] = useState('');
  const [ticketResolution, setTicketResolution] = useState('');
  const [additionalHours, setAdditionalHours] = useState('');
  const [visitDayType, setVisitDayType] = useState('');
  const [additionalKms, setAdditionalKms] = useState('');
  const [accessCancellationType, setAccessCancellationType] = useState('');
  const [projectMonths, setProjectMonths] = useState('');


  const navigate = useNavigate();

  const regions = [...new Set(pricebook.map(item => item.Region).filter(Boolean))];
  const countries = region
    ? [...new Set(pricebook.filter(i => i.Region === region).map(i => i.Country).filter(Boolean))]
    : [];

  const getPriceKey = () => {
    if (selectedMode === 'Project') {
      const map = {
        'L1': { 'Short Term': 'L1.2', 'Long Term': 'L1.3' },
        'L2': { 'Short Term': 'L2.3', 'Long Term': 'L2.4' },
        'L3': { 'Short Term': 'L3.3', 'Long Term': 'L3.4' },
        'L4': { 'Short Term': 'L4.1', 'Long Term': 'L4.2' },
        'L5': { 'Short Term': 'L5.1', 'Long Term': 'L5.2' }
      };
      return map[serviceLevel]?.[termLength] || null;
    }
    if (selectedMode === 'Day Visit') {
      const map = {
        'L1': { 'Half Day': 'L1.6', 'Full Day': 'L1.7' },
        'L2': { 'Half Day': 'L2.6', 'Full Day': 'L2.7' },
        'L3': { 'Half Day': 'L3.6', 'Full Day': 'L3.7' },
      };
      return map[serviceLevel]?.[dayLength] || null;
    }
    if (selectedMode === 'Dispatch Pricing') {
      const map = {
        '2 BD Resolution to site': 'BD2',
        '3 BD Resolution to site': 'BD3',
        '4 BD Resolution to site': 'BD4'
      };
      return map[bdResolution] || null;
    }
    if (selectedMode === 'Dispatch Ticket') {
      const map = {
        '2 BD Resolution to site': 'DT5',
        '3 BD Resolution to site': 'DT6',
        '9x5x4 Incident Response': 'DT1',
        '24x7x4 Response to site': 'DT2',
        'SBD Business Day Resolution to site': 'DT3',
        'NBD Resolution to site': 'DT4'
      };
      return map[ticketResolution] || null;
    }
    return null;
  };

  const matchedRow = pricebook.find(item => item.Region === region && item.Country === country);
  const priceKey = getPriceKey();
  let price = matchedRow && priceKey ? matchedRow[priceKey] : null;
  const currency = matchedRow?.Currency || '';

  // Project monthly price multiplier logic
if (selectedMode === 'Project' && price !== null && projectMonths) {
  const months = parseInt(projectMonths, 10);
  const validShort = termLength === 'Short Term' && months <= 3;
  const validLong = termLength === 'Long Term' && months >= 6;
  
  if ((validShort || validLong) && !isNaN(months)) {
    const multiplier = 1 + (0.05 * months); // 5% increase per month
    price *= multiplier;
  }
}


  // Dispatch Ticket additional hours
  if (selectedMode ==='Dispatch Ticket' && price !== null && additionalHours) {
    const hourlyRate = matchedRow?.DT_HourlyRate || 0;
    price += parseFloat(additionalHours || 0) * parseFloat(hourlyRate);
  }

  // Day Visit multiplier
  if (selectedMode === 'Day Visit' || selectedMode ==='Dispatch Ticket' || selectedMode ==='Dispatch Pricing' && price !== null) {
    if (visitDayType === 'Weekday-Out of Hours') {
      price *= 1.5;
    } else if (visitDayType === 'Weekend') {
      price *= 2;
    }
    // Additional traveled kilometers
    if (additionalKms && !isNaN(additionalKms)) {
      price += parseFloat(additionalKms) * 0.4;
    }
  }

  // Day Visit multiplier
  if (selectedMode === 'Day Visit' || selectedMode ==='Dispatch Ticket' || selectedMode ==='Dispatch Pricing' && price !== null) {
    if (accessCancellationType === 'Access denied at the visit') {
      price *= 1;
    } else if (accessCancellationType === 'Visit cancelled within 24 hours') {
      price *= 0.5;
    }
    
  }

  const exportToPDF = () => {
    const element = document.getElementById('price-summary');
    if (!element) return;
    html2canvas(element).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('teceze-price-summary.pdf');
    });
  };

  const resetForm = () => {
    setRegion('');
    setCountry('');
    setServiceLevel('');
    setEngagementType('');
    setTermLength('');
    setDayLength('');
    setBdResolution('');
    setTicketResolution('');
    setAdditionalHours('');
    setVisitDayType('');
    setAdditionalKms('');
    setAccessCancellationType('');
    setProjectMonths('');
  };

  const styles = {
    appContainer: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg,rgb(55, 167, 98),rgb(71, 149, 168))',
      backgroundImage: 'url("/background.jpg")',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '2rem',
      fontFamily: 'Arial, sans-serif'
    },
    topButtons: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      flexWrap: 'wrap',
      justifyContent: 'center'
    },
    topButton: (active) => ({
      padding: '0.6rem 1.2rem',
      fontSize: '1rem',
      backgroundColor: active ? 'green' : '#ccc',
      color: active ? 'white' : '#333',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer'
    }),
    card: {
      position: 'relative',
      backgroundColor: 'rgba(98, 194, 102, 0.95)',
      backdropFilter: 'blur(4px)',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      padding: '2rem',
      width: '100%',
      maxWidth: '600px'
    },
    heading: {
      textAlign: 'center',
      fontSize: '1.75rem',
      fontWeight: 'bold',
      marginBottom: '1.5rem',
      color: '#2c3e50'
    },
    section: {
      marginBottom: '1rem'
    },
    input: {
      width: '100%',
      padding: '0.5rem',
      fontSize: '1rem',
      borderRadius: '6px',
      border: '1px solid #ccc'
    },
    priceBox: {
      marginTop: '2rem',
      padding: '1rem',
      backgroundColor: '#e0f8e0',
      color: '#256029',
      borderRadius: '8px',
      textAlign: 'center',
      fontSize: '1.2rem',
      fontWeight: 'bold'
    },
    errorBox: {
      marginTop: '2rem',
      padding: '1rem',
      backgroundColor: '#fdecea',
      color: '#d93025',
      borderRadius: '8px',
      textAlign: 'center',
      fontSize: '1rem',
      fontWeight: 'bold'
    },
    button: {
      marginTop: '1rem',
      padding: '0.6rem 1.2rem',
      fontSize: '1rem',
      backgroundColor: 'red',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.appContainer}>
      <div style={styles.topButtons}>
        {['Project', 'Day Visit', 'Dispatch Ticket', 'Dispatch Pricing'].map((mode) => (
          <button
            key={mode}
            style={styles.topButton(selectedMode === mode)}
            onClick={() => {
              setSelectedMode(mode);
              resetForm();
            }}
          >
            {mode}
          </button>
        ))}
      </div>

      <div style={styles.card}>
        <h1 style={styles.heading}>{selectedMode} Calculator</h1>

        <div style={styles.section}>
          <Dropdown
            label="Region"
            options={regions}
            value={region}
            onChange={(e) => {
              setRegion(e.target.value);
              resetForm();
              setRegion(e.target.value);
            }}
          />
        </div>

        {region && (
          <div style={styles.section}>
            <Dropdown
              label="Country"
              options={countries}
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setServiceLevel('');
                setEngagementType('');
                setTermLength('');
                setDayLength('');
                setBdResolution('');
                setTicketResolution('');
                setAdditionalHours('');
                setVisitDayType('');
                setAdditionalKms('');
              }}
            />
          </div>
        )}

        {country && selectedMode === 'Project' && (
          <>
            <div style={styles.section}>
              <Dropdown
                label="Service Level"
                options={['L1', 'L2', 'L3', 'L4', 'L5']}
                value={serviceLevel}
                onChange={(e) => setServiceLevel(e.target.value)}
              />
            </div>
            <div style={styles.section}>
              <Dropdown
                label="Engagement Type"
                options={['With Backfill', 'Without Backfill']}
                value={engagementType}
                onChange={(e) => setEngagementType(e.target.value)}
              />
            </div>
            <div style={styles.section}>
              <Dropdown
                label="Term Length"
                options={['Short Term', 'Long Term']}
                value={termLength}
                onChange={(e) => {
                  setTermLength(e.target.value);
                  setProjectMonths(''); // reset on change
                }}
              />
            </div>

            {termLength && (
                <div style={styles.section}>
                  <label>No of months of the project</label>
                  <input
                    type="number"
                    min={termLength === 'Long Term' ? 6 : 1}
                    max={termLength === 'Short Term' ? 3 : undefined}
                    value={projectMonths}
                    onChange={(e) => setProjectMonths(e.target.value)}
                    placeholder={`Enter ${termLength === 'Short Term' ? 'up to 3' : '6 or more'} months`}
                    style={styles.input}
                  />
                </div>
              )}

          </>
        )}

        {country && selectedMode === 'Day Visit' && (
          <>
            <div style={styles.section}>
              <Dropdown
                label="Service Level"
                options={['L1', 'L2', 'L3']}
                value={serviceLevel}
                onChange={(e) => setServiceLevel(e.target.value)}
              />
            </div>
            <div style={styles.section}>
              <Dropdown
                label="Day Length"
                options={['Half Day', 'Full Day']}
                value={dayLength}
                onChange={(e) => setDayLength(e.target.value)}
              />
            </div>
            <div style={styles.section}>
              <Dropdown
                label="Specify the Visit Day"
                options={['Weekday-Business Hours', 'Weekday-Out of Hours', 'Weekend']}
                value={visitDayType}
                onChange={(e) => setVisitDayType(e.target.value)}
              />
            </div>
            <div style={styles.section}>
              <label>Additional traveled KM more than 50kms</label>
              <input
                type="number"
                min="0"
                placeholder="Enter additional kilometers"
                value={additionalKms}
                onChange={(e) => setAdditionalKms(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.section}>
              <Dropdown
                label="Access Denied / Cancellation Incidents"
                options={['Access denied at the visit', 'Visit cancelled within 24 hours']}
                value={accessCancellationType}
                onChange={(e) => setAccessCancellationType(e.target.value)}
              />
            </div>
          </>
        )}

        {country && selectedMode === 'Dispatch Pricing' && (
          <>
          <div style={styles.section}>
            <Dropdown
              label="No of BD Resolution to site"
              options={['2 BD Resolution to site', '3 BD Resolution to site', '4 BD Resolution to site']}
              value={bdResolution}
              onChange={(e) => setBdResolution(e.target.value)}
            />
          </div>
          <div style={styles.section}>
              <label>Additional traveled KM more than 50kms</label>
              <input
                type="number"
                min="0"
                placeholder="Enter additional kilometers"
                value={additionalKms}
                onChange={(e) => setAdditionalKms(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.section}>
              <Dropdown
                label="Access Denied / Cancellation Incidents"
                options={['Access denied at the visit', 'Visit cancelled within 24 hours']}
                value={accessCancellationType}
                onChange={(e) => setAccessCancellationType(e.target.value)}
              />
            </div>
          </>
        )}

        {country && selectedMode === 'Dispatch Ticket' && (
          <>
            <div style={styles.section}>
              <Dropdown
                label="Length of BD Resolution to site"
                options={[
                  '9x5x4 Incident Response',
                  '24x7x4 Response to site',
                  'SBD Business Day Resolution to site',
                  'NBD Resolution to site',
                  '2 BD Resolution to site',
                  '3 BD Resolution to site'
                ]}
                value={ticketResolution}
                onChange={(e) => setTicketResolution(e.target.value)}
              />
            </div>
            <div style={styles.section}>
              <label>Additional Hours</label>
              <input
                type="number"
                min="0"
                value={additionalHours}
                onChange={(e) => setAdditionalHours(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.section}>
              <label>Additional traveled KM more than 50kms</label>
              <input
                type="number"
                min="0"
                placeholder="Enter additional kilometers"
                value={additionalKms}
                onChange={(e) => setAdditionalKms(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.section}>
              <Dropdown
                label="Access Denied / Cancellation Incidents"
                options={['Access denied at the visit', 'Visit cancelled within 24 hours']}
                value={accessCancellationType}
                onChange={(e) => setAccessCancellationType(e.target.value)}
              />
            </div>
          </>
        )}

        {price !== undefined && price !== null && (
          <>
            <div id="price-summary" style={styles.priceBox}>
              💰 Price: {currency} {price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
              <button style={styles.button} onClick={exportToPDF}>📄 Download PDF</button>
              <button style={{ ...styles.button, backgroundColor: '#aaa' }} onClick={resetForm}>🔄 Reset Form</button>
            </div>
          </>
        )}

        {matchedRow && priceKey && price === undefined && (
          <div style={styles.errorBox}>
            ❗ Price not available for the selected combination.
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
