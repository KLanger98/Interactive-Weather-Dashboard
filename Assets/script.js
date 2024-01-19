const weatherAPI = "6b83faa0314e5970068d0ef9b2e007ee"


//Create event listeners for submission and enter keypress
$('#searchBtn').on('click', searchBtnClick);
$('#searchInput').on('keypress', function(event){
    if(event.key === "Enter"){
        searchBtnClick();
    }
})

//Create a function that checks the validity of the inputted data by checking for an empty input and checking if the city exists
function searchBtnClick(){
    let cityName = $('#searchInput').val()

    if(cityName == ""){
        let noText = $('<h4>').text('Please add text to the search bar').css('color', 'red');
        $('#searchBar').append(noText);
        setTimeout(function(){
            $(noText).remove()
        }, 4000)
        return;
    }

    coordinatesFetch(cityName)
        .then(response =>{
            if(!response.ok){
                let error = $('<h4>').text('City does not exist').css('color', 'red').addClass('errorText')
                $('#searchBar').append(error);
                setTimeout(function(){
                    $(error).remove()
                }, 4000)
                return;
            }
            runSearch();
        })
    
}

//Once valid, add the search to localStorage and reload the page 
function runSearch(){
    let cityName = $('#searchInput').val()
    $('#searchInput').val(' ')

    //Add city to local Storage 
    let previousSearches = JSON.parse(localStorage.getItem('previousSearches'));

    previousSearches.pop();
    previousSearches.unshift(cityName);

    localStorage.setItem('previousSearches', JSON.stringify(previousSearches))
    
    //clear all previous searches before re rendering
    $('#previousSearches').empty();

    loadPreviousSearches();
    $('#mainContainer').empty();
    loadMainBoard();
}

function loadPreviousSearches(){
    //Check if previous data exists within local Storage
    let previousSearches = JSON.parse(localStorage.getItem('previousSearches'));

    //If not, create default previous searches
    if(!previousSearches){
        previousSearches=["Adelaide", "Melbourne", "Sydney", "Perth", "Hobart", "Brisbane", "Darwin"]
        localStorage.setItem("previousSearches", JSON.stringify(previousSearches))
    }

    //Load all previous search list group
    let prevSearchDiv = $('#previousSearches');
    prevSearchDiv.empty();

    let prevSearchHeading = $('<h3>').text('Previous Searches').css('color', 'white').addClass('ms-3')
    prevSearchDiv.append(prevSearchHeading)

    for(let i = 0; i < previousSearches.length; i++){
        let anchor = $('<a>').addClass('list-group-item list-group-item-action list-group-item-primary').attr('href', '#tab')
        if(i == 0){
            anchor.addClass('active');
        }
        let body = $('<div>').addClass("d-flex w-100 justify-content-between");
        let p = $('<p>').addClass('mb-1');
        let smallText = $('<small>').addClass('text-body-secondary').attr('id', 'weatherDescription').css('color', 'white');
        let heading = $('<h5>').text(previousSearches[i]);

        //Add onclick event which clears active class and reassigns selected search the active class
        anchor.on('click', changeActive)

        anchor.append(body, p, smallText);
        body.append(heading);

        prevSearchDiv.append(anchor);
    }
    //Trigger fetch of data to reload into previous search elements 
    loadPreviousSearchesData();
}

//Fetch temperature data for previous search list to display
function loadPreviousSearchesData(){
    $('#previousSearches a').each(function(){
        let cityName = $(this).find('h5').text();

        weatherDataFetch(cityName, "current")
            .then(data =>{
                let currentTempText = $(this).find('p');
                currentTempText.text(data.main.temp + "°C")

                let tempDesc = $(this).find('#weatherDescription');
                tempDesc.text(data.weather[0].description)
            })
            .catch(error =>{
                console.error("Error", error)
            })
    })
}

//Remove active class from all list items and add new active class to selection
function changeActive(event){
    let anchorBoxes = $('a');
    for(let i = 0; i < anchorBoxes.length; i++){
        $(anchorBoxes[i]).off('click');
        if($(anchorBoxes[i]).hasClass("active")){
            $(anchorBoxes[i]).removeClass('active');
        }
    }

    let clickedBox = $(event.target).closest('a');
    $(clickedBox).addClass('active');

    $('#mainContainer').empty();
    loadMainBoard();
}

