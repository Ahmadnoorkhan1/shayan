import React from 'react';
import '../App.css';

const Blogs: React.FC = () => {
  return (
    <div className="relative bg-gray-50 px-6 pt-16 pb-20 lg:px-8 lg:pt-24 lg:pb-28">
      <div className="absolute inset-0">
        <div className="h-1/3 bg-white sm:h-2/3"></div>
      </div>
      <div className="relative mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Create Books, Guides, Newsletters & More...
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-xl text-gray-500 sm:mt-4">
          Instant Author lets you easily create top-notch books, guides, newsletters, and more with just a few taps.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-lg gap-5 lg:max-w-none lg:grid-cols-3">

          <div className="flex flex-col overflow-hidden rounded-lg shadow-lg">
            <div className="flex-shrink-0">
              <img className="h-48 w-full object-cover" src="/images/emma.jpg" alt="" />
            </div>
            <div className="flex flex-1 flex-col justify-between bg-white p-6">
              <div className="flex-1">
                <p className="text-sm font-medium text-indigo-600">
                  <a href="#" className="hover:underline">Book</a>
                </p>
                <a href="#" className="mt-2 block">
                  <p className="text-xl font-semibold text-gray-900">Empowering a Health & Fitness Coach to Scale Her Business with Mini Lessons Academy</p>
                  <p className="mt-3 text-base text-gray-500">As a certified personal trainer and nutritionist based in Austin, Texas, Emma J. has always been passionate about helping people lead healthier lives. For years, she worked one-on-one with clients, providing personalized fitness plans....</p>
                </a>
              </div>
              <div className="mt-6 flex items-center">
                <div className="flex-shrink-0">
                  <a href="#">
                    <span className="sr-only">Roel Aufderehar</span>
                    <img className="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=2&amp;w=256&amp;h=256&amp;q=80" alt="" />
                  </a>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    <a href="#" className="hover:underline">Roel Aufderehar</a>
                  </p>
                  <div className="flex space-x-1 text-sm text-gray-500">
                    <time dateTime="2020-03-16">Mar 16, 2020</time>
                    <span aria-hidden="true">·</span>
                    <span>6 min read</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col overflow-hidden rounded-lg shadow-lg">
            <div className="flex-shrink-0">
              <img className="h-48 w-full object-cover" src="https://images.unsplash.com/photo-1547586696-ea22b4d4235d?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=crop&amp;w=1679&amp;q=80" alt="" />
            </div>
            <div className="flex flex-1 flex-col justify-between bg-white p-6">
              <div className="flex-1">
                <p className="text-sm font-medium text-indigo-600">
                  <a href="#" className="hover:underline">Book</a>
                </p>
                <a href="#" className="mt-2 block">
                  <p className="text-xl font-semibold text-gray-900">How a Business Consultant Expanded His Reach with Mini Lessons Academy
                  </p>
                  <p className="mt-3 text-base text-gray-500">Daniel T., a seasoned business consultant from Chicago, Illinois, has spent over 15 years helping small businesses optimize their operations and strategies. While he enjoyed the in-depth interactions with his clients, Daniel felt there was a ceiling to how many businesses he ...</p>
                </a>
              </div>
              <div className="mt-6 flex items-center">
                <div className="flex-shrink-0">
                  <a href="#">
                    <span className="sr-only">Brenna Goyette</span>
                    <img className="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=2&amp;w=256&amp;h=256&amp;q=80" alt="" />
                  </a>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    <a href="#" className="hover:underline">Brenna Goyette</a>
                  </p>
                  <div className="flex space-x-1 text-sm text-gray-500">
                    <time dateTime="2020-03-10">Mar 10, 2020</time>
                    <span aria-hidden="true">·</span>
                    <span>4 min read</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col overflow-hidden rounded-lg shadow-lg">
            <div className="flex-shrink-0">
              <img className="h-48 w-full object-cover" src="https://images.unsplash.com/photo-1492724441997-5dc865305da7?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=crop&amp;w=1679&amp;q=80" alt="" />
            </div>
            <div className="flex flex-1 flex-col justify-between bg-white p-6">
              <div className="flex-1">
                <p className="text-sm font-medium text-indigo-600">
                  <a href="#" className="hover:underline">Case Study</a>
                </p>
                <a href="#" className="mt-2 block">
                  <p className="text-xl font-semibold text-gray-900">A Teacher Transforms Education with Mini Lessons Academy</p>
                  <p className="mt-3 text-base text-gray-500">For over a decade, Samantha L., a dedicated middle school teacher from Portland, Oregon, has been passionate about making learning engaging and accessible for all her students. With the recent shifts in education models post-Pandemic, she found herself teaching in a hybrid...</p>
                </a>
              </div>
              <div className="mt-6 flex items-center">
                <div className="flex-shrink-0">
                  <a href="#">
                    <span className="sr-only">Daniela Metz</span>
                    <img className="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=2&amp;w=256&amp;h=256&amp;q=80" alt="" />
                  </a>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    <a href="#" className="hover:underline">Daniela Metz</a>
                  </p>
                  <div className="flex space-x-1 text-sm text-gray-500">
                    <time dateTime="2020-02-12">Feb 12, 2020</time>
                    <span aria-hidden="true">·</span>
                    <span>11 min read</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Blogs;
