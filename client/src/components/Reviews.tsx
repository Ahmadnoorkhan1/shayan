import React from 'react';
import '../App.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { REVIEWSDATA } from '../utilities/data/Reviews';

const Reviews: React.FC = () => {
  return (
    <section className="reviews">
      <div className="container">
        <div className="row justify-between">
          <div className="lg:col-6">
            <h2>Our customers have nice things to say about us</h2>
          </div>
          <div className="lg:col-4">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi egestas
              Werat viverra id et aliquet. vulputate egestas sollicitudin .
            </p>
          </div>
        </div>
        <div className="row mt-10">
          <div className="col-12">
            <Swiper
              spaceBetween={50}
              onSlideChange={() => console.log('slide change')}
              onSwiper={(swiper) => console.log(swiper)}
              pagination={true}
              breakpoints={{
                768:{
                  slidesPerView:3,
                },
                640:{
                  slidesPerView:2,
                },
                0:{
                  slidesPerView:1,
                }
              }}
            >
              {
                REVIEWSDATA.map((review: any, index: number) => {
                  return (
                    <SwiperSlide key={index}>
                      <div className="review">
                        <div className="review-author-avatar bg-gradient rounded-t-lg p-3">
                          <img src={review.image} alt={review.name} />
                        </div>
                        <h4 className="my-2">{review.name}</h4>
                        <p className="mb-4 text-[#666]">{review.organization}</p>
                        <p>
                          {review.description}
                        </p>
                        <div className="review-rating mt-6 flex items-center justify-center space-x-2.5">
                          {
                            Array.from({ length: 5 }, (_, i) =>
                            (
                              <img key={i} src={i < review.rating ? "images/icons/star.svg" : "images/icons/star-white.svg"} alt="star" />
                            ))
                          }
                        </div>
                      </div>
                    </SwiperSlide>
                  )
                })
              }
              <div className="swiper-pagination reviews-carousel-pagination !bottom-0"></div>

            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
