import React, { useRef, useEffect } from 'react';
import { useField } from '@unform/core';
import PropTypes from 'prop-types';
import { SelectContainer, AsyncCustomSelect } from './styles';

export default function AsyncSelectForm({
  name,
  label,
  onChange,
  value,
  loadOptions,
  zindex,
  ...rest
}) {
  const selectRef = useRef(null);
  const { fieldName, defaultValue, registerField, error } = useField(name);

  const selectStyles = {
    container: (base, state) => ({
      ...base,
      // opacity: state.isDisabled ? '.5' : '1',
      backgroundColor: 'transparent',
      zIndex: zindex,
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

  function customTheme(theme) {
    return {
      ...theme,
      colors: {
        ...theme.colors,
        primary: '#00A924',
        primary25: '#dae2e5',
      },
    };
  }

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: selectRef.current.select,
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
            const objValue = loadOptions.find((opt) => opt.value === Value);

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
      <div className="select-label">
        <label>{label}</label>
      </div>
      {/* propriedade menuPortalTarget é necessária para exibir corretamente
       * o dropdown de opções dentro de modais
       */}
      <div className="select">
        <AsyncCustomSelect
          ref={selectRef}
          styles={selectStyles}
          theme={customTheme}
          onChange={onChange}
          value={value}
          loadOptions={loadOptions}
          classNamePrefix="Select"
          menuPortalTarget={document.getElementById('modal')}
          isClearable
          {...rest}
        />
      </div>
    </SelectContainer>
  );
}

AsyncSelectForm.propTypes = {
  name: PropTypes.string.isRequired,
  loadOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.string,
    })
  ).isRequired,
  onChange: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  label: PropTypes.string,
  zindex: PropTypes.string,
};

AsyncSelectForm.defaultProps = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  label: '',
  zindex: '150',
};
