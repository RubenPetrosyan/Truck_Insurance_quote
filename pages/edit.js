import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styles from '../styles/edit.module.css';

export default function EditPage() {
  const router = useRouter();
  const { dot } = router.query;
  const [row, setRow] = useState(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Define groups for compact layout (do NOT include "Submission Status")
  const groups = [
    {
      // Group 1: DOT, Phone, Cell Num
      fields: ["DOT", "Phone", "Cell Num"],
    },
    {
      // Group 2: Mailing City, Mailing State, Mailing ZIP
      fields: ["Mailing City", "Mailing State", "Mailing ZIP"],
    },
    {
      // Group 3: Email and Policy_Expiration_Date
      fields: ["Email", "Policy_Expiration_Date"],
    },
  ];

  useEffect(() => {
    if (!dot) return;
    fetch(`/api/getData?dot=${dot}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.row) {
          setRow(data.row);
        } else {
          setError("Sorry, your DOT number isn't found.");
        }
      })
      .catch(() => setError('Error fetching data'));
  }, [dot]);

  if (error) return <div className={styles.error}>{error}</div>;
  if (!row) return <div className={styles.loading}>Loading...</div>;

  // Custom message for title and header
  const customMessage = `Verify and update only Outdated Information. If everything is correct, just submit the information. :${dot}`;

  // Helper function to render an input field for a given key
  const renderField = (key, value) => {
    let inputValue = value;
    let readOnly = false;
    let inputStyle = {};
    if (key === 'DOT') {
      readOnly = true;
      inputStyle = { backgroundColor: '#f2f2f2', cursor: 'not-allowed' };
    }
    if (key.toLowerCase() === 'url') {
      inputValue = `https://truck-insurance-quote.vercel.app/view?dot=${dot}`;
      readOnly = true;
      inputStyle = { backgroundColor: '#f2f2f2', cursor: 'not-allowed' };
    }
    return (
      <div key={key} className={`${styles.field} ${styles.fieldCompact}`}>
        <label htmlFor={key}>{key}</label>
        <input
          id={key}
          name={key}
          type="text"
          defaultValue={inputValue}
          readOnly={readOnly}
          style={inputStyle}
        />
      </div>
    );
  };

  // Collect keys that are included in any group
  const groupedKeys = groups.flatMap((group) => group.fields);
  // Exclude "Submission Status" (case-insensitive) so it does not show in the edit form
  const remainingFields = Object.entries(row).filter(([key]) =>
    !groupedKeys.includes(key) && key.trim().toLowerCase() !== "submission status"
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    const updatedData = {};

    // Collect all data from inputs
    Object.entries(row).forEach(([key]) => {
      const input = e.target.elements[key];
      if (input) {
        updatedData[key] = input.value;
      }
    });

    fetch('/api/updateData', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ DOT: row.DOT, ...updatedData }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.error) {
          alert(`Error: ${result.error}`);
        } else {
          alert('Data updated successfully!');
          router.push(`/view?dot=${dot}`);
        }
      })
      .catch((err) => {
        console.error(err);
        alert('Failed to update data.');
      })
      .finally(() => setIsSaving(false));
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>{customMessage}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <main className={styles.main}>
        <h1>{customMessage}</h1>
        <div className={styles.formCard}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Render each defined group */}
            {groups.map((group, i) => (
              <div key={i} className={styles.formRow}>
                {group.fields.map((fieldKey) => {
                  if (fieldKey in row) {
                    return renderField(fieldKey, row[fieldKey]);
                  }
                  return null;
                })}
              </div>
            ))}
            {/* Render any remaining fields on their own row */}
            {remainingFields.map(([key, value]) => (
              <div key={key} className={styles.formRow}>
                {renderField(key, value)}
              </div>
            ))}
            <button type="submit" className={styles.button} disabled={isSaving}>
              {isSaving && <span className={styles.spinner}></span>}
              {isSaving ? 'Saving...' : 'Submit'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
