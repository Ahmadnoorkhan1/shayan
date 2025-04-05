import AccessTokenRedirect from "../ExternalAccess/AccessTokenRedirect"

interface GettingStartedProps {
    button:boolean,
    title:string,
    description:string
}
const GettingStarted: React.FC<GettingStartedProps> = ({button,title,description}) => {
  return (
    <section className="bg-gradient-to-tl w-full rounded-lg">
    <div className="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
        <div className="max-w-screen-md">
            <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-white ">{title}</h2>
            <p className="mb-8 font-light text-white sm:text-xl ">{description}</p>
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                {/* <a href="#" className="inline-flex items-center justify-center px-4 py-2.5 text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900">
                    Get started
                </a> */}
                {
                    button ? 
                <a href="#" className="btn-secondary inline-flex items-center justify-center px-4 py-2.5 text-base font-medium text-center text-white border border-gray-300 rounded-lg hover:translate-y-1 hover:border-white focus:ring-4 focus:ring-gray-100 ">
                    <svg className="mr-2 -ml-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"></path></svg>
                    View Tutorial
                </a>  : <></>
                }

            </div>
        </div>
    </div>
</section>
  )
}

export default GettingStarted