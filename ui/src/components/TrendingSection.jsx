import React from 'react';
import { FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const trendingProjects = [
  {
    title: 'E-Commerce Website',
    rating: '5.0/499',
    price: 'Rs.1,11,11/-',
    bids: '152 bids',
    views: '45545 views',
    image: '/images/course-04-590x430.jpg',
  },
  {
    title: 'Student ERP',
    rating: '4.5/499',
    price: 'Rs.1,12,545/-',
    bids: '25 bids',
    views: '45255 views',
    image: '/images/course-08-590x430.jpg',
  },
  {
    title: 'Health Care',
    rating: '4.3/429',
    price: 'Rs.5,56,68/-',
    bids: '229 bids',
    views: '10205 views',
    image: '/images/healthcare.jpeg',
  },
  {
    title: 'Agriculture & Farmer',
    rating: '4.5/499',
    price: 'Rs.5,11,11/-',
    bids: '58 bids',
    views: '45255 views',
    image: '/images/farmer.jpeg',
  },
];

const TrendingSection = () => {
  const navigate = useNavigate();

  const fetchBids = () => {
    navigate('/user-bids');
  };

  return (
    <div className="row py-3 trending">
      <div className="col-sm-10 mx-auto">
        <div className="webheading">
          Trending <b className="text-color1">Contracts</b>
        </div>
        <hr className="w-25 mx-auto text-color1" />

        <div className="row">
          {trendingProjects.map((project) => (
            <div key={project.title} className="col-12 col-md-6 col-lg-3 mb-3">
              <div className="card mx-auto border border-0 trendingcard neu-trending-card position-relative p-2">
                <img src={project.image} alt={project.title} className="w-100 trending-image" />
                <span className="badge bg-color-1 position-absolute trending-badge">Fixed Price</span>
                <h6 className="m-0 pt-2 trending-title">{project.title}</h6>
                <p className="m-0 trendingstar">
                  <FaStar className="text-warning" />
                  <FaStar className="text-warning" />
                  <FaStar className="text-warning" />
                  <FaStar className="text-warning" />
                  <FaStar className="text-warning" />
                  ({project.rating} ratings)
                </p>
                <p className="text-danger m-0 trendingprice">{project.price}</p>
                <div className="d-flex justify-content-between gap-2 trending-stats">
                  <span>{project.bids}</span>
                  <span>{project.views}</span>
                </div>
                <button type="button" className="py-2 rounded-pill mt-2 neu-place-bid" onClick={fetchBids}>
                  Place Bid
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendingSection;