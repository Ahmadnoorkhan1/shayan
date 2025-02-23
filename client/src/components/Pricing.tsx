import { PRICING } from "../utilities/data/Pricing";

const Pricing = () => {
  return (
    <>
      <img
        className="floating-bubble-1 absolute right-0 top-0 -z-[1]"
        src="images/floating-bubble-1.svg"
        alt=""
      />
      <img
        className="floating-bubble-2 absolute left-0 top-[387px] -z-[1]"
        src="images/floating-bubble-2.svg"
        alt=""
      />
      <img
        className="floating-bubble-3 absolute right-0 top-[605px] -z-[1]"
        src="images/floating-bubble-3.svg"
        alt=""
      />

      <section className="page-hero py-16">
        <div className="container">
          <div className="text-center">
            <ul className="breadcrumb inline-flex h-8 items-center justify-center space-x-2 rounded-3xl bg-theme-light px-4 py-2">
              <li className="leading-none text-dark">
                <a className="inline-flex items-center text-primary" href="#">
                  <svg
                    className="mr-1.5"
                    width="15"
                    height="15"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.1769 15.0588H10.3533V9.41178H5.64744V15.0588H2.82391V6.58825H1.88274V16H14.118V6.58825H13.1769V15.0588ZM6.58862 15.0588V10.353H9.41215V15.0588H6.58862ZM15.8084 6.09225L15.2512 6.85178L8.00038 1.52472L0.749559 6.8499L0.192383 6.09131L8.00038 0.357666L15.8084 6.09225Z"
                      fill="black"
                    />
                  </svg>
                  <span className="text-sm leading-none">Home</span>
                </a>
              </li>
              <li className="leading-none text-dark">
                <span className="text-sm leading-none">/ Pricing</span>
              </li>
            </ul>
          </div>
          <div className="page-hero-content mx-auto max-w-[768px] text-center">
            <h1 className="mb-5 mt-8">Choose A Plan</h1>
            <p>
              Upgrade Anytime <span className="font-bold text-primary">Subscribe annually to get 2 Months Free</span>
            </p>
          </div>
        </div>
      </section>

      <section className="section mt-12 pt-0">
        <div className="container">
          <div className="flex gap-3 lg:px-10 md:flex-nowrap flex-wrap ">
            {PRICING &&
              PRICING.length &&
              PRICING.map((item: any) => {
                return (
                  <div className="flex">
                    <PricingCard data={item} />;
                  </div>
                );
              })}
          </div>
        </div>
      </section>
    </>
  );
};

const PricingCard = (props: any) => {
  console.log("are we even here?");
  return (
    <div className="flex flex-col justify-between h-full rounded-xl bg-white px-8 py-10 shadow-lg transform transition-all duration-300 hover:scale-105">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="h3">{props?.data?.plan}</h2>
            <p className="mt-3 text-2xl text-dark">{props?.data?.pricing}</p>
          </div>
          <span
            className={`inline-flex h-16 w-16 items-center justify-center rounded-full bg-theme-light ${
              props?.data?.featured ? "" : "hidden"
            }`}
          >
            <img
              src="images/icons/star.svg"
              alt=""
              className={props?.data?.featured ? "" : "hidden"}
            />
          </span>
        </div>
        <p className="mt-6">{props?.data?.subtitle}</p>
        <div className="my-6 border-y border-border py-6">
          <h4 className="h6">What's included?</h4>
          <ul className="mt-6 space-y-3">
            {props?.data?.included &&
              props?.data?.included.length &&
              props?.data?.included.map((item: any, index: number) => (
                <li className="flex items-center text-sm" key={index}>
                  <svg
                    className="mr-2.5"
                    width="16"
                    height="13"
                    viewBox="0 0 16 13"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 5.42857L6.36364 10L14 2"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  {item}
                </li>
              ))}
          </ul>
        </div>
        <div className="my-6 border-y border-border py-6">
          <h4 className="h6">Key Features</h4>
          <ul className="mt-6 space-y-3">
            {props?.data?.keyFeatures &&
              props?.data?.keyFeatures.length &&
              props?.data?.keyFeatures.map((item: any, index: number) => (
                <li className="flex items-center text-sm" key={index}>
                  <svg
                    className="mr-2.5"
                    width="16"
                    height="13"
                    viewBox="0 0 16 13"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 5.42857L6.36364 10L14 2"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  {item}
                </li>
              ))}
          </ul>
        </div>
      </div>
      <div className="text-center mt-8">
        <a
          className="btn btn-outline-white block h-[48px] w-full rounded-[50px] leading-[30px]"
          href="#"
        >
          Buy now
        </a>
        <a className="mt-6 inline-flex items-center text-dark" href="#">
          Start Free trial
          <svg
            className="ml-1.5"
            width="13"
            height="16"
            viewBox="0 0 13 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.7071 8.70711C13.0976 8.31658 13.0976 7.68342 12.7071 7.29289L6.34315 0.928932C5.95262 0.538408 5.31946 0.538408 4.92893 0.928932C4.53841 1.31946 4.53841 1.95262 4.92893 2.34315L10.5858 8L4.92893 13.6569C4.53841 14.0474 4.53841 14.6805 4.92893 15.0711C5.31946 15.4616 5.95262 15.4616 6.34315 15.0711L12.7071 8.70711ZM0 9H12V7H0V9Z"
              fill="currentColor"
            />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default Pricing;
