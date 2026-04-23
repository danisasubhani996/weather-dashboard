const apiKey = "b7899190f9d0f3beba6d84b4d3727969";

const cities = ["Hyderabad","Delhi","Mumbai","Chennai","Bangalore","Kolkata","Pune","Vizag"];

document.getElementById("city").addEventListener("keypress", function(e){
    if(e.key === "Enter") getWeather();
});

document.getElementById("city").addEventListener("input", function(){
    const value = this.value.toLowerCase();
    const box = document.getElementById("suggestions");
    box.innerHTML = "";

    if(!value) return;

    cities.filter(c => c.toLowerCase().includes(value))
    .forEach(city=>{
        const div = document.createElement("div");
        div.className="suggestion-item";
        div.innerText=city;
        div.onclick=()=>{
            document.getElementById("city").value=city;
            box.innerHTML="";
            getWeather();
        };
        box.appendChild(div);
    });
});

document.getElementById("city").addEventListener("focus", showHistory);

function getWeather(){
    const city = document.getElementById("city").value.trim();
    if(!city) return alert("Enter city");
    saveSearch(city);
    fetchWeather(city);
}

function getLocation(){
    navigator.geolocation.getCurrentPosition(pos=>{
        fetchWeatherByCoords(pos.coords.latitude,pos.coords.longitude);
    });
}

async function fetchWeather(city){
    document.getElementById("weatherCard").innerHTML=`<div class="loader"></div>`;

    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
    const data = await res.json();

    if(data.cod!==200){
        document.getElementById("weatherCard").innerHTML="❌ City not found";
        return;
    }

    displayWeather(data);
    getHourly(city);
    getForecast(city);
}

async function fetchWeatherByCoords(lat,lon){
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    const data = await res.json();

    displayWeather(data);
    getHourly(data.name);
    getForecast(data.name);
}

function displayWeather(data){
    const weather=data.weather[0].main;
    const icon=data.weather[0].icon;
    const temp=data.main.temp;

    let cls="cool";
    if(temp>=35) cls="hot";
    else if(temp>=25) cls="warm";
    else if(temp<15) cls="cold";

    document.getElementById("weatherCard").innerHTML=`
        <h2>${data.name}</h2>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png">
        <h1 class="${cls}">${temp}°C</h1>
        <p>${weather}</p>
        <p>💧 ${data.main.humidity}% | 🌬 ${data.wind.speed}</p>
    `;

    changeBackground(temp);
    setDayNight(data.sys.sunset);
    setWeatherEffect(weather);
}

async function getHourly(city){
    const res=await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
    const data=await res.json();

    let html="";
    for(let i=0;i<8;i++){
        const h=data.list[i];
        const time=new Date(h.dt_txt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});

        html+=`
        <div class="hour-card">
            <p>${time}</p>
            <img src="https://openweathermap.org/img/wn/${h.weather[0].icon}.png">
            <p>${h.main.temp}°C</p>
        </div>`;
    }
    document.getElementById("hourly").innerHTML=html;
}

async function getForecast(city){
    const res=await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
    const data=await res.json();

    let html="";
    for(let i=0;i<data.list.length;i+=8){
        const d=data.list[i];

        html+=`
        <div class="forecast-card">
            <p>${new Date(d.dt_txt).toLocaleDateString()}</p>
            <img src="https://openweathermap.org/img/wn/${d.weather[0].icon}.png">
            <p>${d.main.temp}°C</p>
        </div>`;
    }
    document.getElementById("forecast").innerHTML=html;
}

function changeBackground(temp){
    if(temp>=35) document.body.style.background="linear-gradient(135deg,#ff512f,#dd2476)";
    else if(temp>=25) document.body.style.background="linear-gradient(135deg,#f7971e,#ffd200)";
    else if(temp>=15) document.body.style.background="linear-gradient(135deg,#56ccf2,#2f80ed)";
    else document.body.style.background="linear-gradient(135deg,#83a4d4,#b6fbff)";
}

function setDayNight(sunset){
    const now=Date.now()/1000;
    document.body.classList.toggle("night", now>sunset);
}

function setWeatherEffect(weather){
    document.querySelectorAll(".rain,.snow").forEach(e=>e.remove());

    let div=document.createElement("div");
    if(weather==="Rain") div.className="rain";
    else if(weather==="Snow") div.className="snow";
    else return;

    document.body.appendChild(div);
}

function saveSearch(city){
    let history=JSON.parse(localStorage.getItem("history"))||[];
    if(!history.includes(city)){
        history.unshift(city);
        if(history.length>5) history.pop();
    }
    localStorage.setItem("history",JSON.stringify(history));
}

function showHistory(){
    const history=JSON.parse(localStorage.getItem("history"))||[];
    const box=document.getElementById("suggestions");
    box.innerHTML="";

    history.forEach(city=>{
        const div=document.createElement("div");
        div.className="suggestion-item";
        div.innerText=city;
        div.onclick=()=>{
            document.getElementById("city").value=city;
            box.innerHTML="";
            getWeather();
        };
        box.appendChild(div);
    });
}