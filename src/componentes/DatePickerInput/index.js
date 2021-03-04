import React, { useState, useEffect, useRef } from 'react';
import { DatetimePickerTrigger } from 'imrc-datetime-picker';
import moment from 'moment';
import 'moment/locale/pt-br';
import PropTypes from 'prop-types';

import { Container } from './styles';
import 'imrc-datetime-picker/dist/imrc-datetime-picker.css';

/**
 * Conponente de input para seleção de data e hora.
 * @param {onChangeDate} onChangeDate função que é disparada quando o usuário seleciona a data.
 * @param {value} value  valor atribuído ao input.
 * @param {dateAndTime} dateAndTime Indica se deve exibir o seletor de horas.
 * @param {Boolean} readOnly Indica quando o input deverá ficar desabilitado.
 */
function DatePickerInput({
  onChangeDate,
  value,
  dateAndTime,
  label,
  maxDate,
  minDate,
  readOnly,
  isRequired,
  ...rest
}) {
  const [date, setDate] = useState(moment());
  const [dateFormated, setDateFormated] = useState(
    moment(date).format('DD/MM/YYYY')
  );
  const [classes, setClasses] = useState('input_cad');

  const inputRef = useRef(null);

  useEffect(() => {
    if (value) {
      const dt = moment(value);
      const formated = dateAndTime
        ? moment(value).format('DD/MM/YYYY HH:mm:ss')
        : moment(value).format('DD/MM/YYYY');

      setDate(dt);
      setDateFormated(formated);
    } else {
      setDate(moment());
      setDateFormated(moment().format('DD/MM/YYYY'));
    }
  }, [value]);

  const shortcuts = {
    Hoje: moment(),
    Ontem: moment().clone().subtract(1, 'days'),
  };

  const semanas = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
  const meses = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ];

  /* Sempre que o usuário digitar uma data válida cria um objeto Moment e devolve
   * pra tela que chama o componente
   */
  const onDateMatch = (dateInput) => {
    try {
      if (dateAndTime) {
        const arrDateAndTime = dateInput.split(' ');

        let arrDate = arrDateAndTime[0].split('/');
        arrDate = arrDate.reverse();
        arrDate = arrDate.join('/');
        arrDate += ` ${arrDateAndTime[1]}`;

        const newDate = moment(arrDate);
        onChangeDate(newDate);
      } else {
        let arrDate = dateInput.split('/');
        arrDate = arrDate.reverse();
        arrDate = arrDate.join('/');

        const newDate = moment(arrDate);
        onChangeDate(newDate);
      }
    } catch (err) {
      onChangeDate(moment());
    }
  };

  const handleInput = (event) => {
    try {
      const { value: inputValue } = event.target;

      setDateFormated(inputValue || '');
      const valueMoment = moment(inputValue);

      if (maxDate) {
        if (valueMoment.isAfter(maxDate)) {
          throw new Error('Valor informado ultrapassa a data máxima');
        }
      }

      if (minDate) {
        if (valueMoment.isBefore(minDate)) {
          throw new Error('valor informado antecede a data mínima!');
        }
      }

      let regex;
      if (dateAndTime) {
        regex = new RegExp(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/);
      } else {
        regex = new RegExp(/^\d{2}\/\d{2}\/\d{4}$/);
      }

      if (!regex.test(inputValue)) {
        throw new Error('Data inválida');
      }

      setClasses('input_cad');
      onDateMatch(inputValue);
    } catch (err) {
      setClasses('input_cad input_error');
    }
  };

  return (
    <Container isRequired={isRequired}>
      <div className="datepicker-container">
        <label>{label}</label>
      </div>
      <DatetimePickerTrigger
        shortcuts={shortcuts}
        moment={date}
        maxDate={maxDate}
        minDate={minDate}
        onChange={onChangeDate}
        showTimePicker={dateAndTime}
        weeks={semanas}
        months={meses}
        position="bottom"
        closeOnSelectDay
        disabled={readOnly}
        {...rest}
      >
        <input
          className={classes}
          type="text"
          value={dateFormated}
          ref={inputRef}
          onChange={handleInput}
          readOnly={readOnly}
        />
      </DatetimePickerTrigger>
    </Container>
  );
}

export default DatePickerInput;

DatePickerInput.propTypes = {
  onChangeDate: PropTypes.func.isRequired,
  // value: PropTypes.instanceOf(Date).isRequired,
  value: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.instanceOf(moment),
  ]).isRequired,
  maxDate: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.instanceOf(moment),
  ]),
  minDate: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.instanceOf(moment),
  ]),
  dateAndTime: PropTypes.bool,
  label: PropTypes.string,
  readOnly: PropTypes.bool,
  isRequired: PropTypes.bool,
};

DatePickerInput.defaultProps = {
  dateAndTime: false,
  label: '',
  maxDate: null,
  minDate: null,
  readOnly: false,
  isRequired: false,
};
