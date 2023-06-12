'use strict';
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// store data workout
class Workouts {
  current = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance; // in km
    this.duration = duration; // in min
  }
  _description() {
    this.desc = `${this.type[0].toUpperCase() + this.type.slice(1)} on ${
      months[this.current.getMonth()]
    } ${this.current.getDate()}`;
  }
}
class Running extends Workouts {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this._calcPace();
    this._description();
  }
  _calcPace() {
    this.pace = (this.duration / this.distance).toFixed(2); // min / km
  }
}

class Cycling extends Workouts {
  type = 'cycling';
  constructor(coords, distance, duration, elevGain) {
    super(coords, distance, duration);
    this.elevGain = elevGain;
    this._calcSpeed();
    this._description();
  }

  _calcSpeed() {
    this.speed = (this.distance / (this.duration / 60)).toFixed(2); // km / h
  }
}
// const run1 = new Running([39, -12], 5.2, 24, 178);
// const cycling1 = new Cycling([39, -12], 27, 95, 523);
// console.log(run1, cycling1);
// implement method
class App {
  #map;
  #mapEvent;
  #mapZoomLevel = 13;
  #workoutsArr = [];

  constructor() {
    this._getPosition();
    inputType.addEventListener('change', this._toggleInputField);
    form.addEventListener('submit', this._newWorkout.bind(this));
    containerWorkouts.addEventListener('click', this._moveToMaker.bind(this));
  }
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('could not get your position');
        }
      );
    }
  }

  // load map base on current position
  _loadMap(position) {
    //load current position of user
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(eMap) {
    this.#mapEvent = eMap;

    form.classList.remove('hidden');
    inputDistance.focus();
  }

  // display change value inputType
  _toggleInputField() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  // submit form
  _newWorkout(e) {
    e.preventDefault();
    // get coords when click map
    const { lat, lng } = this.#mapEvent.latlng;
    // get data from input field of form
    const type = inputType.value;
    const distance = Number(inputDistance.value);
    const duration = Number(inputDuration.value);
    let workout;

    // check data is valid
    const isNumber = (...value) => value.every(el => Number.isFinite(el));
    const allPositiveNumber = (...value) => value.every(el => el > 0);

    // if workout is running, create Running Object
    if (type === 'running') {
      const cadence = Number(inputCadence.value);
      if (
        !isNumber(distance, duration, cadence) ||
        !allPositiveNumber(distance, duration, cadence)
      ) {
        return alert('you need to input Correct Positive Number !');
      }

      // create new object running
      workout = new Running([lat, lng], duration, distance, cadence);
    }

    // if workout is cycling, create Cycling Object
    if (type === 'cycling') {
      const elevGain = Number(inputElevation.value);
      if (
        !isNumber(distance, duration, elevGain) ||
        !allPositiveNumber(distance, duration)
      ) {
        return alert('you need to input Correct Positive Number !');
      }
      // create new object cycling
      workout = new Cycling([lat, lng], duration, distance, elevGain);
    }
    // add object in workout array
    this.#workoutsArr.push(workout);

    // render maker on Map
    this._renderMaker(workout);

    // Render workout on list
    this._renderWorkoutList(workout);

    // Hide form + clear data input fields:
    inputDistance.value =
      inputCadence.value =
      inputDuration.value =
      inputElevation.value =
        '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  // Render workout on map as marker
  _renderMaker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(L.popup(), {
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: `${workout.type}-popup`,
      })
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.desc}`
      )
      .openPopup();
  }

  // Render workout on left list
  _renderWorkoutList(workout) {
    let html = `<li class="workout workout--${workout.type}" data-id="${
      workout.id
    }">
      <h2 class="workout__title">${workout.desc}</h2>
      <div class="workout__details">
        <span class="workout__icon">${
          workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
        }</span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">min</span>
      </div>`;
    if (workout.type === 'running') {
      html += `<div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.pace}</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${workout.cadence}</span>
        <span class="workout__unit">spm</span>
      </div></li>`;
    }
    if (workout.type === 'cycling') {
      html += `<div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.speed}</span>
        <span class="workout__unit">km/h</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${Math.abs(workout.elevGain)}</span>
        <span class="workout__unit">m</span>
      </div>
    </li>`;
    }
    containerWorkouts.insertAdjacentHTML('afterbegin', html);
  }

  // click each workout to move maker to center on the map
  _moveToMaker(e) {
    const clickedEl = e.target.closest('.workout');
    if (!clickedEl) return;
    const idEl = clickedEl.dataset.id;

    // loop to find workout
    const workout = this.#workoutsArr.find(wk => wk.id === idEl);

    // move maker to center view port
    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }
}
const app = new App();
