define('model', ['jquery','settings' ], function ($,settings) {

    "use strict";


    var model = {
        name: 'Model',
        settings_obj: null,
        StorageData: {},
        StorageCities: [],
        init: function(settings_obj) {
            // Constructor
            this.settings_obj = settings_obj;
            settings.attach(this)
        },
        /**
         * Interface Observer
         */
        update: function(observable, updatedSetting) {

           if(this.settings_obj === observable){
               switch (updatedSetting) {
                   case 'tempratureScaleUpdated':
                       this.getAppSettings();
                       this.StorageData.temp_scale = settings.temp_scale;
                       this.setAppSettings();
                       this.notify("tempratureScaleUpdated");
                       break;
                   case 'Days':
                       this.getAppSettings();
                       this.StorageData['show_days_num'] = settings.show_days_num;
                       this.setAppSettings();
                       this.notify("daysUpdated");
                       break;
                   case 'Time':
                       this.getAppSettings();
                       this.StorageData['refresh_time'] = settings.refresh_time;
                       this.setAppSettings();
                       this.notify("timeUpdated");
                       break;
                   default:
                       break;
               }

           }
        },
        /***LocalStorage Model*/
        getSettingsScale: function(){
            if (!this.supportLocalStorage){ return false }

            if (localStorage['settings'] != undefined)
                 this.StorageData = JSON.parse(localStorage['settings']);
            return this.StorageData;
        },
        setSettingsScale: function(){
            if (!this.supportLocalStorage){ return false }
            localStorage['settings']=JSON.stringify(this.StorageData);
        },
        getCities: function(){
            if (!this.supportLocalStorage){ return false }
            if (localStorage['cities'])
                this.StorageCities = JSON.parse(localStorage['cities']);
            return this.StorageCities;
        },
        setCities: function(cities){
            if (!this.supportLocalStorage){ return false }
            model.flushStorageCities();
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
        },
        /**
         * Interface Observable for View
         */
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
            //console.log(this.observers);
            var me = this;
            $.each(this.observers,function(index,value){
                value.update(me,updatedSetting);
            });
        }
    };

    // on DOM ready state
    $(function () {

        model.init(settings);

    });

    return model;

});