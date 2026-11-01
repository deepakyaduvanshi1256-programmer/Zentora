
import { useState, useRef } from "react";
import {
  FaLaptopCode,
  FaMobileAlt,
  FaChartBar,
  FaBrain,
  FaShieldAlt,
  FaCloud,
  FaPalette,
  FaPaintBrush,
  FaBullhorn,
  FaPenNib,
  FaVideo,
  FaShoppingCart,
  FaBuilding,
  FaDatabase,
  FaBug,
  FaArrowRight,
  FaCode,
  FaCheckCircle
} from "react-icons/fa";

const categories = [
  {
    name: "Web Development",
    icon: FaLaptopCode,
    description: "Explore frontend, backend and full-stack web technologies.",
    items: [
      {
        name: "MERN Stack Development",
        description: "Build full-stack applications using MongoDB, Express, React and Node.js.",
        skills: ["HTML", "CSS", "JavaScript", "React.js", "Node.js", "Express.js", "MongoDB", "REST APIs", "JWT"],
        tools: ["VS Code", "Postman", "Git", "GitHub", "MongoDB Compass"]
      },
      {
        name: "Python Full Stack",
        description: "Develop complete web applications using Python backend technologies.",
        skills: ["Python", "Django", "Flask", "FastAPI", "HTML", "CSS", "JavaScript", "SQL"],
        tools: ["PyCharm", "VS Code", "Postman", "Git"]
      },
      {
        name: "Java Full Stack",
        description: "Build enterprise applications using Java and modern frontend frameworks.",
        skills: ["Core Java", "Advanced Java", "Spring Boot", "Spring MVC", "Hibernate", "React", "SQL", "REST APIs"],
        tools: ["IntelliJ IDEA", "Eclipse", "Maven", "Postman"]
      },
      {
        name: "PHP Full Stack",
        description: "Create dynamic websites and applications using PHP.",
        skills: ["PHP", "Laravel", "CodeIgniter", "MySQL", "HTML", "CSS", "JavaScript"],
        tools: ["VS Code", "XAMPP", "Composer", "phpMyAdmin"]
      },
      {
        name: ".NET Full Stack",
        description: "Develop enterprise web applications with Microsoft's .NET ecosystem.",
        skills: ["C#", "ASP.NET Core", "MVC", "Entity Framework", "SQL Server", "React"],
        tools: ["Visual Studio", "VS Code", "SQL Server"]
      },
      {
        name: "Frontend Development",
        description: "Build responsive and interactive user interfaces.",
        skills: ["HTML5", "CSS3", "JavaScript", "React", "Angular", "Vue", "Bootstrap", "Tailwind CSS"],
        tools: ["VS Code", "Figma", "Git", "Chrome DevTools"]
      },
      {
        name: "Backend Development",
        description: "Create APIs, server-side applications and business logic.",
        skills: ["Node.js", "Express.js", "Python", "Java", "PHP", "Authentication", "REST APIs"],
        tools: ["Postman", "Docker", "Git", "VS Code"]
      },
      {
        name: "WordPress Development",
        description: "Create websites, themes and plugins using WordPress.",
        skills: ["WordPress", "PHP", "WooCommerce", "Themes", "Plugins", "SEO"],
        tools: ["Elementor", "WordPress", "XAMPP"]
      }
    ]
  },
  {
    name: "App Development",
    icon: FaMobileAlt,
    description: "Explore mobile applications and cross-platform development.",
    items: [
      {
        name: "Android Development",
        description: "Create native Android applications.",
        skills: ["Kotlin", "Java", "Android SDK", "Firebase", "REST APIs"],
        tools: ["Android Studio", "Gradle", "Git"]
      },
      {
        name: "iOS Development",
        description: "Build applications for Apple devices.",
        skills: ["Swift", "SwiftUI", "UIKit", "Core Data"],
        tools: ["Xcode", "Simulator", "TestFlight"]
      },
      {
        name: "React Native",
        description: "Build cross-platform apps using React Native.",
        skills: ["JavaScript", "React Native", "Expo", "Navigation", "APIs"],
        tools: ["VS Code", "Expo", "Android Studio"]
      },
      {
        name: "Flutter Development",
        description: "Build Android and iOS apps from one codebase.",
        skills: ["Dart", "Flutter", "Widgets", "Firebase"],
        tools: ["Android Studio", "VS Code", "Flutter SDK"]
      }
    ]
  },
  {
    name: "Data Analytics & BI",
    icon: FaChartBar,
    description: "Turn raw data into insights, reports and dashboards.",
    items: [
      {
        name: "Power BI Dashboard",
        description: "Create interactive business intelligence dashboards and reports.",
        skills: ["Power BI", "DAX", "Power Query", "Data Modeling", "KPIs"],
        tools: ["Power BI Desktop", "Excel", "SQL"]
      },
      {
        name: "Excel Analytics",
        description: "Analyze data and create automated reports.",
        skills: ["Advanced Excel", "Pivot Tables", "VLOOKUP", "XLOOKUP", "Charts"],
        tools: ["Microsoft Excel", "Google Sheets"]
      },
      {
        name: "SQL & Database Analytics",
        description: "Query databases and analyze structured information.",
        skills: ["SQL", "Joins", "Subqueries", "Stored Procedures", "Data Analysis"],
        tools: ["MySQL", "PostgreSQL", "SQL Server"]
      },
      {
        name: "Python Data Analytics",
        description: "Analyze datasets using Python libraries.",
        skills: ["Python", "Pandas", "NumPy", "Matplotlib", "Statistics"],
        tools: ["Jupyter Notebook", "Google Colab", "VS Code"]
      },
      {
        name: "Tableau Dashboard",
        description: "Build visual dashboards and business reports.",
        skills: ["Tableau", "Data Visualization", "Calculated Fields", "KPIs"],
        tools: ["Tableau Desktop", "Excel", "SQL"]
      }
    ]
  },
  {
    name: "AI & Machine Learning",
    icon: FaBrain,
    description: "Explore intelligent applications and predictive systems.",
    items: [
      {
        name: "Machine Learning",
        description: "Build models that learn patterns from data.",
        skills: ["Python", "Scikit-learn", "Regression", "Classification", "Model Evaluation"],
        tools: ["Jupyter", "Google Colab", "Pandas"]
      },
      {
        name: "Deep Learning",
        description: "Develop neural network-based applications.",
        skills: ["Neural Networks", "TensorFlow", "PyTorch", "CNN", "RNN"],
        tools: ["Google Colab", "Jupyter", "Python"]
      },
      {
        name: "Generative AI",
        description: "Build applications using generative AI models.",
        skills: ["LLMs", "Prompt Engineering", "RAG", "Embeddings", "AI APIs"],
        tools: ["Python", "LangChain", "Vector Databases"]
      },
      {
        name: "AI Automation",
        description: "Automate workflows using AI-powered tools.",
        skills: ["AI Agents", "Workflow Automation", "API Integration"],
        tools: ["Python", "Automation Platforms", "AI APIs"]
      }
    ]
  },
  {
    name: "Cybersecurity",
    icon: FaShieldAlt,
    description: "Explore digital security, testing and protection.",
    items: [
      {
        name: "Ethical Hacking",
        description: "Learn authorized security testing.",
        skills: ["Networking", "Linux", "Penetration Testing", "Security Auditing"],
        tools: ["Kali Linux", "Burp Suite", "Nmap"]
      },
      {
        name: "Application Security",
        description: "Identify and prevent application vulnerabilities.",
        skills: ["OWASP", "Secure Coding", "Authentication", "API Security"],
        tools: ["Burp Suite", "OWASP ZAP"]
      },
      {
        name: "Network Security",
        description: "Protect computer networks and infrastructure.",
        skills: ["Firewalls", "Networking", "VPN", "Monitoring"],
        tools: ["Wireshark", "Security Monitoring Tools"]
      }
    ]
  },
  {
    name: "Cloud & DevOps",
    icon: FaCloud,
    description: "Build, deploy and manage scalable applications.",
    items: [
      {
        name: "AWS Cloud",
        description: "Deploy and manage cloud infrastructure.",
        skills: ["EC2", "S3", "Lambda", "IAM", "Cloud Architecture"],
        tools: ["AWS Console", "AWS CLI"]
      },
      {
        name: "Microsoft Azure",
        description: "Build and deploy applications on Azure.",
        skills: ["Azure App Services", "Azure Functions", "Storage", "Networking"],
        tools: ["Azure Portal", "Azure CLI"]
      },
      {
        name: "Docker & Containers",
        description: "Package and run applications in containers.",
        skills: ["Docker", "Images", "Containers", "Compose"],
        tools: ["Docker Desktop", "Docker Hub"]
      },
      {
        name: "CI/CD & DevOps",
        description: "Automate software build, test and deployment.",
        skills: ["CI/CD", "Git", "Linux", "Automation", "Monitoring"],
        tools: ["GitHub Actions", "Jenkins", "GitLab CI"]
      }
    ]
  },
  {
    name: "UI/UX Design",
    icon: FaPalette,
    description: "Design useful and beautiful digital experiences.",
    items: [
      {
        name: "UI Design",
        description: "Design visual interfaces for digital products.",
        skills: ["Layout", "Typography", "Color Theory", "Design Systems"],
        tools: ["Figma", "Adobe XD"]
      },
      {
        name: "UX Research",
        description: "Understand user needs and improve product experiences.",
        skills: ["User Research", "Personas", "User Journeys", "Usability Testing"],
        tools: ["Figma", "Miro"]
      },
      {
        name: "Wireframing & Prototyping",
        description: "Create product layouts and interactive prototypes.",
        skills: ["Wireframes", "Prototypes", "User Flows"],
        tools: ["Figma", "Adobe XD"]
      }
    ]
  },
  {
    name: "Graphic Design",
    icon: FaPaintBrush,
    description: "Create visual content and brand identities.",
    items: [
      {
        name: "Logo & Branding",
        description: "Build memorable brand identities.",
        skills: ["Logo Design", "Brand Guidelines", "Typography"],
        tools: ["Illustrator", "Photoshop"]
      },
      {
        name: "Social Media Design",
        description: "Design engaging social media creatives.",
        skills: ["Posts", "Banners", "Ad Creatives", "Templates"],
        tools: ["Canva", "Photoshop"]
      },
      {
        name: "Print Design",
        description: "Design brochures, posters and printed materials.",
        skills: ["Brochures", "Packaging", "Posters", "Layouts"],
        tools: ["InDesign", "Illustrator"]
      }
    ]
  },
  {
    name: "Digital Marketing",
    icon: FaBullhorn,
    description: "Grow brands, audiences and online visibility.",
    items: [
      {
        name: "SEO",
        description: "Improve website visibility in search engines.",
        skills: ["On-page SEO", "Technical SEO", "Keyword Research", "Link Building"],
        tools: ["Google Search Console", "Ahrefs", "SEMrush"]
      },
      {
        name: "Social Media Marketing",
        description: "Manage social channels and campaigns.",
        skills: ["Content Strategy", "Campaigns", "Community Management"],
        tools: ["Meta Business Suite", "Buffer"]
      },
      {
        name: "Google Ads",
        description: "Create and optimize paid advertising campaigns.",
        skills: ["PPC", "Keyword Targeting", "Conversion Tracking"],
        tools: ["Google Ads", "Analytics"]
      },
      {
        name: "Email Marketing",
        description: "Build email campaigns and customer journeys.",
        skills: ["Email Campaigns", "Automation", "Segmentation"],
        tools: ["Mailchimp", "Email Platforms"]
      }
    ]
  },
  {
    name: "Content & Writing",
    icon: FaPenNib,
    description: "Create written content for audiences and businesses.",
    items: [
      {
        name: "Blog & Article Writing",
        description: "Write useful and engaging articles.",
        skills: ["Research", "Storytelling", "SEO Writing"],
        tools: ["Google Docs", "WordPress"]
      },
      {
        name: "Copywriting",
        description: "Write persuasive content for products and brands.",
        skills: ["Sales Copy", "Landing Pages", "Ad Copy"],
        tools: ["Google Docs", "Grammarly"]
      },
      {
        name: "Technical Writing",
        description: "Create technical documentation and guides.",
        skills: ["Documentation", "API Guides", "User Manuals"],
        tools: ["Markdown", "Notion"]
      },
      {
        name: "Translation",
        description: "Translate content between languages.",
        skills: ["Translation", "Proofreading", "Localization"],
        tools: ["CAT Tools", "Document Editors"]
      }
    ]
  },
  {
    name: "Video & Animation",
    icon: FaVideo,
    description: "Create video content, animation and motion graphics.",
    items: [
      {
        name: "Video Editing",
        description: "Edit videos for creators and businesses.",
        skills: ["Editing", "Transitions", "Color Correction", "Audio"],
        tools: ["Premiere Pro", "DaVinci Resolve"]
      },
      {
        name: "Motion Graphics",
        description: "Create animated visual content.",
        skills: ["Motion Design", "Keyframes", "Animation"],
        tools: ["After Effects", "Blender"]
      },
      {
        name: "3D Animation",
        description: "Create 3D objects, scenes and animation.",
        skills: ["Modeling", "Texturing", "Rendering"],
        tools: ["Blender", "Maya"]
      }
    ]
  },
  {
    name: "E-commerce",
    icon: FaShoppingCart,
    description: "Build and manage online stores and shopping experiences.",
    items: [
      {
        name: "Shopify Development",
        description: "Create and customize Shopify stores.",
        skills: ["Shopify", "Liquid", "Store Customization"],
        tools: ["Shopify Admin", "VS Code"]
      },
      {
        name: "WooCommerce",
        description: "Build online stores using WordPress.",
        skills: ["WordPress", "WooCommerce", "PHP", "Payments"],
        tools: ["WordPress", "WooCommerce"]
      },
      {
        name: "E-commerce Management",
        description: "Manage products, orders and online operations.",
        skills: ["Product Listing", "Inventory", "Order Management"],
        tools: ["Store Admin Panels", "Excel"]
      }
    ]
  },
  {
    name: "ERP & Business Software",
    icon: FaBuilding,
    description: "Explore management systems for institutions and businesses.",
    items: [
      {
        name: "Student ERP",
        description: "Manage student information and academic activities.",
        skills: ["Student Records", "Attendance", "Fees", "Results", "Timetable"],
        tools: ["Web Applications", "Databases", "Dashboards"]
      },
      {
        name: "College ERP",
        description: "Manage college administration and campus operations.",
        skills: ["Admissions", "Faculty", "Examinations", "Fees", "Departments"],
        tools: ["Web Applications", "SQL", "Reporting"]
      },
      {
        name: "School ERP",
        description: "Manage school activities and student records.",
        skills: ["Attendance", "Timetable", "Parent Portal", "Results"],
        tools: ["Web Applications", "Databases"]
      },
      {
        name: "LMS",
        description: "Create and manage online learning platforms.",
        skills: ["Courses", "Lessons", "Quizzes", "Progress Tracking"],
        tools: ["Moodle", "Web Applications"]
      },
      {
        name: "Hospital Management",
        description: "Explore hospital and clinic management software.",
        skills: ["Appointments", "Patient Records", "Staff", "Billing"],
        tools: ["Web Applications", "Databases"]
      },
      {
        name: "HR & Payroll Software",
        description: "Manage employee information and payroll workflows.",
        skills: ["Employee Records", "Leave", "Payroll", "Recruitment"],
        tools: ["ERP Systems", "Databases"]
      },
      {
        name: "CRM & Inventory",
        description: "Manage customer relationships and stock.",
        skills: ["CRM", "Inventory", "Orders", "Reports"],
        tools: ["Business Software", "Dashboards"]
      }
    ]
  },
  {
    name: "Database & Backend",
    icon: FaDatabase,
    description: "Explore data storage, database systems and API development.",
    items: [
      {
        name: "MongoDB",
        description: "Work with document-oriented NoSQL databases.",
        skills: ["Collections", "Documents", "Aggregation", "Mongoose"],
        tools: ["MongoDB Compass", "Atlas"]
      },
      {
        name: "MySQL & PostgreSQL",
        description: "Build and manage relational databases.",
        skills: ["SQL", "Joins", "Indexes", "Database Design"],
        tools: ["MySQL Workbench", "pgAdmin"]
      },
      {
        name: "API Development",
        description: "Design and build application programming interfaces.",
        skills: ["REST APIs", "GraphQL", "Authentication", "Validation"],
        tools: ["Postman", "Swagger"]
      }
    ]
  },
  {
    name: "Software Testing & QA",
    icon: FaBug,
    description: "Improve software quality through testing and automation.",
    items: [
      {
        name: "Manual Testing",
        description: "Test software features and identify defects.",
        skills: ["Test Cases", "Bug Reporting", "Regression Testing"],
        tools: ["Jira", "Test Management Tools"]
      },
      {
        name: "Automation Testing",
        description: "Automate repetitive software tests.",
        skills: ["Selenium", "Playwright", "Cypress", "JavaScript"],
        tools: ["VS Code", "Browser Automation"]
      },
      {
        name: "Performance Testing",
        description: "Evaluate application speed and reliability.",
        skills: ["Load Testing", "Stress Testing", "Performance Analysis"],
        tools: ["JMeter", "Load Testing Tools"]
      }
    ]
  }
];

