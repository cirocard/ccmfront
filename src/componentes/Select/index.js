import React, { useRef, useEffect } from 'react';
import Select from 'react-select';
import { useField } from '@unform/core';
import styled from 'styled-components';

import { SelectContainer } from './styles';

const CustomSelect = styled(Select)`
  & .Select__control {
    height: 30px;
    min-height: 30px;
  }
  & .Select__indicator {
    margin-top: -3px;
  }
  & .Select__single-value {
    font-weight: bold;
    color: #495057;
    font-size: 15px;
  }
`;

export default function FormSelect({ name, optionsList, ...rest }) {
  const selectRef = useRef(null);
  const { fieldName, registerField, error } = useField(name);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: selectRef.current,
      path: 'state.value',
      getValue: (ref) => {
        if (rest.isMulti) {
          if (!ref.state.value) {
            return [];
          }
          return ref.state.value.map((option) => option.value);
        }
        if (!ref.state.value) {
          return '';
        }
        return ref.state.value.value;
      },
    });
  }, [fieldName, registerField, rest.isMulti]);

  return (
    <SelectContainer>
      <CustomSelect
        isClearable
        ref={selectRef}
        classNamePrefix="Informe"
        options={optionsList}
        {...rest}
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary: '#00A924',
            primary25: '#dae2e5',
          },
        })}
      />

      {error && (
        <span style={{ color: '#f00', display: 'block' }}>{error}</span>
      )}
    </SelectContainer>
  );
}
