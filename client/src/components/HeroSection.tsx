import '../App.css'
const HeroSection = () => {
  return (
    <section className="section banner relative">
      <div className="container">
        <div className="row items-center">
          <div className="lg:col-6">
            <h1 className="banner-title">
              ✨ Your Next Bestseller Created in 60 Seconds
            </h1>
            <p className="mt-6 text-primary font-bold">
              Turn Your Ideas into Profitable Courses in Minutes.
            </p>
            <button className="btn btn-white mt-6">Free Trail</button>
          </div>
          <div className="lg:col-6">
            {/* ADD A VIDEO TAG HERE ILL GIVE YOU THE BLOB TO SHOW */}
          </div>
        </div>
      </div>
      <img
        className="banner-shape absolute -top-28 right-0 -z-[1] w-full max-w-[30%]"
        src="images/banner-shape.svg"
        alt=""
      />
    </section>
  )
}

export default HeroSection