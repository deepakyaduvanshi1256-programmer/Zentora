import { FaBriefcase, FaChartBar, FaChartLine, FaLaptopCode, FaLayerGroup, FaMobileAlt, FaPalette, FaPenNib, FaVideo } from 'react-icons/fa';

const categories = [
  { name: 'Web & Software Dev', icon: FaLaptopCode }, { name: 'Graphic Design', icon: FaPalette },
  { name: 'Content Writing', icon: FaPenNib }, { name: 'SEO & Marketing', icon: FaChartLine },
  { name: 'Mobile App Dev', icon: FaMobileAlt }, { name: 'Data Analytics', icon: FaChartBar },
  { name: 'UI/UX Design', icon: FaLayerGroup }, { name: 'Video Editing', icon: FaVideo },
  { name: 'Business Consulting', icon: FaBriefcase },
];

const CategorySection = () => (
  <section className="container py-5" data-aos="fade-up" data-aos-duration="800">
    <div className="text-center mb-4">
      <h2 className="fs-3 fs-md-2 fw-bold">Browse Talent <span className="text-primary">By Category</span></h2>
      <div className="mx-auto border-top border-primary border-3 mt-3" style={{ width: '70px' }} />
    </div>
    <div className="row g-3 g-md-4">
      {categories.map(({ name, icon: CategoryIcon }, index) => (
        <div key={name} className="col-12 col-sm-6 col-lg-4" data-aos="fade-up" data-aos-delay={index * 50}>
          <div className="card shadow-sm h-100 border-0 rounded-4 transition">
            <div className="card-body d-flex align-items-center gap-3 p-4">
              <span className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary" style={{ width: '52px', height: '52px', flex: '0 0 52px' }}><CategoryIcon className="fs-4" /></span>
              <h3 className="h6 fw-semibold mb-0">{name}</h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default CategorySection;