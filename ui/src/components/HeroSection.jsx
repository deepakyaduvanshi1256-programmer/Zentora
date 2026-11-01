import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";

const words = ["Work with talented experts", "Find projects you love", "Build your dream team", "Grow with Zentora"];

const HeroSection = () => {
  const navigate = useNavigate();
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[wordIndex];
    const delay = deleting ? 45 : text === word ? 1300 : 75;
    const timer = window.setTimeout(() => {
      if (!deleting && text === word) { setDeleting(true); return; }
      if (deleting && text === "") { setDeleting(false); setWordIndex((wordIndex + 1) % words.length); return; }
      setText(deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1));
    }, delay);
    return () => window.clearTimeout(timer);
  }, [text, deleting, wordIndex]);

  return (
    <section className="hero-neu-section overflow-hidden" data-aos="fade-up" data-aos-duration="800">
      <div className="container py-5">
        <div className="row align-items-center g-5">
          <div className="col-12 col-lg-6">
            <span className="hero-neu-eyebrow">India's trusted freelance marketplace</span>
            <h1 className="hero-neu-title mt-4">Where Talent <span>Meets Opportunity</span></h1>
            <div className="hero-typewriter" aria-live="polite">{text}<span className="hero-cursor">|</span></div>
            <p className="hero-neu-copy">Connect with skilled professionals, discover meaningful projects, and build successful partnerships.</p>
            <div className="d-flex flex-column flex-sm-row gap-3">
              <button type="button" onClick={() => navigate(isLoggedIn() ? "/user-projects" : "/login", { state: { redirectTo: "/user-projects" } })} className="hero-neu-button hero-neu-button-primary border-0"><i className="bi bi-grid-fill me-2"></i>Browse Projects</button>
              <Link to="/register" className="hero-neu-button"><i className="bi bi-person-plus-fill me-2"></i>Join Zentora</Link>
            </div>
          </div>
          <div className="col-12 col-lg-6 text-center">
            <div className="hero-neu-image-wrap"><img src="/images/girl-1.webp" alt="Freelance professional using Zentora" /></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;