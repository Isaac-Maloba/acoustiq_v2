import React, { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend, FiClock } from 'react-icons/fi';
import '../css/InfoPages.css';

const Contact = () => {
    const [form,    setForm]    = useState({ name: '', email: '', subject: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    // No backend for contact form — shows a thank-you message on submit
    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };

    const contactItems = [
        {
            icon:  <FiMail size={18} />,
            label: 'Email',
            value: 'isaaccmaloba@gmail.com',
            href:  'mailto:isaaccmaloba@gmail.com'
        },
        {
            icon:  <FiPhone size={18} />,
            label: 'Phone / WhatsApp',
            value: '+254 119 043 365',
            href:  'tel:+254119043365'
        },
        {
            icon:  <FiMapPin size={18} />,
            label: 'Location',
            value: 'Nairobi, Kenya',
            href:  null
        },
        {
            icon:  <FiClock size={18} />,
            label: 'Hours',
            value: 'Mon – Sat, 9 am – 6 pm EAT',
            href:  null
        },
    ];

    return (
        <div className="info-page">

            {/* ── HERO ── */}
            <div className="info-hero">
                <div className="info-hero-tag">Get in Touch</div>
                <h1 className="info-hero-title">We'd love to <em>hear from you</em></h1>
                <p className="info-hero-sub">
                    Have a question about an order, a product, or just want to talk music?
                    Reach out — we usually respond within a few hours.
                </p>
            </div>

            <div className="info-divider" />

            <div className="contact-layout">

                {/* ── CONTACT DETAILS ── */}
                <div className="contact-details">
                    <h2 className="contact-section-title">Contact Details</h2>
                    {contactItems.map((item, i) => (
                        <div key={i} className="contact-item">
                            <div className="contact-item-icon">{item.icon}</div>
                            <div>
                                <div className="contact-item-label">{item.label}</div>
                                {item.href
                                    ? <a href={item.href} className="contact-item-value">{item.value}</a>
                                    : <div className="contact-item-value">{item.value}</div>
                                }
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── CONTACT FORM ── */}
                <div className="contact-form-card">
                    <h2 className="contact-section-title">Send a Message</h2>

                    {submitted ? (
                        <div className="contact-thanks">
                            <div className="contact-thanks-icon"><FiSend size={24} /></div>
                            <h3>Message sent!</h3>
                            <p>Thanks for reaching out. We'll get back to you shortly.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-row-2">
                                <div className="form-group">
                                    <label className="form-label">Your Name</label>
                                    <input
                                        className="form-control"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Isaac Maloba"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <input
                                        className="form-control"
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="maloba@example.com"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Subject</label>
                                <input
                                    className="form-control"
                                    name="subject"
                                    value={form.subject}
                                    onChange={handleChange}
                                    placeholder="Order enquiry, product question..."
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Message</label>
                                <textarea
                                    className="form-control"
                                    name="message"
                                    value={form.message}
                                    onChange={handleChange}
                                    rows={5}
                                    placeholder="Tell us how we can help..."
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-ice w-full" style={{ padding: '12px' }}>
                                <FiSend size={14} /> Send Message
                            </button>
                        </form>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Contact;