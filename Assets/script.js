const weatherAPI = "6b83faa0314e5970068d0ef9b2e007ee"



//TODO: Add a function that fires when a search is submitted 
$('#searchBtn').on('click', searchBtnClick);


function searchBtnClick(event){
    let cityName = $('#searchInput').val()
    //Check if city exists 
    //Add city to local Storage 
    let previousSearches = JSON.parse(localStorage.getItem('previousSearches'));

    previousSearches.pop();
    previousSearches.unshift(cityName);

    localStorage.setItem('previousSearches', JSON.stringify(previousSearches))
    
    //clear all previous searches before re rendering
    let previousSearchDiv = $('#previousSearches');
    previousSearchDiv.empty();

    loadPreviousSearches();


    //
}

//TODO: Add the search to the list of previously searched cities and make it active and project contents onto dashboard 

//TODO: Remove last previously searched item

//TODO: Generate 5 day forecast

//TODO: Generate current day forecast

//TODO: Load minor infomation for list items

//TODO: Make an API call 

function appendNewSearch(){
    let previousSearches = JSON.parse(localStorage.getItem('previousSearches'));

    console.log(previousSearches);
}

function loadPreviousSearches(){
    let previousSearches = JSON.parse(localStorage.getItem('previousSearches'));


    if(!previousSearches){
        previousSearches=["Adelaide", "Melbourne", "Sydney", "Perth", "Hobart", "Brisbane", "Darwin"]
        localStorage.setItem("previousSearches", JSON.stringify(previousSearches))
    }
    let prevSearchDiv = $('#previousSearches');

    for(let i = 0; i < previousSearches.length; i++){
        let anchor = $('<a>').addClass('list-group-item list-group-item-action').attr('href', '#tab')
        if(i == 0){
            anchor.addClass('active');
        }
        let body = $('<div>').addClass("d-flex w-100 justify-content-between");
        let p = $('<p>').addClass('mb-1');
        let smallText = $('<small>').addClass('text-body-secondary').attr('id', 'weatherDescription');
        let innerSmall = $('<div>').text('sometime');
        let heading = $('<h5>').text(previousSearches[i]);

        anchor.append(body, p, smallText);
        body.append(heading, innerSmall);

        prevSearchDiv.append(anchor);
    }

    loadPreviousSearchesData()
}

function loadMainBoard(){
    let currentSearch = $('.active').find('h5').text();
    console.log(currentSearch);
    let mainContainer = $('#mainContainer');

    weatherDataFetch(currentSearch, "current")
        .then(data =>{

                //Get current weather data for selected city

        

        //Load today's weather 
        let mainHeading = $('h2').text(currentSearch);
        mainContainer.append(mainHeading);

        let mainCard = $('<div>').addClass('card');
        let headerCard = $('<div>').addClass('card-header');
        let bodyCard = $('<div>').addClass('card-body');

        mainCard.append(headerCard, bodyCard);

        let smallHeading = $('<h5>').addClass('card-title').text("Today's weather");
        let currentTemperature = $('<h5>').text("The current temperature is: " + data.main.temp)
        let currentWind = $('<h5>').text("Wind: " + data.wind.speed);
        let currentHumidity = $('<h5>').text("Humidity: " + data.main.humidity);

        headerCard.append(smallHeading);
        bodyCard.append(currentTemperature, currentWind, currentHumidity);
        mainContainer.append(mainCard)


        })
        .catch(error =>{
            console.error("Error", error)
        })

    weatherDataFetch(currentSearch, "fiveDay")
        .then(data =>{
        console.log(data)
            //Load 5 day forecast 
        let fiveDayHeader = $('<h3>').text("5 Day Forecast:");
        mainContainer.append(fiveDayHeader);

        for(let i = 0; i < 5; i++){
            let date = data.list[0].dt;

            
            let mainForecastCard = $('<div>').addClass('card');
            let headerForecastCard = $('<div>').addClass('card-header');
            let bodyForecastCard = $('<div>').addClass('card-body');

            mainForecastCard.append(headerForecastCard, bodyForecastCard);

            let smallForecastHeading = $('<h5>').addClass('card-title').text(date);
            let smallForecastTemp = $('<h5>').text(data.list[0].main.temp);
            let smallForecastWind = $('<h5>').text(data.list[0].wind.speed);
            let smallForecastHumidity = $('<h5>').text(data.list[0].main.humidity);

            headerForecastCard.append(smallForecastHeading);
            bodyForecastCard.append(smallForecastTemp, smallForecastWind, smallForecastHumidity);


            mainContainer.append(mainForecastCard);
        }
        })
        .catch(error => {
            console.error("Error", error)
        })

    


}

function loadPreviousSearchesData(){


    $('#previousSearches a').each(function(){
        let cityName = $(this).find('h5').text();

        weatherDataFetch(cityName, "current")
            .then(data =>{
                let currentTempText = $(this).find('p');
                currentTempText.text(data.main.temp + " Degrees")

                let tempDesc = $(this).find('#weatherDescription');
                tempDesc.text(data.weather[0].description)


            })
            .catch(error =>{
                console.error("Error", error)
            })
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
                .catch(error =>{
                    console.error('Error:', error)
                    throw error;
                })
                return data;
            } else if (day == "fiveDay"){
                let apiUrl = "https://api.openweathermap.org/data/2.5/forecast?lat=" + latitude + "&lon=" + longitude + "&appid=" + weatherAPI + "&units=metric";

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
                return data;
            }
        })
        
        .catch(error => {
            console.error("error", error)
            throw error;
        })
    
}

async function coordinatesFetch(cityName){
    
    try{
        let apiUrl = "http://api.openweathermap.org/geo/1.0/direct?q=" + cityName + "&limit=5&appid=6b83faa0314e5970068d0ef9b2e007ee";

        const response = await fetch(apiUrl);

        if(!response.ok){
            throw new Error('Network response failed');
        }

        const data = await response.json();
        return data
    } catch(error){
        console.error('Error', error);
        throw error;
    }
    
}



loadPreviousSearches()
loadMainBoard();