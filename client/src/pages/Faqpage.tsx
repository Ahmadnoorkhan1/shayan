import Faq from "../components/Faq"

const Faqpage = () => {
  const accordionData = [
    {
      question: "Can anyone create a course with Mini Lessons Academy, even without experience?",
      answer:
        "Absolutely! Our platform is designed for everyone, whether you’re new or experienced. We make it super easy to create courses on any topic, from fitness to cooking. You just need your ideas; our AI does the heavy lifting.",
    },
    {
      question: "How long does it take to create a course using Mini Lessons Academy?",
      answer:
        "You’ll be amazed at how fast it is! Our AI-powered tool helps you create full courses in just a few minutes. It’s all about quick, efficient course creation without sacrificing quality.",
    },
    {
      question: "Can I use Mini Lessons Academy on different devices?",
      answer:
        "Yes, you can! Our platform works great on smartphones, tablets, and computers. So you can create courses anytime, anywhere, with any device.",
    },
    {
      question: "What if I run into problems or need help with my course?",
      answer:
        "We’ve got your back 24/7! If you have questions or need some guidance, our support team and community are always ready to assist you. Plus, our tools are user-friendly, so you’ll find them easy to navigate.",
    },
    {
      question: "What happens if my course doesn’t attract many learners?",
      answer:"We’re confident in the potential of your courses. But if your course doesn’t reach at least 500 learners in 60 days, we offer a money-back guarantee. Plus, we’ll provide our ‘Creator’s Toolkit’ to help you relaunch successfully.",
    },
    {
      question: "How does Mini Lessons Academy help with marketing my course?",
      answer:
        "We provide personalized marketing tools and strategies to make sure your course gets noticed. Our AI-driven marketing plans are tailored to each of your courses for maximum visibility.",
    },
    {
      question: "What additional tools do I get when I sign up?",
      answer:
        "Joining us gives you access to a treasure trove of tools, including market analysis reports, content creation workshops, pricing strategies, and more. These resources are designed to help you create courses that students will love.",
    },
    {
      question: "How does the AI in Mini Lessons Academy work for course creation?",
      answer:
        "Our AI tool is like magic for course creation. It takes your ideas and turns them into complete, ready-to-sell courses. The AI handles the structure and content, so you focus on bringing your unique knowledge to students.",
    },
  ];
  
  return (
    <>  
      <div className="flex flex-col container justify-center items-center pt-8">
        <h1 className="banner-title">Frequently Asked Questions</h1>
        <Faq data={accordionData}/>
        <img
        className="banner-shape absolute -top-28 right-0 -z-[1] w-full max-w-[30%]"
        src="images/banner-shape.svg"
        alt=""
      />
      </div>
    </>
  )
}

export default Faqpage