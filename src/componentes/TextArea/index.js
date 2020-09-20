import React, { useEffect, useRef } from 'react';
import { useField } from '@unform/core';
import PropTypes from 'prop-types';

const TextArea = ({ name, nrow, isUppercase, ...rest }) => {
  const inputRef = useRef(null);

  const { fieldName, defaultValue = '', registerField, error } = useField(name);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef.current,
      path: 'value',
    });
  }, [fieldName, registerField]);

  const toInputUppercase = (e) => {
    if (isUppercase) {
      e.target.value = `${e.target.value}`.toUpperCase();
    }
  };

  return (
    <textarea
      ref={inputRef}
      name={fieldName}
      id={fieldName}
      defaultValue={defaultValue}
      onBlur={toInputUppercase}
      uppercase={isUppercase}
      rows={nrow}
      invalid={error}
      {...rest}
    />
  );
};

export default TextArea;

TextArea.propTypes = {
  name: PropTypes.string.isRequired,
  isUppercase: PropTypes.bool,
  nrow: PropTypes.string,
};

TextArea.defaultProps = {
  isUppercase: true,
  nrow: '2',
};
