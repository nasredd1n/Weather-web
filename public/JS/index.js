let toHistory = false;
let mapInitialized = false;
let map;

window.onload = function() {
    document.getElementById("city").value = "Astana";
    document.getElementById("searchButton").click();
}

function getDayOfWeek(dateString) {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dateObject = new Date(dateString);
    const dayOfWeekNumber = dateObject.getDay();
    const dayOfWeek = daysOfWeek[dayOfWeekNumber];
    return dayOfWeek;
}

function getMap(lat, lon) {
    const center = { lat: lat, lng: lon };

    map = new google.maps.Map(document.getElementById('map'), {
      center: center,
      zoom: 12,
      mapTypeId: 'satellite',
    });

    marker = new google.maps.Marker({
      position: center,
      map: map,
      draggable: true,
    });
}

async function search() {
    let city = document.getElementById("city").value;
    document.getElementById("city").value = "";
    getWeatherData(city);
    get7days(city);
}

async function getWeatherData(city) {
    try {
        const response = await fetch('/getWeatherData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({city: city}),
        });
        const responseData = await response.json();

        let data = responseData.forecast.forecastday;
        buildInfo(responseData, city);
        getMap(responseData.location.lat, responseData.location.lon);
        updateHistory(city);
    } catch (error) {
        console.error('Error: ', error);
    }
}

async function get7days(city) {
    try {
        const response = await fetch('/get7days', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({city: city}),
        });
        const responseData = await response.json();
        result = ``;
        for (let i in responseData.data) {
            result += `
                <div class="weekBlock mx-2">
                    <div class="w-100 d-flex justify-content-center my-3">
                        <img src="https://cdn.weatherbit.io/static/img/icons/${responseData.data[i].weather.icon}.png" class="weekWeather text-center">
                    </div>
                    <h4 class="text-center">${responseData.data[i].temp} °C</h4>
                    <p class="text-center fs-5">${responseData.data[i].weather.description}</p>
                    <hr class="mx-2">
                    <div class="mx-3 d-flex justify-content-between">
                        <div class="d-flex fw-light align-items-center">
                            <i class="fa-solid fa-wind fa-lg week_icon"></i>
                            <p class="weekDes ms-1">${responseData.data[i].wind_spd}m/s</p>
                        </div>
                        <div class="d-flex fw-light align-items-center">
                            <i class="fa-solid fa-gauge fa-lg week_icon"></i>
                            <p class="weekDes ms-1">${responseData.data[i].pres}mb</p>
                        </div>
                    </div>
                    <p class="text-center fs-5 my-3">${getDayOfWeek(responseData.data[i].datetime)}</p>
                </div>
            `;
        }

        document.getElementById("week").innerHTML = result;
    } catch (error) {
        console.error('Error: ', error);
    }
}

function buildInfo(data, city) {
    document.getElementById("cityName").innerHTML = city;
    document.getElementById("weatherIcon").src = data.current.condition.icon;
    document.getElementById("temperature").innerHTML = `${data.current.temp_c} °C`;
    document.getElementById("text").innerHTML = data.current.condition.text;
    document.getElementById("sunrise").innerHTML = data.forecast.forecastday[0].astro.sunrise;
    document.getElementById("sunset").innerHTML = data.forecast.forecastday[0].astro.sunset;
    document.getElementById("humidity").innerHTML = `${data.current.humidity}%`;
    document.getElementById("windSpeed").innerHTML = `${data.current.wind_kph}km/h`;
    document.getElementById("visibility").innerHTML = `${data.current.vis_km}km`;
    document.getElementById("pressure").innerHTML = `${data.current.pressure_mb}mb`;
}

async function updateHistory(city) {
    try {
        if (toHistory == true) {
            const currentDate = new Date();
            const date = `${currentDate.getFullYear()}.${currentDate.getMonth()}.${currentDate.getDate()}`;
            const time = `${currentDate.getHours()}:${currentDate.getMinutes()}`;
            const temperature = document.getElementById("temperature").innerHTML;
            const description = document.getElementById("text").innerHTML;
            const humidity = document.getElementById("humidity").innerHTML;
            const pressure = document.getElementById("pressure").innerHTML;
            const visibility = document.getElementById("visibility").innerHTML;
            const windSpeed = document.getElementById("windSpeed").innerHTML;
            const sunrise = document.getElementById("sunrise").innerHTML;
            const sunset = document.getElementById("sunset").innerHTML;
            const urlParams = new URLSearchParams(window.location.search);
            const user = urlParams.get('username');
            const response = await fetch('/updateHistory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({date: date, time: time, city: city, temperature: temperature, description: description, humidity: humidity, pressure: pressure, visibility: visibility, windSpeed: windSpeed, sunrise: sunrise, sunset: sunset, user: user}),
            });
        } else {
            toHistory = true;
        }
    } catch (error) {
        console.error('Error: ', error);
    }
}

const switchers = [...document.querySelectorAll('.switcher')]

switchers.forEach(item => {
	item.addEventListener('click', function() {
		switchers.forEach(item => item.parentElement.classList.remove('is-active'))
		this.parentElement.classList.add('is-active')
	})
})

