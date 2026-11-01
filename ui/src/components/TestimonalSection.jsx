import { FaStar } from "react-icons/fa";

const testimonials = [
  {
    name: "Er. Deepak Yadav",
    role: "Software Engineer",
    image: "/images/testimonial-04.jpg",
    text: "Zentora made finding reliable freelance opportunities simple and helped me communicate with clients without unnecessary delays.",
  },
  {
    name: "Er. Sadhana Yadav",
    role: "Software Engineer",
    image: "/images/testimonial-03.png",
    text: "A clean and professional platform that makes hiring skilled talent faster, more transparent, and easier to manage.",
  },
];

const TestimonalSection = () => (
  <section className="bg-light py-5" data-aos="fade-up" data-aos-duration="800">
    <div className="container">
      <div className="text-center mb-4">
        <h2 className="fs-3 fs-md-2 fw-bold">
          Our <span className="text-primary">Testimonials</span>
        </h2>
      </div>
      <div className="row align-items-center g-4">
        <div className="col-12 col-lg-5">
          <span className="badge bg-primary-subtle text-primary mb-2">
            COMMUNITY STORIES
          </span>
          <h3 className="fw-bold mb-3">What our Zentora community says</h3>
          <p className="text-secondary">
            See why freelancers and businesses choose Zentora for secure
            collaboration, clear communication, and lasting professional
            partnerships.
          </p>
        </div>
        {testimonials.map((item, index) => (
          <div
            key={item.name}
            className="col-12 col-md-6 col-lg-3"
            data-aos="fade-up"
            data-aos-delay={(index + 1) * 100}
          >
            <div className="card shadow-sm h-100 border-0 rounded-4 transition p-2">
              <div className="card-body text-center">
                <img
                  src={item.image}
                  alt={item.name}
                  className="img-fluid rounded-circle mb-3"
                  style={{ width: "90px", height: "90px", objectFit: "cover" }}
                />
                <div className="text-warning mb-2">
                  {Array.from({ length: 5 }).map((_, star) => (
                    <FaStar key={star} />
                  ))}
                </div>
                <p className="small text-secondary">{item.text}</p>
                <h3 className="h6 mb-1">{item.name}</h3>
                <p className="small text-primary mb-0">{item.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonalSection;
