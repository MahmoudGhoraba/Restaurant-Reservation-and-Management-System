export const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-grid">
            <div className="footer-section">
              <h3>Restaurant Management</h3>
              <p>
                Your one-stop solution for restaurant reservations and management.
              </p>
            </div>
            <div className="footer-section">
              <h3>Quick Links</h3>
              <ul>
                <li><a href="/menu">Menu</a></li>
                <li><a href="/reservations">Reservations</a></li>
                <li><a href="/about">About</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Contact</h3>
              <p>
                Email: info@restaurant.com<br />
                Phone: (555) 123-4567
              </p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Restaurant Management System. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
