define('city-keeper',['jquery'], function ($) {

    "use strict";


    var city_keeper = {
        name: "CityKeeper",
        cities : [],
        temporary_cities : [],
        $self:this,

        addCityToTemporaryArray: function(city){
            this.temporary_cities.push(city);
        },
        addCityToSlider: function(city) {
            this.cities.push(city);
            //TODO проверять есть ли такой город, если нет, то добавлять
        },
        removeCity: function(index) {
            this.cities.splice(index, 1);
            this.notify('cityDeleted');
        },
        refreshCityForecast: function(newitem, longname, temperature){
            $.each(this.cities, function(index, item){
                if((item.longname == longname)){// && ( Math.round(item.currently.temperature) == temperature )){
                    city_keeper.cities[index] = newitem;
                    city_keeper.notify('cityRefreshed');
                }
            })
        },
//        storeCities: function() {
//            // TODO сохранить на диск через LocalStorage
//        },
//        retriveCities: function() {
//            // TODO вытащить из LocalStorage
//        },
//        flush: function() {
//            // TODO очистить LocalStorage
//        },
//        /**
//         * Interface Observable
//         */
        init: function() {
            // Constructor
        },
        observers: [],
        attach: function(obj) {
            // TODO добавлять, если такого объекта нет в массиве
            if(true)
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
        }
    };

    // on DOM ready state
    $(function () {


    });

    return city_keeper;

});