
import { useState } from "react";
import {
  FaLightbulb,
  FaBullseye,
  FaUsers,
  FaTimes,
  FaArrowRight,
  FaCode,
  FaPalette,
  FaPenNib,
  FaVideo,
  FaChartLine
} from "react-icons/fa";

const professions = [
  { name: "Developers", icon: FaCode },
  { name: "Designers", icon: FaPalette },
  { name: "Writers", icon: FaPenNib },
  { name: "Video Editors", icon: FaVideo },
  { name: "Marketers", icon: FaChartLine }
];

const ZentoraFounder = () => {
  const [showStory, setShowStory] = useState(false);

  return (
    <section className="zentora-founder-section py-5">
      <div className="container py-md-4">

        {/* Section Heading */}
        <div className="text-center mb-5">
          <span className="founder-eyebrow">
            THE PERSON BEHIND THE PLATFORM
          </span>

          <h2 className="founder-heading mt-3">
            The Mind Behind <span>Zentora</span>
          </h2>

          <p className="founder-subtitle">
            Every great platform starts with an idea.
          </p>
        </div>

        {/* Founder Profile */}
        <div className="row align-items-center g-5">

          <div className="col-12 col-lg-5">
            <div className="founder-image-frame">
              <img
                src="/images/deepak-yadav.jpeg"
                alt="Deepak Yadav - Founder of Zentora"
              />
            </div>
          </div>

          <div className="col-12 col-lg-7">
            <div className="founder-content">

              <span className="founder-label">
                FOUNDER & CREATOR
              </span>

              <h3 className="founder-name">
                DEEPAK YADAV
              </h3>

              <h4 className="founder-role">
                Founder & Creator of Zentora
              </h4>

              <p className="founder-quote">
                "Turning an idea into a platform where every skill
                gets an opportunity."
              </p>

              <p className="founder-description">
                Built with passion, powered by ideas, and created
                to connect every skill with opportunity.
              </p>

              <div className="d-flex flex-wrap gap-2 mt-4">
                {professions.map(({ name, icon: Icon }) => (
                  <span
                    key={name}
                    className="founder-profession-chip"
                  >
                    <Icon className="me-2" />
                    {name}
                  </span>
                ))}
              </div>

              <button
                type="button"
                className="founder-discover-btn"
                onClick={() => setShowStory(true)}
              >
                Discover Zentora
                <FaArrowRight className="ms-2" />
              </button>

            </div>
          </div>
        </div>

        {/* Interactive Story Panel */}
        {showStory && (
          <div
            className="founder-story-overlay"
            onClick={() => setShowStory(false)}
          >
            <div
              className="founder-story-panel"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="founder-story-heading"
            >

              <button
                type="button"
                className="founder-close-btn"
                onClick={() => setShowStory(false)}
                aria-label="Close story"
              >
                <FaTimes />
              </button>

              <span className="founder-label">
                OUR STORY
              </span>

              <h3
                id="founder-story-heading"
                className="founder-story-title"
              >
                One Platform.
                <span> Endless Opportunities.</span>
              </h3>

              <p className="founder-description">
                Zentora is an online freelancing marketplace that
                connects clients with talented developers,
                freelancers and professionals from different fields.
              </p>

              <div className="row g-3 mt-3">

                <div className="col-12 col-md-4">
                  <div className="founder-story-card">
                    <FaLightbulb />
                    <h5>Our Idea</h5>
                    <p>
                      Create one place where skills meet
                      opportunities.
                    </p>
                  </div>
                </div>

                <div className="col-12 col-md-4">
                  <div className="founder-story-card">
                    <FaUsers />
                    <h5>Our Platform</h5>
                    <p>
                      Help clients post projects and discover
                      talented professionals.
                    </p>
                  </div>
                </div>

                <div className="col-12 col-md-4">
                  <div className="founder-story-card">
                    <FaBullseye />
                    <h5>Our Mission</h5>
                    <p>
                      Make freelancing opportunities accessible
                      to every skill.
                    </p>
                  </div>
                </div>

              </div>

              <p className="founder-bottom-quote mt-4">
                Your Skills. Your Ideas. Your Opportunities.
              </p>

              <button
                type="button"
                className="founder-discover-btn"
                onClick={() => setShowStory(false)}
              >
                Close Story
              </button>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default ZentoraFounder;
