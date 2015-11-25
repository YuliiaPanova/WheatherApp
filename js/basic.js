define(function (require) {
        var $ = require('jquery'),
            settings = require('settings'),
            view = require('view'),
            //jrange = require('jrange'),
            keeper = require('city-keeper');
    "use strict";
    var basic = {
        name: "Basic",
        viewObj:null,
        modals: [],
        observers: [],
        search: $('#search'),
        confirmDelete : $('#confirm-delete'),
        containerForCities : $('#citiesList'),
        templateListOfCities : $('#template-list-of-cities').html(),
        APIkeyForecast : '8b36d2c6b8f96d14b5cd1a6316655ab8',
        init: function(view_obj) {// Constructor
            this.viewObj = view_obj;
            this.viewObj.attach(this);
        },
        attach: function(obj) {
            this.observers.push(obj)
        },
        detach: function() {
            //TODO
        },
        notify: function(updatedSetting) {
            var me = this;
            $.each(this.observers,function(index,value){
                value.update(me,updatedSetting);
            });
        },
        update: function(observable, updatedSetting) {
            if(this.viewObj === observable){
                switch (updatedSetting) {
                    case 'refreshOneCity':
                        basic.refreshForecast();
                        break;
                    case 'ConfirmAddCity':
                        basic.confirmAddCities();
                        break;
                    case 'ConfirmDeleteCity':
                        basic.confirmDeleteCities();
                        break;
                    default:
                        break;
                }

            }
        },

        confirmDeleteCities: function(){
            var $checked = $('#citiesList').find("input:checked");
            $checked.each(function (i, ob) {
                var searchCityLongName = $(this).parents('li').find('.city-name').html();
                $.each(keeper.cities, function(index, item){
                    if(item){
                        if((searchCityLongName == item.longname)){
                            keeper.removeCity(index);
                        }
                    }
                });
            });
            settings.setCities(keeper.cities);//store changes to LocalStorage
        },

        confirmAddCities: function(){
            var $checked = $('#citiesList').find("input:checked");
            $checked.each(function (i, ob) {
                var $searchCity= $(this).parents('li').find('.city-name').html();
                $.each(keeper.temporary_cities, function(index, item){
                    if(($searchCity == item.longname)){
                        keeper.addCityToSlider(item);
                        return false;
                    }
                });
            });
            keeper.notify('addCityToSlider');
            settings.setCities(keeper.cities);//store cities to LocalStorage
        },

        searchCityLocation: function(){
           var $self=$(this);
            var char = $self.val();
            basic.containerForCities.empty();
            keeper.temporary_cities.length = 0;
            if(char){
                basic.getCityByChar(char)
            }
       },

        getCityByChar: function(locationName){
            var autocomplete = new google.maps.places.AutocompleteService(),
                options = {
                    input: locationName,
                    types: ['(cities)']
                };

            autocomplete.getPlacePredictions(options, function (req) {
                $.each(req, function (index, value) {
                    var obj = value;
                    var str = obj.description.trim();
                    basic.getCityCoordinates(str).then(function (data) {
                        var city = data.results[0].address_components[0].long_name;
                        var loc = data.results[0].geometry.location;
                        var citylong = data.results[0].formatted_address;
                        basic.getForecast(loc.lat,loc.lng,city,citylong,false);
                    })
                });
            })
       },

        getCityCoordinates: function (locationName) {
            return $.getJSON('https://maps.googleapis.com/maps/api/geocode/json', {
                address: locationName,
                language: "en"
            });
        },

        getForecast: function (latitude, longitude, cityName, cityLongName, refresh){
            var result;
            var forecastURL = 'https://api.forecast.io/forecast/'+ basic.APIkeyForecast + '/'+  latitude  +','+ longitude;
            // https://api.forecast.io/forecast/8b36d2c6b8f96d14b5cd1a6316655ab8/49.58826699999999,34.551417
            $.ajax({
                    url: forecastURL,
                    type: "GET",
                    dataType: "jsonp",
                    success: function(response) {
                        result = response;
                    }}
            ).then( function(){
                    result.name = cityName;
                    result.longname = cityLongName;
                    result.windDirection = basic.getWindDirection(result.currently.windBearing);
                    var time =new Date();
                    var hours = time.getHours() - 2 + result.offset ;
                    if(( 5 <= hours ) && (hours <= 17)){
                            result.dayTime = 'day'
                        }else{
                            result.dayTime = 'night'
                        };
                console.log(result.longname,result.dayTime,hours,result.offset)

                    var minutes = ( time.getMinutes() > 9) ? time.getMinutes(): '0'+time.getMinutes();
                    result.refresh = time.getHours() + ':' + minutes;
                    if(!refresh){
                        keeper.addCityToTemporaryArray(result);
                        keeper.notify('addCityToTemporaryArray');
                        console.log(result)
                    }else{
                        keeper.refreshCityForecast(result,cityLongName, Math.round(result.currently.temperature));
                        settings.setCities(keeper.cities);
                        keeper.notify('refreshCityForecast');
                        console.log(result)
                    }

                },
                function(){
                    console.log('bad city name');
                    //TODO exeption
                }
            );
        },

        refreshForecast: function(){
            $.each(keeper.cities, function(index, item){
                if(item.dorefresh){
                    basic.getForecast(item.latitude, item.longitude, item.name, item.longname, true);
                    item.dorefresh = false;
                }
            })

        },

        getWindDirection: function(windDir){
             var degr = windDir,
                result;
             switch(true){
                 case (degr<=10): result = 'N';break;
                 case (10<degr && degr<=30): result = 'NNO';break;
                 case (30<degr && degr<=50): result = 'NO';break;
                 case (50<degr && degr<=80): result = 'ONO';break;
                 case (80<degr && degr<=100): result = 'O';break;
                 case (100<degr && degr<=120): result = 'OSO';break;
                 case (120<degr && degr<=140): result = 'SO';break;
                 case (140<degr && degr<=170): result = 'SSO';break;
                 case (170<degr && degr<=190): result = 'S';break;
                 case (190<degr && degr<=210): result = 'SSW';break;
                 case (210<degr && degr<=230): result = 'SW';break;
                 case (230<degr && degr<=260): result = 'WSW';break;
                 case (260<degr && degr<=280): result = 'W';break;
                 case (280<degr && degr<=300): result = 'WNW';break;
                 case (300<degr && degr<=330): result = 'NW';break;
                 case (330<degr && degr<=350): result = 'NNW';break;
                 case (350<degr && degr<=380): result = 'N';break;
                 default: result = '?';
             }
             return result;
        }

    };

    // on DOM ready state
    $(function () {
        var $searchCity= $('#searchCity');
        basic.init(view);
        $searchCity.keyup( basic.searchCityLocation);
        keeper.cities = settings.getCities();
        view.currentCityTime.longname = keeper.cities[0].longname;
        view.currentCityTime.dayTime = keeper.cities[0].dayTime;
        view.currentCityTime.icon = keeper.cities[0].currently.icon;
        keeper.notify('cityLoadedFromStorage');
        settings.getSettingsScale();
        if(settings.temp_scale == 'celsius'){
            //need to refreshSlider because settings.temp_scale == celsius
            view.doUpdateTempratures();
            $('#celsius').addClass('active');
            $('#faring').removeClass('active');
        }
        settings.getSettingsDayShow();
        settings.getSettingsTimeUpdateForecast();
    });
    return basic;
});