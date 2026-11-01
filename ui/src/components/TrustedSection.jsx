
import {
  FaCheckCircle,
  FaHeartbeat,
  FaLaptopCode,
  FaGraduationCap,
  FaBalanceScale,
  FaPalette,
  FaBuilding,
  FaMoneyBillWave,
  FaShoppingCart,
  FaHardHat,
  FaTractor,
  FaPlane,
  FaTruck,
  FaUsers,
  FaBullhorn,
  FaHome,
  FaFlask,
  FaGlobe,
  FaTools
} from "react-icons/fa";

const benefits = [
  "Connect clients with skilled professionals",
  "Discover opportunities across industries",
  "Post projects and receive professional bids"
];

const worlds = [
  {
    icon: FaHeartbeat,
    name: "Healthcare World",
    description: "Doctors, clinics, hospitals, nurses and health professionals"
  },
  {
    icon: FaLaptopCode,
    name: "Technology World",
    description: "Developers, engineers, programmers, IT experts and startups"
  },
  {
    icon: FaGraduationCap,
    name: "Education & Learning World",
    description: "Teachers, mentors, tutors, students and educational institutions"
  },
  {
    icon: FaGraduationCap,
    name: "Student & College ERP World",
    description: "Student ERP, College ERP, School ERP, attendance, examination and campus management professionals"
  },
  {
    icon: FaBalanceScale,
    name: "Professional World",
    description: "Lawyers, legal experts, consultants and business advisors"
  },
  {
    icon: FaPalette,
    name: "Creative World",
    description: "Artists, graphic designers, UI/UX designers and content creators"
  },
  {
    icon: FaBuilding,
    name: "Business World",
    description: "Entrepreneurs, companies, founders and business teams"
  },
  {
    icon: FaMoneyBillWave,
    name: "Finance World",
    description: "Accountants, financial analysts, tax consultants and auditors"
  },
  {
    icon: FaShoppingCart,
    name: "E-commerce & Retail",
    description: "Online stores, sellers, product managers and retail businesses"
  },
  {
    icon: FaHardHat,
    name: "Engineering & Construction",
    description: "Civil engineers, architects, contractors and construction experts"
  },
  {
    icon: FaTractor,
    name: "Agriculture World",
    description: "Farmers, agricultural experts, agritech and food businesses"
  },
  {
    icon: FaPlane,
    name: "Travel & Hospitality",
    description: "Travel agents, hotels, tourism and hospitality professionals"
  },
  {
    icon: FaTruck,
    name: "Logistics World",
    description: "Transport, delivery, supply chain and warehouse professionals"
  },
  {
    icon: FaUsers,
    name: "HR & Recruitment World",
    description: "Recruiters, HR managers, talent acquisition and career experts"
  },
  {
    icon: FaBullhorn,
    name: "Marketing & Media World",
    description: "Digital marketers, SEO experts, advertisers and social media managers"
  },
  {
    icon: FaHome,
    name: "Home & Personal Services",
    description: "Interior designers, repair experts and service professionals"
  },
  {
    icon: FaFlask,
    name: "Science & Research World",
    description: "Researchers, scientists, laboratories and data specialists"
  },
  {
    icon: FaGlobe,
    name: "NGO & Social Impact World",
    description: "NGOs, social workers, community projects and non-profit teams"
  },
  {
    icon: FaTools,
    name: "Skilled Services World",
    description: "Technicians, electricians, mechanics and skilled workers"
  }
];

const TrustedSection = () => (
  <section
    className="zentora-ecosystem-section py-5"
    data-aos="fade-up"
    data-aos-duration="800"
  >
    <div className="container py-md-4">

      {/* Heading */}
      <div className="text-center mb-5">
        <span className="ecosystem-eyebrow">
          ONE PLATFORM, MANY POSSIBILITIES
        </span>

        <h2 className="ecosystem-heading mt-3">
          Trusted by <span>Teams</span>
        </h2>

        <p className="ecosystem-subtitle">
          Connecting people, professions, businesses and opportunities.
        </p>
      </div>

      {/* Existing Trusted Content */}
      <div className="row align-items-center g-4 mb-5">

        <div className="col-12 col-lg-6">
          <img
            src="/images/about-01.webp"
            alt="Teams working together with Zentora"
            className="img-fluid rounded-4 shadow-sm w-100"
          />
        </div>

        <div className="col-12 col-lg-6">
          <div className="ecosystem-intro-card">
            <h3>A Connected Ecosystem for Every Profession</h3>

            <p>
              Zentora brings clients and talented professionals together
              through one online marketplace. Whether you are a developer,
              teacher, designer, consultant or business owner, your skills
              can connect you with new opportunities.
            </p>

            {benefits.map((benefit) => (
              <p key={benefit} className="mb-2">
                <FaCheckCircle className="text-primary me-2" />
                {benefit}
              </p>
            ))}
          </div>
        </div>

      </div>

      {/* Professional Worlds */}
      <div className="text-center mb-4">
        <span className="ecosystem-eyebrow">
          EXPLORE OUR CONNECTED WORLDS
        </span>

        <h3 className="ecosystem-world-heading mt-3">
          Every Industry. <span>Every Skill.</span>
        </h3>

        <p className="ecosystem-subtitle">
          Different professions. One connected ecosystem.
        </p>
      </div>

      <div className="row g-3 g-md-4">
        {worlds.map(({ icon: WorldIcon, name, description }) => (
          <div
            className="col-12 col-sm-6 col-lg-4"
            key={name}
          >
            <div className="ecosystem-world-card h-100">
              <div className="ecosystem-world-icon">
                <WorldIcon />
              </div>

              <h4>{name}</h4>

              <p>{description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Final Message */}
      <div className="ecosystem-final-message text-center mt-5">
        <h3>
          Different Professions.
          <span> One Connected Ecosystem.</span>
        </h3>

        <p>
          Your Skills. Your Ideas. Your Opportunities.
        </p>
      </div>

    </div>
  </section>
);

export default TrustedSection;
