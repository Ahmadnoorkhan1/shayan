import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import apiService from '../../utilities/service/api';
import { Loader2, AlertTriangle } from 'lucide-react';
import { formatSharedContent } from '../../utilities/shared/tableUtils';
import LoadingState from './states/LoadingState';
import ErrorState from './states/ErrorState';
import QuizInteractivity from './interactivity/QuizInteractivity';
import FlashCards from './interactivity/FlashCards';
import ShortAnswerQuestions from './interactivity/ShortAnswerQuestions';

interface SharedContentProps {}

const SharedContent: React.FC<SharedContentProps> = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    const fetchSharedContent = async () => {
      try {
        setLoading(true);
        const response = await apiService.get(`/shared/${type}/${id}`, {});
        
        if (response.success && response.data) {
          // Handle different types of content formats
          let processedContent;

          console.log(response.data, ' <<< ')
          
          // Check if content is already stringified or needs to be
          if (typeof response.data.content === 'string') {
            try {
              // Try parsing it in case it's a JSON string
              processedContent = JSON.parse(response.data.content);
            } catch (e) {
              // If parsing fails, it might be a direct string
              processedContent = response.data.content;
            }
          }
          const parsedContent = JSON.parse(processedContent)
          console.log(parsedContent, ' <<< ')
          const html = await formatSharedContent(
            parsedContent, 
            response.data.title || 'Shared Content', 
            (response.data.courseType || type) as 'course' | 'book'
          );

          console.log('HTML generated:', html);
          
          // Set the sanitized and formatted content
          setContent(html);
                  
        } else {
          setError(response.message || 'Failed to load content');
        }
      } catch (error: any) {
        console.error('Error fetching shared content:', error);
        setError(error.message || 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSharedContent();
  }, [id, type]);

  useEffect(() => {
    // Initialize all interactive elements after content has been rendered
    if (content && !loading) {
      // Use setTimeout to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        try {
          console.log('Setting up all interactive elements');
          
          // Initialize interactive components
          initializeInteractiveComponents();
          
        } catch (e) {
          console.error('Error initializing interactive content:', e);
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [content, loading]);

  const initializeInteractiveComponents = () => {
    // Set up all interactive components
    QuizInteractivity.initialize();
    FlashCards.initialize();
    ShortAnswerQuestions.initialize();
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  // Render the content directly into the DOM
  return (
    <div className="shared-content-wrapper">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export default SharedContent;