function loadMainBoard(){
    let currentSearch = $('.active').find('h5').text();
    console.log(currentSearch);
    let mainContainer = $('#mainContainer');

    weatherDataFetch(currentSearch, "current")
        .then(data =>{
        console.log(data)
        //Load today's weather 
        let mainHeading = $('<h2>').text(currentSearch).css("color", "white");
        mainContainer.append(mainHeading);

        let mainCard = $('<div>').addClass('card text-bg-dark');
        let headerCard = $('<div>').addClass('card-header');
        let bodyCard = $('<div>').addClass('card-body row');
        let mainTemps = $('<div>').addClass('col-6')
        let otherInfo = $('<div>').addClass('col-6')

        mainCard.append(headerCard, bodyCard);

        //Add icon
        let iconDiv = $('<div>').attr('id', 'icon');
        let iconUrl = "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png";
        let iconImg = $('<img>').attr('src', iconUrl).attr('alt', "weather icon").attr('height', "100px");
        iconDiv.append(iconImg);
        bodyCard.append(iconDiv);
        //Add weather info
        let smallHeading = $('<h3>').addClass('card-title').text("Today's weather in " + currentSearch);
        let currentTemperature = $('<h5>').text("The current temperature is: " + data.main.temp + "°C")
        let currentWind = $('<h5>').text("Wind: " + data.wind.speed + " km/h");
        let currentHumidity = $('<h5>').text("Humidity: " + data.main.humidity + " g.m-3");
        let currentFeelsLike = $('<h5>').text("Feels like: " + data.main.feels_like + "°C");
        let maxTemp = $('<h5>').text("Max: " + data.main.temp_max + "°C");
        let minTemp = $('<h5>').text("Min: " + data.main.temp_min + "°C");

        mainTemps.append(currentTemperature, currentFeelsLike, minTemp, maxTemp);
        otherInfo.append(currentWind, currentHumidity)

        headerCard.append(smallHeading);
        bodyCard.append(mainTemps, otherInfo);
        mainContainer.append(mainCard)
        })
        .catch(error =>{
            console.error("Error", error)
        })

    weatherDataFetch(currentSearch, "fiveDay")
        .then(data =>{
        console.log(data)
            //Load 5 day forecast 
        let fiveDayHeader = $('<h3>').text("5 Day Forecast:").css('color', 'white').addClass(' mt-4');
        mainContainer.append(fiveDayHeader);

        for(let i = 4; i < data.list.length; i = i + 8){
            let date = data.list[i].dt;
            console.log();

            
            let mainForecastCard = $('<div>').addClass('card  col-lg-2 m-3 text-bg-warning col-sm-10 col-md-10');
            let headerForecastCard = $('<div>').addClass('card-header');
            let bodyForecastCard = $('<div>').addClass('card-body');

            //Add Icon at top of card
            let iconDiv = $('<div>').attr('id', 'icon');
            let iconUrl = "http://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png";
            let iconImg = $('<img>').attr('src', iconUrl).attr('alt', "weather icon");
            iconDiv.append(iconImg);
            bodyForecastCard.append(iconDiv);

            mainForecastCard.append(headerForecastCard, bodyForecastCard);

            let smallForecastHeading = $('<h5>').addClass('card-title').text(dayjs.unix(date).format("dddd, DD/MM/YYYY"));
            let smallForecastTemp = $('<p>').text("Temperature: " + data.list[i].main.temp + "°C");
            let smallForecastWind = $('<p>').text("Wind speed: " + data.list[i].wind.speed + " km/h");
            let smallForecastHumidity = $('<p>').text("Humidity: " + data.list[i].main.humidity + " g.m-3");

            headerForecastCard.append(smallForecastHeading);
            bodyForecastCard.append(smallForecastTemp, smallForecastWind, smallForecastHumidity);


            mainContainer.append(mainForecastCard);
        }
        })
        .catch(error => {
            console.error("Error", error)
        })

    


}



function weatherDataFetch(cityName, day){

    return coordinatesFetch(cityName)
        .then(data => {
            let latitude = data[0].lat;
            let longitude = data[0].lon;
            if(day === "current"){
                let apiUrl = "https://api.openweathermap.org/data/2.5/weather?lat="+ latitude + "&lon=" + longitude + "&appid=" + weatherAPI + "&units=metric";

            return fetch(apiUrl)
                .then(response =>{
                    if(!response.ok){
                        throw new Error('Network not responding');
                    }

                    return response.json();
                })
                .then(weatherData =>{
                    return weatherData;
                })
                .catch (error =>{
                    console.error('Error:', error)
                    throw error;
                })
            } else if (day == "fiveDay"){
                let apiUrl = "https://api.openweathermap.org/data/2.5/forecast?lat="+ latitude + "&lon=" + longitude + "&appid=" + weatherAPI + "&units=metric";

                return fetch(apiUrl)
                .then(response =>{
                    if(!response.ok){
                        throw new Error('Network not responding');
                    }

                    return response.json();
                })
                .then(weatherData =>{
                    return weatherData;
                })
                .catch(error =>{
                    console.error('Error:', error)
                    throw error;
                })
            }
        })
        .catch(error => {
            console.error("error", error)
            throw error;
        })
    
}

function coordinatesFetch(cityName){
    let apiUrl = "http://api.openweathermap.org/geo/1.0/direct?q=" + cityName + "&limit=5&appid=6b83faa0314e5970068d0ef9b2e007ee";

    return fetch(apiUrl)
        .then(response =>{
            if(!response.ok){
                throw new Error('Network response failed');
            }
            return response.json();
        })
        .then(data =>{
            return data
        })
        .catch(error => {
            console.error("Error", error);
            throw error;
        })
    
}

loadPreviousSearches()
loadMainBoard();