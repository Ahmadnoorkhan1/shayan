import { useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export function useDashboardTour() {
  const [driverObj, setDriverObj] = useState<any>(null);
  const [isTourOpen, setIsTourOpen] = useState(false);

  useEffect(() => {
    // Initialize driver.js
    const driverInstance = driver({
      showProgress: true,
      nextBtnText: 'Next',
      prevBtnText: 'Previous',
      doneBtnText: 'Done',
      animate: true,
    //   opacity: 0.8,
      onDestroyStarted: () => {
        setIsTourOpen(false);
      },
    });

    setDriverObj(driverInstance);

    // Clean up
    return () => {
      if (driverInstance) {
        driverInstance.destroy();
      }
    };
  }, []);

  const startTour = () => {
    if (!driverObj) return;
    
    setIsTourOpen(true);
    
    // Define the steps
    const steps = [
      {
        element: '#dashboard-getting-started',
        popover: {
          title: 'Welcome to the Dashboard',
          description: 'This is your main dashboard where you can manage your courses and books.',
          side: 'bottom',
          align: 'start',
        }
      },
      {
        element: '#course-tab',
        popover: {
          title: 'Course Management',
          description: 'Click here to manage your courses.',
          side: 'bottom',
        }
      },
      {
        element: '#book-tab',
        popover: {
          title: 'Book Management',
          description: 'Switch to this tab to manage your books.',
          side: 'bottom',
        }
      },
      {
        element: '#data-table',
        popover: {
          title: 'Your Content',
          description: 'Here you can view, edit, and manage all your content.',
          side: 'top',
        }
      },
      {
        element: '#add-new-item',
        popover: {
          title: 'Create New Content',
          description: 'Click here to create new courses or books.',
          side: 'left',
        }
      }
    ];

    try {
      // Use the highlight method directly (works with recent versions)
      driverObj.highlight({
        steps: steps,
        showProgress: true
      });
    } catch (error) {
      console.error("Error starting tour:", error);
    }
  };

  return { startTour, isTourOpen };
}