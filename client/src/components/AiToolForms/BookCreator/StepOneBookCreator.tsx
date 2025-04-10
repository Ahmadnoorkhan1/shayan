import ContentTopicInput from '../common/ContentTopicInput';

interface StepOneProps {
  handleForm: CallableFunction;
}

const StepOneBookCreator: React.FC<StepOneProps> = ({ handleForm }) => {
  return (
    <ContentTopicInput 
      handleForm={handleForm}
      contentType="book"
      // You can optionally customize these props:
      // title="Custom title for book creator" 
      // description="Custom description for book creator"
      // placeholder="Custom placeholder for book creator"
    />
  );
};

export default StepOneBookCreator;