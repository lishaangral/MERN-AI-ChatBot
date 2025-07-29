import React from 'react'

type Props = {
    name: string;
    type: string;
    label: string;
}

const CustomizedInput = (props: Props) => {
  return (
    <div className="custom-input">
      <input
        name={props.name}
        type={props.type}
        placeholder={props.label}
      />
    </div>
  )
}

export default CustomizedInput