const CategorySection = () => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [activeItem, setActiveItem] = useState(0);
  const middleRef = useRef(null);
  const sidebarRef = useRef(null);
  const detailsRef = useRef(null);

  const category = categories[activeCategory];
  const selectedItem = category.items[activeItem];
  const CategoryIcon = category.icon;

  return (
    <section className="skill-explorer-section py-5">
      <div className="container py-md-4">

        <div className="skill-explorer-header mb-5">
          <div>
            <span className="skill-explorer-label">
              EXPLORE YOUR POSSIBILITIES
            </span>

            <h2>
              Find Your <span>Creative Space.</span>
            </h2>

            <p>
              Explore 15 professional categories, hundreds of skills
              and technologies, and discover what you can create.
            </p>
          </div>

          <div className="skill-explorer-count">
            <strong>15</strong>
            <span>Main Categories</span>
          </div>
        </div>

        <div className="skill-browser">

          {/* LEVEL 1: MAIN CATEGORIES */}
          <div className="skill-browser-sidebar" ref={sidebarRef}>
            <h3>Explore Categories</h3>

            {categories.map((item, index) => {
              const Icon = item.icon;

              return (
                <button
                  type="button"
                  key={item.name}
                  className={`skill-category-button ${
                    activeCategory === index ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveCategory(index);
                    setActiveItem(0);
                    if (window.innerWidth <= 575) {
                      setTimeout(() => middleRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" }), 50);
                    }
                  }}
                >
                  <Icon />
                  <span>{item.name}</span>
                  <FaArrowRight className="skill-category-arrow" />
                </button>
              );
            })}
          </div>

          {/* LEVEL 2: SPECIALIZATIONS */}
          <div className="skill-browser-middle" ref={middleRef}>
            <div className="skill-browser-title">
              <span>01 / SPECIALIZATIONS</span>
              <h3>{category.name}</h3>
              <p>{category.description}</p>

              <button
                type="button"
                className="skill-navigation-button skill-back-button"
                onClick={() => sidebarRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "nearest",
                  inline: "start"
                })}
              >
                <FaArrowRight className="skill-back-arrow" />
                Back to Explore Categories
              </button>
            </div>

            {category.items.map((item, index) => (
              <button
                type="button"
                key={item.name}
                className={`skill-specialization-button ${
                  activeItem === index ? "active" : ""
                }`}
                onClick={() => {
                  setActiveItem(index);
                  if (window.innerWidth <= 575) {
                    setTimeout(() => detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" }), 50);
                  }
                }}
              >
                <span>{item.name}</span>
                <FaArrowRight />
              </button>
            ))}
          </div>

          {/* LEVEL 3: TECHNOLOGY DETAILS */}
          <div className="skill-browser-details" ref={detailsRef}>
            <button
              type="button"
              className="skill-navigation-button skill-back-button"
              onClick={() => middleRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "start"
              })}
            >
              <FaArrowRight className="skill-back-arrow" />
              Back to Specializations
            </button>
            <div className="skill-detail-icon">
              <CategoryIcon />
            </div>

            <span className="skill-detail-label">
              02 / EXPLORE TECHNOLOGY
            </span>

            <h3>{selectedItem.name}</h3>

            <p>{selectedItem.description}</p>

            <div className="skill-detail-divider" />

            <h4>
              <FaCode /> Skills & Technologies
            </h4>

            <div className="skill-detail-tags">
              {selectedItem.skills.map((skill) => (
                <span key={skill}>
                  <FaCheckCircle />
                  {skill}
                </span>
              ))}
            </div>

            <h4 className="mt-4">Tools & Platforms</h4>

            <div className="skill-detail-tags">
              {selectedItem.tools.map((tool) => (
                <span key={tool}>{tool}</span>
              ))}
            </div>

            <div className="skill-detail-footer">
              <span>Explore your skills with Zentora</span>
              <FaArrowRight />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default CategorySection;
