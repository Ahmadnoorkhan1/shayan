import { useEffect } from "react";
import GettingStarted from "../../components/dashboard/GettingStarted"
import Tabs from "../../components/ui/tabs"
import { useDashboardTour } from "../../hooks/useDashboardTour";

const Dashboard = () => {
    const { startTour } = useDashboardTour();

   
    
    return (
        <>
        <div id="dashboard-getting-started">
            <GettingStarted 
                button={true} 
                title="We would love to see what you make." 
                description="Ready to make content with the help of our AI?. No need to worry we got your back! Here is a tutorial to help you understand how our tools can help."
                onTutorialClick={startTour}  
            />
        </div>
        <Tabs />
        </>
    )
}

export default Dashboard