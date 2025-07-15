import Input, { InputProps } from "../Input";
import { useEffect } from "react";

interface SearchInputProps extends InputProps {
  searchFunc: Function;
}

const SearchInput = ({ searchFunc, ...inputProps }: SearchInputProps) => {
  const { value, className = "" } = inputProps;
  useEffect(() => {
    const timer = setTimeout(() => {
      searchFunc();
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <Input
      {...inputProps}
      className={`py-2 ${className}`}
      aria-label="Search"
      title="Search"
      required
    />
  );
};

export default SearchInput;
