import ContentTopicInput from '../common/ContentTopicInput';

interface StepOneProps {
  handleForm: CallableFunction;
}

const StepOneCourseCreator: React.FC<StepOneProps> = ({ handleForm }) => {
  return (
    <ContentTopicInput 
      handleForm={handleForm}
      contentType="course"
      // You can optionally customize these props:
      // title="Custom title for course creator" 
      // description="Custom description for course creator"
      // placeholder="Custom placeholder for course creator"
    />
  );
};

export default StepOneCourseCreator;