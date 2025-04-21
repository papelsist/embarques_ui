import React from "react";

import "./InputField.css";

const InputField = ({
  label,
  type,
  name,
  value,
  onChange,
  leftIcon,
  rightIcon,
}) => {

  return (
    <div className={"inputContainer"}>
      <div className={"inputWrapper"}>
        <img src={leftIcon} alt="" className={"icon"} aria-hidden="true" />
        <div className={"fieldContent"}>
          <label className={"label"}>{label}</label>
          <div className={"inputField"}>
            <div className={"inputLabel"}>{label}</div>
            <input
              type={type}
              name={name}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={"input"}
              aria-label={label}
            />
            <div className={"underline"} />
          </div>
        </div>
        <img
          src={rightIcon}
          alt=""
          className={"icon"}
          aria-hidden="true"
        />
      </div>
    </div>
  );
};

export default InputField;







