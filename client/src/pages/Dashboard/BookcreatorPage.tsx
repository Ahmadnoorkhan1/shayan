import GettingStarted from "../../components/dashboard/GettingStarted"

const BookcreatorPage = () => {
  return (
    <>
       <GettingStarted button={false} title="Create a book with our AI" description=" What do you want your book to be about?
(don't worry, you can always change the content or name of your book later!)" />
    </>
  )
}

export default BookcreatorPage