import GettingStarted from "../../components/dashboard/GettingStarted";
import Faq from "../../components/Faq";

const Knowledgebase = () => {
  const GeneralQuestions = [
    {
      question:"Can I upload or import an email list for the whitelist?",
      answer:"Not currently. This feature may be added in the future if highly requested."
    },
    {
      question:"Can I upload or import an email list for the whitelist?",
      answer:"Not currently. This feature may be added in the future if highly requested."
    },
    {
      question:"Can I upload or import an email list for the whitelist?",
      answer:"Not currently. This feature may be added in the future if highly requested."
    },
    {
      question:"Can I upload or import an email list for the whitelist?",
      answer:"Not currently. This feature may be added in the future if highly requested."
    },
  ];
  const CourseAccess = [
    {
      question:"Can users sign up themselves if I share my course link?",
      answer:"Yes, if your course is set to Private, users will see a login screen when they click the course link. They can register for a new MLA account directly from this screen.If you’ve added their email to the whitelist before they register, they will automatically gain access as long as they use the same email for registration."
    },
    {
      question:"Can I upload or import an email list for the whitelist?",
      answer:"Not currently. This feature may be added in the future if highly requested."
    },
    {
      question:"Can I upload or import an email list for the whitelist?",
      answer:"Not currently. This feature may be added in the future if highly requested."
    },
    {
      question:"Can I upload or import an email list for the whitelist?",
      answer:"Not currently. This feature may be added in the future if highly requested."
    },
  ];
  const StudentManagement = [
    {
      question:"Can I charge my students for course access?",
      answer:"You’re welcome to independently charge your students and manually add them to the whitelist. While there isn’t currently an integrated 'sell access to course' feature, this is planned for a future update.."
    },
    {
      question:"Can I upload or import an email list for the whitelist?",
      answer:"Not currently. This feature may be added in the future if highly requested."
    },

  ];
  return (
    <div className="flex flex-col h-[85vh] overflow-y-scroll`">
      <GettingStarted
        button={false}
        title="Course Hosting Frequently Asked Questions"
        description = "Welcome to the Course Hosting knowledge base for Mini Lessons Academy. Here, you’ll find answers to commonly asked questions about our newest feature. If you don’t see what you’re looking for, feel free to reach out to our support team."
      />
      <h2 className="pt-5 text-primary"> General Questions</h2>
      <Faq data={GeneralQuestions}/>
      <h2 className="pt-5 text-primary"> Course Access</h2>
      <Faq data={CourseAccess}/>
      <h2 className="pt-5 text-primary"> Student Management</h2>
      <Faq data={StudentManagement}/>
    </div>
  );
};

export default Knowledgebase;
