import { Link } from "react-router";

const SidebarLinks = (props:any) => {
  return (
    <li className="pb-4">
      <Link to={props.to} className="flex gap-2 text-[#0e0e0e]">
        <img src={props.src} alt="" width={25} height={25} />
        {props.title}
      </Link>
    </li>
  );
};

export default SidebarLinks;
