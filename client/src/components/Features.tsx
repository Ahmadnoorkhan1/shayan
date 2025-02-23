import React from 'react';
import '../App.css';

const Features: React.FC = () => {
  const features = [
    { title: 'Live Caption', description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit.', icon: 'feature-icon-1.svg' },
    { title: 'Smart Reply', description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit.', icon: 'feature-icon-2.svg' },
    { title: 'Sound Amplifier', description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit.', icon: 'feature-icon-3.svg' },
    { title: 'Gesture Navigation', description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit.', icon: 'feature-icon-4.svg' },
    { title: 'Dark Theme', description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit.', icon: 'feature-icon-5.svg' },
    { title: 'Privacy Controls', description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit.', icon: 'feature-icon-6.svg' },
    { title: 'Location Controls', description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit.', icon: 'feature-icon-7.svg' },
    { title: 'Security Updates', description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit.', icon: 'feature-icon-8.svg' },
    { title: 'Focus Mode', description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit.', icon: 'feature-icon-9.svg' },
    { title: 'Family Link', description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit.', icon: 'feature-icon-10.svg' },
  ];

  return (
    <section className="section key-feature relative">
      <img
        className="absolute left-0 top-0 -z-[1] -translate-y-1/2"
        src="images/icons/feature-shape.svg"
        alt=""
      />
      <div className="container">
        <div className="row justify-between text-center lg:text-start">
          <div className="lg:col-5">
            <h2>The Highlighting Part Of Our Features</h2>
          </div>
          <div className="mt-6 lg:col-5 lg:mt-0">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi egestas
              Werat viverra id et aliquet. vulputate egestas sollicitudin .
            </p>
          </div>
        </div>
        <div className="key-feature-grid mt-10 grid grid-cols-2 gap-7 md:grid-cols-3 xl:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col justify-between rounded-lg bg-white p-5 shadow-lg"
            >
              <div>
                <h3 className="h4 text-xl lg:text-2xl">{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
              <span className="icon mt-4">
                <img
                  className="objec-contain"
                  src={`images/icons/${feature.icon}`}
                  alt={feature.title}
                />
              </span>
            </div>
          ))}
        </div>
      </div>
      
    </section>
  );
};

export default Features;
