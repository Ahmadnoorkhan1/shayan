import { useCallback } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export function useDashboardTour() {
  const startTour = useCallback(() => {
    const driverObj = driver({
      showProgress: true,
      nextBtnText: 'Next →',
      prevBtnText: '← Previous',
      doneBtnText: 'Finish',
      animate: true,
      smoothScroll: true,
      stagePadding: 10,
      stageRadius: 5,
      steps: [
        {
          element: '#dashboard-getting-started',
          popover: {
            title: 'Welcome to the Dashboard',
            description: 'This is your main dashboard where you can manage your courses and books. Let\'s explore the key features available to you.',
            side: 'bottom',
            align: 'start',
          }
        },
        {
          element: '#course-tab',
          popover: {
            title: 'Course Management',
            description: 'Click here to manage your courses. You can create, edit, and organize your educational content from this tab.',
            side: 'bottom',
          }
        },
        {
          element: '#book-tab',
          popover: {
            title: 'Book Management',
            description: 'Switch to this tab to manage your books and reading materials. Import, categorize, and share your publications.',
            side: 'bottom',
          }
        },
        {
          element: '#data-table',
          popover: {
            title: 'Your Content',
            description: 'This table displays all your content for easy management. edit, share search to quickly find and perform what you need.',
            side: 'top',
          }
        },
        {
          element: '#add-new-item',
          popover: {
            title: 'hey! Click me!',
            description: 'Click on this 3D model to quickly create a new course or book! You can also interact with it - try dragging to rotate, scrolling to zoom, or clicking for special effects.',
            side: 'left',
          }
        }
      ],
      // onDestroyStarted is called when the user tries to exit the tour
      onDestroyStarted: () => {
        // For immediate closing without confirmation
        driverObj.destroy();
        
        // Alternatively, if you want confirmation:
        // if (!driverObj.hasNextStep() || confirm("Are you sure you want to exit the tour?")) {
        //   driverObj.destroy();
        // }
      },
    });
    

    driverObj.drive();
    
    // Return the driver object for external control if needed
    return driverObj;
  }, []);

  return { startTour };
}