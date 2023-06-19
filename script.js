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
const sortType = document.querySelector('.sort--type');
const sortDistance = document.querySelector('.sort--distance');
const sortDuration = document.querySelector('.sort--duration');
const sortContainer = document.querySelector('.sort-container');

const btnSort = document.querySelector('.btn--sort');
const control = document.querySelector('.control');

// store data workout
class Workouts {
  current = new Date();
  id = (Date.now() + '').slice(-10);
  click = 0;

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
  countClick() {
    this.click += 1;
    return this.click;
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
  #makerArr = [];

  constructor() {
    this._getPosition();
    inputType.addEventListener('change', this._toggleInputField);
    form.addEventListener('submit', this._newWorkout.bind(this));
    containerWorkouts.addEventListener(
      'click',
      this._containerClick.bind(this)
    );
    // btnSort.addEventListener('click', this._showSort);
    control.addEventListener('click', this._controlBtn.bind(this));
    sortContainer.addEventListener('click', this._sortType.bind(this));
  }

  _containerClick(e) {
    const clickedEl = e.target;
    if (!clickedEl.closest('.workout')) return;
    const id = clickedEl.closest('.workout').dataset.id;
    const workoutClicked = this.#workoutsArr.find(el => el.id === id);

    if (clickedEl.classList.contains('workout__icon--edit')) {
      this._edit(workoutClicked);
      form.dataset.id = id;
    } else if (clickedEl.classList.contains('workout__icon--delete')) {
      this._delete(workoutClicked);
    } else {
      this._moveToMaker(e);
    }
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

    this._getLocalStorage();
  }

  _showForm(eMap) {
    this.#mapEvent = eMap;

    form.classList.remove('hidden');
    inputDistance.focus();
  }

  // display change value inputType
  _toggleInputField() {
    if (inputType.value === 'running') {
      inputCadence.closest('.form__row').classList.remove('form__row--hidden');
      inputElevation.closest('.form__row').classList.add('form__row--hidden');
    } else {
      inputCadence.closest('.form__row').classList.add('form__row--hidden');
      inputElevation
        .closest('.form__row')
        .classList.remove('form__row--hidden');
    }
  }

  // display btn control
  _displayControl() {
    if (this.#workoutsArr.length !== 0) {
      control.classList.remove('control-hidden');
    } else {
      control.classList.add('control-hidden');
    }
  }

  // submit form
  _newWorkout(e) {
    e.preventDefault();
    let lat, lng;
    let type, distance, duration, workout, cadence, elevGain;
    // get data from input field of form
    type = inputType.value;
    distance = Number(inputDistance.value);
    duration = Number(inputDuration.value);

    // check data is valid
    const isNumber = (...value) => value.every(el => Number.isFinite(el));
    const allPositiveNumber = (...value) => value.every(el => el > 0);
    if (type === 'running') {
      cadence = Number(inputCadence.value);
      if (
        !isNumber(distance, duration, cadence) ||
        !allPositiveNumber(distance, duration, cadence)
      ) {
        return alert('you need to input Correct Positive Number !');
      }
    }
    if (type === 'cycling') {
      elevGain = Number(inputElevation.value);
      if (
        !isNumber(distance, duration, elevGain) ||
        !allPositiveNumber(distance, duration)
      ) {
        return alert('you need to input Correct Positive Number !');
      }
    }

    // check submit to new workout
    if (form.dataset.id === '') {
      // get coords when click map of user
      lat = this.#mapEvent.latlng.lat;
      lng = this.#mapEvent.latlng.lng;

      if (type === 'running')
        workout = new Running([lat, lng], distance, duration, cadence);
      if (type === 'cycling')
        workout = new Cycling([lat, lng], distance, duration, elevGain);
    }
    // check submit to edit
    else {
      let wkEdit = this.#workoutsArr.find(ob => ob.id === form.dataset.id);
      if (type === 'running')
        workout = new Running(wkEdit.coords, distance, duration, cadence);
      if (type === 'cycling')
        workout = new Cycling(wkEdit.coords, distance, duration, elevGain);

      this._delete(wkEdit);
    }
    // add object in workout array
    this.#workoutsArr.push(workout);

    // render maker on Map
    this._renderMaker(workout);

    // Render workout on list
    this._renderWorkoutList(workout);

    // display control
    this._displayControl();

    // Hide form + clear data input fields:
    inputDistance.value =
      inputCadence.value =
      inputDuration.value =
      inputElevation.value =
        '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);

    // Set local storage to all workouts
    this._setLocalStorage();
  }

  // Render workout on map as marker
  _renderMaker(workout) {
    const maker = L.marker(workout.coords);
    this.#makerArr.push(maker);

    maker
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
      <div class="workout-group__icon">
        <div class="workout__icon workout__icon--edit">🖋️</div>
        <div class="workout__icon workout__icon--delete">🗑️</div>
      </div>
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
    containerWorkouts.insertAdjacentHTML('beforeend', html);
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

    // using the public interface
    // console.log(workout.countClick(), workout);
  }

  // edit workout
  _edit(wk) {
    form.classList.remove('hidden');
    inputDistance.focus();

    // get value from workout edited to show on form input
    inputType.value = wk.type;
    inputDistance.value = wk.distance;
    inputDuration.value = wk.duration;
    if (wk.type === 'running') inputCadence.value = wk.cadence;
    if (wk.type === 'cycling') inputElevation.value = wk.elevGain;

    // check type to toggle field when edit workout
    inputType.dispatchEvent(new Event('change'));
  }

  // delete workout
  _delete(workout) {
    let wkIndex = this.#workoutsArr.indexOf(workout);

    // delete wk on local storage
    const dataLocalStorage = JSON.parse(localStorage.getItem('workout'));
    dataLocalStorage.splice(wkIndex, 1);

    // delet wk on array
    this.#workoutsArr.splice(wkIndex, 1);
    this._setLocalStorage();

    // delete wk on maker
    this.#makerArr[wkIndex].remove();
    this.#makerArr.splice(wkIndex, 1);

    // delete ui
    const wkUINodeList = document.querySelectorAll('.workout');
    for (let i = 0; i < wkUINodeList.length; i++) {
      if (wkUINodeList[i].dataset.id === workout.id) wkUINodeList[i].remove();
    }

    // display control
    this._displayControl();
  }

  _controlBtn(e) {
    const clicked = e.target;
    const showSort = function () {
      btnSort.classList.toggle('active');
      sortContainer.classList.toggle('sort-hidden');
    };

    if (clicked.classList.contains('btn--sort')) {
      showSort();
    }
    if (clicked.classList.contains('btn--overview')) {
      // Automatically Zoom the map to fit all markers
      const group = new L.featureGroup(this.#makerArr);
      this.#map.fitBounds(group.getBounds());
    }
    if (clicked.classList.contains('btn--delete-all')) {
      this.#workoutsArr.forEach(el => this._delete(el));

      // delete all on localstorage
      this._reset();
    }
  }

  _sortType(e) {
    const btnClicked = e.target;
    const wkUINodeList = document.querySelectorAll('.workout');

    [...btnClicked.parentElement.children].forEach(el =>
      el.classList.remove('active')
    );
    btnClicked.classList.add('active');

    if (btnClicked.classList.contains('sort--type')) {
      this.#workoutsArr.sort((a, b) => {
        if (a.type < b.type) return -1;
        if (a.type > b.type) return 1;
        return 0;
      });
    } else if (btnClicked.classList.contains('sort--distance')) {
      this.#workoutsArr.sort((a, b) => a.distance - b.distance);
    } else {
      this.#workoutsArr.sort((a, b) => a.duration - b.duration);
    }

    this.#workoutsArr.forEach((el, i) => {
      // delete UI and re-render new wk
      wkUINodeList[i].remove();
      this._renderWorkoutList(el);
    });
  }

  // store workout at localstorage
  _setLocalStorage() {
    localStorage.setItem('workout', JSON.stringify(this.#workoutsArr));
  }

  _getLocalStorage() {
    const dataLocalWorkouts = JSON.parse(localStorage.getItem('workout'));
    if (!dataLocalWorkouts) return;

    this.#workoutsArr = dataLocalWorkouts;
    this.#workoutsArr.forEach(wk => {
      this._renderMaker(wk);
      this._renderWorkoutList(wk);
    });

    this._displayControl();
  }

  _reset() {
    localStorage.removeItem('workout');
    location.reload();
  }
}
const app = new App();
