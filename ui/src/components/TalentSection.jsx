const talent = [
  ['Sadhana Yadav', 'UI/UX Designer', '/images/team-01.webp'], ['Er. Deepak Yadav', 'Web Developer', '/images/team-02.webp'],
  ['Veena Singh', 'Software Developer', '/images/team-03.webp'], ['Er. Abhishek Nishad', 'Web Developer', '/images/team-04.webp'],
];

const TalentSection = () => (
  <section className="container py-5" data-aos="fade-up" data-aos-duration="800">
    <div className="text-center mb-4">
      <h2 className="fs-3 fs-md-2 fw-bold">Top <span className="text-primary">Talent</span></h2>
      <p className="text-secondary">Featured freelancers on Zentora</p>
    </div>
    <div className="row g-4 justify-content-center">
      {talent.map(([name, role, image], index) => (
        <div key={name} className="col-12 col-sm-6 col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay={index * 100}>
          <div className="card shadow-sm h-100 border-0 rounded-4 transition text-center">
            <div className="card-body p-4"><img src={image} alt={name} className="img-fluid rounded-3 w-100 mb-3" /><h3 className="h5 mb-1">{name}</h3><p className="text-primary mb-0">{role}</p></div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default TalentSection;