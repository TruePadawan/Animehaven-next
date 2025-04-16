import { CheckboxProps } from "./Checkbox.types";

const Checkbox = (props: CheckboxProps) => {
  return (
    <div className="form-check form-check-reverse">
      <label className="form-check-label text-white" htmlFor={props.id}>
        {props.label}
      </label>
      <input
        className="form-check-input"
        type={"checkbox"}
        id={props.id}
        name={props.name}
        onChange={props.onChange}
        checked={props.checked}
      />
    </div>
  );
};

export default Checkbox;
