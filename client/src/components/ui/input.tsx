import React from "react"

interface INPUT_PROPS{
  type:string,
}

const input: React.FC<INPUT_PROPS> = ({type}) => {
  return (
    <div>
      <input type={type} name="" id="" />
    </div>
  )
}

export default input