import { useState } from 'react';
import { message } from 'antd';
import { API_ROOT } from '../site/media';

export default function Contact() {
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const values = {
      name: form.name.value,
      email: form.email.value,
      feedback: form.feedback.value,
    };
    if (values.name.length < 2 || values.feedback.length < 10) {
      message.error('Please complete the form with a longer message.');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${API_ROOT}feedbacksub.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to submit');
      message.success(data.message || 'Thank you. The office will contact you soon.');
      form.reset();
    } catch (err) {
      message.error(err.message || 'Could not send the message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <header className="page-hero">
        <p className="kicker">Office</p>
        <h1>Contact us</h1>
      </header>
      <section className="section contact-grid">
        <div>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.7, maxWidth: '28rem' }}>
            Questions about admissions, programs or a campus visit? Write to the college office.
            Hours: Monday–Saturday, 8:00 AM – 3:00 PM.
          </p>
          <p style={{ marginTop: '1.6rem', color: '#5b6b82', lineHeight: 1.8 }}>
            Near Harichand Bazar, Peshawar Road, Pakistan
            <br />
            <a href="tel:+921234567890">+92 123 4567890</a>
            <br />
            <a href="mailto:info@apexcollege.edu.pk">info@apexcollege.edu.pk</a>
          </p>
        </div>
        <form className="form-stack" onSubmit={onSubmit}>
          <label>
            Full name
            <input name="name" required minLength={2} />
          </label>
          <label>
            Email
            <input name="email" type="email" required />
          </label>
          <label>
            Message
            <textarea name="feedback" required minLength={10} maxLength={500} />
          </label>
          <button className="btn-gold" type="submit" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send message'}
          </button>
        </form>
      </section>
    </div>
  );
}
