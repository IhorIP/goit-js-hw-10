import flatpickr from 'flatpickr';
// Додатковий імпорт стилів flatpickr
import 'flatpickr/dist/flatpickr.min.css';

import iziToast from 'izitoast';
// Додатковий імпорт стилів iziToast
import 'izitoast/dist/css/iziToast.min.css';

const datetimePicker = document.querySelector('#datetime-picker');
const startBtn = document.querySelector('[data-start]');

const daysEl = document.querySelector('[data-days]');
const hoursEl = document.querySelector('[data-hours]');
const minutesEl = document.querySelector('[data-minutes]');
const secondsEl = document.querySelector('[data-seconds]');

// При першому завантаженні кнопка Start неактивна,
// поки користувач не обере валідну (майбутню) дату
startBtn.disabled = true;

// Обрана користувачем дата, потрібна поза межами onClose()
let userSelectedDate = null;

// Ідентифікатор інтервалу, щоб мати змогу зупинити таймер
let timerId = null;

const options = {
  enableTime: true,
  time_24hr: true,
  defaultDate: new Date(),
  minuteIncrement: 1,
  onClose(selectedDates) {
    const selectedDate = selectedDates[0];

    // Валідація: дата має бути строго в майбутньому.
    // Якщо обрана дата в минулому АБО дорівнює поточному моменту — вона недійсна
    if (selectedDate <= new Date()) {
      iziToast.error({
        title: 'Error',
        message: 'Please choose a date in the future',
        position: 'topRight',
      });
      startBtn.disabled = true;
      return;
    }

    userSelectedDate = selectedDate;
    startBtn.disabled = false;
  },
};

flatpickr(datetimePicker, options);

startBtn.addEventListener('click', onStartClick);

function onStartClick() {
  // На час відліку блокуємо кнопку і поле вибору дати
  startBtn.disabled = true;
  datetimePicker.disabled = true;

  timerId = setInterval(() => {
    const currentTime = new Date();
    const deltaTime = userSelectedDate.getTime() - currentTime.getTime();

    if (deltaTime <= 0) {
      clearInterval(timerId);
      updateTimerFace({ days: 0, hours: 0, minutes: 0, seconds: 0 });

      // Після зупинки таймера інпут знову активний,
      // кнопка Start залишається неактивною
      datetimePicker.disabled = false;
      return;
    }

    const time = convertMs(deltaTime);
    updateTimerFace(time);
  }, 1000);
}

function updateTimerFace({ days, hours, minutes, seconds }) {
  daysEl.textContent = addLeadingZero(days);
  hoursEl.textContent = addLeadingZero(hours);
  minutesEl.textContent = addLeadingZero(minutes);
  secondsEl.textContent = addLeadingZero(seconds);
}

function addLeadingZero(value) {
  return String(value).padStart(2, '0');
}

function convertMs(ms) {
  // Number of milliseconds per unit of time
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;

  // Remaining days
  const days = Math.floor(ms / day);
  // Remaining hours
  const hours = Math.floor((ms % day) / hour);
  // Remaining minutes
  const minutes = Math.floor(((ms % day) % hour) / minute);
  // Remaining seconds
  const seconds = Math.floor((((ms % day) % hour) % minute) / second);

  return { days, hours, minutes, seconds };
}
