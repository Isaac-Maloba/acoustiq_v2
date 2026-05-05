import React from 'react';
import { FiPackage, FiTruck, FiMapPin, FiClock, FiAlertCircle } from 'react-icons/fi';
import '../css/InfoPages.css';

const zones = [
    {
        zone:      'Nairobi CBD & Westlands',
        timeframe: '1 – 2 business days',
        cost:      'KES 200',
    },
    {
        zone:      'Nairobi suburbs (Kasarani, Karen, Kitengela, etc.)',
        timeframe: '1 – 3 business days',
        cost:      'KES 300',
    },
    {
        zone:      'Mombasa, Kisumu, Nakuru',
        timeframe: '2 – 4 business days',
        cost:      'KES 500',
    },
    {
        zone:      'Other towns within Kenya',
        timeframe: '3 – 5 business days',
        cost:      'KES 600 – 800',
    },
    {
        zone:      'Remote areas (arid/semi-arid regions)',
        timeframe: '5 – 7 business days',
        cost:      'Quoted on request',
    },
];

const steps = [
    {
        icon:  <FiPackage size={20} />,
        title: 'Order Confirmed',
        body:  'You complete M-Pesa payment and receive an SMS confirmation. Your order enters our fulfilment queue.'
    },
    {
        icon:  <FiClock size={20} />,
        title: 'Processing',
        body:  'We inspect and package your item carefully. Orders placed before 2 pm EAT are processed same day.'
    },
    {
        icon:  <FiTruck size={20} />,
        title: 'Dispatched',
        body:  'Your order is handed to our courier partner. You will receive a tracking reference via SMS or email.'
    },
    {
        icon:  <FiMapPin size={20} />,
        title: 'Delivered',
        body:  'Your item arrives at your door. Large or fragile items (e.g. drum kits, pianos) may require a signature.'
    },
];

const ShippingInfo = () => (
    <div className="info-page">

        {/* ── HERO ── */}
        <div className="info-hero">
            <div className="info-hero-tag">Delivery</div>
            <h1 className="info-hero-title">Shipping <em>Information</em></h1>
            <p className="info-hero-sub">
                We deliver nationwide across Kenya. Here's everything you need to
                know about how and when your order will arrive.
            </p>
        </div>

        <div className="info-divider" />

        <div className="info-prose-wrapper">

            {/* ── HOW IT WORKS ── */}
            <h2 className="info-section-heading">How it works</h2>
            <div className="shipping-steps">
                {steps.map((step, i) => (
                    <div
                        key={i}
                        className="shipping-step"
                        style={{
                            display: 'flex',
                            flexDirection: 'row',      /* ← force horizontal */
                            alignItems: 'center',
                            gap: '16px',
                            marginBottom: '24px',
                        }}
                    >
                        <div
                            className="shipping-step-icon"
                            style={{
                                flexShrink: 0,
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                background: 'var(--bg-surface2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid var(--border)',
                            }}
                        >
                            {step.icon}
                        </div>
                        <div
                            className="shipping-step-connector"
                            style={{ display: 'none' }} /* hide if it forces vertical */
                        />
                        <div className="shipping-step-body" style={{ flex: 1, minWidth: 0 }}>
                            <h4 style={{ margin: '0 0 4px', wordBreak: 'normal' }}>{step.title}</h4>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>{step.body}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="info-divider" />

            {/* ── DELIVERY ZONES ── */}
            <h2 className="info-section-heading">Delivery zones & rates</h2>
            <div className="shipping-table-wrapper">
                <table className="shipping-table">
                    <thead>
                        <tr>
                            <th>Zone</th>
                            <th>Estimated Delivery</th>
                            <th>Shipping Fee</th>
                        </tr>
                    </thead>
                    <tbody>
                        {zones.map((z, i) => (
                            <tr key={i}>
                                <td>{z.zone}</td>
                                <td>{z.timeframe}</td>
                                <td className="shipping-cost">{z.cost}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="info-divider" />

            {/* ── NOTES ── */}
            <h2 className="info-section-heading">Important notes</h2>
            <div className="shipping-notes">
                {[
                    'Delivery timeframes are estimates and may be affected by public holidays, adverse weather, or courier delays.',
                    'Fragile items (e.g. violins, acoustic guitars) are shipped with extra protective packaging at no additional cost.',
                    'Large items such as drum kits, keyboards, and studio monitors may require additional handling time.',
                    'Acoustiq is not liable for delays caused by the courier once the item has been dispatched.',
                    // Updated email address
                    'If your item has not arrived within the estimated window, contact us at isaaccmaloba@gmail.com and we will follow up with the courier.',
                ].map((note, i) => (
                    <div key={i} className="shipping-note-item">
                        <FiAlertCircle size={14} className="shipping-note-icon" />
                        <span>{note}</span>
                    </div>
                ))}
            </div>

        </div>
    </div>
);

export default ShippingInfo;