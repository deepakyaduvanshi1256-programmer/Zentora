import { FaCheckCircle } from 'react-icons/fa';

const benefits = ['Expert freelancers', 'Safe escrow payments', '24/7 priority support'];

const TrustedSection = () => (
  <section className="bg-light py-5" data-aos="fade-up" data-aos-duration="800">
    <div className="container py-md-3">
      <div className="text-center mb-4">
        <h2 className="fs-3 fs-md-2 fw-bold">Trusted by <span className="text-primary">Teams</span></h2>
        <div className="mx-auto border-top border-primary border-3 mt-3" style={{ width: '70px' }} />
      </div>
      <div className="row align-items-center g-4">
        <div className="col-12 col-lg-6">
          <img src="/images/about-01.webp" alt="Teams working together with Zentora" className="img-fluid rounded-4 shadow-sm w-100" />
        </div>
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4 p-md-5">
              <h3 className="h4 fw-bold mb-3">A secure platform built for great work</h3>
              <p className="text-secondary">Zentora brings clients and talented professionals together in one transparent marketplace, making it easier to collaborate, communicate, and deliver outstanding results.</p>
              {benefits.map((benefit) => <p key={benefit} className="mb-2"><FaCheckCircle className="text-primary me-2" />{benefit}</p>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default TrustedSection;