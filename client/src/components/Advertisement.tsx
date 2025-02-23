import React from 'react';
import '../App.css';

const Advertisement: React.FC = () => {
  return (
    <section className="section services">
      <div className="container">
        <div className="row gx-5 mt-12 items-center lg:mt-0">
          <div className="lg:col-7 lg:order-2">
            <div className="video pb-5 pr-9">
              <div className="video-thumbnail overflow-hidden rounded-2xl">
                <img className="w-full object-contain" src="images/advertisement.png" alt="Intro Thumbnail" />
              </div>
              <div className="video-player absolute left-0 top-0 z-10 hidden h-full w-full">
                <iframe className="h-full w-full" allowFullScreen src="blob:https://minilessonsacademy.com/df74cef7-7fc0-4f79-9e89-9710f31ef586" title="Video" />
              </div>
              {/* <img className="intro-shape absolute bottom-0 right-0 -z-[1]" src="images/shape.svg" alt="Shape" /> */}
            </div>
          </div>
          <div className="mt-6 lg:col-5 lg:order-1 lg:mt-0">
            <div className="text-container">
              <h2 className="lg:text-4xl">Better. Faster. Easier.
              </h2>
              <p className="mt-4 text-[24px] text-primary font-bold">
                Create and monetize complete courses easily with AI, with images, text and more, all in under 60 seconds.
              </p>
              <p className='mt-4'>If you're an educator, coach, or entrepreneur, let Mini Lessons instantly create your courses for you with AI.
                Our platform creates complete courses with engaging content and visuals that captivate your audience. Create faster, teach better, and grow your reach with ease.
              </p>
              <button className="btn btn-white mt-6">Know about us</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Advertisement;
