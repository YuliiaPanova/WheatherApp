define(function (require) {
    var _ = require('underscore'),
        $ = require('jquery'),
        settings = require('settings'),
        jcarousel = require('jcarousel'),
        rangeslider = require('rangeslider'),
        keeper = require('city-keeper');

    "use strict";
    _.templateSettings.interpolate = /\{\{=(.+?)\}\}/g;
    _.templateSettings.evaluate = /\{\{(.+?)\}\}/g;
    _.templateSettings.escape = /\{\{-(.+?)\}\}/g;

    var view = {
        name: "View",
        CityKeeper: null,
        Settings:null,
        currentCityTime:{},
        containerForCities : $('#citiesList'),
        slidesList : $('#slides-list'),
        pagination : $('.jcarousel-pagination'),
        templateOfCities : $('#template-list-of-cities').text(),
        templateOneSlide : $('#template-for-city').text(),
        search: $('#search'),
        addCity: $('#add-city'),
        confirmDelete : $('#confirm-delete'),
        deleteCity : $('#delete-city'),
        activeClass: 'active',
        classDisplayNone:'display-none',
        ///**
        // * Interface Observable
        // */
        init: function(keeper_obj,settings_obj) {// Constructor
            this.CityKeeper = keeper_obj;
            this.CityKeeper.attach(this);
            this.Settings = settings_obj;
            this.Settings.attach(this);
        },
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
        update: function(observable, updatedSetting) {

            if(this.Settings === observable){
                switch (updatedSetting) {
                    case 'daysUpdated':
                        console.log('Number of days updated: ',settings.show_days_num);
                        $('#range-days').val(settings.show_days_num).change();
                        view.doUpdateCountOfDays();
                        break;
                    case 'timeUpdated':
                        console.log('Time updated to refresh updated:', settings.refresh_time);
                        $('#range-time').val(settings.refresh_time).change();
                        break;
                    default:
                        break;
                }
            }

            if(this.CityKeeper === observable){
                switch (updatedSetting) {
                     case 'addCityToTemporaryArray':
                         view.doUpdateRightCities(keeper.temporary_cities);
                         view.containerForCities.find('label').removeClass('display-none');
                        break;
                    case 'addCityToSlider':
                    case 'cityRefreshed':
                    case 'cityDeleted':
                    case 'cityLoadedFromStorage':
                        view.refreshSliderAndRightCities();
                        view.doUpdateCountOfDays();
                        break;
                    default:
                        break;
                }
            }
        },

        initMenuButton:function(){
            var $aside = $('#aside-block');
            if ($aside.hasClass(view.activeClass)){
                $aside.removeClass(view.activeClass)
            }else{
                $aside.addClass(view.activeClass)
            }
        },

        initAddCity: function() {
            var $self=$(this);
            if(view.search.hasClass(view.classDisplayNone)){
                view.search.removeClass(view.classDisplayNone);
                view.search.addClass(view.activeClass);
                $self.off('click',view.initAddCity);
                $self.on('click',view.initConfirmAddCity);
            }else{
                view.search.addClass(view.classDisplayNone)
            }
        },

        initConfirmAddCity: function() {
            view.addCity.off('click',view.initConfirmAddCity);
            view.addCity.on('click',view.initAddCity);
            view.addCity.removeClass(view.activeClass);
            view.search.addClass(view.classDisplayNone);
            view.containerForCities.find('label').addClass(view.classDisplayNone);
            view.notify('ConfirmAddCity');
        },

        initDeleteCity :function(){
            view.search.addClass(view.classDisplayNone);
            view.addCity.addClass(view.classDisplayNone);
            view.confirmDelete.removeClass(view.classDisplayNone);
            view.deleteCity.addClass(view.activeClass);
            view.doUpdateRightCities(keeper.cities);
            view.containerForCities.find('label').removeClass(view.classDisplayNone);
        },

        initConfirmDeleteCity : function (){
            view.deleteCity.removeClass(view.activeClass);
            view.confirmDelete.addClass(view.classDisplayNone);
            view.addCity.removeClass(view.classDisplayNone);
            view.containerForCities.find('label').addClass(view.classDisplayNone);
            view.notify('ConfirmDeleteCity');
        },

        doUpdateRightCities: function(array){
            view.containerForCities.empty();
            $.each(array,function(index,value){
                var obj = value;
                var template = _.template(view.templateOfCities);
                var text = template(obj);
                view.containerForCities.append(text);
            });
            if (array === keeper.cities){
                view.containerForCities.find('li').on('click',view.scrollToSlide);
                view.containerForCities.find('label').click(function( event ) {
                    event.stopPropagation();
                });
            }
            view.doUpdateTempratures();
        },

        doRefreshSlider: function(){
            view.slidesList.empty();
            $('.jcarousel-pagination').empty();
            $.each(keeper.cities,function(index,obj){
                var template = _.template(view.templateOneSlide);
                var text = template(obj);
                view.slidesList.append(text);
            });
            $('.refresh-icon').on('click',view.refreshIcon);
            view.makeWindDirectionIcon();
            view.dayTimeOutputColor(view.currentCityTime.dayTime, view.currentCityTime.precipType);
        },

        refreshSliderAndRightCities: function(){
            $('.jcarousel').jcarousel('destroy');
            view.doUpdateRightCities(keeper.cities);
            view.doRefreshSlider();
            view.doUpdateTempratures();
            view.initJCarousel();
        },

        initJCarousel: function(){
            var jcarousel = $('.jcarousel');
            jcarousel
                .on('jcarousel:reload jcarousel:create', function () {
                    var carousel = $(this),
                        width = carousel.innerWidth();
                    carousel.jcarousel('items').css('width', Math.ceil(width) + 'px');

                }).jcarousel({
                    animation: {
                        duration: 400,
                        easing:   'linear',
                        complete: function() {
                        }
                    },
                    wrap: 'circular'
                });

            $('.jcarousel-pagination')
                .on('jcarouselpagination:active', 'a', function() {
                    $(this).removeClass('next-window-icon').addClass('active-window-icon');
                })
                .on('jcarouselpagination:inactive', 'a', function() {
                    $(this).removeClass('active-window-icon').addClass('next-window-icon');
                })
                .on('click', function(e) {
                    e.preventDefault();
                })
                .jcarouselPagination({
                    perPage: 1,
                    item: function(page) {
                        return '<a href="#' + page + '" class="icon next-window-icon"></a>';
                    }
                });
            },

        scrollToSlide: function(){
            var $self = $(this),
                name = $self.find('.city-name').text();
            $.each(keeper.cities,function(index,value){
                if((value.longname == name)) {
                    $('.jcarousel').jcarousel('scroll',index);
                    view.currentCityTime.dayTime = value.dayTime;
                    view.currentCityTime.longname = value.longname;
                    view.currentCityTime.icon = value.currently.icon;
                    view.dayTimeOutputColor(view.currentCityTime.dayTime, view.currentCityTime.icon);
                }
            });
        },

        dayTimeOutputColor: function(dayTime, icon){
            var $body = $('body'),
                $rainSnow = $('.rain-snow');
            if ( dayTime == 'day'){
                $body.css('background-color','#1025C5');
            }else {
                $body.css('background-color','#080b22');
            }
            if (!(icon=='snow') && !(icon=='rain')){
                $rainSnow.removeClass('snow').removeClass('rain');
            }
            if (icon=='rain'){
                $rainSnow.removeClass('snow').addClass('rain');
            }
            if (icon=='snow') {
                $rainSnow.removeClass('rain').addClass('snow');
            }
        },

        refreshIcon: function(){
            var $self=$(this),
                longname = $self.next().val();
            $.each(keeper.cities, function(index, item){
                if(longname == item.longname){
                    item.dorefresh = true;
                }
            });
            view.notify('refreshOneCity');
        },

        doUpdateTempratures: function() {
            var $elems = $('.temprature');
            if( settings.temp_scale == 'fahrenheit') {
                $elems.each(function(index,value) {
                    if($(this).hasClass('celsius')){
                        $(this).addClass('fahrenheit');
                        $(this).removeClass('celsius');
                    }
                })
            }else{
                if(settings.temp_scale == 'celsius'){
                    $elems.each(function(index,value) {
                        if($(this).hasClass('fahrenheit')){
                            var faring = parseInt($(this).text());
                            var celsius = (faring - 32);
                            celsius = celsius/1.8;
                            celsius = Math.round(celsius);
                            $(this).empty().text(celsius);
                            $(this).addClass('celsius');
                            $(this).removeClass('fahrenheit');
                        }
                    });
                }
            }
        },

        doUpdateTempratureScale: function(){
            var $self=$(this);
            if($self.hasClass('faring') && (settings.temp_scale == 'celsius')){
                $('#celsius').removeClass('active');
                $('#faring').addClass('active');
                settings.temp_scale = 'fahrenheit';
                settings.setSettingsScale();
                view.refreshSliderAndRightCities();
            }else{
                if($self.hasClass('celsius') && (settings.temp_scale == 'fahrenheit')){
                    $('#celsius').addClass('active');
                    $('#faring').removeClass('active');
                    settings.temp_scale = 'celsius';
                    settings.setSettingsScale();
                    view.refreshSliderAndRightCities();
                }
            }
        },

        doUpdateCountOfDays: function(){
            var $elems = $('.day-temprature');
            $elems.each(function(index,value){
                var $innerElems = $(this).find('li');
                $innerElems.each(function(index,value){
                    if(index >= settings.show_days_num){
                        $(this).css('display','none');
                    }else{
                        $(this).css('display','block')
                    }
                });
            });
        },

        initRangeSlideer: function(){
            var $time = $('#range-time'),
                $days = $('#range-days'),
                $document = $(document),
                selector = '[data-rangeslider]';
            // For ie8 support
            var textContent = ('textContent' in document) ? 'textContent' : 'innerText';
            // Example functionality to demonstrate a value feedback
            function valueOutput(element) {
                var value = element.value;
                var output = element.parentNode.getElementsByTagName('output')[0] || element.parentNode.parentNode.getElementsByTagName('output')[0];
                output[textContent] = value;
            }
            $document.on('input', 'input[type="range"], ' + selector, function(e) {
                valueOutput(e.target);
            });

            $days.rangeslider({
                polyfill: false,
                onInit: function() {
                    valueOutput(this.$element[0]);
                },
                onSlideEnd: function(position, value) {
                    console.log( 'set number of days to show forecast: ' + value);
                    settings.setSettingsDayShow(value);
                    view.doUpdateCountOfDays();
                }
            });

            $time.rangeslider({
                polyfill: false,
                onInit: function() {
                        valueOutput(this.$element[0]);
                },
                onSlideEnd: function(position, value) {
                    //console.log('onSlideEnd');
                    console.log( 'set time to update: ' + value);
                    settings.setSettingsTimeUpdateForecast(value);
                }
            });
        },

        makeWindDirectionIcon: function(){
            var $windIcons = $('.wind-direction-icon');
                //$windName = $('.wind-direcction-name');
            $.each($windIcons,function(index,obj){
                var angle = keeper.cities[index].currently.windBearing;
                $(obj).css({ '-ms-transform': 'rotate('+ angle +'deg)','-webkit-transform': 'rotate(' + angle + 'deg)', 'transform': 'rotate(' + angle + 'deg)' })
                $(obj).find('.wind-direction-name').css({ '-ms-transform': 'rotate(-' + angle + 'deg)','-webkit-transform': 'rotate(-' + angle + 'deg)', 'transform': 'rotate(-' + angle + 'deg)' });
            });
        }
    };

    // on DOM ready state
    $(function () {
        var $addCity = $('#add-city'),
            $deleteCity = $('#delete-city'),
            $unitFaring = $('#faring'),
            $unitCelsius = $('#celsius'),
            $confirmDelete = $('#confirm-delete'),
            $menuButton = $('.menu-button');

        view.init(keeper,settings);
        view.initJCarousel();
        view.initRangeSlideer();

        $unitCelsius.on('click',view.doUpdateTempratureScale);
        $unitFaring.on('click', view.doUpdateTempratureScale);
        $menuButton.on('click', view.initMenuButton);
        $addCity.on('click',view.initAddCity);
        $deleteCity .on('click',view.initDeleteCity);
        $confirmDelete.on('click',view.initConfirmDeleteCity);
    });

    return view;
});