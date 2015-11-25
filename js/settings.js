define(['jquery'], function ($) {

    "use strict";

    var settings = {
        name: 'Settings',
        /**
         * @type {string} celsius|fahrenheit
         */
        temp_scale: 'fahrenheit',
        show_days_num: 7,
        refresh_time: 5,
        settings_obj: null,
        StorageData: {},
        StorageCities: [],
        init: function(settings_obj) {
            // Constructor
            //this.settings_obj = settings_obj;
            //settings.attach(this)
        },
        //update: function(observable, updatedSetting) {
        //
        //    if(this.settings_obj === observable){
        //        switch (updatedSetting) {
        //            case 'tempratureScaleUpdated':
        //                this.getSettingsScale();
        //                this.StorageData.temp_scale = settings.temp_scale;
        //                this.setSettingsScale();
        //                this.notify("tempratureScaleUpdated");
        //                break;
        //            case 'Days':
        //                this.getSettingsScale();
        //                this.StorageData['show_days_num'] = settings.show_days_num;
        //                this.setSettingsScale();
        //                this.notify("daysUpdated");
        //                break;
        //            case 'Time':
        //                this.getSettingsScale();
        //                this.StorageData['refresh_time'] = settings.refresh_time;
        //                this.setSettingsScale();
        //                this.notify("timeUpdated");
        //                break;
        //            default:
        //                break;
        //        }
        //
        //    }
        //},

        ///**
        // * Interface Observable
        // */
        observers: [],
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
        getSettingsScale: function(){
            if (!this.supportLocalStorage){ return false }
            if (localStorage['temp_scale']){
                this.temp_scale = JSON.parse(localStorage['temp_scale']);
            }
        },
        setSettingsScale: function(){
            if (!this.supportLocalStorage){ return false }
            localStorage['temp_scale']=JSON.stringify(this.temp_scale);
        },
        getSettingsTimeUpdateForecast: function(){
            if (!this.supportLocalStorage){ return false }
            if (localStorage['refresh_time']){
                this.refresh_time = JSON.parse(localStorage['refresh_time']);
                this.notify('timeUpdated');
            }
        },
        setSettingsTimeUpdateForecast: function(value){
            this.refresh_time = value;
            if (!this.supportLocalStorage){ return false }
            localStorage['refresh_time'] = JSON.stringify(value);
        },
        getSettingsDayShow: function(){
            if (!this.supportLocalStorage){ return false }
            if (localStorage['show_days_num']){
                this.show_days_num = JSON.parse(localStorage['show_days_num']);
                this.notify('daysUpdated');
            }
        },
        setSettingsDayShow: function(value){
            this.show_days_num = value;
            if (!this.supportLocalStorage){ return false }
            localStorage['show_days_num']=JSON.stringify(value);
        },
        getCities: function(){
            if (!this.supportLocalStorage){ return false }
            if (localStorage['cities'])
                this.StorageCities = JSON.parse(localStorage['cities']);
            return this.StorageCities;
        },
        setCities: function(cities){
            if (!this.supportLocalStorage){ return false }
            settings.flushStorageCities();
            this.StorageCities = cities;
            localStorage['cities']=JSON.stringify(this.StorageCities);
        },
        flushStorageCities: function() {
            if (!this.supportLocalStorage){ return false }
            localStorage.removeItem('cities');
        },
        supportLocalStorage: function(){
            try {
                return 'localStorage' in window && window['localStorage'] !== null;
            } catch (e) {
                return false;
            }
        }
    };

    // on DOM ready state
    $(function () {

        settings.init();

        //$("#slider-day").on("slide",function(e){
        //
        //    /**
        //     * TODO
        //     * Запустить таймер, если он не был создан
        //     * Кажое событие slide обнуляет таймер , если он запущен
        //     * По его истечении выполнить действия
        //     */
        //
        //
        //    settings.notify('Days');
        //    var days = $('#days').val();
        //    days = days.slice(0,-5);
        //    settings.show_days_num = days;
        //    //TODO settings.storeSettings()
        //});
        //
        //$("#slider-time").on("slide",function(e){
        //    settings.notify('Time');
        //    var time = $('#time').val();
        //    //time = time.slice(0,-4);
        //    settings.refresh_time = time;
        //    //TODO settings.storeSettings()
        //});
    });

    return settings;

});