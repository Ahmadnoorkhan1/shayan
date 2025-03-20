interface SelectProps {
  value: string;
  options: string[];
  placeholder: string;
  onChange: (value: string) => void;
  className?: string;
  isSelected?: boolean;
}

export const CustomSelect: React.FC<SelectProps> = ({
  value,
  options,
  placeholder,
  onChange,
  className = '',
  isSelected = false,
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`
        w-full px-3 py-2 text-sm rounded-md border
        appearance-none bg-white
        focus:outline-none focus:ring-2 focus:ring-purple-200
        transition-colors
        ${isSelected 
          ? "border-purple-200 text-purple-900" 
          : "border-gray-200 text-gray-500"
        }
        hover:border-purple-300
        ${className}
        bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2212%22%20height%3D%227%22%20viewBox%3D%220%200%2012%207%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M1%201L6%206L11%201%22%20stroke%3D%22%23666666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')]
        bg-[length:12px]
        bg-[right_12px_center]
        bg-no-repeat
        pr-10
      `}
    >
      <option value="" disabled hidden>
        {placeholder}
      </option>
      {options.map((option) => (
        <option 
          key={option} 
          value={option}
          className="py-2 px-3 hover:bg-purple-50 hover:text-purple-900"
        >
          {option}
        </option>
      ))}
    </select>
  );
};