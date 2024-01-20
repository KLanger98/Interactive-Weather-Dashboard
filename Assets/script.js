const weatherAPI = "6b83faa0314e5970068d0ef9b2e007ee"
let dataFetching = false;


//Create event listeners for submission and enter keypress
$('#searchBtn').on('click', searchBtnClick);
$('#searchInput').on('keypress', function(event){
    if(event.key === "Enter"){
        searchBtnClick();
    }
})

//Create a function that checks the validity of the inputted data by checking for an empty input and checking if the city exists
function searchBtnClick(){
    //check if there is a fetch still being completed
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
        .then(data =>{
            if(data[0] == null){
                let error = $('<h4>').text('City does not exist').css('color', 'red').addClass('errorText')
                $('#searchBar').append(error);
                setTimeout(function(){
                    $(error).remove()
                }, 4000)
                return;
            }
            runSearch();
            return;
        })
        .catch(error => {
            console.error("Error", error)
        })
        .finally(() =>{
            $(this).attr('data-fetch', false);
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
    if(dataFetching == true){
        console.log('Please wait for fetch to complete');
        return;
    }
    $('#spinLoad').css('display', 'inline');
    $('#currentWeatherMain').css('display', 'none');
    $('#fiveDayContainer').css('display', 'none');
    dataFetching = true;
    let anchorBoxes = $('a');
    for(let i = 0; i < anchorBoxes.length; i++){
        if($(anchorBoxes[i]).hasClass("active")){
            $(anchorBoxes[i]).removeClass('active');
        }
    }

    let clickedBox = $(event.target).closest('a');
    $(clickedBox).addClass('active');
    loadMainBoard();
}

//Load the main staging area for today's weather and five day forecast
function loadMainBoard(){
    
    

    let currentSearch = $('.active').find('h5').text();
    let mainContainer = $('#mainContainer');

    //Load today's weather 
    $('#mainHeading').text(currentSearch).css("color", "white")    

    weatherDataFetch(currentSearch, "current")
        .then(data =>{
            //Add icon
            
            let iconUrl = "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png";
            $('#currentIcon').attr('src', iconUrl).attr('alt', "weather Icon").attr('height', "100px");
                //Add weather info
            $('#mainTitle').text(currentSearch);
            $('#currentTemp').text(data.main.temp + "°C");
            $('#currentWind').text(data.wind.speed + " km/h")
            $('#currentHumidity').text(data.main.humidity + " g.m-3")
            $('#currentMaxTemp').text(data.main.temp_max + "°C");
            $('#currentMinTemp').text(data.main.temp_min + "°C");
            $('#currentFeelsLike').text(data.main.feels_like + "°C")
        })
        .catch(error =>{
            console.error("Error", error)
        })
        .finally(()=>{
            $('#currentWeatherMain').css('display', 'inline');
            dataFetching = false;
        })

    weatherDataFetch(currentSearch, "fiveDay")
        .then(data =>{
            //Load 5 day forecast 
        console.log(data);
        for(let j = 4; j < data.list.length; j = j + 8){
        }
        let timeStamps = [3 ,11, 19, 27, 35];
        for(let i = 0; i < 5; i++){
            let iconUrl = "https://openweathermap.org/img/w/" + data.list[timeStamps[i]].weather[0].icon + ".png";
            let date = data.list[i].dt;

            $('#forecast-' + i + "-icon").attr('src', iconUrl);
            $('#forecast-' + i + "-title").text(dayjs.unix(date).format("dddd, DD/MM/YYYY"));
            $('#forecast-' + i + "-temp").text("Temperature: " + data.list[timeStamps[i]].main.temp + "°C");
            $('#forecast-' + i + "-humidity").text("Humidity: " + data.list[timeStamps[i]].main.humidity + " g.m-3");
            $('#forecast-' + i + "-wind").text("Wind speed: " + data.list[timeStamps[i]].wind.speed + " km/h");
        }
        })
        .catch(error => {
            console.error("Error", error)
        })

        .finally(()=>{
            $('#fiveDayContainer').css('display', 'inline');
            $('#spinLoad').css('display', 'none');
            dataFetching = false;
        })
}

//Given coordinates, fetch the necessary weather data depending on requested timeframe either today or five day forecast
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


//Fetch the name of the city 
function coordinatesFetch(cityName){
    let apiUrl = "https://api.openweathermap.org/geo/1.0/direct?q=" + cityName + "&limit=5&appid=6b83faa0314e5970068d0ef9b2e007ee";

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