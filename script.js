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
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, duration, distance) {
    this.coords = coords;
    this.duration = duration; // in min
    this.distance = distance; // in km
  }
}
class Running extends Workouts {
  constructor(coords, duration, distance, cadence) {
    super(coords, duration, distance);
    this.cadence = cadence;
    this.calcPace();
  }
  calcPace() {
    this.pace = this.duration / this.distance; // min / km
  }
}

class Cycling extends Workouts {
  constructor(coords, duration, distance, elevGain) {
    super(coords, duration, distance);
    this.elevGain = elevGain;
    this.calcSpeed();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60); // km / h
  }
}
// const run1 = new Running([39, -12], 5.2, 24, 178);
// const cycling1 = new Cycling([39, -12], 27, 95, 523);
// console.log(run1, cycling1);
// implement method
class App {
  #map;
  #mapEvent;
  workouts = [];
  constructor() {
    this._getPosition();
    inputType.addEventListener('change', this._toggleInputField);
    form.addEventListener('submit', this._newWorkout.bind(this));
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
    // console.log(this);
    this.#map = L.map('map').setView(coords, 13);

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
    // get data from input field of form
    const valueDistance = Number(inputDistance.value);
    const valueDuration = Number(inputDuration.value);
    const valueCadence = Number(inputCadence.value);
    const valueElevation = Number(inputElevation.value);

    // check data is valid

    // if workout is running, create new Running Object

    // if workout is cycling, create new Cycling Object

    // Render workout on map as marker

    // Render workout on list

    // Hide form + clear data input fields:
    inputDistance.value =
      inputCadence.value =
      inputDuration.value =
      inputElevation.value =
        '';
    // display marker on map
    const { lat, lng } = this.#mapEvent.latlng;
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(L.popup(), {
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: 'running-popup',
      })
      .setPopupContent(
        'You clicked the map at ' + this.#mapEvent.latlng.toString()
      )
      .openPopup();
  }
}

const app = new App();
