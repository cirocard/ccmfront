import React, { useRef, useEffect } from 'react';
import { useField } from '@unform/core';
import PropTypes from 'prop-types';
import { CustomSelect, SelectContainer } from './styles';

export default function FormSelect({
  name,
  optionsList,
  clearable = true,
  readOnly,
  zindex,
  label,
  ...rest
}) {
  const selectRef = useRef(null);
  const { fieldName, defaultValue, registerField, error } = useField(name);

  /* ====== Custom Styles ====== */
  const selectStyles = {
    container: (base, state) => ({
      ...base,
      backgroundColor: 'transparent',
      zIndex: zindex || '150',
    }),
    control: (base, state) => {
      let bdColor = 'hsl(0, 0%, 80%)';
      if (state.isDisabled) {
        bdColor = '#ccc';
      }
      if (state.isFocused && error) {
        bdColor = '#f00';
      }
      if (error) {
        bdColor = '#f00';
      }
      return {
        ...base,
        borderColor: bdColor,
        '&:hover': {
          borderColor: bdColor,
        },
      };
    },
    menuPortal: (styles) => ({ ...styles, zIndex: 999 }),
  };
  /* ====== Custom Styles ====== */

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
      setValue: (ref, Value) => {
        if (Value) {
          if (Value instanceof Object) {
            ref.select.setValue(Value);
          } else {
            const objValue = optionsList.find((opt) => opt.value === Value);
            ref.select.setValue(objValue);
          }
        } else {
          ref.select.setValue(null);
        }
      },
    });
  }, [fieldName, registerField, rest.isMulti, defaultValue]);

  return (
    <SelectContainer>
      {label ? (
        <div className="select-label">
          <label htmlFor={fieldName}>{label}</label>
          {error && (
            <span style={{ color: '#f00', display: 'block' }}>{error}</span>
          )}
        </div>
      ) : (
        <></>
      )}
      {/* propriedade menuPortalTarget é necessária para exibir corretamente
       * o dropdown de opções dentro de modais
       */}
      <div className="select">
        <CustomSelect
          isClearable={clearable}
          isDisabled={readOnly}
          ref={selectRef}
          classNamePrefix="Select"
          options={optionsList}
          styles={selectStyles}
          menuPortalTarget={document.getElementById('modal')}
          menuPlacement="auto"
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
      </div>
    </SelectContainer>
  );
}

FormSelect.propTypes = {
  name: PropTypes.string.isRequired,
  optionsList: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.string,
    })
  ).isRequired,
  clearable: PropTypes.bool,
  readOnly: PropTypes.bool,
  label: PropTypes.string,
  zindex: PropTypes.string,
};

FormSelect.defaultProps = {
  clearable: true,
  readOnly: false,
  label: '',
  zindex: '150',
};
