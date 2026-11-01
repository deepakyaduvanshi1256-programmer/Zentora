import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";

const Contact = () => {
  const [showSuccess, setShowSuccess] = useState(false);

  const [sending, setSending] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    setSending(true);
    try {
      const response = await axiosInstance.post("/contact", payload);
      if (response?.data?.success) {
        form.reset();
        setShowSuccess(true);
      }
    } catch (error) {
      window.alert(error.response?.data?.message || "Unable to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      className="neu-contact-section py-5"
      data-aos="fade-up"
      data-aos-duration="800"
    >
      <div className="container">
        <div className="text-center mb-4">
          <h2 className="fs-3 fs-md-2 fw-bold">
            Contact <span className="text-primary">Us</span>
          </h2>
          <p className="text-secondary">Have a question? Send us a message.</p>
        </div>
        {showSuccess && (
          <div
            className="alert alert-success alert-dismissible fade show"
            role="alert"
          >
            Message Saved! We will contact you soon.
            <button
              type="button"
              className="btn-close"
              onClick={() => setShowSuccess(false)}
              aria-label="Close"
            />
          </div>
        )}
        <div className="row g-4">
          <div className="col-12 col-md-6">
            <div className="neu-contact-card card p-4 border-0 h-100">
              <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-12">
                  <label className="form-label" htmlFor="name">
                    Name
                  </label>
                  <input
                    className="form-control"
                    id="name"
                    name="name"
                    required
                  />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label" htmlFor="email">
                    Email
                  </label>
                  <input
                    className="form-control"
                    id="email"
                    name="email"
                    type="email"
                    required
                  />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label" htmlFor="phone">
                    Phone
                  </label>
                  <input
                    className="form-control"
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="message">
                    Message
                  </label>
                  <textarea
                    className="form-control"
                    id="message"
                    name="message"
                    rows="5"
                    required
                  />
                </div>
                <div className="col-12">
                  <button
                    type="submit"
                    disabled={sending}
                    className="btn btn-primary btn-lg rounded-pill shadow-sm px-4"
                  >
                    {sending ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="neu-contact-card neu-contact-info card p-4 border-0 h-100 text-white">
              <div className="card-body">
                <h3 className="h4 fw-bold">Get in touch</h3>
                <p>
                  Our team is ready to help with your Zentora account and
                  projects.
                </p>
                <p className="mb-3">
                  <i className="bi bi-envelope-fill me-2" />
                  <a
                    className="text-white text-decoration-none"
                    href="mailto:deepakyaduvanshi12@gmail.com"
                  >
                    deepakyaduvanshi1256@gmail.com
                  </a>
                </p>
                <p>
                  <i className="bi bi-telephone-fill me-2" />
                  <a
                    className="text-white text-decoration-none"
                    href="tel:+919044792856"
                  >
                    +91 9044792856
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
