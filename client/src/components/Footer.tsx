import React from 'react';
import '../App.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer bg-theme-light/50">
      <div className="container">
        <div className="row gx-5 pb-10 pt-[52px]">
          <div className="col-12 mt-12 md:col-6 lg:col-3">
            <a href="index.html" className='flex items-center gap-2'>
              <img src="/images/logo.png" height="30" width="40" alt="logo" />
              <span className='lg:text-[24px] text-lg font-bold text-[#650AAA]'>Mini Lessons Academy</span>
            </a>
            <p className="mt-6">
              Lorem ipsum dolor sit sed dmi amet, consectetur adipiscing. Cdo
              tellus, sed condimentum volutpat.
            </p>
          </div>
          <div className="col-12 mt-12 md:col-6 lg:col-3">
            <h6>Socials</h6>
            <p>themefisher@gmail.com</p>
            <ul className="social-icons mt-4 lg:mt-6">
              <li>
                <a href="#">
                  <img src="/images/icons/facebook.svg" alt="Facebook" width="24" height="21" />
                </a>
              </li>
              <li>
                <a href="#">
                  <img src="/images/icons/twitter.svg" alt="Twitter" width="24" height="15" />
                </a>
              </li>
              <li>
                <a href="#">
                  <img src="/images/icons/linkedin.svg" alt="LinkedIn" width="24" height="16" />
                </a>
              </li>
              <li>
                <a href="#">
                  <img src="/images/icons/pinterest-colored.svg" alt="Instagram" width="24" height="18" />
                </a>
              </li>
            </ul>
          </div>
          <div className="col-12 mt-12 md:col-6 lg:col-3">
            <h6>Quick Links</h6>
            <ul>
              <li>
                <a href="about.html">About</a>
              </li>
              <li>
                <a href="#">Category</a>
              </li>
              <li>
                <a href="#">Testimonial</a>
              </li>
              <li>
                <a href="contact.html">Contact</a>
              </li>
            </ul>
          </div>
          <div className="col-12 mt-12 md:col-6 lg:col-3">
            <h6>Location & Contact</h6>
            <p>2118 Thornridge Cir. Syracuse, Connecticut 35624</p>
            <p>(704) 555-0127</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
