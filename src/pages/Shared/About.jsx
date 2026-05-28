import React from 'react';
import { useNavigate } from 'react-router-dom';
import PublicTopBar from '../../components/PublicTopBar';
import '../../styles/About.css';
import { FiTarget, FiShield, FiTrendingUp, FiLayers, FiUsers, FiCpu } from 'react-icons/fi';
import { MdOutlineLocalPharmacy } from 'react-icons/md';

export default function About() {
  const navigate = useNavigate();
  const features = [
    {
      icon: <FiTarget />,
      title: "Seamless Distribution",
      desc: "Medistro bridges the gap between medicine distributors and pharmacies with a unified digital platform."
    },
    {
      icon: <FiShield />,
      title: "Secure Transactions",
      desc: "Bank-grade security ensures all orders, invoices, and user data are protected with the latest encryption."
    },
    {
      icon: <FiTrendingUp />,
      title: "Real-time Analytics",
      desc: "Make data-driven decisions with real-time tracking of sales, inventory levels, and market trends."
    },
    {
      icon: <FiLayers />,
      title: "Inventory Management",
      desc: "Smart stock management for distributors with automatic low-stock alerts and expiration tracking."
    },
    {
      icon: <FiUsers />,
      title: "Multi-role Access",
      desc: "Tailored experiences for Admin, Distributor, Pharmacy, and Employee roles with specific permissions."
    },
    {
      icon: <FiCpu />,
      title: "Smart Automation",
      desc: "Automated invoicing, order confirmation, and reporting to reduce manual errors and save time."
    }
  ];

  return (
    <div className="about-page">
      <PublicTopBar />
      
      <main className="about-content">
        {/* Hero Section */}
        <section className="about-hero">
          <div className="about-container">
            <div className="about-badge">Empowering Healthcare Supply Chains</div>
            <h1>Revolutionizing Medicine <span className="text-gradient">Distribution</span></h1>
            <p>
              Medistro is a professional, enterprise-grade platform designed to streamline 
              the pharmaceutical supply chain. We empower pharmacies and distributors 
              to work together more efficiently through technology.
            </p>
          </div>
        </section>

        {/* Vision Section */}
        <section className="about-vision">
          <div className="about-container">
            <div className="about-vision-grid">
              <div className="about-vision-text">
                <h2>Our Vision</h2>
                <p>
                  We envision a world where essential medicines are always available where they are needed most. 
                  By digitizing the traditional distribution model, we eliminate bottlenecks, 
                  reduce waste, and ensure a steady supply of healthcare products.
                </p>
                <div className="about-stats">
                  <div className="about-stat">
                    <span className="stat-num">100%</span>
                    <span className="stat-label">Secure</span>
                  </div>
                  <div className="about-stat">
                    <span className="stat-num">24/7</span>
                    <span className="stat-label">Available</span>
                  </div>
                  <div className="about-stat">
                    <span className="stat-num">Real-time</span>
                    <span className="stat-label">Updates</span>
                  </div>
                </div>
              </div>
              <div className="about-vision-image">
                <div className="vision-card">
                  <div className="vision-card-icon"><MdOutlineLocalPharmacy /></div>
                  <h3>Medistro Core</h3>
                  <p>The heartbeat of your pharmacy business.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="about-features-section">
          <div className="about-container">
            <div className="section-header">
              <h2>Powerful Features</h2>
              <p>Everything you need to manage your pharmaceutical distribution business in one place.</p>
            </div>
            <div className="about-features-grid">
              {features.map((f, i) => (
                <div key={i} className="about-feature-card">
                  <div className="feature-icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="about-cta">
          <div className="about-container">
            <div className="cta-card">
              <h2>Ready to transform your business?</h2>
              <p>Join hundreds of pharmacies and distributors already using Medistro.</p>
              <div className="cta-buttons">
                <a href="/register" className="btn btn-primary btn-lg">Get Started Now</a>
                <a href="/login" className="btn btn-secondary btn-lg">Sign In</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="about-footer">
        <div className="about-container">
          <p
            style={{ cursor: 'default', userSelect: 'none' }}
            onClick={() => navigate('/admin-login')}
            title=""
          >
            &copy; 2026 Medistro Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
