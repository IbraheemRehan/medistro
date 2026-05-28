import React from 'react';
import { FiStar } from 'react-icons/fi';

export default function RatingsDashboardCard({ summary, loading, receivedLabel = 'From' }) {
  if (loading) {
    return (
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-body" style={{ textAlign: 'center', padding: 32, color: 'var(--gray-500)' }}>
          Loading ratings…
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const { averageRating, reviewCount, received = [] } = summary;

  return (
    <div className="card" style={{ marginTop: 24 }}>
      <div className="card-header">
        <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiStar color="#fbbf24" /> Ratings &amp; Feedback
        </span>
      </div>
      <div className="card-body">
        <div style={{ display: 'flex', gap: 24, marginBottom: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#fbbf24' }}>
              ★ {Number(averageRating || 0).toFixed(1)}
            </div>
            <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>
              Average rating ({reviewCount || 0} review{(reviewCount || 0) !== 1 ? 's' : ''})
            </div>
          </div>
        </div>

        {received.length === 0 ? (
          <p style={{ fontSize: 14, color: 'var(--gray-500)', margin: 0 }}>No feedback received yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 280, overflowY: 'auto' }}>
            {received.slice(0, 10).map((r, i) => (
              <div
                key={r.orderId || i}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  border: '1px solid var(--gray-200)',
                  background: 'var(--gray-50, #f9fafb)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>
                    {receivedLabel}: {r.from}
                  </span>
                  <span style={{ color: '#fbbf24', fontWeight: 700 }}>★ {r.rating}</span>
                </div>
                {r.feedback && (
                  <p style={{ fontSize: 13, color: 'var(--gray-600)', margin: '8px 0 0', lineHeight: 1.4 }}>
                    {r.feedback}
                  </p>
                )}
                <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 6 }}>
                  {r.date ? new Date(r.date).toLocaleDateString() : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
