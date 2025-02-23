import GettingStarted from "../../components/dashboard/GettingStarted"
import Tabs from "../../components/ui/tabs"

const Dashboard = () => {

    

    return (
        <div className="h-[85vh] overflow-scroll">
        <GettingStarted button={true} title="We would love to see what you make." description="Ready to make content with the help of our AI?. No need to worry we got your back! Here is a tutorial to help you understand how our tools can help.  "/>
        <Tabs />
        </div>  
    )
}

export default Dashboard