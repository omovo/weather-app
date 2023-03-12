$(window).on('load', function () {
    currentLocation();
    checkLocalStorage();
});
// API Key for all weather data 
let APIKey = "0039b25f6e783ae164a12fcada093b0b";
let q = "";
let now = moment();
//Date and time formate for header
let currentDate = now.format('MMMM Do YYYY || h:mm a');
$("#currentDay").text(currentDate);

//Setting the click function at ID search button
$("#search-button").on("click", function (event) {
    // Preventing the button from trying to submit the form
    event.preventDefault();

    q = $("#city-input").val();
    if (q === '') {
        return alert('Please Enter Valid City Name ! ');
    }
    getWeather(q);

    saveToLocalStorage(q);
});
// Function to create Button for searched city 
function createRecentSearchBtn(q) {
    let newLi = $("<li>")
    let newBtn = $('<button>');
    //Adding Extra ID for Button to stop Creating Duplicate Button on Click
    newBtn.attr('id', 'extraBtn');
    newBtn.addClass("button is-small recentSearch");
    newBtn.text(q);
    newLi.append(newBtn)
    $("#historyList").prepend(newLi);
    //setting click function to prevent duplicate button
    $("#extraBtn").on("click", function () {
        let newQ = $(this).text();
        getWeather(newQ);
    });
}
//converting temperature F to Celsius 
function convertToC(fahrenheit) {
    let fTempVal = fahrenheit;
    let cTempVal = (fTempVal - 32) * (5 / 9);
    let celcius = Math.round(cTempVal * 10) / 10;
    return celcius;
  }

//Function to get weather details 
function getWeather(q) {
    let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + q + "&units=imperial&appid=" + APIKey;
    $.ajax({
        // gets the current weather info
        url: queryURL,
        method: "GET",
        error: (err => { //If API through error then alert 
            alert("Your city was not found. Check your spelling or enter a city code")
            return;
          })
    }).then(function (response) {
        console.log(response)
        //to avoid repeating city information on button click 
        $(".cityList").empty()
        $("#days").empty()
        let celcius = convertToC(response.main.temp);
        let cityMain1 = $("<div col-12>").append($("<p><h2>" + response.name + ' (' + currentDate + ')' + "</h2><p>"));
        let image = $('<img class="imgsize">').attr('src', 'http://openweathermap.org/img/w/' + response.weather[0].icon + '.png');        
        let degreeMain = $('<p>').text('Temperature : ' + response.main.temp + ' °F (' + celcius + '°C)');
        let humidityMain = $('<p>').text('Humidity : ' + response.main.humidity + '%');
        let windMain = $('<p>').text('Wind Speed : ' + response.wind.speed + 'MPH');       
        let uvIndexcoord = '&lat=' + response.coord.lat + '&lon=' + response.coord.lon;
        let cityId = response.id;

        displayUVindex(uvIndexcoord);
        displayForecast(cityId);

        cityMain1.append(image).append(degreeMain).append(humidityMain).append(windMain);
        $('#cityList').empty();
        $('#cityList').append(cityMain1);
    });
}
//function for UV Index
function displayUVindex(uv) {
    $.ajax({ // gets the UV index info
        url: "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + uv,
        method: "GET"
    }).then(function (response) {
        let UVIndex = $("<p><span>");
        UVIndex.attr("class", "badge badge-danger");
        UVIndex.text(response.value);
        $("#cityList").append('UV-Index : ').append(UVIndex);       
    });
}
//function to Display 5 Day forecast
function displayForecast(c) {
    $.ajax({ // gets the 5 day forecast API
        url: "https://api.openweathermap.org/data/2.5/forecast?id=" + c + "&units=imperial&APPID=" + APIKey,
        method: "GET",
    }).then(function (response) {
        //  Parse response to display forecast for next 5 days underneath current conditions
        let arrayList = response.list;
        for (let i = 0; i < arrayList.length; i++) {
            if (arrayList[i].dt_txt.split(' ')[1] === '12:00:00') {
                console.log(arrayList[i]);
                let celcius = convertToC(arrayList[i].main.temp);//converting F to Celsius 
                let cityMain = $('<div>');
                cityMain.addClass('col forecast bg-primary text-white ml-3 mb-3 rounded>');
                let date5 = $("<h5>").text(response.list[i].dt_txt.split(" ")[0]);
                let image = $('<img>').attr('src', 'http://openweathermap.org/img/w/' + arrayList[i].weather[0].icon + '.png');
                const degreeMain = $('<p>').text('Temp : ' + arrayList[i].main.temp + ' °F ('+ celcius + '°C)');               
                let humidityMain = $('<p>').text('Humidity : ' + arrayList[i].main.humidity + '%');
                let windMain = $('<p>').text('Wind Speed : ' + arrayList[i].wind.speed + 'MPH');                
                cityMain.append(date5).append(image).append(degreeMain).append(humidityMain).append(windMain);
                $('#days').append(cityMain);
            }
        }
    });
};
// Display automatic Current Locaion 
function currentLocation() {
    $.ajax({
        url: "https://freegeoip.app/json/",
        method: "GET",
    }).then(function (response) {
        q = response.city || 'exton';
        console.log(q);
        getWeather(q);
    });
};

// Function to get data store in Locaal Storage 
function checkLocalStorage() {
    let storedData = localStorage.getItem('queries');
    let dataArray = [];
    if (!storedData) {
        console.log("no data stored");
    } else {
        storedData.trim();
        dataArray = storedData.split(',');
        for (var i = 0; i < dataArray.length; i++) {
            createRecentSearchBtn(dataArray[i]);
        }
    }
};
// Function to Set data in Local storage
function saveToLocalStorage(q) {
    let data = localStorage.getItem('queries');
    if (data) {
        console.log(data, q)

    } else {
        data = q;
        localStorage.setItem('queries', data);
    }
    if (data.indexOf(q) === -1) {
        data = data + ',' + q;
        localStorage.setItem('queries', data);
        createRecentSearchBtn(q);
    }
}
//added clear histor fuction to clear searched city list
$("#clear-history").on("click", function (event) {
    $("#historyList").empty();
});