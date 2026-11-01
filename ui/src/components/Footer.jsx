import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="container-fluid bg-dark text-white pt-5 pb-3">
    <div className="container">
      <div className="row g-4">
        <div className="col-12 col-md-6 col-lg-3">
          <h2 className="h4 fw-bold">
            <i className="bi bi-check2-circle text-primary me-2" />
            Zentora
          </h2>
          <p className="text-white-50">
            Where Talent Meets Opportunity. Connect, collaborate, and grow with
            a trusted freelance marketplace.
          </p>
          <div className="d-flex gap-3 fs-4">
            <a href="#" aria-label="Facebook" className="text-white-50">
              <i className="bi bi-facebook" />
            </a>
            <a href="#" aria-label="LinkedIn" className="text-white-50">
              <i className="bi bi-linkedin" />
            </a>
            <a href="#" aria-label="Instagram" className="text-white-50">
              <i className="bi bi-instagram" />
            </a>
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <h3 className="h5">Quick Links</h3>
          {[
            ["Home", "/"],
            ["Projects", "/user-projects"],
            ["Pricing", "/pricing"],
            ["Login", "/login"],
            ["Register", "/register"],
          ].map(([text, to]) => (
            <Link
              key={to}
              to={to}
              className="d-block text-decoration-none text-white-50 mb-2 footer-link"
            >
              {text}
            </Link>
          ))}
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <h3 className="h5">Categories</h3>
          {[
            "Web Development",
            "Graphic Design",
            "Content Writing",
            "Mobile Apps",
            "Business Consulting",
          ].map((item) => (
            <span key={item} className="d-block text-white-50 mb-2">
              {item}
            </span>
          ))}
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <h3 className="h5">Contact</h3>
          <a
            href="mailto:deepakyaduvanshi12@gmail.com"
            className="d-block text-decoration-none text-white-50 mb-2"
          >
            <i className="bi bi-envelope me-2" />
            deepakyaduvanshi1256@gmail.com
          </a>
          <a
            href="tel:+919044792856"
            className="d-block text-decoration-none text-white-50"
          >
            <i className="bi bi-telephone me-2" />
            +91 9044792856
          </a>
        </div>
      </div>
      <div className="border-top border-secondary mt-4 pt-3 text-center text-white-50 small">
        © {new Date().getFullYear()} Zentora. All rights reserved.<br />
        Created and Designed by <strong>Er. Deepak Yadav</strong> · +91 9044792856 · deepakyaduvanshi1256@gmail.com
      </div>
    </div>
  </footer>
);

export default Footer;
