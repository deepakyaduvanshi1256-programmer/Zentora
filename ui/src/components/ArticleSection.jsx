const articles = [
  { image: '/images/course-79-750x750.jpg', title: 'Building a High-Impact Freelancer Profile', category: 'CAREER' },
  { image: '/images/course-09-750x750.jpg', title: 'How to Choose the Right Freelance Talent', category: 'BUSINESS' },
  { image: '/images/course-07-750x750.jpg', title: 'Winning Your First Freelance Project', category: 'GUIDE' },
];

const ArticleSection = () => (
  <section className="bg-light py-5" data-aos="fade-up" data-aos-duration="800">
    <div className="container">
      <div className="text-center mb-4">
        <h2 className="fs-3 fs-md-2 fw-bold">Latest <span className="text-primary">Articles</span></h2>
        <p className="text-secondary">Zentora insights and marketplace updates</p>
      </div>
      <div className="row g-4">
        {articles.map((article, index) => (
          <div key={article.title} className="col-12 col-sm-6 col-lg-4" data-aos="fade-up" data-aos-delay={(index + 1) * 100}>
            <article className="card shadow-sm h-100 border-0 rounded-4 transition overflow-hidden">
              <img src={article.image} className="img-fluid rounded-3 w-100" alt={article.title} />
              <div className="card-body p-4">
                <span className="badge bg-primary-subtle text-primary mb-2">{article.category}</span>
                <h3 className="h5 fw-bold">{article.title}</h3>
                <p className="text-secondary small mb-0">Practical tips to help freelancers and clients succeed.</p>
              </div>
            </article>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ArticleSection;