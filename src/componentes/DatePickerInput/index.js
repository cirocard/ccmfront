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
 */
function DatePickerInput({ onChangeDate, value, dateAndTime, label }) {
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
      setDate(null);
      setDateFormated('');
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

        const date = moment(arrDate);
        onChangeDate(date);
      } else {
        let arrDate = dateInput.split('/');
        arrDate = arrDate.reverse();
        arrDate = arrDate.join('/');

        const date = moment(arrDate);
        onChangeDate(date);
      }
    } catch (err) {}
  };

  const handleInput = (event) => {
    const { value } = event.target;
    setDateFormated(value);

    const regex = new RegExp(
      /^(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}|\d{2}\/\d{2}\/\d{4})$/
    );
    if (regex.test(value)) {
      setClasses('input_cad');
      onDateMatch(value);
    } else {
      setClasses('input_cad input_error');
    }
  };

  return (
    <Container>
      <div className="datepicker-container">
        <label>{label}</label>
      </div>
      <DatetimePickerTrigger
        shortcuts={shortcuts}
        moment={date}
        onChange={onChangeDate}
        showTimePicker={dateAndTime}
        weeks={semanas}
        months={meses}
        position="bottom"
        closeOnSelectDay
      >
        <input
          className={classes}
          type="text"
          value={dateFormated}
          ref={inputRef}
          onChange={(event) => handleInput(event)}
        />
      </DatetimePickerTrigger>
    </Container>
  );
}

export default DatePickerInput;

DatePickerInput.propTypes = {
  onChangeDate: PropTypes.func.isRequired,
  value: PropTypes.instanceOf(Date).isRequired,
  dateAndTime: PropTypes.bool,
  label: PropTypes.string,
};

DatePickerInput.defaultProps = {
  dateAndTime: false,
  label: '',
};
