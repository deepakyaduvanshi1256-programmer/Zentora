import { useNavigate } from "react-router-dom";
import { IoCheckmarkOutline } from "react-icons/io5";
import { isLoggedIn } from "../utils/auth";

const plans = [
  {
    name: "Starter",
    price: "₹0",
    credits: 10,
    description: "For new freelancers getting started",
    button: "Start Free",
  },
  {
    name: "Professional",
    price: "₹499",
    credits: 50,
    description: "Best for active freelancers",
    button: "Get Pro Plan",
  },
  {
    name: "Advance",
    price: "₹1499",
    credits: 150,
    description: "For power users and small agencies",
    button: "Get Advance Plan",
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  return (
    <section
      className="container py-5 neu-pricing-section"
      data-aos="fade-up"
      data-aos-duration="800"
    >
      <div className="text-center mb-4">
        <h2 className="fs-3 fs-md-2 fw-bold">
          Freelancer <span className="text-primary">Plans</span>
        </h2>
        <h3 className="h5">Buy credits. Place bids. Win projects.</h3>
        <p className="text-secondary mx-auto" style={{ maxWidth: "760px" }}>
          Choose monthly credits and start bidding. Clients post projects for
          free; plans are for freelancers.
        </p>
      </div>
      <div className="row g-4 align-items-stretch">
        {plans.map((plan, index) => (
          <div
            key={plan.name}
            className="col-12 col-sm-6 col-lg-4"
            data-aos="fade-up"
            data-aos-delay={index * 100}
          >
            <div
              className={`neu-pricing-card card h-100 border-0 ${index === 1 ? "neu-pricing-featured" : ""}`}
            >
              <div className="card-body p-4 d-flex flex-column">
                <span className="fw-bold text-primary">{plan.name}</span>
                <div className="h2 fw-bold mt-2">
                  {plan.price}
                  <small className="fs-6 text-secondary fw-normal">
                    {" "}
                    / month
                  </small>
                </div>
                <p className="text-secondary">{plan.description}</p>
                {[
                  "Browse all open projects",
                  "Basic profile and portfolio",
                  "Priority bid visibility",
                  "Bid analytics dashboard",
                ]
                  .slice(0, index + 2)
                  .map((feature) => (
                    <p key={feature} className="mb-2">
                      <IoCheckmarkOutline className="text-primary me-2" />
                      {feature}
                    </p>
                  ))}
                <button
                  type="button"
                  className="neu-pricing-button btn btn-lg rounded-pill mt-auto"
                  onClick={() => navigate(isLoggedIn() ? "/user-plans" : "/login", { state: { plan: plan.name } })}
                >
                  {plan.button}
                </button>
                <small className="text-center text-secondary mt-3">
                  {plan.credits} credits · 1 credit per bid
                </small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Pricing;
