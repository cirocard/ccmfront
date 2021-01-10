import React, { useEffect, useRef } from 'react';
import { useField } from '@unform/core';
import PropTypes from 'prop-types';
/* ============= Styles =============== */
// import { InputContainer, FormInput } from './styles';
/* ============= End Styles =============== */

const Input = ({ name, ...rest }) => {
  const inputRef = useRef(null);

  const { fieldName, defaultValue = '', registerField, error } = useField(name);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef.current,
      path: 'value',
    });
  }, [fieldName, registerField]);

  return (
    <div>
      <input
        ref={inputRef}
        name={fieldName}
        id={fieldName}
        defaultValue={defaultValue}
        {...rest}
      />

      {error && (
        <span style={{ color: '#f00', display: 'block' }}>{error}</span>
      )}
    </div>
  );
};

export default Input;

Input.propTypes = {
  name: PropTypes.string.isRequired,
};
