(function (context) {
    'use strict';

    // starting global context
    context.pling = {};

}(window));

(function () {
    'use strict';

    /*
        Unfortunately when you use window.history.replaceState with angular-route you have big problems
        (angular-issue:6172)
        The reason for this is that Angular can't change anything before the hash without the browser reloading the page
    */
    var clean_uri = location.protocol + "//" + location.host + location.pathname, // eslint-disable-line
        hash_pos = location.href.indexOf("#"), // eslint-disable-line
        hash,
        queryString = '';

    if (hash_pos > 0) {
        hash = location.href.substring(hash_pos, location.href.length); // eslint-disable-line
        clean_uri += hash;
    }

    if (window && window.location && window.location.search) {
        localStorage.setItem('PLING-QUERY-STRING', window.location.search); // eslint-disable-line
        queryString = window.location.search;

        // Checking if it comes from other applications with querystring token
        if (queryString.indexOf('token=') === 1) {

            // Will set token to localStorage
            localStorage.setItem('PLING-TOKEN', queryString.split('=')[1]); // eslint-disable-line
        }
    }

    // Clear URL
    window.history.replaceState({}, document.title, clean_uri);

    // Config method
    function PlingUiConfig($provide, $httpProvider) {

        $provide.decorator('$log', function ($delegate, shadowLogger) {
            return shadowLogger($delegate);
        });

        // Interceptor that add token in each Header Request
        $httpProvider.interceptors.push('plingRequestInterceptor');
    }

    // Run method
    function PlingUiRun(options, $injector) {
        var cache = null;

        if (options.onRun && options.onRun.cacheViews) {
            cache = $injector.get('cacheService');
            cache.cacheViews();
        }
    }

    // Injeção de Dependência
    angular.module('plingUi', [
        'plingUi.templates',
        'ngMaterial',
        'datetime',
        'angular.filter',
        'md.data.table',
        'dndLists',
        'luegg.directives'
    ]);

    angular.module('plingUi').config(['$provide', '$httpProvider', PlingUiConfig]);
    angular.module('plingUi').run(['boot.options', '$injector', PlingUiRun]);
}());

/* global angular */

/* More about AngularJS Directives:
    http://weblogs.asp.net/dwahlin/creating-custom-angularjs-directives-part-i-the-fundamentals */

(function () {
    'use strict';

    /* AQUI SE CRIA A DIRETIVA */
    angular.module('plingUi').directive('plgSample', function () {

        return {

            // E = element, A = attribute, C = class, M = comment
            'restrict'    : 'E',

            // Your Controller
            'controller'  : 'MyController',

            // Your HTML Template
            // You can also use 'template': <div>{{yourScopeVar}}</div>' intead of 'templateUrl'
            'templateUrl' : 'myComponentSample.html',

            // DOM manipulation
            'link' : function ($scope, element, attrs) {

                element.css('background-color', 'white');
                $scope.tagline = 'it Works! Attrs: ' + attrs;

            }
        };

    });
}());

(function () {
    'use strict';

    // Injeção de dependências
    plgAppBarController.$inject = [
        '$scope',
        'applicationsService',
        '$rootScope'
    ];

    // Component configuration
    angular.module('plingUi').component('plgAppBar', {
        'templateUrl' : 'plg-app-bar.html',
        'restrict'      : 'E',
        'controller'  : plgAppBarController,
        'bindings'    : {}
    });

    // CREATING CONTROLLER
    function plgAppBarController($scope, applicationsService, $rootScope) {

        var currentApp = {};

        function getCurrentApplication (apps) {
            var i, app;

            for (i = 0; i < apps.length; i += 1)
                if (apps[i].appModule === currentApp.appModule && apps[i].env === currentApp.env) {
                    app = {
                        'name': apps[i].name,
                        'iconPath': apps[i].iconPath
                    };

                    /* Remove app atual para nao mostar na lista */
                    apps.splice(i, 1);

                    return app;
                }
        }

        function redirect(url) {
            applicationsService.redirect(url);
        }

        $scope.getCallbackUrl = function (app) {

            $rootScope.$emit('PLING-SERVICE-BAR-ISLOADING', true);

            applicationsService.getCallbackUrl(app._id, function (err, callbackUrl) {
                if (err) {
                    console.error('[ERROR]: ', err); // eslint-disable-line
                    $rootScope.$emit('PLING-SERVICE-BAR-ISLOADING', false);

                    if (typeof $rootScope.toast === 'function')
                        $rootScope.toast('Erro ao obter endereço URL da aplicação');

                    return false;
                }

                redirect(callbackUrl);
            });
        };

        $scope.openMenu = function($mdOpenMenu, ev) {
            $mdOpenMenu(ev);
        };

        (function () {

            $scope.hasMenu      = pling.loader.settings.menu && pling.loader.settings.menu.length > 0 ? true : false; // eslint-disable-line
            currentApp          = applicationsService.getCurrentApp();
            $scope.applications = applicationsService.getLocal();
            $scope.currentApp   = getCurrentApplication($scope.applications);
        }());
    }
}());

(function () {
    'use strict';

    function PlgBackgroundImageDirective() {

        return function (scope, element, attrs) {
            var url = attrs.plgBackImg;

            element.css({
                'background-image': 'url(' + url + ')',
                'background-size' : 'cover'
            });
        };
    }

    PlgBackgroundImageDirective.$inject = [];

    angular.module('plingUi').directive('plgBackImg', PlgBackgroundImageDirective);
}());

(function () {
    function PlgCalendarCtrl($scope, $rootScope, $attrs, plgCalendarFactory) {
        var ctrl = this,
            i,
            currentMoment = moment(Date.now()),
            todayDate     = moment(currentMoment),
            secondClick   = false,
            fromDateCopy,
            currentDate;

        ctrl.selected    = ctrl.selected && ctrl.selected.fromDate && ctrl.selected.toDate ? ctrl.selected : { 'fromDate': currentMoment.format('YYYY-MM-DD'), 'toDate': currentMoment.format('YYYY-MM-DD') };
        ctrl.weekDays    = moment.weekdaysShort();
        ctrl.todayYear   = currentMoment.format('YYYY');
        $rootScope.$broadcast('PLGCALENDAR_UPDATE', ctrl.selected, currentMoment);

        buildDisplay();

        function buildDisplay() {
            ctrl.selected.display = moment(ctrl.selected.fromDate).format('DD/MM/YYYY') + (ctrl.selected.toDate ? ' - ' + moment(ctrl.selected.toDate).format('DD/MM/YYYY') : '');
        }

        /* Responsable to update bindings values in the view */
        function updateValues(isDayChanged, isMonthOrYearChange) {
            ctrl.weekDays    = moment.weekdaysMin();
            ctrl.todayYear   = currentMoment.format('YYYY');
            ctrl.daysInMonth = plgCalendarFactory.getDaysInMonths(ctrl.monthsLimit, currentMoment, ctrl.events);

            $rootScope.$broadcast('PLGCALENDAR_UPDATE', ctrl.selected, currentMoment, isDayChanged, isMonthOrYearChange);
        }

        /* Responsable to get the full date in format YYYY-MM-DD */
        function getCurrentDate(day, i) {
            return moment(currentMoment).add(i, 'month').date(day).format('YYYY-MM-DD');
        }

        /* Responsable to convert integer number to array */
        function convertIntegerToArray(n) {
            var range = [];

            for (i = 0; i < n && i < 12; i++) {
                range.push(i);
            }
            return range;
        }

        /* Select the date that user clicked */
        ctrl.selectDate = function (day, i) {
            currentDate = moment(currentMoment).add(i, 'months').date(day);

            if (!ctrl.disableRange) {
                if (!secondClick) {
                    ctrl.selected.fromDate = currentDate.format('YYYY-MM-DD');
                    ctrl.selected.toDate   = currentDate.format('YYYY-MM-DD');
                } else {
                    ctrl.selected.toDate = currentDate.format('YYYY-MM-DD');
                }

                if (ctrl.selected.fromDate > ctrl.selected.toDate) {
                    fromDateCopy  = ctrl.selected.fromDate;
                    ctrl.selected.fromDate = ctrl.selected.toDate;
                    ctrl.selected.toDate   = fromDateCopy;
                }
            } else {
                ctrl.selected.fromDate = currentDate.format('YYYY-MM-DD');
                ctrl.selected.toDate   = currentDate.format('YYYY-MM-DD');
            }

            buildDisplay();

            secondClick = !secondClick;

            updateValues(true);
        };

        /* Get days in month by int params i (exp.: currentMonth + 1) */
        ctrl.getDaysInMonth = function (i, wantFullDay) {
            var month    = moment(currentMoment).add(i, 'months'),
                days     = month.daysInMonth(),
                firstDay = moment(month).date(1).day(),
                arr      = [],
                position,
                day;

            for (position = 1; position <= firstDay + days; position += 1) {

                day = position > firstDay ? position - firstDay : false;

                if (wantFullDay && day !== false) {
                    day = getCurrentDate(day, i);
                }

                arr.push(day);
            }

            return arr;
        };

        /* Set the current month */
        ctrl.setToday = function () {
            secondClick = false;

            currentMoment = moment(todayDate);

            ctrl.selectDate(currentMoment.date(), 0);
            ctrl.selectDate(currentMoment.date(), 0);
        };

        /* Set the current month */
        ctrl.setThisMonth = function () {
            secondClick = false;

            ctrl.selectDate(1, 0);
            ctrl.selectDate(moment(currentMoment).daysInMonth(), 0);
        };

        /* Set the current year */
        ctrl.setThisYear = function () {
            secondClick = false;

            ctrl.selectDate(1, currentMoment.format('M') * -1 + 1);
            ctrl.selectDate(moment(currentMoment).add(12 - currentMoment.format('M')).daysInMonth(), 12 - currentMoment.format('M'));
        };

        /* Get the month format by number */
        ctrl.getMonth = function (i, format) {
            return moment(currentMoment).add(i, 'months').format(format || 'MMMM');
        };

        /* Check if the day is selected by day and month */
        ctrl.isSelected = function (day, i) {
            return getCurrentDate(day, i) === ctrl.selected.fromDate || getCurrentDate(day, i) === ctrl.selected.toDate;
        };

        /* Check if the day is in range by day and month number */
        ctrl.isInRange = function (day, i) {
            return getCurrentDate(day, i) > ctrl.selected.fromDate && getCurrentDate(day, i) < ctrl.selected.toDate;
        };

        /* Check if is today */
        ctrl.isToday = function (day, i) {
            return getCurrentDate(day, i) === moment().format('YYYY-MM-DD');
        };

        /* Go to the next month or year */
        ctrl.nextDate = function (monthOrYear) {
            currentMoment.add(1, monthOrYear);
            updateValues(false, true);
        };

        /* Go to the previous month or year */
        ctrl.prevDate = function (monthOrYear) {
            currentMoment.subtract(1, monthOrYear);
            updateValues(false, true);
        };

        /* Define Shared methods */
        if ($attrs.shared) {
            delete ctrl.shared;
            delete ctrl.events;
            ctrl.shared = angular.copy(ctrl);
        }

        $scope.$watch(function () {
            return ctrl.events;
        }, function (newVal) {
            ctrl.daysInMonth = plgCalendarFactory.getDaysInMonths(ctrl.monthsLimit, currentMoment, newVal);
        });

        ctrl.monthsNumbers = convertIntegerToArray(ctrl.monthsLimit);
    }

    PlgCalendarCtrl.$inject = ['$scope', '$rootScope', '$attrs', 'plgCalendarFactory'];

    angular.module('plingUi').component('plgCalendar', {
        'bindings'  : {
            'monthsLimit'        : '=',
            'selected'           : '=',
            'shared'             : '=',
            'disableRange'       : '=',
            'disableDayChoice'   : '=',
            'disableMonthChoice' : '=',
            'disableYearChoice'  : '=',
            'events'             : '='
        },
        'transclude': true,
        'controller' : PlgCalendarCtrl,
        'templateUrl' : 'plgCalendar.html'
    });
}());

(function () {
    'use strict';

    function plgCalendarFactory() {
        var daysInMonths = {}, i, j, output = [];

        return {
            'getDaysInMonths': function (monthsLimit, currentMoment, events) {
                var month, days, firstDay, arr = [], position, objDay;

                for (i = monthsLimit - 1; i >= 0; i--) {
                    month      = moment(currentMoment).add(i, 'months');
                    days       = month.daysInMonth();
                    firstDay   = moment(month).date(1).day();
                    arr.length = 0;

                    for (position = 1; position <= firstDay + days; position += 1) {

                        objDay = position > firstDay ? position - firstDay : false;

                        /*
                        if (wantFullDay && day !== false) {
                            day = moment(currentMoment).add(i, 'month').date(day).format('YYYY-MM-DD');
                        }*/

                        objDay = { 'day': objDay };

                        if (events && events.length > 0 && objDay.day) {
                            objDay.events = this.filterEventsInDay(events, month.date(objDay.day));
                        }

                        arr.push(objDay);
                    }
                    daysInMonths[i] = arr;
                }
                return daysInMonths;
            },
            'filterEventsInDay': function (events, day) {
                output.length = 0;
                for (j = events.length - 1; j >= 0; j--) {
                    if (moment(typeof events[j] === 'object' ? events[j].date : events[j]).utc().format('YYYY-MM-DD') === moment(day).utc().format('YYYY-MM-DD')) {
                        output.push(events[j]);
                    }
                }
                return angular.copy(output);
            }
        };
    }

    plgCalendarFactory.$inject = [];

    angular.module('plingUi').factory('plgCalendarFactory', plgCalendarFactory);
}());

/* global angular, console, document, $, window */
(function () {
    'use strict';

    // creating directive
    function PlgChangeIconView($log, $compile, $rootScope) {
        return {
            'restrict': 'E',
            'scope': {
                'obj': '=',
                'serviceModule': '='
            },
            'replace': true,

            // linking directive
            'link': function (scope, element) {

                var builder, compiledElm;

                // validating bind value
                if (scope.obj) {
                    builder = {
                        'buildTemplate': function (scope, cb) {
                            var template;

                            scope.viewListSelected  = this.viewListSelected;
                            scope.changeIcon        = this.changeIcon;

                            // Update value to default, if click previous ou next page in pagination DATATABLE
                            scope.$watch('obj', function() {
                                scope.iconView          = 'expand_more';
                                scope.iconViewLabel     = 'Expandir linha';
                            });

                            template =  '<md-button class="md-icon-button" aria-label="expand" ng-click="viewListSelected(obj, serviceModule.isExpandLineList); changeIcon(iconView)">' +
                                        '    <md-tooltip>{{iconViewLabel}}</md-tooltip>' +
                                        '    <md-icon class="icons" aria-hidden="true">{{iconView}}</md-icon>' +
                                        '</md-button>';

                            cb(null, template);
                        },

                        'changeIcon': function (iconLabel) {
                            if (iconLabel === 'expand_more') {
                                scope.iconView = 'expand_less';
                                scope.iconViewLabel = 'Retrair linha';
                            } else {
                                scope.iconView = 'expand_more';
                                scope.iconViewLabel = 'Expandir linha';
                            }
                        },

                        // View effect collapse "open/closed"
                        'viewListSelected': function (obj, visualize) {
                            if (visualize) {
                                $rootScope.$emit('viewListSelected', obj);
                            }
                        }

                    };

                    // defining template
                    builder.buildTemplate(scope, function (err, template) {

                        // handling error
                        if (err) {
                            $log.warn(err);
                            return;
                        }

                        // compiling template
                        compiledElm = $compile(template)(scope);

                        // handling post compile hooks
                        if (builder.postCompile) {
                            builder.postCompile(compiledElm);
                        }

                        // replacing into DOM
                        element.replaceWith(compiledElm);

                    });
                }
            }
        };
    }

    // injecting dependencies
    PlgChangeIconView.$inject = ['$log', '$compile', '$rootScope'];

    // registering into angular
    angular.module('plingUi').directive('plgChangeIconView', PlgChangeIconView);
}());

(function () {
    'use strict';

    // creating directive
    function PlgChangeTypeList($log, $compile, $localstorage, $rootScope) {
        return {
            'restrict': 'E',
            'scope': {
                'listType' : '=',
                'chkList'  : '=',
                'remove'   : '@'
            },
            'replace': true,

            // linking directive
            'link': function (scope, element) {

                var builder, compiledElm, defaultOption = 'list', options = ['list', 'cards', 'datatable'];

                if (scope.remove && options.indexOf(scope.remove) !== -1) {
                    options.splice(options.indexOf(scope.remove), 1);
                }

                if (!$localstorage.get('listCardsDatatable')) {
                    if (scope.remove === defaultOption) {
                        defaultOption = 'datatable';
                    }
                    $localstorage.set('listCardsDatatable', defaultOption);
                    scope.listType = defaultOption;
                } else {
                    scope.listType = $localstorage.get('listCardsDatatable');
                }

                // validating bind value
                if (scope.listType) {
                    builder = {
                        'buildTemplate': function (scope, cb) {
                            var template;

                            scope.changeListType = this.changeListType;

                            template = '<md-button class="md-icon-button btnFilterListing" ng-click="changeListType();" ng-switch on="listType">' +
                                        (scope.remove !== 'datatable'
                                            ? '    <md-tooltip md-direction="bottom" ng-show="listType === ' + builder.getPrevious('datatable') + '">Alterar para tabela</md-tooltip>' +
                                       '        <i class="material-icons" ng-switch-when="' + builder.getPrevious('datatable') + '">view_list</i>' : '' ) +
                                        (scope.remove !== 'cards'
                                            ? '    <md-tooltip md-direction="bottom" ng-show="listType === ' + builder.getPrevious('cards') + '">Alterar para cards</md-tooltip>' +
                                       '        <i class="material-icons" ng-switch-default>view_module</i>' : '' ) +
                                        (scope.remove !== 'list'
                                            ? '    <md-tooltip md-direction="bottom" ng-show="listType === ' + builder.getPrevious('list') + '">Alterar para listagem</md-tooltip>' +
                                       '        <i class="material-icons" ng-switch-when="' + builder.getPrevious('list') + '">view_headline</i>' : '' ) +

                                       '</md-button>';

                            cb(null, template);
                            angular.noop(scope);
                        },


                        'changeListType': function () {

                            // ### Reset bind CHECKBOX "Select Items"
                            scope.chkList = [];

                            // ### Send scroll from UP page
                            window.scrollTo(0, 0);

                            scope.listType = builder.getNext(scope.listType);

                            $localstorage.set('listCardsDatatable', scope.listType);

                            $rootScope.$broadcast('resetViewsItems', true);
                        },

                        'getNext': function (listType) {
                            var i = options.indexOf(listType);

                            return options[i < options.length - 1 ? i + 1 : 0];
                        },

                        'getPrevious': function (listType) {
                            var i = options.indexOf(listType);

                            return options[i > 0 ? i - 1 : options.length - 1];
                        }

                    };

                    // defining template
                    builder.buildTemplate(scope, function (err, template) {

                        // handling error
                        if (err) {
                            $log.warn(err);
                            return;
                        }

                        // compiling template
                        compiledElm = $compile(template)(scope);

                        // handling post compile hooks
                        if (builder.postCompile) {
                            builder.postCompile(compiledElm);
                        }

                        // replacing into DOM
                        element.replaceWith(compiledElm);

                    });
                }
            }
        };
    }

    // injecting dependencies
    PlgChangeTypeList.$inject = [ '$log', '$compile', '$localstorage', '$rootScope' ];

    // registering into angular
    angular.module('plingUi').directive('plgChangeTypeList', PlgChangeTypeList);
}());

(function() {

    'use strict';

    // CREATING CONTROLLER
    function plgComboBoxController($scope, $rootScope, $timeout) {
        var i,
            j,
            ctrl = this,
            id,
            ngModelCopy = [];

        ctrl.filterSelect       = this.filterSelect;
        ctrl.newChoiceSave      = this.newChoiceSave;
        ctrl.saveLine           = this.saveLine;
        ctrl.reloadChoiceAction = this.reloadChoiceAction;
        ctrl.params             = this.params;
        ctrl.params.refName     = ctrl.params.refName || 'name';
        ctrl.loading            = this.loading;
        ctrl.choices            = this.choices || [];
        ctrl.ngModel            = this.ngModel || [];
        ctrl.focus              = this.focus;
        ctrl.getOut             = this.getOut;
        ctrl.selectChoice       = this.selectChoice;
        ctrl.filterChoices      = this.filterChoices;
        ctrl.createFilterFor    = this.createFilterFor;
        ctrl.allNoneChoice      = this.allNoneChoice;
        ctrl.noneChoice         = this.noneChoice;
        ctrl.saveChoice         = this.saveChoice;
        ctrl.addChoice          = false;
        ctrl.focusChoice        = false;
        ctrl.selectChoiceName   = this.selectChoiceName || '';
        ctrl.loadingStart       = false;

        $timeout(function () {
            if (ctrl.choices.length > 0) {
                for (i = 0; i < ctrl.choices.length; i += 1) {
                    if (ctrl.choices[i]._id || ctrl.choices[i].id) {
                        ctrl.choices[i].icon = 'check_box_outline_blank';
                        if (ctrl.ngModel) {
                            if (ctrl.params.isMultiple) {
                                for (j = 0; j < ctrl.ngModel.length; j += 1) {
                                    id = typeof ctrl.ngModel[j] === 'object' ? ctrl.ngModel[j]._id || ctrl.ngModel[j]._id : ctrl.ngModel[j];
                                    if (id === ctrl.choices[i]._id || id === ctrl.choices[i].id) {
                                        ctrl.choices[i].icon   = 'check_box';
                                        ngModelCopy.push(ctrl.choices[i]);
                                        if (ctrl.ngModel.length > 1) {
                                            ctrl.selectChoiceName  = ctrl.ngModel.length + ' Selecionados';
                                        } else {
                                            ctrl.selectChoiceName  = ctrl.choices[i][ctrl.params.refName];
                                        }
                                    }
                                }
                            } else if (ctrl.ngModel === ctrl.choices[i]._id || ctrl.ngModel === ctrl.choices[i].id) {
                                ctrl.choices[i].icon = 'check_box';
                                ctrl.selectChoiceName = ctrl.choices[i][ctrl.params.refName];
                            }
                        }
                    }
                }
            }
            ctrl.loadingStart       = true;

            if (ctrl.simpleCombo) {
                ctrl.ngModel = ngModelCopy;
            }
        });

        ctrl.createFilterFor = function (query) {
            var lowercaseQuery = angular.lowercase(query);

            return function filterFn(termChoice) {
                var lowercaseOptions = angular.lowercase(termChoice[ctrl.params.refName]);

                return lowercaseOptions.indexOf(lowercaseQuery) >= 0;
            };
        };

        ctrl.filterChoices = function (scope, term) {
            var results = term ? scope.$ctrl.choices.filter(scope.$ctrl.createFilterFor(term)) : scope.$ctrl.choices;

            scope.$ctrl.addChoice = false;
            if (results && term) {
                if (results.length === 0 && term.length > 0) {
                    scope.$ctrl.addChoice = true;
                }
            }
            return results;
        };

        ctrl.noneChoice = function (scope) {
            // console.log(scope); // eslint-disable-line
            scope.$ctrl.ngModel           = [];
            scope.$ctrl.selectChoiceName  = '';
            scope.$ctrl.focusChoice       = false;
            scope.$ctrl.focusBlur         = true;
            scope.$ctrl.saveLine(scope.$ctrl.$parent);
        };

        ctrl.allNoneChoice = function (scope, result, icon) {
            var l= 0;

            if (result.length > 0) {
                if (scope.$ctrl.choices.length === result.length) {
                    scope.$ctrl.ngModel           = [];
                    scope.$ctrl.selectChoiceName  = '';
                    for (i = 0; i < scope.$ctrl.choices.length; i += 1) {
                        scope.$ctrl.choices[i].icon           = icon;
                        if (icon === 'check_box') {
                            l += 1;
                            scope.$ctrl.ngModel.push(ctrl.simpleCombo ? scope.$ctrl.choices[i] : scope.$ctrl.choices[i]._id || scope.$ctrl.choices[i].id);
                            scope.$ctrl.selectChoiceName  = scope.$ctrl.choices[i][ctrl.params.refName];
                            if (l > 1) {
                                scope.$ctrl.selectChoiceName  = l + ' Selecionados';
                            }
                        }
                    }
                } else {
                    for (j = 0; j < result.length; j += 1) {
                        for (i = 0; i < scope.$ctrl.choices.length; i += 1) {
                            if (result[j]._id === scope.$ctrl.choices[i]._id || result[j].id === scope.$ctrl.choices[i].id) {
                                if (icon === 'check_box' && scope.$ctrl.choices[i].icon === 'check_box_outline_blank') {
                                    scope.$ctrl.ngModel.push(ctrl.simpleCombo ? scope.$ctrl.choices[i] : scope.$ctrl.choices[i]._id || scope.$ctrl.choices[i].id);
                                    scope.$ctrl.choices[i].icon       = icon;
                                    scope.$ctrl.selectChoiceName  = scope.$ctrl.choices[i][ctrl.params.refName];
                                    if (scope.$ctrl.ngModel.length > 1) {
                                        scope.$ctrl.selectChoiceName  = scope.$ctrl.ngModel.length + ' Selecionados';
                                    }
                                } else if (icon === 'check_box_outline_blank' && scope.$ctrl.choices[i].icon === 'check_box') {
                                    scope.$ctrl.choices[i].icon       = icon;
                                    for (l = 0; l < scope.$ctrl.ngModel.length; l += 1) {
                                        if (scope.$ctrl.ngModel[l] === scope.$ctrl.choices[i]._id || scope.$ctrl.ngModel[l] === scope.$ctrl.choices[i].id || ctrl.simpleCombo && (scope.$ctrl.ngModel[l]._id === scope.$ctrl.choices[i]._id && scope.$ctrl.choices[i]._id || scope.$ctrl.ngModel[l].id === scope.$ctrl.choices[i].id && scope.$ctrl.choices[i].id)) {
                                            scope.$ctrl.ngModel.splice(l, 1);
                                            if (scope.$ctrl.ngModel.length > 1) {
                                                scope.$ctrl.selectChoiceName  = scope.$ctrl.ngModel.length + ' Selecionados';
                                            }
                                        }
                                    }
                                } else if (scope.$ctrl.ngModel.length === 1) {
                                    scope.$ctrl.selectChoiceName  = scope.$ctrl.choices[i][ctrl.params.refName];
                                }
                            }
                        }
                    }
                }
            }
        };

        ctrl.selectChoice = function (scope, choice) {
            var nameChecked = '';

            if (scope.params.isMultiple) {
                if (choice.icon === 'check_box_outline_blank') {
                    for (i = 0; i < scope.choices.length; i += 1) {
                        if (scope.ngModel.length > 1) {
                            for (j = 0; j < scope.ngModel.length; j += 1) {
                                if (scope.ngModel[j] === scope.choices[i]._id || scope.ngModel[j] === scope.choices[i].id) {
                                    scope.choices[i].icon   = 'check_box';
                                }
                            }
                        }
                        if (choice._id === scope.choices[i]._id && choice._id || choice.id === scope.choices[i].id && choice.id) {
                            scope.choices[i].icon   = 'check_box';
                            scope.ngModel.push(ctrl.simpleCombo ? choice : choice._id || choice.id);
                            scope.selectChoiceName  = choice[ctrl.params.refName];
                            if (scope.ngModel.length > 1) {
                                scope.selectChoiceName  = scope.ngModel.length + ' Selecionados';
                            }
                        }
                    }
                } else {
                    for (i = 0; i < scope.choices.length; i += 1) {
                        if (choice._id === scope.choices[i]._id && choice._id || choice.id === scope.choices[i].id && choice.id) {
                            scope.choices[i].icon   = 'check_box_outline_blank';
                        }
                        if (scope.choices[i].icon === 'check_box') {
                            nameChecked = scope.choices[i][ctrl.params.refName];
                        }
                    }
                    if (scope.ngModel) {
                        for (j = 0; j < scope.ngModel.length; j += 1) {
                            if (scope.ngModel[j] === choice._id || scope.ngModel[j] === choice.id || ctrl.simpleCombo && (scope.ngModel[j]._id === choice._id && choice._id || scope.ngModel[j].id === choice.id && choice.id)) {
                                scope.ngModel.splice(j, 1);
                            }
                        }
                    }
                    scope.selectChoiceName  = nameChecked;
                    if (scope.ngModel.length > 1) {
                        scope.selectChoiceName  = scope.ngModel.length + ' Selecionados';
                    }
                }
                scope.saveLine(scope);
            }
            if (!scope.params.isMultiple) {
                scope.ngModel           = choice._id || choice.id;
                scope.selectChoiceName  = choice[ctrl.params.refName];
                scope.focusChoice       = false;
                scope.focusBlur         = true;
                scope.saveLine(scope);
            }
        };

        ctrl.focus = function (scope) {
            if (scope.$ctrl.focusChoice) {
                scope.$ctrl.focusChoice   = false;
                scope.$ctrl.focusBlur     = true;
            } else {
                scope.$ctrl.focusChoice   = true;
                // angular.element(document.body).append('<div class="md-multiple-select-div" ng-click="$ctrl.getOut(this)" ></div>');
            }
            if (scope.$ctrl.reloadChoiceAction) {
                $rootScope.$emit('reloadChoice', scope.$ctrl);
            }
        };

        ctrl.getOut = function (scope) {
            if (!scope.$ctrl.loading) {
                if (scope.$ctrl.focusChoice) {
                    // console.log(scope); // eslint-disable-line
                    scope.$ctrl.focusChoice   = false;
                    scope.$ctrl.focusBlur     = true;
                } else {
                    scope.$ctrl.focusChoice   = true;
                }
            }
            // scope.$ctrl.saveLine(scope);
        };

        ctrl.saveChoice = function (scope) {
            scope.$ctrl.loading         = true;
            scope.$ctrl.newChoiceSave   = null;
            $rootScope.$emit('newChoiceSave', scope.$ctrl);
            $timeout(function () {
                if (scope.$ctrl.newChoiceSave) {
                    scope.$ctrl.choices.push(scope.$ctrl.newChoiceSave);
                    scope.$ctrl.loading         = false;
                    scope.$ctrl.filterSelect    = '';
                    scope.$ctrl.selectChoice(scope.$ctrl, scope.$ctrl.newChoiceSave);
                }
            }, 3000);
        };
    }

    plgComboBoxController.$inject = ['$scope', '$rootScope', '$timeout'];

    // CREATING COMPONENT WITH BINDINGS
    angular.module('plingUi').component('plgComboBox', {
        'bindings'  : {
            'params'            : '=',
            'choices'           : '=',
            'ngModel'           : '=',
            'selectChoiceName'  : '=?',
            'loading'           : '=',
            'filterSelect'      : '=?',
            'reloadChoiceAction': '=',
            'saveLine'          : '&',
            'simpleCombo'       : '='
        },
        'controller' : plgComboBoxController,
        'templateUrl' : 'plgComboBox.html'
    });
}());

/* global angular, console, document, $, window */
(function() {
    'use strict';

    // creating directive
    function PlgDataTable($log, $compile, $location) {
        return {
            'transclude': true,
            'restrict': 'E',
            'scope': {
                'objPk'              : '@',
                'byEvent'            : '=',
                'paginateByRequest'  : '=',
                'params'             : '=',
                'module'             : '=',
                'dynamicForm'        : '=',
                'filterDefault'      : '=',
                'query'              : '=',
                'chkList'            : '=',
                'callbacks'          : '=',
                'disableCellView'    : '=',
                'disableCellExpand'  : '=',
                'mdOnSelect'         : '=',
                'mdOnDeselect'       : '=',
                'mdOnReorder'        : '=',
                'mdProgress'         : '=',
                'mdOnPageSelect'     : '=',
                'mdOnPaginate'       : '&'
            },
            'replace': true,

            // linking directive
            'link': function(scope, element, attribute, controller, transclude) {

                var builder, compiledElm;

                // validating bind value
                if (scope.params) {

                    scope.objPk = scope.objPk || '_id';

                    builder = {
                        'buildTemplate': function(scope, cb) {
                            var template,
                                temp,
                                dictionary = {};

                            scope.editView = this.editView;
                            scope.itemExpand = this.itemExpand;

                            scope.options = {
                                'autoSelect': false,
                                'boundaryLinks': false,
                                'largeEditDialog': false,
                                'pageSelector': false,
                                'rowSelection': true
                            };


                            // Display "show / hide" buttons actions, ex: Inativar, Excluir... (Click "checkall" checkbox)
                            // And md-select "select none, select all"
                            // ----- IMPORTANT! We can't clear scope.chkList with new array -----
                            scope.$on('checkedAllItens', function (event, arg) {
                                angular.noop(event);

                                if (arg) {
                                    scope.params.forEach(function (i) {
                                        if (scope.chkList.filter(function (s) { return s[scope.objPk] === i[scope.objPk]; }).length <= 0) {
                                            scope.chkList.push(i);
                                        }
                                    });
                                } else {
                                    scope.chkList.length = 0;
                                    dictionary = {};
                                }
                            });

                            // Reset value default "limit" Infinity Scroll
                            // Reset to "page = 1"
                            scope.$on('resetViewsItems', function (event, arg) {
                                angular.noop(event);
                                if (arg && scope.params.length > 0) {
                                    scope.query.page = 1;
                                }
                            });

                            // Datatable - Control checkbox per page, "Check All", "Check None" and simple checked
                            scope.$on('chkListPage', function (event, list_dt) {
                                scope.chkList.forEach(function (ch) {
                                    dictionary[ch[scope.objPk]] = true;
                                });

                                list_dt.forEach(function (dt) {
                                    if (dictionary[dt[scope.objPk]]) {
                                        temp = scope.chkList.every(function (el, index) {
                                            if (el[scope.objPk] === dt[scope.objPk]) {
                                                scope.chkList[index] = dt;
                                            }
                                            return el[scope.objPk] !== dt[scope.objPk];
                                        });
                                        if (temp) {
                                            scope.chkList.push(dt);
                                        }
                                    }

                                });
                            });


                            template = '<md-table-container style="background-color : #FFFFFF;overflow: hidden;">' +
                                       '    <table md-table md-row-select="options.rowSelection" ng-model="chkList" md-progress="mdProgress">' +
                                       '        <thead md-head md-order="query.order" md-on-reorder="mdOnReader">' +
                                       '            <tr md-row class="hideSelectAll">' +
                                       '               <th md-column md-order-by="{{ header.ref }}" ng-repeat="header in dynamicForm.isListCollumn"><span>{{ header.label }}</span></th>' +
                                       '            </tr>' +
                                       '        </thead>' +
                                       '        <tbody md-body ng-repeat="obj in params | filterDynamic:query.filter | orderBy: query.order' +  (scope.paginateByRequest ? '' : '| limitTo: query.limit : (query.page -1) * query.limit') + ' track by $index">' +
                                       '            <tr md-row md-select="obj" md-on-select="mdOnSelect" md-on-deselect="mdOnDeselect" md-auto-select="options.autoSelect" style="cursor: pointer !important">' +
                                       '                <td md-cell ng-repeat="prop in dynamicForm.isListCollumn" ng-click="editView(module.module, obj[objPk])">' +
                                       '                    <!--CELL-->' +
                                       '                    <div ng-if="prop.type === \'number\' || prop.type === \'numeric\'">{{ obj[prop.ref] | number: 2 }}</div>' +
                                       '                    <div ng-if="prop.type === \'date\'">{{ obj[prop.ref] | date: \'dd/MM/yyyy\' }}</div>' +
                                       '                    <div ng-if="prop.type !== \'number\' && prop.type !== \'numeric\' && prop.type !== \'img\' && prop.type !== \'date\'">{{ obj[prop.ref] }}</div>' +
                                       '                    <div ng-if="prop.type === \'img\'">' +
                                       '                        <img class="plg-data-table-component-cell-icon" ng-if="obj[prop.ref]" ng-src="{{ obj[prop.ref] }}" err-src="/assets/img/ic_person_black_48dp_2x.png" class="plg-data-table-component-cell-img">' +
                                       '                        <data-md-icon ng-if="!obj[prop.ref]" class="plg-data-table-component-cell-icon">person</data-md-icon>' +
                                       '                    </div>' +
                                       '                    <!--/CELL-->' +
                                       '                </td>' +
                                                        (scope.disableCellExpand ? ''
                                      :'                <td md-cell style="padding:0px !important;">' +
                                       '                    <md-menu-item layout-align="end right" role="menuitem" class="layout-align-center-right" aria-hidden="false">' +
                                       '                        <div class="plg-data-table-cell-expand-icon" ng-click="itemExpand($event, obj)">' +
                                       '                            <plg-change-icon-view obj="obj" service-module="module"></plg-change-icon-view>' +
                                       '                        </div>' +
                                       '                    </md-menu-item>' +
                                       '                 </td>') +
                                       '                <td md-cell style="padding:0 13px 0 0 !important; text-align: right; width:58px;" class="plg-data-table-cell-group">' +
                                       '                    <plg-group-filters type="single" by-event="byEvent" service-module="module" filter-default="filterDefault" params="obj">' +
                                       '                    </plg-group-filters>' +
                                       '                </td>' +
                                       '            </tr>' +
                                       '            <tr md-row ng-if="obj.isExpand" style="background-color: #ffffff !important;">' +
                                       '                <td md-cell colspan="60">' +
                                       '                    <DYNAMIC_TEMPLATE/>' +
                                       '                </td>' +
                                       '            </tr>' +
                                       '        </tbody>' +
                                       '    </table>' +
                                       '</md-table-container>' +
                                       '<md-table-pagination md-limit="query.limit" md-page="query.page" md-page-select="mdOnPageSelect" md-total="{{query.total || params.length}}" md-on-paginate="mdOnPaginate()" md-label="{page: \'Página:\', rowsPerPage: \'Linhas por página:\', of: \'de\'}"></md-table-pagination>';

                            transclude(scope, function(clone) {
                                if (!scope.disableCellExpand) {
                                    template = template.replace('<DYNAMIC_TEMPLATE/>', clone[1].data);
                                }
                            });

                            cb(null, template);
                        },

                        'editView': function(path, id) {
                            if (!scope.disableCellView) {
                                $location.path(path + '/' + id);
                            }
                        },

                        'itemExpand': function(evt, item) {
                            evt.preventDefault();
                            item.isExpand = !item.isExpand;
                        }

                    };

                    // defining template
                    builder.buildTemplate(scope, function(err, template) {

                        scope.chkList.length = 0;

                        // handling error
                        if (err) {
                            $log.warn(err);
                            return;
                        }

                        // compiling template
                        compiledElm = $compile(template)(scope);

                        // handling post compile hooks
                        if (builder.postCompile) {
                            builder.postCompile(compiledElm);
                        }

                        // replacing into DOM
                        element.replaceWith(compiledElm);

                    });
                }
            }
        };
    }

    // injecting dependencies
    PlgDataTable.$inject = ['$log', '$compile', '$location'];

    // registering into angular
    angular.module('plingUi').directive('plgDataTable', PlgDataTable);
}());

/* global angular, console, document, $, window */
(function () {
    'use strict';

    // creating directive
    function PlgDataTableFilters($rootScope, $log, $compile, $http, core, formatResultList) {
        return {
            'restrict': 'E',
            'scope': {
                'params': '=',
                'serviceModule': '=',
                'dynamicForm': '=',
                'filterDefault': '='
            },
            'replace': true,

            // linking directive
            'link': function (scope, element) {

                var builder, compiledElm;

                // validating bind value
                if (scope.params) {
                    builder = {
                        'buildTemplate': function (scope, cb) {
                            var template;


                            scope.actionsList = this.actionsList;

                            scope.collection    = scope.serviceModule.collection;
                            scope.module        = scope.serviceModule.module;

                            if (scope.serviceModule.subModuleEdit) {
                                scope.module    = scope.serviceModule.module + '/' + scope.serviceModule.subModuleEdit;
                            }

                            scope.resultViewItems = formatResultList.action(scope.filterDefault.action, scope.serviceModule.viewItems);

                            template =  '<md-menu md-offset="0 -7" md-position-mode="target-right target">' +
                                        '    <md-button aria-label="" class="md-icon-button" ng-click="$mdOpenMenu($event)" >' +
                                        '        <md-tooltip>Ações</md-tooltip>' +
                                        '        <md-icon md-svg-src="assets/images/icone_mais.svg"></md-icon>' +
                                        '    </md-button>' +
                                        '    <md-menu-content layout="column" layout-wrap width="4" >' +
                                        '        <md-menu-item flex ng-show="module">' +
                                        '           <p><font color="#959595">Alterar Status</font></p>' +
                                        '        </md-menu-item>' +
                                        '        <md-menu-item flex ng-repeat="item in resultViewItems">' +
                                        '            <md-button ng-click="actionsList(params, \'Registro\', item, collection)" style="margin-left: 15px !important">' +
                                        '                 <md-icon md-svg-src="{{item.moduleIcon}}"></md-icon>' +
                                        '                 {{item.name}}' +
                                        '            </md-button>' +
                                        '        </md-menu-item>' +
                                        '    </md-menu-content>' +
                                        '</md-menu>';

                            cb(null, template);
                        },

                        'actionsList': function (param, label, item, collection) {
                            var payload = {},
                                getParam;

                            getParam             = param._id;
                            payload[item.method] = item.action;

                            // localhost:500/api/v1/integra
                            $http.patch(core.getAppCoreUrl('integra', collection + '/' + getParam), payload)
                                .success(function (data) {
                                    if (data) {
                                        $rootScope.$emit('saveRecordSuccess', label + ' ' + item.msg + ' com sucesso.');
                                        $rootScope.$emit('research', [param], item.method, item.action);
                                    } else {
                                        $rootScope.$emit('recordError', 'Ocorreu um erro ao ' + item.msg + ' ' + collection);
                                    }
                                });
                        }

                    };

                    // defining template
                    builder.buildTemplate(scope, function (err, template) {

                        // handling error
                        if (err) {
                            $log.warn(err);
                            return;
                        }

                        // compiling template
                        compiledElm = $compile(template)(scope);

                        // handling post compile hooks
                        if (builder.postCompile) {
                            builder.postCompile(compiledElm);
                        }

                        // replacing into DOM
                        element.replaceWith(compiledElm);

                    });
                }
            }
        };
    }

    // injecting dependencies
    PlgDataTableFilters.$inject = ['$rootScope', '$log', '$compile', '$http', 'coreApiService', 'formatResultList'];

    // registering into angular
    angular.module('plingUi').directive('plgDataTableFilters', PlgDataTableFilters);
}());

/*  angular, console, document, $, jQuery, window, URL */
(function () {
    'use strict';

    // creating directive
    function PlgDataTableSearch($log, $compile, $rootScope) {
        return {
            'restrict': 'E',
            'scope': {
                'dynamicForm': '=',
                'offline': '@',
                'disableGeneralSearch': '@',
                'disableSearchIcons': '@'
            },
            'replace': true,

            // linking directive
            'link': function (scope, element) {

                var builder, compiledElm, fields = [], fieldsType;

                builder = {
                    'buildTemplate': function (scope, cb) {

                        var template;

                        scope.serializeQueryString  = this.serializeQueryString;
                        scope.searchPeople          = this.searchPeople;
                        scope.searchColorActive     = this.searchColorActive;
                        scope.searchColorInactivate = this.searchColorInactivate;
                        scope.colorIconsTrash       = this.colorIconsTrash;
                        scope.setHideInputs         = this.setHideInputs;

                        scope.search                   = {};
                        scope.searchIconsTrash         = 'checkOffColorIconFilter';
                        scope.searchIconsActive        = 'checkOffColorIconFilter';
                        scope.searchIconsInactivate    = 'checkOffColorIconFilter';
                        scope.show = {
                            'date': false,
                            'default': true
                        };
                        if (scope.disableGeneralSearch) {
                            scope.dynamicForm          = scope.dynamicForm || {};
                            scope.dynamicForm.allField = scope.dynamicForm.allField || [];
                            scope.search.fieldtable    = scope.search.fieldtable || [];

                            scope.dynamicForm.allField.forEach(function (f) {
                                scope.search.fieldtable.push(f.ref);
                            });
                        }

                        template =  '<div class="search-inputs" ng-if="show.default && !disableGeneralSearch">' +
                                    '    <md-input-container>' +
                                    '        <label>Pesquisar</label>' +
                                    '        <input ng-model="search.searchDefault">' +
                                    '    </md-input-container>' +
                                    '</div>' +
                                    '<div class="search-inputs" style="padding-top: 5px;margin-right:30px;" ng-if="show.date">' +
                                    '    <plg-date-picker selected="search.searchDate"></plg-date-picker>' +
                                    '</div>' +

                                    '<div style="margin-left: 20px !important;max-height:72px;">' +
                                    '    <md-input-container>' +
                                    '        <md-select multiple ng-model="search.fieldtable" ng-change="setHideInputs(search.fieldtable)" placeholder="Selecione">' +
                                    '            <md-option ng-repeat="table in dynamicForm.allField" value="{{table.ref}}">{{table.label}}</md-option>' +
                                    '        </md-select>' +
                                    '    </md-input-container>' +
                                    '</div>' +

                                    '<div style="width: 140px;margin-left: 10px;" ng-if="!disableSearchIcons">' +
                                    '    <md-input-container>' +
                                    '        <md-button ng-class="searchIconsActive" class="md-icon-button search-md-button" ng-click="searchColorActive()">' +
                                    '            <md-tooltip md-direction="bottom">Ativos</md-tooltip>' +
                                    '            <i class="material-icons">done_all</i>' +
                                    '        </md-button>' +
                                    '        <md-button ng-class="searchIconsInactivate" class="md-icon-button search-md-button" ng-click="searchColorInactivate()">' +
                                    '            <md-tooltip md-direction="bottom">Inativos</md-tooltip>' +
                                    '            <i class="material-icons">highlight_off</i>' +
                                    '        </md-button>' +
                                    '        <md-button ng-class="searchIconsTrash" class="md-icon-button search-md-button" ng-click="colorIconsTrash()">' +
                                    '            <md-tooltip md-direction="bottom">Excluídos</md-tooltip>' +
                                    '            <i class="material-icons">delete</i>' +
                                    '        </md-button>' +
                                    '    </md-input-container>' +
                                    '</div>' +

                                    '<md-button ng-click="searchPeople(search)" class="md-raised" style="font-size: 11px !important;">Pesquisar</md-button>';

                        cb(null, template);
                    },

                    'serializeQueryString' : function (obj) {
                        var str = [], p, offlineObj = {};

                        if (scope.offline) {

                            if (obj.fieldtable && obj.fieldtable.length > 0) {
                                fieldsType = builder.getFields(obj.fieldtable);
                                fieldsType.forEach(function (f) {
                                    if (f.type === 'date') {
                                        offlineObj[f.ref] = angular.copy(obj.searchDate);
                                    } else {
                                        offlineObj[f.ref] = obj.searchDefault;
                                    }
                                });
                            } else {
                                offlineObj = obj.searchDefault;
                            }

                            return offlineObj;
                        }

                        for (p in obj) {
                            if (obj.hasOwnProperty(p) && encodeURIComponent(obj[p])) {
                                str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
                            }
                        }

                        if (str.length > 0) {
                            return '&' + str.join('&');
                        }

                        return str.join('&');
                    },

                    'searchPeople' : function (search) {
                        $rootScope.$emit('searchPeople', scope.serializeQueryString(search));
                    },

                    'searchColorActive' : function () {
                        if (scope.searchIconsActive === 'checkOffColorIconFilter') {
                            scope.searchIconsActive = 'checkOnColorIconFilter';
                            scope.search.active     = true;
                        } else {
                            scope.searchIconsActive = 'checkOffColorIconFilter';
                            delete scope.search.active;
                        }
                    },

                    'searchColorInactivate' : function () {
                        if (scope.searchIconsInactivate === 'checkOffColorIconFilter') {
                            scope.searchIconsInactivate = 'checkOnColorIconFilter';
                            scope.search.inactive       = true;
                        } else {
                            scope.searchIconsInactivate = 'checkOffColorIconFilter';
                            delete scope.search.inactive;
                        }
                    },

                    'colorIconsTrash' : function () {
                        if (scope.searchIconsTrash === 'checkOffColorIconFilter') {
                            scope.searchIconsTrash = 'checkOnColorIconFilter';
                            scope.search.trash     = true;
                        } else {
                            scope.searchIconsTrash = 'checkOffColorIconFilter';
                            delete scope.search.trash;
                        }
                    },

                    'getFields': function (names) {
                        fields.length = 0;

                        if (scope.dynamicForm.allField && scope.dynamicForm.allField.length > 0) {
                            names.forEach(function (n) {
                                scope.dynamicForm.allField.every(function (field) {
                                    if (field.ref === n) {
                                        fields.push(field);
                                        return false;
                                    }
                                    return true;
                                });
                            });
                        }
                        return fields;
                    },

                    'setHideInputs': function (names) {

                        if (names && names.length > 0) {
                            fieldsType = builder.getFields(names);
                            fieldsType.forEach(function (field) {
                                if (field.type === 'date') {
                                    scope.show.date = true;
                                } else {
                                    scope.show.default = true;
                                }

                                if (fieldsType.length === 1) {
                                    scope.show.default = !scope.show.date;
                                    scope.show.date = !scope.show.default;
                                }
                            });
                        } else {
                            scope.show.default = true;
                            scope.show.date = false;
                        }
                    }
                };

                // defining template
                builder.buildTemplate(scope, function (err, template) {

                    // handling error
                    if (err) {
                        $log.warn(err);
                        return;
                    }

                    // compiling template
                    compiledElm = $compile(template)(scope);

                    // handling post compile hooks
                    if (builder.postCompile) {
                        builder.postCompile(compiledElm);
                    }

                    // replacing into DOM
                    element.replaceWith(compiledElm);

                });
            }
        };
    }

    // injecting dependencies
    PlgDataTableSearch.$inject = ['$log', '$compile', '$rootScope'];

    // registering into angular
    angular.module('plingUi').directive('plgDataTableSearch', PlgDataTableSearch);
}());

(function () {

    angular.module('plingUi').component('plgDatePicker', {
        'bindings'  : {
            'selected'    : '=',
            'disableRange': '=',
            'monthsLimit' : '@',
            'label'       : '='
        },
        'controller' : PlgDatePickerCtrl,
        'templateUrl' : 'plgDatePicker.html'
    });

    function PlgDatePickerCtrl() {
        var ctrl = this,
            fromDate,
            toDate,
            dateFormat;

        ctrl.mask = ctrl.disableRange ? '?9?9/?9?9/?9?9?9?9' : '?9?9/?9?9/?9?9?9?9 - ?9?9/?9?9/?9?9?9?9';

        ctrl.setDates = function (select) {
            if (select.display && select.display.length >= 8 && !select.$invalid) {
                createDates(select.display);
                handleDates(select);
            } else {
                select.fromDate = null;
                select.toDate   = null;
            }
        };

        ctrl.validate = function (select) {
            if (select && select.display) {
                dateFormat = select.display.replace(new RegExp('(_\/|\/_|_)', 'g'), '') || '';

                if (dateFormat) {
                    fromDate = dateFormat.split(' - ')[0];
                    toDate   = dateFormat.split(' - ')[1];

                    if (!isValid(fromDate) || toDate && !isValid(toDate)) {
                        select.$invalid = true;
                        select.fromDate = null;
                        select.toDate   = null;
                        return false;
                    }

                    select.$invalid = false;
                }
            }
        };

        function isValid(date) {
            return moment(date, 'DD/MM/YYYY', true).isValid();
        }

        function createDates(display) {
            dateFormat = display.replace(new RegExp('(_\/|\/_|_)', 'g'), '') || '';
            fromDate = dateFormat.split(' - ')[0];
            toDate   = dateFormat.split(' - ')[1];
            fromDate = fromDate.slice(-4) + '-' + fromDate.slice(3, 5) + '-' + fromDate.slice(0, 2);
            toDate   = toDate ? toDate.slice(-4) + '-' + toDate.slice(3, 5) + '-' + toDate.slice(0, 2) : '';
        }

        function handleDates(select) {
            if (toDate && fromDate > toDate) {
                select.fromDate = toDate;
                select.toDate   = fromDate;

                select.display  = select.display.slice(-10) + ' - ' + select.display.slice(0, 10);
            } else {
                select.fromDate = fromDate;
                select.toDate   = toDate || fromDate;
            }
        }
    }
}());

angular.module('dndLists', [])

  /**
   * Use the dnd-draggable attribute to make your element draggable
   *
   * Attributes:
   * - dnd-draggable      Required attribute. The value has to be an object that represents the data
   *                      of the element. In case of a drag and drop operation the object will be
   *                      serialized and unserialized on the receiving end.
   * - dnd-selected       Callback that is invoked when the element was clicked but not dragged.
   *                      The original click event will be provided in the local event variable.
   * - dnd-effect-allowed Use this attribute to limit the operations that can be performed. Options:
   *                      - 'move': The drag operation will move the element. This is the default.
   *                      - 'copy': The drag operation will copy the element. Shows a copy cursor.
   *                      - 'copyMove': The user can choose between copy and move by pressing the
   *                        ctrl or shift key. *Not supported in IE:* In Internet Explorer this
   *                        option will be the same as 'copy'. *Not fully supported in Chrome on
   *                        Windows:* In the Windows version of Chrome the cursor will always be the
   *                        move cursor. However, when the user drops an element and has the ctrl
   *                        key pressed, we will perform a copy anyways.
   *                      - HTML5 also specifies the 'link' option, but this library does not
   *                        actively support it yet, so use it at your own risk.
   * - dnd-moved          Callback that is invoked when the element was moved. Usually you will
   *                      remove your element from the original list in this callback, since the
   *                      directive is not doing that for you automatically. The original dragend
   *                      event will be provided in the local event variable.
   * - dnd-canceled       Callback that is invoked if the element was dragged, but the operation was
   *                      canceled and the element was not dropped. The original dragend event will
   *                      be provided in the local event variable.
   * - dnd-copied         Same as dnd-moved, just that it is called when the element was copied
   *                      instead of moved. The original dragend event will be provided in the local
   *                      event variable.
   * - dnd-dragstart      Callback that is invoked when the element was dragged. The original
   *                      dragstart event will be provided in the local event variable.
   * - dnd-dragend        Callback that is invoked when the drag operation ended. Available local
   *                      variables are event and dropEffect.
   * - dnd-type           Use this attribute if you have different kinds of items in your
   *                      application and you want to limit which items can be dropped into which
   *                      lists. Combine with dnd-allowed-types on the dnd-list(s). This attribute
   *                      should evaluate to a string, although this restriction is not enforced.
   * - dnd-disable-if     You can use this attribute to dynamically disable the draggability of the
   *                      element. This is useful if you have certain list items that you don't want
   *                      to be draggable, or if you want to disable drag & drop completely without
   *                      having two different code branches (e.g. only allow for admins).
   *                      **Note**: If your element is not draggable, the user is probably able to
   *                      select text or images inside of it. Since a selection is always draggable,
   *                      this breaks your UI. You most likely want to disable user selection via
   *                      CSS (see user-select).
   *
   * CSS classes:
   * - dndDragging        This class will be added to the element while the element is being
   *                      dragged. It will affect both the element you see while dragging and the
   *                      source element that stays at it's position. Do not try to hide the source
   *                      element with this class, because that will abort the drag operation.
   * - dndDraggingSource  This class will be added to the element after the drag operation was
   *                      started, meaning it only affects the original element that is still at
   *                      it's source position, and not the 'element' that the user is dragging with
   *                      his mouse pointer.
   */
    .directive('dndDraggable', ['$parse', '$timeout', 'dndDropEffectWorkaround', 'dndDragTypeWorkaround', function($parse,   $timeout,   dndDropEffectWorkaround,   dndDragTypeWorkaround) {

        return function(scope, element, attr) {

            // Set the HTML5 draggable attribute on the element
            element.attr('draggable', 'true');

            // If the dnd-disable-if attribute is set, we have to watch that
            if (attr.dndDisableIf) {
                scope.$watch(attr.dndDisableIf, function(disabled) {
                    element.attr('draggable', !disabled);
                });
            }

            /**
            * When the drag operation is started we have to prepare the dataTransfer object,
            * which is the primary way we communicate with the target element
            */
            element.on('dragstart', function(event) {
                event = event.originalEvent || event;

                // Check whether the element is draggable, since dragstart might be triggered on a child.
                if (element.attr('draggable') == 'false') return true; // eslint-disable-line

                // Serialize the data associated with this element. IE only supports the Text drag type
                event.dataTransfer.setData('Text', angular.toJson(scope.$eval(attr.dndDraggable)));

                // Only allow actions specified in dnd-effect-allowed attribute
                event.dataTransfer.effectAllowed = attr.dndEffectAllowed || 'move';

                // Add CSS classes. See documentation above
                element.addClass('dndDragging');
                $timeout(function() { element.addClass('dndDraggingSource'); }, 0);

                // Workarounds for stupid browsers, see description below
                dndDropEffectWorkaround.dropEffect = 'none';
                dndDragTypeWorkaround.isDragging = true;

                // Save type of item in global state. Usually, this would go into the dataTransfer
                // typename, but we have to use 'Text' there to support IE
                dndDragTypeWorkaround.dragType = attr.dndType ? scope.$eval(attr.dndType) : undefined; // eslint-disable-line

                // Try setting a proper drag image if triggered on a dnd-handle (won't work in IE).
                if (event._dndHandle && event.dataTransfer.setDragImage) {
                    event.dataTransfer.setDragImage(element[0], 0, 0);
                }

                // Invoke callback
                $parse(attr.dndDragstart)(scope, { 'event': event });

                event.stopPropagation();
            });

        /**
        * The dragend event is triggered when the element was dropped or when the drag
        * operation was aborted (e.g. hit escape button). Depending on the executed action
        * we will invoke the callbacks specified with the dnd-moved or dnd-copied attribute.
        */
            element.on('dragend', function(event) {
                var dropEffect;

                event = event.originalEvent || event;

                // Invoke callbacks. Usually we would use event.dataTransfer.dropEffect to determine
                // the used effect, but Chrome has not implemented that field correctly. On Windows
                // it always sets it to 'none', while Chrome on Linux sometimes sets it to something
                // else when it's supposed to send 'none' (drag operation aborted).
                dropEffect = dndDropEffectWorkaround.dropEffect;

                scope.$apply(function() {
                    switch (dropEffect) {
                    case 'move':
                        $parse(attr.dndMoved)(scope, { 'event': event });
                        break;
                    case 'copy':
                        $parse(attr.dndCopied)(scope, { 'event': event });
                        break;
                    case 'none':
                        $parse(attr.dndCanceled)(scope, { 'event': event });
                        break;
                    }

                    $parse(attr.dndDragend)(scope, { 'event': event, 'dropEffect': dropEffect });
                });

                // Clean up
                element.removeClass('dndDragging');
                $timeout(function() { element.removeClass('dndDraggingSource'); }, 0);
                dndDragTypeWorkaround.isDragging = false;
                event.stopPropagation();
            });

            /**
            * When the element is clicked we invoke the callback function
            * specified with the dnd-selected attribute.
            */
            element.on('click', function(event) {
                if (!attr.dndSelected) return;

                event = event.originalEvent || event;
                scope.$apply(function() {
                    $parse(attr.dndSelected)(scope, { 'event': event });
                });

            // Prevent triggering dndSelected in parent elements.
                event.stopPropagation();
            });

            /**
            * Workaround to make element draggable in IE9
            */
            element.on('selectstart', function() {
                if (this.dragDrop) this.dragDrop();
            });
        };
    }])

  /**
   * Use the dnd-list attribute to make your list element a dropzone. Usually you will add a single
   * li element as child with the ng-repeat directive. If you don't do that, we will not be able to
   * position the dropped element correctly. If you want your list to be sortable, also add the
   * dnd-draggable directive to your li element(s). Both the dnd-list and it's direct children must
   * have position: relative CSS style, otherwise the positioning algorithm will not be able to
   * determine the correct placeholder position in all browsers.
   *
   * Attributes:
   * - dnd-list             Required attribute. The value has to be the array in which the data of
   *                        the dropped element should be inserted.
   * - dnd-allowed-types    Optional array of allowed item types. When used, only items that had a
   *                        matching dnd-type attribute will be dropable.
   * - dnd-disable-if       Optional boolean expresssion. When it evaluates to true, no dropping
   *                        into the list is possible. Note that this also disables rearranging
   *                        items inside the list.
   * - dnd-horizontal-list  Optional boolean expresssion. When it evaluates to true, the positioning
   *                        algorithm will use the left and right halfs of the list items instead of
   *                        the upper and lower halfs.
   * - dnd-dragover         Optional expression that is invoked when an element is dragged over the
   *                        list. If the expression is set, but does not return true, the element is
   *                        not allowed to be dropped. The following variables will be available:
   *                        - event: The original dragover event sent by the browser.
   *                        - index: The position in the list at which the element would be dropped.
   *                        - type: The dnd-type set on the dnd-draggable, or undefined if unset.
   *                        - external: Whether the element was dragged from an external source.
   * - dnd-drop             Optional expression that is invoked when an element is dropped on the
   *                        list. The following variables will be available:
   *                        - event: The original drop event sent by the browser.
   *                        - index: The position in the list at which the element would be dropped.
   *                        - item: The transferred object.
   *                        - type: The dnd-type set on the dnd-draggable, or undefined if unset.
   *                        - external: Whether the element was dragged from an external source.
   *                        The return value determines the further handling of the drop:
   *                        - false: The drop will be canceled and the element won't be inserted.
   *                        - true: Signalises that the drop is allowed, but the dnd-drop
   *                          callback already took care of inserting the element.
   *                        - otherwise: All other return values will be treated as the object to
   *                          insert into the array. In most cases you want to simply return the
   *                          item parameter, but there are no restrictions on what you can return.
   * - dnd-inserted         Optional expression that is invoked after a drop if the element was
   *                        actually inserted into the list. The same local variables as for
   *                        dnd-drop will be available. Note that for reorderings inside the same
   *                        list the old element will still be in the list due to the fact that
   *                        dnd-moved was not called yet.
   * - dnd-external-sources Optional boolean expression. When it evaluates to true, the list accepts
   *                        drops from sources outside of the current browser tab. This allows to
   *                        drag and drop accross different browser tabs. Note that this will allow
   *                        to drop arbitrary text into the list, thus it is highly recommended to
   *                        implement the dnd-drop callback to check the incoming element for
   *                        sanity. Furthermore, the dnd-type of external sources can not be
   *                        determined, therefore do not rely on restrictions of dnd-allowed-type.
   *
   * CSS classes:
   * - dndPlaceholder       When an element is dragged over the list, a new placeholder child
   *                        element will be added. This element is of type li and has the class
   *                        dndPlaceholder set. Alternatively, you can define your own placeholder
   *                        by creating a child element with dndPlaceholder class.
   * - dndDragover          Will be added to the list while an element is dragged over the list.
   */
    .directive('dndList', ['$parse', '$timeout', 'dndDropEffectWorkaround', 'dndDragTypeWorkaround', function($parse,   $timeout,   dndDropEffectWorkaround,   dndDragTypeWorkaround) {
        return function(scope, element, attr) {
            // While an element is dragged over the list, this placeholder element is inserted
            // at the location where the element would be inserted after dropping
            var placeholder = getPlaceholderElement(); // eslint-disable-line
            var placeholderNode = placeholder[0];
            var listNode = element[0];
            var horizontal = attr.dndHorizontalList && scope.$eval(attr.dndHorizontalList);
            var externalSources = attr.dndExternalSources && scope.$eval(attr.dndExternalSources);

            placeholder.remove();

            /**
            * The dragenter event is fired when a dragged element or text selection enters a valid drop
            * target. According to the spec, we either need to have a dropzone attribute or listen on
            * dragenter events and call preventDefault(). It should be noted though that no browser seems
            * to enforce this behaviour.
            */
            element.on('dragenter', function (event) {
                event = event.originalEvent || event;
                if (!isDropAllowed(event)) return true; // eslint-disable-line
                event.preventDefault();
            });

            /**
            * The dragover event is triggered 'every few hundred milliseconds' while an element
            * is being dragged over our list, or over an child element.
            */
            element.on('dragover', function(event) {
                var listItemNode;

                event = event.originalEvent || event;

                if (!isDropAllowed(event)) return true; // eslint-disable-line

                // First of all, make sure that the placeholder is shown
                // This is especially important if the list is empty
                if (placeholderNode.parentNode != listNode) { // eslint-disable-line
                    element.append(placeholder);
                }

                if (event.target !== listNode) {
                    // Try to find the node direct directly below the list node.
                    listItemNode = event.target;

                    while (listItemNode.parentNode !== listNode && listItemNode.parentNode) {
                        listItemNode = listItemNode.parentNode;
                    }

                    if (listItemNode.parentNode === listNode && listItemNode !== placeholderNode) {
                        // If the mouse pointer is in the upper half of the child element,
                        // we place it before the child element, otherwise below it.
                        if (isMouseInFirstHalf(event, listItemNode)) { // eslint-disable-line
                            listNode.insertBefore(placeholderNode, listItemNode);
                        } else {
                            listNode.insertBefore(placeholderNode, listItemNode.nextSibling);
                        }
                    }
                } else {
                    // This branch is reached when we are dragging directly over the list element.
                    // Usually we wouldn't need to do anything here, but the IE does not fire it's
                    // events for the child element, only for the list directly. Therefore, we repeat
                    // the positioning algorithm for IE here.
                    if (isMouseInFirstHalf(event, placeholderNode, true)) { // eslint-disable-line
                        // Check if we should move the placeholder element one spot towards the top.
                        // Note that display none elements will have offsetTop and offsetHeight set to
                        // zero, therefore we need a special check for them.
                        while (placeholderNode.previousElementSibling && (isMouseInFirstHalf(event, placeholderNode.previousElementSibling, true) || placeholderNode.previousElementSibling.offsetHeight === 0)) { // eslint-disable-line
                            listNode.insertBefore(placeholderNode, placeholderNode.previousElementSibling);
                        }
                    } else {
                        // Check if we should move the placeholder element one spot towards the bottom
                        while (placeholderNode.nextElementSibling &&
                        !isMouseInFirstHalf(event, placeholderNode.nextElementSibling, true)) { // eslint-disable-line
                            listNode.insertBefore(placeholderNode,
                            placeholderNode.nextElementSibling.nextElementSibling);
                        }
                    }
                }

                // At this point we invoke the callback, which still can disallow the drop.
                // We can't do this earlier because we want to pass the index of the placeholder.
                if (attr.dndDragover && !invokeCallback(attr.dndDragover, event, getPlaceholderIndex())) { // eslint-disable-line
                    return stopDragover(); // eslint-disable-line
                }

                element.addClass('dndDragover');
                event.preventDefault();
                event.stopPropagation();
                return false;
            });

            /**
            * When the element is dropped, we use the position of the placeholder element as the
            * position where we insert the transferred data. This assumes that the list has exactly
            * one child element per array element.
            */
            element.on('drop', function(event) {
                var data, transferredObject, index;

                event = event.originalEvent || event;

                if (!isDropAllowed(event)) return true; // eslint-disable-line

                // The default behavior in Firefox is to interpret the dropped element as URL and
                // forward to it. We want to prevent that even if our drop is aborted.
                event.preventDefault();

                // Unserialize the data that was serialized in dragstart. According to the HTML5 specs,
                // the 'Text' drag type will be converted to text/plain, but IE does not do that.
                data = event.dataTransfer.getData('Text') || event.dataTransfer.getData('text/plain');

                try {
                    transferredObject = JSON.parse(data);
                } catch (e) {
                    return stopDragover(); // eslint-disable-line
                }

                // Invoke the callback, which can transform the transferredObject and even abort the drop.
                index = getPlaceholderIndex(); // eslint-disable-line

                if (attr.dndDrop) {
                    transferredObject = invokeCallback(attr.dndDrop, event, index, transferredObject); // eslint-disable-line
                    if (!transferredObject) {
                        return stopDragover(); // eslint-disable-line
                    }
                }

                // Insert the object into the array, unless dnd-drop took care of that (returned true).
                if (transferredObject !== true) {
                    scope.$apply(function() {
                        scope.$eval(attr.dndList).splice(index, 0, transferredObject);
                    });
                }

                invokeCallback(attr.dndInserted, event, index, transferredObject); // eslint-disable-line

                // In Chrome on Windows the dropEffect will always be none...
                // We have to determine the actual effect manually from the allowed effects
                if (event.dataTransfer.dropEffect === 'none') {
                    if (event.dataTransfer.effectAllowed === 'copy' ||
                        event.dataTransfer.effectAllowed === 'move') {
                        dndDropEffectWorkaround.dropEffect = event.dataTransfer.effectAllowed;
                    } else {
                        dndDropEffectWorkaround.dropEffect = event.ctrlKey ? 'copy' : 'move';
                    }
                } else {
                    dndDropEffectWorkaround.dropEffect = event.dataTransfer.dropEffect;
                }

                // Clean up
                stopDragover(); // eslint-disable-line
                event.stopPropagation();
                return false;
            });

            /**
            * We have to remove the placeholder when the element is no longer dragged over our list. The
            * problem is that the dragleave event is not only fired when the element leaves our list,
            * but also when it leaves a child element -- so practically it's fired all the time. As a
            * workaround we wait a few milliseconds and then check if the dndDragover class was added
            * again. If it is there, dragover must have been called in the meantime, i.e. the element
            * is still dragging over the list. If you know a better way of doing this, please tell me!
            */
            element.on('dragleave', function(event) {
                event = event.originalEvent || event;

                element.removeClass('dndDragover');
                $timeout(function() {
                    if (!element.hasClass('dndDragover')) {
                        placeholder.remove();
                    }
                }, 100);
            });

            function isMouseInFirstHalf(event, targetNode, relativeToParent) {
                var mousePointer = horizontal ? event.offsetX || event.layerX
                                              : event.offsetY || event.layerY;

                var targetSize     = horizontal ? targetNode.offsetWidth : targetNode.offsetHeight;
                var targetPosition = horizontal ? targetNode.offsetLeft : targetNode.offsetTop;

                targetPosition = relativeToParent ? targetPosition : 0;
                return mousePointer < targetPosition + targetSize / 2;
            }

            function getPlaceholderElement() {
                var placeholder;

                angular.forEach(element.children(), function(childNode) {
                    var child = angular.element(childNode);

                    if (child.hasClass('dndPlaceholder')) {
                        placeholder = child;
                    }
                });
                return placeholder || angular.element('<li class="dndPlaceholder"></li>');
            }

            function getPlaceholderIndex() {
                return Array.prototype.indexOf.call(listNode.children, placeholderNode);
            }

            function isDropAllowed(event) {
                var allowed;

                // Disallow drop from external source unless it's allowed explicitly.
                if (!dndDragTypeWorkaround.isDragging && !externalSources) return false;

                // Check mimetype. Usually we would use a custom drag type instead of Text, but IE doesn't
                // support that.
                if (!hasTextMimetype(event.dataTransfer.types)) return false; // eslint-disable-line

                // Now check the dnd-allowed-types against the type of the incoming element. For drops from
                // external sources we don't know the type, so it will need to be checked via dnd-drop.
                if (attr.dndAllowedTypes && dndDragTypeWorkaround.isDragging) {
                    allowed = scope.$eval(attr.dndAllowedTypes);
                    if (angular.isArray(allowed) && allowed.indexOf(dndDragTypeWorkaround.dragType) === -1) {
                        return false;
                    }
                }

                // Check whether droping is disabled completely
                if (attr.dndDisableIf && scope.$eval(attr.dndDisableIf)) return false;

                return true;
            }

            function stopDragover() {
                placeholder.remove();
                element.removeClass('dndDragover');
                return true;
            }

            function invokeCallback(expression, event, index, item) {
                return $parse(expression)(scope, {
                    'event': event,
                    'index': index,
                    'item': item || undefined, // eslint-disable-line
                    'external': !dndDragTypeWorkaround.isDragging,
                    'type': dndDragTypeWorkaround.isDragging ? dndDragTypeWorkaround.dragType : undefined // eslint-disable-line
                });
            }

            function hasTextMimetype(types) {
                var i;

                if (!types) return true;

                for (i = 0; i < types.length; i++) {
                    if (types[i] === 'Text' || types[i] === 'text/plain') return true;
                }

                return false;
            }
        };
    }])

    /**
    * Use the dnd-nodrag attribute inside of dnd-draggable elements to prevent them from starting
    * drag operations. This is especially useful if you want to use input elements inside of
    * dnd-draggable elements or create specific handle elements. Note: This directive does not work
    * in Internet Explorer 9.
    */
    .directive('dndNodrag', function() {
        return function(scope, element, attr) { // eslint-disable-line
            // Set as draggable so that we can cancel the events explicitly
            element.attr('draggable', 'true');

            /**
            * Since the element is draggable, the browser's default operation is to drag it on dragstart.
            * We will prevent that and also stop the event from bubbling up.
            */
            element.on('dragstart', function(event) {
                event = event.originalEvent || event;

                if (!event._dndHandle) {
                    // If a child element already reacted to dragstart and set a dataTransfer object, we will
                    // allow that. For example, this is the case for user selections inside of input elements.
                    if (!(event.dataTransfer.types && event.dataTransfer.types.length)) {
                        event.preventDefault();
                    }
                    event.stopPropagation();
                }
            });

            /**
            * Stop propagation of dragend events, otherwise dnd-moved might be triggered and the element
            * would be removed.
            */
            element.on('dragend', function(event) {
                event = event.originalEvent || event;
                if (!event._dndHandle) {
                    event.stopPropagation();
                }
            });
        };
    })

  /**
   * Use the dnd-handle directive within a dnd-nodrag element in order to allow dragging with that
   * element after all. Therefore, by combining dnd-nodrag and dnd-handle you can allow
   * dnd-draggable elements to only be dragged via specific 'handle' elements. Note that Internet
   * Explorer will show the handle element as drag image instead of the dnd-draggable element. You
   * can work around this by styling the handle element differently when it is being dragged. Use
   * the CSS selector .dndDragging:not(.dndDraggingSource) [dnd-handle] for that.
   */
    .directive('dndHandle', function() {
        return function(scope, element, attr) { // eslint-disable-line
            element.attr('draggable', 'true');

            element.on('dragstart dragend', function(event) {
                event = event.originalEvent || event;
                event._dndHandle = true;
            });
        };
    })

  /**
   * This workaround handles the fact that Internet Explorer does not support drag types other than
   * 'Text' and 'URL'. That means we can not know whether the data comes from one of our elements or
   * is just some other data like a text selection. As a workaround we save the isDragging flag in
   * here. When a dropover event occurs, we only allow the drop if we are already dragging, because
   * that means the element is ours.
   */
  .factory('dndDragTypeWorkaround', function() { return {}; })

  /**
   * Chrome on Windows does not set the dropEffect field, which we need in dragend to determine
   * whether a drag operation was successful. Therefore we have to maintain it in this global
   * variable. The bug report for that has been open for years:
   * https://code.google.com/p/chromium/issues/detail?id=39399
   */
  .factory('dndDropEffectWorkaround', function() { return {}; });


angular.module('plingUi').filter('filterDynamic', ['$filter', function ($filter) {
    'use strict';

    var output = [], querys = {}, date;

    function filter(items, value, pkey) {
        if (value && value.fromDate) {
            return items.filter(function (i) {
                date = moment(i[pkey], 'DD/MM/YYYY').isValid() ? moment(i[pkey], 'DD/MM/YYYY').format('YYYY-MM-DD') : moment(i[pkey]).format('YYYY-MM-DD');
                return i[pkey] && (value.fromDate <= date &&  value.toDate >= date);
            });
        } else {
            return $filter('filter')(items, typeof value === 'object' ? '' : value);
        }
    }

    return function(items, option) {
        querys = {};
        output.length = 0;

        if (!items || !option || items.length <= 0) {
            return items;
        }

        if (typeof option === 'object') {
            Object.keys(option).forEach(function (pkey) {
                querys[pkey] = angular.copy(option[pkey]);
            });
        } else {
            querys['default'] = option;
        }

        Object.keys(querys).forEach(function (pkey) {
            output = filter(output.length > 0 ? output : items, querys[pkey], pkey);
        });

        return output || items;
    };
}]);


/* global angular */
(function () {
    'use strict';

    function PlgEditFabSpeedDial() {

        return {
            'restrict'    : 'E',
            'controller'  : 'PlgEditFabSpeedDialController',
            'templateUrl' : 'myComponentSample.html',
            'replace'     : true,
            'link' : function (scope) {
                scope.tagline = 'it Works!';
            }
        };

    }

    angular.module('plingUi').directive('plgEditFabSpeedDial', PlgEditFabSpeedDial);
}());

(function () {

    angular.module('plingUi').component('plgElasticSearch', {
        'bindings'  : {},
        'controller' : PlgElasticSearchCtrl,
        'templateUrl' : 'plgElasticSearch.html'
    });

    PlgElasticSearchCtrl.$inject = ['$q', 'plgElasticSearchService'];

    function PlgElasticSearchCtrl($q, plgElasticSearchService) {
        var ctrl = this, onTypingEnd;

        ctrl.selectedItemChange = plgElasticSearchService.onSelectedItemChange;
        ctrl.getDocumentName    = plgElasticSearchService.getRefName;
        ctrl.items              = plgElasticSearchService.items;
        ctrl.getFields          = plgElasticSearchService.getFields;

        ctrl.querySearch        = function (term) {
            var deferrer = $q.defer();

            window.clearTimeout(onTypingEnd);

            if (term.length > 2) {
                onTypingEnd = setTimeout(function() {
                    plgElasticSearchService.querySearch(term, deferrer);
                }, 500);

                return deferrer.promise;
            }

            deferrer.reject();
            return [];
        };
    }
}());

(function () {
    'use strict';

    angular.module('plingUi').service('plgElasticSearchService', plgElasticSearchService);

    plgElasticSearchService.$inject = ['$q', 'elasticSearchApiService'];

    function plgElasticSearchService($q, elasticSearchApiService) {
        var API = {}, cb = angular.noop, self = this;

        this.getRefName           = getRefName;
        this.getFields            = getFields;
        this.configSearch         = configSearch;
        this.onSelectedItemChange = onSelectedItemChange;
        this.querySearch          = querySearch;
        this.items                = [];

        /**
         * Get the prop name of object from elasticsearch that need to show to the client
         * @returns {String} Attribute name
         */
        function getRefName() {
            return API ? API.refName : 'name';
        }

        /**
         * Get fields for search
         * @returns {Object[]} Fields for search
         */
        function getFields() {
            return API ? API.optionsFields : false;
        }

        /**
         * Config how search need to be
         * @param {Object} api { index, entity, refName, source?, additionalQuery?, size?, optionsFields? }
         * @param {Function} callback callback
         * @returns {undefined} just ignore that
         */
        function configSearch(api, callback) {
            cb = callback || angular.noop;
            if (!validate(api)) {
                return cb(new Error('configSearch api não está completa'));
            }
            API = api;
        }

        /**
         * handle on user selected a item
         * @param {Object} item ElasticSearch document
         */
        function onSelectedItemChange(item) {
            cb(null, angular.copy(item && item.length === 1 ? item[0] : item));
        }

        /**
         * get items from elasticSearchApiService
         * @param {String} term User text
         * @param {Promise} deferrer $q.defer() Promise
         * @returns {Promise} promise
         */
        function querySearch(term, deferrer) {
            deferrer = deferrer || $q.defer();

            elasticSearchApiService.suggest(API.index, API.entity, term, API.source, API.additionalQuery, API.size, function (err, data) {
                if (!err) {
                    cloneArray(self.items, data);
                    deferrer.resolve(data);
                } else {
                    deferrer.reject(err);
                }
            });
            return deferrer.promise;
        }


        function validate(api) {
            return api && api.index && api.entity && api.refName;
        }

        function cloneArray(a, b) {
            var i;

            a.length = 0;
            for (i = 0; i < b.length; i++) {
                a.push(b[i]);
            }
        }
    }
}());

/* global angular, console, document, $  */
(function () {
    'use strict';

    // creating directive
    function PlgFormCard($log, $compile, $location, $rootScope) {
        return {
            'restrict': 'E',
            'scope': {
                'params': '=',
                'module': '=',
                'dynamicForm': '=',
                'filterDefault': '=',
                'chkList': '=',
                'options': '='
            },
            'replace': true,

            // linking directive
            'link': function (scope, element) {

                var builder, compiledElm;

                // validating bind value
                if (scope.params) {
                    builder = {
                        'buildTemplate': function (scope, cb) {
                            var template;


                            scope.editView      = this.editView;
                            scope.toggle        = this.toggle;
                            scope.exists        = this.exists;


                            // Display "show / hide" buttons actions, ex: Inativar, Excluir... (Click "checkall" checkbox)
                            // And md-select "select none, select all"
                            // ----- IMPORTANT! We can't clear scope.chkList with new array -----
                            scope.$on('checkedAllItens', function (event, arg) {
                                angular.noop(event);

                                if (arg) {
                                    scope.params.forEach(function (i) {
                                        if (scope.chkList.filter(function (s) { return s._id === i._id; }).length <= 0) {
                                            scope.chkList.push(i);
                                        }
                                    });
                                } else {
                                    scope.chkList.length = 0;
                                }
                            });

                            // Reset value default "limit" Infinity Scroll
                            // Reset to "page = 1"
                            scope.$on('resetViewsItems', function (event, arg) {
                                angular.noop(event);
                                if (arg && scope.params.length > 0) {
                                    scope.params.splice(scope.options.limit, scope.params.length);
                                    scope.options.page = 1;
                                }
                            });

                            template =  '<div class="gapiCard md-whiteframe-1dp" ng-class="obj.category_name" flex="20" ng-repeat="obj in params | filterDynamic:options.filter">' +
                                        '   <div class="divCheckbox">' +
                                        '       <md-checkbox aria-label="checkbox" ng-checked="exists(obj, chkList)" ng-click="toggle(obj, chkList)"></md-checkbox>' +
                                        '   </div>' +

                                        '   <div class="divText">' +
                                        '       <plg-group-filters' +
                                        '               type="single"' +
                                        '               params="obj"' +
                                        '               service-module="module"' +
                                        '               dynamic-form="dynamicForm"' +
                                        '               filter-default="filterDefault">' +
                                        '       </plg-group-filters>' +
                                        '   </div>' +

                                        '   <div style="cursor: pointer" ng-click="editView(module.module, obj._id)">' +
                                        '      <div class="cardIdentity"></div>' +
                                        '      <div class="cardContent">' +


                                        '          <p ng-repeat="item in dynamicForm.isListCollumn" ng-click="editView(module.module, obj._id)" style="outline: 0">' +

                                        '              <plg-form-fields' +
                                        '                      fields="obj[item.ref]"' +
                                        '                      type-field="item"' +
                                        '                      origin="cards"' +
                                        '              </plg-form-fields>' +

                                        '          </p>' +


                                        '      </div>' +
                                        '   </div>' +
                                        '   <div class="clear"></div>' +
                                        '</div>';


                            // returning information
                            cb(null, template);
                        },

                        // Display "show / hide" buttons actions, ex: Inativar, Excluir... (Click only checkbox)
                        'toggle': function (item, chkList) {
                            var idx = chkList.indexOf(item);

                            if (idx > -1) {
                                chkList.splice(idx, 1);
                            } else {
                                chkList.push(item);
                            }
                        },

                        'exists': function (item, chkList) {
                            $rootScope.$emit('enableAllActions', chkList);
                            return chkList.indexOf(item) > -1;
                        },

                        'editView' : function (path, id) {
                            $location.path(path + '/' + id);
                        }

                    };

                    // defining template
                    builder.buildTemplate(scope, function (err, template) {

                        // handling error
                        if (err) {
                            $log.warn(err);
                            return;
                        }

                        // compiling template
                        compiledElm = $compile(template)(scope);

                        // handling post compile hooks
                        if (builder.postCompile) {
                            builder.postCompile(compiledElm);
                        }

                        // replacing into DOM
                        element.replaceWith(compiledElm);

                    });
                }
            }
        };
    }

    // injecting dependencies
    PlgFormCard.$inject = ['$log', '$compile', '$location', '$rootScope'];

    // registering into angular
    angular.module('plingUi').directive('plgFormCard', PlgFormCard);
}());

/* global angular, console, document, $, window */
(function () {
    'use strict';

    // creating directive
    function PlgFormFields($log, $compile, $sce, $localstorage, core) {
        return {
            'restrict': 'E',
            'scope': {
                'fields': '=',
                'typeField': '=',
                'origin': '@origin'
            },
            'replace': true,

            // linking directive
            'link': function (scope, element) {

                var builder, compiledElm;

                // validating bind value
                builder = {
                    'buildTemplate': function (scope, cb) {
                        var template,
                            customer_id;

                        scope.originField = scope.origin === 'listing' ? 'listingFields' : 'cardsFields';

                        if (scope.typeField.type === 'img') {

                            // ----------------------- Get image in DRIVE not Parse BASE 64
                            if (scope.typeField.isDriveParseBase64 && scope.fields) {
                                if (scope.fields !== '/assets/img/ic_person_black_48dp_2x.png') {

                                    // customer_id mantido, pois o viewer no drive não possuí auth do token... neste caso o mesmo eh passado por param
                                    customer_id    = JSON.parse(window.localStorage['PLING-USER']).customer_id;

                                    scope.imgUrl = core.getAppCoreUrl('drive', 'viewer/' + customer_id + '/' + scope.fields);
                                    template     = '<div><img class="{{originField}}" ng-src="{{imgUrl}}" err-src="/assets/img/ic_person_black_48dp_2x.png" /></div>';
                                } else {
                                    template = '<div><img class="{{originField}}" ng-src="{{fields}}"/></div>';
                                }
                            }

                        } else if (scope.typeField.type === 'date') {
                            template = '<div style="padding: 25px 0;" flex="100">{{ fields | date: \'dd/MM/yyyy\' }}</div>';
                        } else if (scope.typeField.type === 'number') {
                            template = '<div style="padding: 25px 0;" flex="100">{{ fields | number: 2 }}</div>';
                        } else if (scope.origin === 'listing') {
                            template = '<div style="padding: 25px 0;" flex="100">{{fields}}</div>';
                        } else {
                            template = '<div>{{fields}}</div>';
                        }


                        cb(null, template);
                    }

                };

                // defining template
                builder.buildTemplate(scope, function (err, template) {

                    // handling error
                    if (err) {
                        $log.warn(err);
                        return;
                    }

                    // compiling template
                    compiledElm = $compile(template)(scope);

                    // handling post compile hooks
                    if (builder.postCompile) {
                        builder.postCompile(compiledElm);
                    }

                    // replacing into DOM
                    element.replaceWith(compiledElm);

                });
            }
        };
    }

    // injecting dependencies
    PlgFormFields.$inject = ['$log', '$compile', '$sce', '$localstorage', 'coreApiService'];

    // registering into angular
    angular.module('plingUi').directive('plgFormFields', PlgFormFields);
}());

/* global angular, console, document, $, window */
(function () {
    'use strict';

    // creating directive
    function PlgFormList($log, $compile, $location) {
        return {
            'restrict': 'E',
            'transclude': true,
            'scope': {
                'params': '=',
                'module': '=',
                'dynamicForm': '=',
                'filterDefault': '=',
                'chkList': '=',
                'byEvent': '=',
                'objPk': '@',
                'dynamicTemplate': '=',
                'class': '@',
                'disableCellView': '=',
                'disableCellExpand' : '=',
                'callbacks': '=',
                'options': '='
            },
            'replace': true,

            // linking directive
            'link': function (scope, element, attrs, ctrl, transclude) {

                var builder, compiledElm;

                // validating bind value
                if (scope.params) {

                    scope.objPk = scope.objPk || '_id';

                    builder = {
                        'buildTemplate': function (scope, cb) {
                            var template;


                            scope.editListSelect    = this.editListSelect;
                            scope.toggle            = this.toggle;
                            scope.exists            = this.exists;


                            // Display "show / hide" buttons actions, ex: Inativar, Excluir... (Click "checkall" checkbox)
                            // And md-select "select none, select all"
                            // ----- IMPORTANT! We can't clear scope.chkList with new array -----
                            scope.$on('checkedAllItens', function (event, arg) {
                                angular.noop(event);

                                if (arg) {
                                    scope.params.forEach(function (i) {
                                        if (scope.chkList.filter(function (s) { return s[scope.objPk] === i[scope.objPk]; }).length <= 0) {
                                            scope.chkList.push(i);
                                        }
                                    });
                                } else {
                                    scope.chkList.length = 0;
                                }
                            });

                            // Reset value default "limit" Infinity Scroll
                            // Reset to "page = 1"
                            scope.$on('resetViewsItems', function (event, arg) {
                                angular.noop(event);
                                if (arg && scope.params.length > 0) {
                                    if (scope.options.limit) {
                                        scope.params.splice(scope.options.limit, scope.params.length);
                                    }
                                    scope.options.page = 1;
                                }
                            });

                            template =  '<div class="toolbarListingHeader" ng-class="class" flex="100">' +
                                        '   <md-list-item class="md-2-line plg-list-header" style="min-height: 60px !important">' +
                                        '       <div class="items" style="min-width: 63px !important;">&nbsp;</div>' +
                                        '       <div class="items listContainer" flex="100" layout="column" ng-repeat="header in dynamicForm.isListCollumn">' +
                                        '           <font color="#777777"><strong><small>{{ header.label }}</small></strong></font>' +
                                        '       </div>' +
                                        '       <div class="items" style="min-width: 53px !important;">&nbsp;</div>' +
                                        '       <div class="items" style="min-width: 53px !important;">&nbsp;</div>' +
                                        '   </md-list-item>' +
                                        '   <md-divider></md-divider>' +
                                        '</div>' +

                                        '<div ng-repeat="obj in params | filterDynamic:options.filter" ng-hide="hideViewRegister" flex="100" class="md-list-div" ng-class="{\'margin-whiteframe-remove\': !obj.whiteframe, \'md-whiteframe-z3\': obj.whiteframe, \'margin-whiteframe\': obj.whiteframe}" >' +

                                        '   <md-list-item class="md-2-line" aria-label="row">' +

                                        '       <div class="md-primary gapiListCheck" style="margin-top: 65px;">' +
                                        '           <div class="md-list-checkbox" >' +
                                        '               <md-checkbox aria-label="checkbox" ng-checked="exists(obj, chkList)" ng-click="toggle(obj, chkList)"></md-checkbox>' +
                                        '           </div>' +
                                        '       </div>' +
                                        '       <div class="listContainer" flex="100" layout="column" ng-click="editListSelect(module ? module.module : {}, obj[objPk])" ng-repeat="item in dynamicForm.isListCollumn">' +
                                        '           <small>' +

                                        '               <plg-form-fields' +
                                        '                       fields="obj[item.ref]"' +
                                        '                       type-field="item"' +
                                        '                       origin="listing"' +
                                        '               </plg-form-fields>' +

                                        '           </small>' +
                                        '       </div>' +
                                                (scope.disableCellExpand ? ''
                                       :'       <div style="margin-top: 15px;">' +
                                        '           <plg-change-icon-view' +
                                        '                   obj="obj"' +
                                        '                   service-module="module">' +
                                        '           </plg-change-icon-view>' +
                                        '       </div>') +
                                                (!scope.module ? ''
                                        :'       <div class="md-primary gapiListCheck" style="margin-top: 15px;">' +

                                        '           <plg-group-filters' +
                                        '                   type="single"' +
                                        '                   params="obj"' +
                                        '                   service-module="module"' +
                                        '                   filter-default="filterDefault" by-event="byEvent">' +
                                        '           </plg-group-filters>' +

                                        '       </div>') +
                                        '   </md-list-item>' +
                                        '   <md-divider style="border: 1px solid #eeeeee"></md-divider>' +
                                        '   <md-list-item class="md-list-all-content" layout="row" layout-wrap ng-if="obj.whiteframe" style="margin: 0px !important;">' +

                                            (scope.dynamicTemplate ? '<DYNAMIC_TEMPLATE/>' : '<plg-list-view params="obj" dynamic-form="dynamicForm"></plg-list-view>') +

                                        '   </md-list-item>' +
                                        '</div>';

                            if (scope.dynamicTemplate) {
                                transclude(scope, function(clone) {
                                    template = template.replace('<DYNAMIC_TEMPLATE/>', clone[1].data);
                                });
                            }

                            cb(null, template);
                        },

                        // Display "show / hide" buttons actions, ex: Inativar, Excluir... (Click only checkbox)
                        'toggle': function (item, chkList) {
                            var idx = chkList.indexOf(item);

                            if (idx > -1) {
                                chkList.splice(idx, 1);
                            } else {
                                chkList.push(item);
                            }
                        },

                        // Set the array within the scope of the controller
                        'exists': function (item, chkList) {
                            return chkList.indexOf(item) > -1;
                        },

                        // redirect to Edit
                        'editListSelect' : function (path, id) {
                            if (!scope.disableCellView) {
                                $location.path(path + '/' + id);
                            }
                        }

                    };

                    // defining template
                    builder.buildTemplate(scope, function (err, template) {

                        scope.chkList.length = 0;

                        // handling error
                        if (err) {
                            $log.warn(err);
                            return;
                        }

                        // compiling template
                        compiledElm = $compile(template)(scope);

                        // handling post compile hooks
                        if (builder.postCompile) {
                            builder.postCompile(compiledElm);
                        }

                        // replacing into DOM
                        element.replaceWith(compiledElm);

                    });
                }
            }
        };
    }

    // injecting dependencies
    PlgFormList.$inject = ['$log', '$compile', '$location'];

    // registering into angular
    angular.module('plingUi').directive('plgFormList', PlgFormList);
}());

/* global angular, console, document, $, window */
(function () {
    'use strict';

    // creating directive
    function PlgGroupFilters($rootScope, $log, $compile, $http, core) {
        return {
            'restrict': 'E',
            'scope': {
                'params': '=',
                'serviceModule': '=',
                'filterDefault': '=',
                'viewItems': '=',
                'byEvent': '=',
                'type': '@type'
            },
            'replace': true,

            // linking directive
            'link': function (scope, element) {

                var builder, compiledElm;

                // validating bind value
                if (scope.type) {
                    builder = {
                        'buildTemplate': function (scope, cb) {
                            var template;


                            if (scope.type === 'single') {

                                scope.actionsList       = this.actionsList;

                                scope.coremodulename    = scope.serviceModule.coremodulename;
                                scope.resultViewItems   = builder.action(scope.filterDefault.action, scope.serviceModule.viewItems);

                                template =  '<md-menu md-offset="-22 20" md-position-mode="target-right target">' +
                                            '    <md-button aria-label="" class="md-icon-button plgGroupFiltersSingle" ng-click="$mdOpenMenu($event);" md-prevent-menu-close="md-prevent-menu-close">' +
                                            '        <md-tooltip>Ações</md-tooltip>' +
                                            '        <md-icon>more_vert</md-icon>' +
                                            '    </md-button>' +
                                            '    <md-menu-content layout="column" layout-wrap width="3">' +
                                            '       <div ng-repeat="(key, value) in resultViewItems | groupBy: \'group\'">' +
                                            '           <md-menu-item flex class="filterDataTableItem">' +
                                            '               <p><font color="#959595" size="2">{{key}}</font></p>' +
                                            '           </md-menu-item>' +
                                            '           <md-menu-item flex ng-repeat="item in value" class="filterDataTableItem">' +
                                            '               <md-button ng-click="actionsList(params, \'Registro\', item, coremodulename)">' +
                                            '                   <md-icon md-svg-src="{{item.moduleIcon}}" class="plGroupFiltersButton"></md-icon>' +
                                            '                   <font color="#505050" size="2">{{item.name}}</font>' +
                                            '               </md-button>' +
                                            '           </md-menu-item>' +
                                            '       </div>' +
                                            '    </md-menu-content>' +
                                            '</md-menu>';

                            } else if (scope.type === 'bulk') {


                                scope.allActionsBulk = this.allActionsBulk;


                                template =  '<md-menu md-offset="-22 20" md-position-mode="target-right target">' +
                                            '    <md-button aria-label="" class="md-icon-button plgGroupFiltersBulk" ng-click="$mdOpenMenu($event);" md-prevent-menu-close="md-prevent-menu-close">' +
                                            '        <md-tooltip>Ações</md-tooltip>' +
                                            '        <md-icon style="color: #ffffff">more_vert</md-icon>' +
                                            '    </md-button>' +
                                            '    <md-menu-content layout="column" layout-wrap width="3">' +
                                            '       <div ng-repeat="(key, value) in viewItems | groupBy: \'group\'">' +
                                            '           <md-menu-item flex class="filterDataTableItem">' +
                                            '               <p><font color="#959595" size="2">{{key}}</font></p>' +
                                            '           </md-menu-item>' +
                                            '           <md-menu-item flex ng-repeat="item in value" class="filterDataTableItem">' +
                                            '               <md-button ng-click="allActionsBulk(item)" aria-label="none">' +
                                            '                   <md-icon md-svg-src="{{item.moduleIcon}}" class="plGroupFiltersButton"></md-icon>' +
                                            '                   <font color="#505050" size="2">{{item.name}}</font>' +
                                            '               </md-button>' +
                                            '           </md-menu-item>' +
                                            '       </div>' +
                                            '    </md-menu-content>' +
                                            '</md-menu>';

                            }

                            cb(null, template);
                        },

                        'actionsList': function (param, label, item, coremodulename) {
                            var payload = {},
                                getParam;

                            if (scope.byEvent) {
                                $rootScope.$emit('allActionsList', item, param, coremodulename);
                            } else {

                                /* jslint nomen:true*/
                                getParam                = param._id;

                                /* jslint nomen:false*/
                                payload[item.method]    = item.action;

                                $http.patch(core.getAppCoreUrl('integra', coremodulename + '/' + getParam), payload)
                                    .success(function (data) {
                                        if (data) {
                                            $rootScope.$emit('saveRecordSuccess', label + ' ' + item.msg + ' com sucesso.');
                                            $rootScope.$emit('research', [param], item.method, item.action);
                                        } else {
                                            $rootScope.$emit('recordError', 'Ocorreu um erro ao ' + item.msg + ' ' + coremodulename);
                                        }
                                    });
                            }
                        },

                        'allActionsBulk': function (item) {
                            $rootScope.$emit('allActionsBulk', item);
                        },

                        'action': function (action, viewItems) {
                            var i,
                                j,
                                viewItemsFilter   = [];

                            for (i = 0; i < viewItems.length; i += 1)
                                for (j = 0; j < viewItems[i].type.length; j += 1)
                                    if (viewItems[i].type[j].itens === action)
                                        viewItemsFilter.push(viewItems[i]);

                            return viewItemsFilter;
                        }
                    };

                    // defining template
                    builder.buildTemplate(scope, function (err, template) {

                        // handling error
                        if (err) {
                            $log.warn(err);
                            return;
                        }

                        // compiling template
                        compiledElm = $compile(template)(scope);

                        // handling post compile hooks
                        if (builder.postCompile) {
                            builder.postCompile(compiledElm);
                        }

                        // replacing into DOM
                        element.replaceWith(compiledElm);

                    });
                }
            }
        };
    }

    // injecting dependencies
    PlgGroupFilters.$inject = ['$rootScope', '$log', '$compile', '$http', 'coreApiService'];

    // registering into angular
    angular.module('plingUi').directive('plgGroupFilters', PlgGroupFilters);
}());

/*
 * ngImgCrop v0.3.2
 * https://github.com/alexk111/ngImgCrop
 *
 * Copyright (c) 2014 Alex Kaul
 * License: MIT
 *
 * Generated at Wednesday, December 3rd, 2014, 3:54:12 PM
 */
(function() {
    'use strict';

    var crop = angular.module('plingUi');

    crop.factory('cropAreaCircle', ['cropArea', function(CropArea) {
        var CropAreaCircle = function() {
            CropArea.apply(this, arguments);

            this._boxResizeBaseSize = 20;
            this._boxResizeNormalRatio = 0.9;
            this._boxResizeHoverRatio = 1.2;
            this._iconMoveNormalRatio = 0.9;
            this._iconMoveHoverRatio = 1.2;

            this._boxResizeNormalSize = this._boxResizeBaseSize*this._boxResizeNormalRatio;
            this._boxResizeHoverSize = this._boxResizeBaseSize*this._boxResizeHoverRatio;

            this._posDragStartX=0;
            this._posDragStartY=0;
            this._posResizeStartX=0;
            this._posResizeStartY=0;
            this._posResizeStartSize=0;

            this._boxResizeIsHover = false;
            this._areaIsHover = false;
            this._boxResizeIsDragging = false;
            this._areaIsDragging = false;
        };

        CropAreaCircle.prototype = new CropArea();

        CropAreaCircle.prototype._calcCirclePerimeterCoords=function(angleDegrees) {
            var hSize=this._size/2;
            var angleRadians = angleDegrees * (Math.PI / 180),
                circlePerimeterX = this._x + hSize * Math.cos(angleRadians),
                circlePerimeterY = this._y + hSize * Math.sin(angleRadians);

            return [circlePerimeterX, circlePerimeterY];
        };

        CropAreaCircle.prototype._calcResizeIconCenterCoords=function() {
            return this._calcCirclePerimeterCoords(-45);
        };

        CropAreaCircle.prototype._isCoordWithinArea=function(coord) {
            return Math.sqrt((coord[0]-this._x)*(coord[0]-this._x) + (coord[1]-this._y)*(coord[1]-this._y)) < this._size/2;
        };
        CropAreaCircle.prototype._isCoordWithinBoxResize=function(coord) {
            var resizeIconCenterCoords=this._calcResizeIconCenterCoords();
            var hSize=this._boxResizeHoverSize/2;

            return coord[0] > resizeIconCenterCoords[0] - hSize && coord[0] < resizeIconCenterCoords[0] + hSize &&
                   coord[1] > resizeIconCenterCoords[1] - hSize && coord[1] < resizeIconCenterCoords[1] + hSize;
        };

        CropAreaCircle.prototype._drawArea=function(ctx, centerCoords, size) {
            ctx.arc(centerCoords[0], centerCoords[1], size/2, 0, 2 * Math.PI);
        };

        CropAreaCircle.prototype.draw=function() {
            CropArea.prototype.draw.apply(this, arguments);

            // draw move icon
            this._cropCanvas.drawIconMove([this._x, this._y], this._areaIsHover?this._iconMoveHoverRatio:this._iconMoveNormalRatio);

            // draw resize cubes
            this._cropCanvas.drawIconResizeBoxNESW(this._calcResizeIconCenterCoords(), this._boxResizeBaseSize, this._boxResizeIsHover?this._boxResizeHoverRatio:this._boxResizeNormalRatio);
        };

        CropAreaCircle.prototype.processMouseMove=function(mouseCurX, mouseCurY) {
            var cursor='default', iFR, iFX, iFY;
            var res=false;

            this._boxResizeIsHover = false;
            this._areaIsHover = false;

            if (this._areaIsDragging) {
                this._x = mouseCurX - this._posDragStartX;
                this._y = mouseCurY - this._posDragStartY;
                this._areaIsHover = true;
                cursor='move';
                res=true;
                this._events.trigger('area-move');
            } else if (this._boxResizeIsDragging) {
                cursor = 'nesw-resize';
                iFX = mouseCurX - this._posResizeStartX;
                iFY = this._posResizeStartY - mouseCurY;
                if (iFX > iFY) {
                    iFR = this._posResizeStartSize + iFY*2;
                } else {
                    iFR = this._posResizeStartSize + iFX*2;
                }

                this._size = Math.max(this._minSize, iFR);
                this._boxResizeIsHover = true;
                res=true;
                this._events.trigger('area-resize');
            } else if (this._isCoordWithinBoxResize([mouseCurX, mouseCurY])) {
                cursor = 'nesw-resize';
                this._areaIsHover = false;
                this._boxResizeIsHover = true;
                res=true;
            } else if (this._isCoordWithinArea([mouseCurX, mouseCurY])) {
                cursor = 'move';
                this._areaIsHover = true;
                res=true;
            }

            this._dontDragOutside();
            angular.element(this._ctx.canvas).css({'cursor': cursor});

            return res;
        };

        CropAreaCircle.prototype.processMouseDown=function(mouseDownX, mouseDownY) {
            if (this._isCoordWithinBoxResize([mouseDownX, mouseDownY])) {
                this._areaIsDragging = false;
                this._areaIsHover = false;
                this._boxResizeIsDragging = true;
                this._boxResizeIsHover = true;
                this._posResizeStartX=mouseDownX;
                this._posResizeStartY=mouseDownY;
                this._posResizeStartSize = this._size;
                this._events.trigger('area-resize-start');
            } else if (this._isCoordWithinArea([mouseDownX, mouseDownY])) {
                this._areaIsDragging = true;
                this._areaIsHover = true;
                this._boxResizeIsDragging = false;
                this._boxResizeIsHover = false;
                this._posDragStartX = mouseDownX - this._x;
                this._posDragStartY = mouseDownY - this._y;
                this._events.trigger('area-move-start');
            }
        };

        CropAreaCircle.prototype.processMouseUp = function(/* eslint-disable-line no-console. mouseUpX, mouseUpY */) {
            if (this._areaIsDragging) {
                this._areaIsDragging = false;
                this._events.trigger('area-move-end');
            }
            if (this._boxResizeIsDragging) {
                this._boxResizeIsDragging = false;
                this._events.trigger('area-resize-end');
            }
            this._areaIsHover = false;
            this._boxResizeIsHover = false;

            this._posDragStartX = 0;
            this._posDragStartY = 0;
        };

        return CropAreaCircle;
    }]);

    crop.factory('cropAreaSquare', ['cropArea', function(CropArea) {
        var CropAreaSquare = function() {
            CropArea.apply(this, arguments);

            this._resizeCtrlBaseRadius = 10;
            this._resizeCtrlNormalRatio = 0.75;
            this._resizeCtrlHoverRatio = 1;
            this._iconMoveNormalRatio = 0.9;
            this._iconMoveHoverRatio = 1.2;

            this._resizeCtrlNormalRadius = this._resizeCtrlBaseRadius*this._resizeCtrlNormalRatio;
            this._resizeCtrlHoverRadius = this._resizeCtrlBaseRadius*this._resizeCtrlHoverRatio;

            this._posDragStartX=0;
            this._posDragStartY=0;
            this._posResizeStartX=0;
            this._posResizeStartY=0;
            this._posResizeStartSize=0;

            this._resizeCtrlIsHover = -1;
            this._areaIsHover = false;
            this._resizeCtrlIsDragging = -1;
            this._areaIsDragging = false;
        };

        CropAreaSquare.prototype = new CropArea();

        CropAreaSquare.prototype._calcSquareCorners=function() {
            var hSize=this._size/2;

            return [
              [this._x-hSize, this._y-hSize],
              [this._x+hSize, this._y-hSize],
              [this._x-hSize, this._y+hSize],
              [this._x+hSize, this._y+hSize]
            ];
        };

        CropAreaSquare.prototype._calcSquareDimensions=function() {
            var hSize=this._size/2;

            return {
                'left': this._x-hSize,
                'top': this._y-hSize,
                'right': this._x+hSize,
                'bottom': this._y+hSize
            };
        };

        CropAreaSquare.prototype._isCoordWithinArea=function(coord) {
            var squareDimensions=this._calcSquareDimensions();

            return coord[0]>=squareDimensions.left&&coord[0]<=squareDimensions.right&&coord[1]>=squareDimensions.top&&coord[1]<=squareDimensions.bottom;
        };

        CropAreaSquare.prototype._isCoordWithinResizeCtrl=function(coord) {
            var resizeIconsCenterCoords=this._calcSquareCorners();
            var res=-1, i, len, resizeIconCenterCoords;

            for (i=0, len = resizeIconsCenterCoords.length; i < len; i++) {
                resizeIconCenterCoords = resizeIconsCenterCoords[i];
                if (coord[0] > resizeIconCenterCoords[0] - this._resizeCtrlHoverRadius && coord[0] < resizeIconCenterCoords[0] + this._resizeCtrlHoverRadius &&
                 coord[1] > resizeIconCenterCoords[1] - this._resizeCtrlHoverRadius && coord[1] < resizeIconCenterCoords[1] + this._resizeCtrlHoverRadius) {
                    res=i;
                    break;
                }
            }
            return res;
        };

        CropAreaSquare.prototype._drawArea=function(ctx, centerCoords, size) {
            var hSize=size/2;

            ctx.rect(centerCoords[0]-hSize, centerCoords[1]-hSize, size, size);
        };

        CropAreaSquare.prototype.draw=function() {
            var resizeIconsCenterCoords, i, len, resizeIconCenterCoords;

            CropArea.prototype.draw.apply(this, arguments);
            // draw move icon
            this._cropCanvas.drawIconMove([this._x, this._y], this._areaIsHover?this._iconMoveHoverRatio:this._iconMoveNormalRatio);

            // draw resize cubes
            resizeIconsCenterCoords = this._calcSquareCorners();
            for (i = 0, len = resizeIconsCenterCoords.length; i < len; i++) {
                resizeIconCenterCoords=resizeIconsCenterCoords[i];
                this._cropCanvas.drawIconResizeCircle(resizeIconCenterCoords, this._resizeCtrlBaseRadius, this._resizeCtrlIsHover===i?this._resizeCtrlHoverRatio:this._resizeCtrlNormalRatio);
            }
        };

        CropAreaSquare.prototype.processMouseMove=function(mouseCurX, mouseCurY) {
            var cursor='default', xMulti, yMulti, iFX, iFY, iFR, wasSize, posModifier, hoveredResizeBox, res = false;

            this._resizeCtrlIsHover = -1;
            this._areaIsHover = false;

            if (this._areaIsDragging) {
                this._x = mouseCurX - this._posDragStartX;
                this._y = mouseCurY - this._posDragStartY;
                this._areaIsHover = true;
                cursor='move';
                res=true;
                this._events.trigger('area-move');
            } else if (this._resizeCtrlIsDragging>-1) {
                switch (this._resizeCtrlIsDragging) {
                case 0: // eslint-disable-line no-console. Top Left
                    xMulti=-1;
                    yMulti=-1;
                    cursor = 'nwse-resize';
                    break;
                case 1: // eslint-disable-line no-console. Top Right
                    xMulti=1;
                    yMulti=-1;
                    cursor = 'nesw-resize';
                    break;
                case 2: // eslint-disable-line no-console. Bottom Left
                    xMulti=-1;
                    yMulti=1;
                    cursor = 'nesw-resize';
                    break;
                case 3: // eslint-disable-line no-console. Bottom Right
                    xMulti=1;
                    yMulti=1;
                    cursor = 'nwse-resize';
                    break;
                }
                iFX = (mouseCurX - this._posResizeStartX)*xMulti;
                iFY = (mouseCurY - this._posResizeStartY)*yMulti;
                if (iFX>iFY) {
                    iFR = this._posResizeStartSize + iFY;
                } else {
                    iFR = this._posResizeStartSize + iFX;
                }
                wasSize=this._size;
                this._size = Math.max(this._minSize, iFR);
                posModifier=(this._size-wasSize)/2;
                this._x+=posModifier*xMulti;
                this._y+=posModifier*yMulti;
                this._resizeCtrlIsHover = this._resizeCtrlIsDragging;
                res=true;
                this._events.trigger('area-resize');
            } else {
                hoveredResizeBox=this._isCoordWithinResizeCtrl([mouseCurX, mouseCurY]);
                if (hoveredResizeBox>-1) {
                    switch (hoveredResizeBox) {
                    case 0:
                        cursor = 'nwse-resize';
                        break;
                    case 1:
                        cursor = 'nesw-resize';
                        break;
                    case 2:
                        cursor = 'nesw-resize';
                        break;
                    case 3:
                        cursor = 'nwse-resize';
                        break;
                    }
                    this._areaIsHover = false;
                    this._resizeCtrlIsHover = hoveredResizeBox;
                    res=true;
                } else if (this._isCoordWithinArea([mouseCurX, mouseCurY])) {
                    cursor = 'move';
                    this._areaIsHover = true;
                    res=true;
                }
            }

            this._dontDragOutside();
            angular.element(this._ctx.canvas).css({'cursor': cursor});

            return res;
        };

        CropAreaSquare.prototype.processMouseDown=function(mouseDownX, mouseDownY) {
            var isWithinResizeCtrl=this._isCoordWithinResizeCtrl([mouseDownX, mouseDownY]);

            if (isWithinResizeCtrl>-1) {
                this._areaIsDragging = false;
                this._areaIsHover = false;
                this._resizeCtrlIsDragging = isWithinResizeCtrl;
                this._resizeCtrlIsHover = isWithinResizeCtrl;
                this._posResizeStartX=mouseDownX;
                this._posResizeStartY=mouseDownY;
                this._posResizeStartSize = this._size;
                this._events.trigger('area-resize-start');
            } else if (this._isCoordWithinArea([mouseDownX, mouseDownY])) {
                this._areaIsDragging = true;
                this._areaIsHover = true;
                this._resizeCtrlIsDragging = -1;
                this._resizeCtrlIsHover = -1;
                this._posDragStartX = mouseDownX - this._x;
                this._posDragStartY = mouseDownY - this._y;
                this._events.trigger('area-move-start');
            }
        };

        CropAreaSquare.prototype.processMouseUp=function(/* eslint-disable-line no-console. mouseUpX, mouseUpY */) {
            if (this._areaIsDragging) {
                this._areaIsDragging = false;
                this._events.trigger('area-move-end');
            }
            if (this._resizeCtrlIsDragging>-1) {
                this._resizeCtrlIsDragging = -1;
                this._events.trigger('area-resize-end');
            }
            this._areaIsHover = false;
            this._resizeCtrlIsHover = -1;

            this._posDragStartX = 0;
            this._posDragStartY = 0;
        };

        return CropAreaSquare;
    }]);

    crop.factory('cropArea', ['cropCanvas', function(CropCanvas) {

        /* global Image */
        var CropArea = function(ctx, events) {
            this._ctx=ctx;
            this._events=events;

            this._minSize=80;

            this._cropCanvas=new CropCanvas(ctx);

            this._image = new Image();
            this._x = 0;
            this._y = 0;
            this._size = 200;
        };

  /* GETTERS/SETTERS */

        CropArea.prototype.getImage = function () {
            return this._image;
        };
        CropArea.prototype.setImage = function (image) {
            this._image = image;
        };

        CropArea.prototype.getX = function () {
            return this._x;
        };
        CropArea.prototype.setX = function (x) {
            this._x = x;
            this._dontDragOutside();
        };

        CropArea.prototype.getY = function () {
            return this._y;
        };
        CropArea.prototype.setY = function (y) {
            this._y = y;
            this._dontDragOutside();
        };

        CropArea.prototype.getSize = function () {
            return this._size;
        };
        CropArea.prototype.setSize = function (size) {
            this._size = Math.max(this._minSize, size);
            this._dontDragOutside();
        };

        CropArea.prototype.getMinSize = function () {
            return this._minSize;
        };
        CropArea.prototype.setMinSize = function (size) {
            this._minSize = size;
            this._size = Math.max(this._minSize, this._size);
            this._dontDragOutside();
        };

        /* FUNCTIONS */
        CropArea.prototype._dontDragOutside=function() {
            var h=this._ctx.canvas.height,
                w=this._ctx.canvas.width;

            if (this._size>w) { this._size=w; }
            if (this._size>h) { this._size=h; }
            if (this._x<this._size/2) { this._x=this._size/2; }
            if (this._x>w-this._size/2) { this._x=w-this._size/2; }
            if (this._y<this._size/2) { this._y=this._size/2; }
            if (this._y>h-this._size/2) { this._y=h-this._size/2; }
        };

        CropArea.prototype._drawArea=function() {};

        CropArea.prototype.draw=function() {
            // draw crop area
            this._cropCanvas.drawCropArea(this._image, [this._x, this._y], this._size, this._drawArea);
        };

        CropArea.prototype.processMouseMove=function() {};

        CropArea.prototype.processMouseDown=function() {};

        CropArea.prototype.processMouseUp=function() {};

        return CropArea;
    }]);

    crop.factory('cropCanvas', [function() {
    // Shape = Array of [x,y]; [0, 0] - center
        var shapeArrowNW=[[-0.5, -2], [-3, -4.5], [-0.5, -7], [-7, -7], [-7, -0.5], [-4.5, -3], [-2, -0.5]];
        var shapeArrowNE=[[0.5, -2], [3, -4.5], [0.5, -7], [7, -7], [7, -0.5], [4.5, -3], [2, -0.5]];
        var shapeArrowSW=[[-0.5, 2], [-3, 4.5], [-0.5, 7], [-7, 7], [-7, 0.5], [-4.5, 3], [-2, 0.5]];
        var shapeArrowSE=[[0.5, 2], [3, 4.5], [0.5, 7], [7, 7], [7, 0.5], [4.5, 3], [2, 0.5]];
        var shapeArrowN=[[-1.5, -2.5], [-1.5, -6], [-5, -6], [0, -11], [5, -6], [1.5, -6], [1.5, -2.5]];
        var shapeArrowW=[[-2.5, -1.5], [-6, -1.5], [-6, -5], [-11, 0], [-6, 5], [-6, 1.5], [-2.5, 1.5]];
        var shapeArrowS=[[-1.5, 2.5], [-1.5, 6], [-5, 6], [0, 11], [5, 6], [1.5, 6], [1.5, 2.5]];
        var shapeArrowE=[[2.5, -1.5], [6, -1.5], [6, -5], [11, 0], [6, 5], [6, 1.5], [2.5, 1.5]];

  // Colors
        var colors={
            'areaOutline': '#fff',
            'resizeBoxStroke': '#fff',
            'resizeBoxFill': '#444',
            'resizeBoxArrowFill': '#fff',
            'resizeCircleStroke': '#fff',
            'resizeCircleFill': '#444',
            'moveIconFill': '#fff'
        };

        return function(ctx) {

            /* Base functions */

            // Calculate Point
            var calcPoint=function(point, offset, scale) {
                return [scale*point[0]+offset[0], scale*point[1]+offset[1]];
            };

            // Draw Filled Polygon
            var drawFilledPolygon=function(shape, fillStyle, centerCoords, scale) {
                var pc, p, pc0;

                ctx.save();
                ctx.fillStyle = fillStyle;
                ctx.beginPath();
                pc0=calcPoint(shape[0], centerCoords, scale);
                ctx.moveTo(pc0[0], pc0[1]);

                for (p in shape) {
                    if (p > 0) {
                        pc=calcPoint(shape[p], centerCoords, scale);
                        ctx.lineTo(pc[0], pc[1]);
                    }
                }

                ctx.lineTo(pc0[0], pc0[1]);
                ctx.fill();
                ctx.closePath();
                ctx.restore();
            };

            /* Icons */
            this.drawIconMove=function(centerCoords, scale) {
                drawFilledPolygon(shapeArrowN, colors.moveIconFill, centerCoords, scale);
                drawFilledPolygon(shapeArrowW, colors.moveIconFill, centerCoords, scale);
                drawFilledPolygon(shapeArrowS, colors.moveIconFill, centerCoords, scale);
                drawFilledPolygon(shapeArrowE, colors.moveIconFill, centerCoords, scale);
            };

            this.drawIconResizeCircle=function(centerCoords, circleRadius, scale) {
                var scaledCircleRadius=circleRadius*scale;

                ctx.save();
                ctx.strokeStyle = colors.resizeCircleStroke;
                ctx.lineWidth = 2;
                ctx.fillStyle = colors.resizeCircleFill;
                ctx.beginPath();
                ctx.arc(centerCoords[0], centerCoords[1], scaledCircleRadius, 0, 2*Math.PI);
                ctx.fill();
                ctx.stroke();
                ctx.closePath();
                ctx.restore();
            };

            this.drawIconResizeBoxBase=function(centerCoords, boxSize, scale) {
                var scaledBoxSize=boxSize*scale;

                ctx.save();
                ctx.strokeStyle = colors.resizeBoxStroke;
                ctx.lineWidth = 2;
                ctx.fillStyle = colors.resizeBoxFill;
                ctx.fillRect(centerCoords[0] - scaledBoxSize/2, centerCoords[1] - scaledBoxSize/2, scaledBoxSize, scaledBoxSize);
                ctx.strokeRect(centerCoords[0] - scaledBoxSize/2, centerCoords[1] - scaledBoxSize/2, scaledBoxSize, scaledBoxSize);
                ctx.restore();
            };
            this.drawIconResizeBoxNESW=function(centerCoords, boxSize, scale) {
                this.drawIconResizeBoxBase(centerCoords, boxSize, scale);
                drawFilledPolygon(shapeArrowNE, colors.resizeBoxArrowFill, centerCoords, scale);
                drawFilledPolygon(shapeArrowSW, colors.resizeBoxArrowFill, centerCoords, scale);
            };
            this.drawIconResizeBoxNWSE=function(centerCoords, boxSize, scale) {
                this.drawIconResizeBoxBase(centerCoords, boxSize, scale);
                drawFilledPolygon(shapeArrowNW, colors.resizeBoxArrowFill, centerCoords, scale);
                drawFilledPolygon(shapeArrowSE, colors.resizeBoxArrowFill, centerCoords, scale);
            };

            /* Crop Area */
            this.drawCropArea=function(image, centerCoords, size, fnDrawClipPath) {
                var xRatio=image.width/ctx.canvas.width,
                    yRatio=image.height/ctx.canvas.height,
                    xLeft=centerCoords[0]-size/2,
                    yTop=centerCoords[1]-size/2;

                ctx.save();
                ctx.strokeStyle = colors.areaOutline;
                ctx.lineWidth = 2;
                ctx.beginPath();
                fnDrawClipPath(ctx, centerCoords, size);
                ctx.stroke();
                ctx.clip();

                 // draw part of original image
                if (size > 0) {
                    ctx.drawImage(image, xLeft*xRatio, yTop*yRatio, size*xRatio, size*yRatio, xLeft, yTop, size, size);
                }

                ctx.beginPath();
                fnDrawClipPath(ctx, centerCoords, size);
                ctx.stroke();
                ctx.clip();

                ctx.restore();
            };
        };
    }]);

    /**
     * EXIF service is based on the exif-js library (https://github.com/jseidelin/exif-js)
     */

    crop.service('cropEXIF', [function() {
        var debug = false;
        var IptcFieldMap = {
            '0x78' : 'caption',
            '0x6E' : 'credit',
            '0x19' : 'keywords',
            '0x37' : 'dateCreated',
            '0x50' : 'byline',
            '0x55' : 'bylineTitle',
            '0x7A' : 'captionWriter',
            '0x69' : 'headline',
            '0x74' : 'copyright',
            '0x0F' : 'category'
        };

        var ExifTags = this.Tags = {

          // version tags
            '0x9000' : 'ExifVersion',             // eslint-disable-line no-console. EXIF version
            '0xA000' : 'FlashpixVersion',         // eslint-disable-line no-console. Flashpix format version

            // colorspace tags
            '0xA001' : 'ColorSpace',              // eslint-disable-line no-console. Color space information tag

            // image configuration
            '0xA002' : 'PixelXDimension',         // eslint-disable-line no-console. Valid width of meaningful image
            '0xA003' : 'PixelYDimension',         // eslint-disable-line no-console. Valid height of meaningful image
            '0x9101' : 'ComponentsConfiguration', // eslint-disable-line no-console. Information about channels
            '0x9102' : 'CompressedBitsPerPixel',  // eslint-disable-line no-console. Compressed bits per pixel

            // user information
            '0x927C' : 'MakerNote',               // eslint-disable-line no-console. Any desired information written by the manufacturer
            '0x9286' : 'UserComment',             // eslint-disable-line no-console. Comments by user

            // related file
            '0xA004' : 'RelatedSoundFile',        // eslint-disable-line no-console. Name of related sound file

            // date and time
            '0x9003' : 'DateTimeOriginal',        // eslint-disable-line no-console. Date and time when the original image was generated
            '0x9004' : 'DateTimeDigitized',       // eslint-disable-line no-console. Date and time when the image was stored digitally
            '0x9290' : 'SubsecTime',              // eslint-disable-line no-console. Fractions of seconds for DateTime
            '0x9291' : 'SubsecTimeOriginal',      // eslint-disable-line no-console. Fractions of seconds for DateTimeOriginal
            '0x9292' : 'SubsecTimeDigitized',     // eslint-disable-line no-console. Fractions of seconds for DateTimeDigitized

            // picture-taking conditions
            '0x829A' : 'ExposureTime',            // eslint-disable-line no-console. Exposure time (in seconds)
            '0x829D' : 'FNumber',                 // eslint-disable-line no-console. F number
            '0x8822' : 'ExposureProgram',         // eslint-disable-line no-console. Exposure program
            '0x8824' : 'SpectralSensitivity',     // eslint-disable-line no-console. Spectral sensitivity
            '0x8827' : 'ISOSpeedRatings',         // eslint-disable-line no-console. ISO speed rating
            '0x8828' : 'OECF',                    // eslint-disable-line no-console. Optoelectric conversion factor
            '0x9201' : 'ShutterSpeedValue',       // eslint-disable-line no-console. Shutter speed
            '0x9202' : 'ApertureValue',           // eslint-disable-line no-console. Lens aperture
            '0x9203' : 'BrightnessValue',         // eslint-disable-line no-console. Value of brightness
            '0x9204' : 'ExposureBias',            // eslint-disable-line no-console. Exposure bias
            '0x9205' : 'MaxApertureValue',        // eslint-disable-line no-console. Smallest F number of lens
            '0x9206' : 'SubjectDistance',         // eslint-disable-line no-console. Distance to subject in meters
            '0x9207' : 'MeteringMode',            // eslint-disable-line no-console. Metering mode
            '0x9208' : 'LightSource',             // eslint-disable-line no-console. Kind of light source
            '0x9209' : 'Flash',                   // eslint-disable-line no-console. Flash status
            '0x9214' : 'SubjectArea',             // eslint-disable-line no-console. Location and area of main subject
            '0x920A' : 'FocalLength',             // eslint-disable-line no-console. Focal length of the lens in mm
            '0xA20B' : 'FlashEnergy',             // eslint-disable-line no-console. Strobe energy in BCPS
            '0xA20C' : 'SpatialFrequencyResponse', // eslint-disable-line no-console.
            '0xA20E' : 'FocalPlaneXResolution',   // eslint-disable-line no-console. Number of pixels in width direction per FocalPlaneResolutionUnit
            '0xA20F' : 'FocalPlaneYResolution',   // eslint-disable-line no-console. Number of pixels in height direction per FocalPlaneResolutionUnit
            '0xA210' : 'FocalPlaneResolutionUnit', // eslint-disable-line no-console. Unit for measuring FocalPlaneXResolution and FocalPlaneYResolution
            '0xA214' : 'SubjectLocation',         // eslint-disable-line no-console. Location of subject in image
            '0xA215' : 'ExposureIndex',           // eslint-disable-line no-console. Exposure index selected on camera
            '0xA217' : 'SensingMethod',           // eslint-disable-line no-console. Image sensor type
            '0xA300' : 'FileSource',              // eslint-disable-line no-console. Image source (3 == DSC)
            '0xA301' : 'SceneType',               // eslint-disable-line no-console. Scene type (1 == directly photographed)
            '0xA302' : 'CFAPattern',              // eslint-disable-line no-console. Color filter array geometric pattern
            '0xA401' : 'CustomRendered',          // eslint-disable-line no-console. Special processing
            '0xA402' : 'ExposureMode',            // eslint-disable-line no-console. Exposure mode
            '0xA403' : 'WhiteBalance',            // eslint-disable-line no-console. 1 = auto white balance, 2 = manual
            '0xA404' : 'DigitalZoomRation',       // eslint-disable-line no-console. Digital zoom ratio
            '0xA405' : 'FocalLengthIn35mmFilm',   // eslint-disable-line no-console. Equivalent foacl length assuming 35mm film camera (in mm)
            '0xA406' : 'SceneCaptureType',        // eslint-disable-line no-console. Type of scene
            '0xA407' : 'GainControl',             // eslint-disable-line no-console. Degree of overall image gain adjustment
            '0xA408' : 'Contrast',                // eslint-disable-line no-console. Direction of contrast processing applied by camera
            '0xA409' : 'Saturation',              // eslint-disable-line no-console. Direction of saturation processing applied by camera
            '0xA40A' : 'Sharpness',               // eslint-disable-line no-console. Direction of sharpness processing applied by camera
            '0xA40B' : 'DeviceSettingDescription', // eslint-disable-line no-console.
            '0xA40C' : 'SubjectDistanceRange',    // eslint-disable-line no-console. Distance to subject

            // other tags
            '0xA005' : 'InteroperabilityIFDPointer',
            '0xA420' : 'ImageUniqueID'            // eslint-disable-line no-console. Identifier assigned uniquely to each image
        };

        var TiffTags = this.TiffTags = {
            '0x0100' : 'ImageWidth',
            '0x0101' : 'ImageHeight',
            '0x8769' : 'ExifIFDPointer',
            '0x8825' : 'GPSInfoIFDPointer',
            '0xA005' : 'InteroperabilityIFDPointer',
            '0x0102' : 'BitsPerSample',
            '0x0103' : 'Compression',
            '0x0106' : 'PhotometricInterpretation',
            '0x0112' : 'Orientation',
            '0x0115' : 'SamplesPerPixel',
            '0x011C' : 'PlanarConfiguration',
            '0x0212' : 'YCbCrSubSampling',
            '0x0213' : 'YCbCrPositioning',
            '0x011A' : 'XResolution',
            '0x011B' : 'YResolution',
            '0x0128' : 'ResolutionUnit',
            '0x0111' : 'StripOffsets',
            '0x0116' : 'RowsPerStrip',
            '0x0117' : 'StripByteCounts',
            '0x0201' : 'JPEGInterchangeFormat',
            '0x0202' : 'JPEGInterchangeFormatLength',
            '0x012D' : 'TransferFunction',
            '0x013E' : 'WhitePoint',
            '0x013F' : 'PrimaryChromaticities',
            '0x0211' : 'YCbCrCoefficients',
            '0x0214' : 'ReferenceBlackWhite',
            '0x0132' : 'DateTime',
            '0x010E' : 'ImageDescription',
            '0x010F' : 'Make',
            '0x0110' : 'Model',
            '0x0131' : 'Software',
            '0x013B' : 'Artist',
            '0x8298' : 'Copyright'
        };

        var GPSTags = this.GPSTags = {
            '0x0000' : 'GPSVersionID',
            '0x0001' : 'GPSLatitudeRef',
            '0x0002' : 'GPSLatitude',
            '0x0003' : 'GPSLongitudeRef',
            '0x0004' : 'GPSLongitude',
            '0x0005' : 'GPSAltitudeRef',
            '0x0006' : 'GPSAltitude',
            '0x0007' : 'GPSTimeStamp',
            '0x0008' : 'GPSSatellites',
            '0x0009' : 'GPSStatus',
            '0x000A' : 'GPSMeasureMode',
            '0x000B' : 'GPSDOP',
            '0x000C' : 'GPSSpeedRef',
            '0x000D' : 'GPSSpeed',
            '0x000E' : 'GPSTrackRef',
            '0x000F' : 'GPSTrack',
            '0x0010' : 'GPSImgDirectionRef',
            '0x0011' : 'GPSImgDirection',
            '0x0012' : 'GPSMapDatum',
            '0x0013' : 'GPSDestLatitudeRef',
            '0x0014' : 'GPSDestLatitude',
            '0x0015' : 'GPSDestLongitudeRef',
            '0x0016' : 'GPSDestLongitude',
            '0x0017' : 'GPSDestBearingRef',
            '0x0018' : 'GPSDestBearing',
            '0x0019' : 'GPSDestDistanceRef',
            '0x001A' : 'GPSDestDistance',
            '0x001B' : 'GPSProcessingMethod',
            '0x001C' : 'GPSAreaInformation',
            '0x001D' : 'GPSDateStamp',
            '0x001E' : 'GPSDifferential'
        };

        var StringValues = this.StringValues = {
            'ExposureProgram' : {
                '0' : 'Not defined',
                '1' : 'Manual',
                '2' : 'Normal program',
                '3' : 'Aperture priority',
                '4' : 'Shutter priority',
                '5' : 'Creative program',
                '6' : 'Action program',
                '7' : 'Portrait mode',
                '8' : 'Landscape mode'
            },
            'MeteringMode' : {
                '0' : 'Unknown',
                '1' : 'Average',
                '2' : 'CenterWeightedAverage',
                '3' : 'Spot',
                '4' : 'MultiSpot',
                '5' : 'Pattern',
                '6' : 'Partial',
                '255' : 'Other'
            },
            'LightSource' : {
                '0' : 'Unknown',
                '1' : 'Daylight',
                '2' : 'Fluorescent',
                '3' : 'Tungsten (incandescent light)',
                '4' : 'Flash',
                '9' : 'Fine weather',
                '10' : 'Cloudy weather',
                '11' : 'Shade',
                '12' : 'Daylight fluorescent (D 5700 - 7100K)',
                '13' : 'Day white fluorescent (N 4600 - 5400K)',
                '14' : 'Cool white fluorescent (W 3900 - 4500K)',
                '15' : 'White fluorescent (WW 3200 - 3700K)',
                '17' : 'Standard light A',
                '18' : 'Standard light B',
                '19' : 'Standard light C',
                '20' : 'D55',
                '21' : 'D65',
                '22' : 'D75',
                '23' : 'D50',
                '24' : 'ISO studio tungsten',
                '255' : 'Other'
            },
            'Flash' : {
                '0x0000' : 'Flash did not fire',
                '0x0001' : 'Flash fired',
                '0x0005' : 'Strobe return light not detected',
                '0x0007' : 'Strobe return light detected',
                '0x0009' : 'Flash fired, compulsory flash mode',
                '0x000D' : 'Flash fired, compulsory flash mode, return light not detected',
                '0x000F' : 'Flash fired, compulsory flash mode, return light detected',
                '0x0010' : 'Flash did not fire, compulsory flash mode',
                '0x0018' : 'Flash did not fire, auto mode',
                '0x0019' : 'Flash fired, auto mode',
                '0x001D' : 'Flash fired, auto mode, return light not detected',
                '0x001F' : 'Flash fired, auto mode, return light detected',
                '0x0020' : 'No flash function',
                '0x0041' : 'Flash fired, red-eye reduction mode',
                '0x0045' : 'Flash fired, red-eye reduction mode, return light not detected',
                '0x0047' : 'Flash fired, red-eye reduction mode, return light detected',
                '0x0049' : 'Flash fired, compulsory flash mode, red-eye reduction mode',
                '0x004D' : 'Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected',
                '0x004F' : 'Flash fired, compulsory flash mode, red-eye reduction mode, return light detected',
                '0x0059' : 'Flash fired, auto mode, red-eye reduction mode',
                '0x005D' : 'Flash fired, auto mode, return light not detected, red-eye reduction mode',
                '0x005F' : 'Flash fired, auto mode, return light detected, red-eye reduction mode'
            },
            'SensingMethod' : {
                '1' : 'Not defined',
                '2' : 'One-chip color area sensor',
                '3' : 'Two-chip color area sensor',
                '4' : 'Three-chip color area sensor',
                '5' : 'Color sequential area sensor',
                '7' : 'Trilinear sensor',
                '8' : 'Color sequential linear sensor'
            },
            'SceneCaptureType' : {
                '0' : 'Standard',
                '1' : 'Landscape',
                '2' : 'Portrait',
                '3' : 'Night scene'
            },
            'SceneType' : {
                '1' : 'Directly photographed'
            },
            'CustomRendered' : {
                '0' : 'Normal process',
                '1' : 'Custom process'
            },
            'WhiteBalance' : {
                '0' : 'Auto white balance',
                '1' : 'Manual white balance'
            },
            'GainControl' : {
                '0' : 'None',
                '1' : 'Low gain up',
                '2' : 'High gain up',
                '3' : 'Low gain down',
                '4' : 'High gain down'
            },
            'Contrast' : {
                '0' : 'Normal',
                '1' : 'Soft',
                '2' : 'Hard'
            },
            'Saturation' : {
                '0' : 'Normal',
                '1' : 'Low saturation',
                '2' : 'High saturation'
            },
            'Sharpness' : {
                '0' : 'Normal',
                '1' : 'Soft',
                '2' : 'Hard'
            },
            'SubjectDistanceRange' : {
                '0' : 'Unknown',
                '1' : 'Macro',
                '2' : 'Close view',
                '3' : 'Distant view'
            },
            'FileSource' : {
                '3' : 'DSC'
            },
            'Components' : {
                '0' : '',
                '1' : 'Y',
                '2' : 'Cb',
                '3' : 'Cr',
                '4' : 'R',
                '5' : 'G',
                '6' : 'B'
            }
        };

        function imageHasData(img) {
            return !!img.exifdata;
        }

        function base64ToArrayBuffer(base64, contentType) {

            /* global atob */
            var binary, len, buffer, view, i;

            contentType = contentType || base64.match(/^data\:([^\;]+)\;base64,/mi)[1] || ''; // eslint-disable-line no-console. e.g. 'data:image/jpeg;base64,...' => 'image/jpeg'
            base64 = base64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
            binary = atob(base64);
            len = binary.length;
            buffer = new ArrayBuffer(len);
            view = new Uint8Array(buffer);
            for (i = 0; i < len; i++) {
                view[i] = binary.charCodeAt(i);
            }
            return buffer;
        }

        function objectURLToBlob(url, callback) {
            var http = new XMLHttpRequest();

            http.open('GET', url, true);
            http.responseType = 'blob';
            http.onload = function() {
                if (this.status === 200 || this.status === 0) {
                    callback(this.response);
                }
            };
            http.send();
        }

        function getStringFromDB(buffer, start, length) {
            var outstr = '', n;

            for (n = start; n < start+length; n++) {
                outstr += String.fromCharCode(buffer.getUint8(n));
            }
            return outstr;
        }

        function readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd) {
            var type = file.getUint16(entryOffset+2, !bigEnd),
                numValues = file.getUint32(entryOffset+4, !bigEnd),
                valueOffset = file.getUint32(entryOffset+8, !bigEnd) + tiffStart,
                offset,
                vals, val, n,
                numerator, denominator;

            switch (type) {
            case 1: // eslint-disable-line no-console. byte, 8-bit unsigned int
            case 7: // eslint-disable-line no-console. undefined, 8-bit byte, value depending on field
                if (numValues === 1) {
                    return file.getUint8(entryOffset + 8, !bigEnd);
                } else {
                    offset = numValues > 4 ? valueOffset : entryOffset + 8;
                    vals = [];
                    for (n=0; n<numValues; n++) {
                        vals[n] = file.getUint8(offset + n);
                    }
                    return vals;
                }

            case 2: // eslint-disable-line no-console. ascii, 8-bit byte
                offset = numValues > 4 ? valueOffset : entryOffset + 8;
                return getStringFromDB(file, offset, numValues-1);

            case 3: // eslint-disable-line no-console. short, 16 bit int
                if (numValues === 1) {
                    return file.getUint16(entryOffset + 8, !bigEnd);
                } else {
                    offset = numValues > 2 ? valueOffset : entryOffset + 8;
                    vals = [];
                    for (n=0; n<numValues; n++) {
                        vals[n] = file.getUint16(offset + 2*n, !bigEnd);
                    }
                    return vals;
                }

            case 4: // eslint-disable-line no-console. long, 32 bit int
                if (numValues === 1) {
                    return file.getUint32(entryOffset + 8, !bigEnd);
                } else {
                    vals = [];
                    for (n=0; n<numValues; n++) {
                        vals[n] = file.getUint32(valueOffset + 4*n, !bigEnd);
                    }
                    return vals;
                }

            case 5:    // eslint-disable-line no-console. rational = two long values, first is numerator, second is denominator
                if (numValues === 1) {
                    numerator = file.getUint32(valueOffset, !bigEnd);
                    denominator = file.getUint32(valueOffset+4, !bigEnd);
                    val = numerator / denominator;
                    val.numerator = numerator;
                    val.denominator = denominator;
                    return val;
                } else {
                    vals = [];
                    for (n=0; n<numValues; n++) {
                        numerator = file.getUint32(valueOffset + 8*n, !bigEnd);
                        denominator = file.getUint32(valueOffset+4 + 8*n, !bigEnd);
                        vals[n] = numerator / denominator;
                        vals[n].numerator = numerator;
                        vals[n].denominator = denominator;
                    }
                    return vals;
                }

            case 9: // eslint-disable-line no-console. slong, 32 bit signed int
                if (numValues === 1) {
                    return file.getInt32(entryOffset + 8, !bigEnd);
                } else {
                    vals = [];
                    for (n=0; n<numValues; n++) {
                        vals[n] = file.getInt32(valueOffset + 4*n, !bigEnd);
                    }
                    return vals;
                }

            case 10: // eslint-disable-line no-console. signed rational, two slongs, first is numerator, second is denominator
                if (numValues === 1) {
                    return file.getInt32(valueOffset, !bigEnd) / file.getInt32(valueOffset+4, !bigEnd);
                } else {
                    vals = [];
                    for (n=0; n<numValues; n++) {
                        vals[n] = file.getInt32(valueOffset + 8*n, !bigEnd) / file.getInt32(valueOffset+4 + 8*n, !bigEnd);
                    }
                    return vals;
                }
            }
        }

        function readTags(file, tiffStart, dirStart, strings, bigEnd) {
            var entries = file.getUint16(dirStart, !bigEnd),
                tags = {},
                entryOffset, tag,
                i;

            for (i=0; i<entries; i += 1) {
                entryOffset = dirStart + i*12 + 2;
                tag = strings[file.getUint16(entryOffset, !bigEnd)];
                if (!tag && debug) console.log('Unknown tag: ' + file.getUint16(entryOffset, !bigEnd)); // eslint-disable-line no-console
                tags[tag] = readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd);
            }
            return tags;
        }

        function readEXIFData(file, start) {
            var bigEnd,
                tags, tag,
                exifData, gpsData,
                tiffOffset, firstIFDOffset;

            if (getStringFromDB(file, start, 4) !== 'Exif') {
                if (debug) console.log('Not valid EXIF data! ' + getStringFromDB(file, start, 4)); // eslint-disable-line no-console
                return false;
            }
            tiffOffset = start + 6;

            // test for TIFF validity and endianness
            if (file.getUint16(tiffOffset) === 0x4949) {
                bigEnd = false;
            } else if (file.getUint16(tiffOffset) === 0x4D4D) {
                bigEnd = true;
            } else {
                if (debug) console.log('Not valid TIFF data! (no 0x4949 or 0x4D4D)'); // eslint-disable-line no-console
                return false;
            }

            if (file.getUint16(tiffOffset+2, !bigEnd) !== 0x002A) {
                if (debug) console.log('Not valid TIFF data! (no 0x002A)'); // eslint-disable-line no-console
                return false;
            }

            firstIFDOffset = file.getUint32(tiffOffset+4, !bigEnd);

            if (firstIFDOffset < 0x00000008) {
                if (debug) console.log('Not valid TIFF data! (First offset less than 8)', file.getUint32(tiffOffset+4, !bigEnd)); // eslint-disable-line no-console
                return false;
            }

            tags = readTags(file, tiffOffset, tiffOffset + firstIFDOffset, TiffTags, bigEnd);

            if (tags.ExifIFDPointer) {
                exifData = readTags(file, tiffOffset, tiffOffset + tags.ExifIFDPointer, ExifTags, bigEnd);
                for (tag in exifData) {
                    switch (tag) {
                    case 'LightSource' :
                    case 'Flash' :
                    case 'MeteringMode' :
                    case 'ExposureProgram' :
                    case 'SensingMethod' :
                    case 'SceneCaptureType' :
                    case 'SceneType' :
                    case 'CustomRendered' :
                    case 'WhiteBalance' :
                    case 'GainControl' :
                    case 'Contrast' :
                    case 'Saturation' :
                    case 'Sharpness' :
                    case 'SubjectDistanceRange' :
                    case 'FileSource' :
                        exifData[tag] = StringValues[tag][exifData[tag]];
                        break;

                    case 'ExifVersion' :
                    case 'FlashpixVersion' :
                        exifData[tag] = String.fromCharCode(exifData[tag][0], exifData[tag][1], exifData[tag][2], exifData[tag][3]);
                        break;

                    case 'ComponentsConfiguration' :
                        exifData[tag] =
                          StringValues.Components[exifData[tag][0]] +
                          StringValues.Components[exifData[tag][1]] +
                          StringValues.Components[exifData[tag][2]] +
                          StringValues.Components[exifData[tag][3]];
                        break;
                    }
                    tags[tag] = exifData[tag];
                }
            }

            if (tags.GPSInfoIFDPointer) {
                gpsData = readTags(file, tiffOffset, tiffOffset + tags.GPSInfoIFDPointer, GPSTags, bigEnd);
                for (tag in gpsData) {
                    switch (tag) {
                    case 'GPSVersionID' :
                        gpsData[tag] = gpsData[tag][0] +
                            '.' + gpsData[tag][1] +
                            '.' + gpsData[tag][2] +
                            '.' + gpsData[tag][3];
                        break;
                    }
                    tags[tag] = gpsData[tag];
                }
            }

            return tags;
        }

        function findEXIFinJPEG(file) {
            var dataView = new DataView(file), offset = 2, length, marker;

            if (debug) console.log('Got file of length ' + file.byteLength); // eslint-disable-line no-console
            if (dataView.getUint8(0) !== 0xFF || dataView.getUint8(1) !== 0xD8) {
                if (debug) console.log('Not a valid JPEG'); // eslint-disable-line no-console
                return false; // eslint-disable-line no-console. not a valid jpeg
            }

            length = file.byteLength;

            while (offset < length) {
                if (dataView.getUint8(offset) !== 0xFF) {
                    if (debug) console.log('Not a valid marker at offset ' + offset + ', found: ' + dataView.getUint8(offset)); // eslint-disable-line no-console
                    return false; // eslint-disable-line no-console. not a valid marker, something is wrong
                }

                marker = dataView.getUint8(offset + 1);
                if (debug) console.log(marker); // eslint-disable-line no-console

              // eslint-disable-line no-console. we could implement handling for other markers here,
              // eslint-disable-line no-console. but we're only looking for 0xFFE1 for EXIF data

                if (marker === 225) {
                    if (debug) console.log('Found 0xFFE1 marker'); // eslint-disable-line no-console

                    return readEXIFData(dataView, offset + 4, dataView.getUint16(offset + 2) - 2);

              // eslint-disable-line no-console. offset += 2 + file.getShortAt(offset+2, true);

                } else {
                    offset += 2 + dataView.getUint16(offset+2);
                }

            }

        }

        function readIPTCData(file, startOffset, sectionLength) {
            var dataView = new DataView(file);
            var data = {};
            var fieldValue, fieldName, dataSize, segmentType;
            var segmentStartPos = startOffset;

            while (segmentStartPos < startOffset+sectionLength) {
                if (dataView.getUint8(segmentStartPos) === 0x1C && dataView.getUint8(segmentStartPos+1) === 0x02) {
                    segmentType = dataView.getUint8(segmentStartPos+2);
                    if (segmentType in IptcFieldMap) {
                        dataSize = dataView.getInt16(segmentStartPos+3);
                        fieldName = IptcFieldMap[segmentType];
                        fieldValue = getStringFromDB(dataView, segmentStartPos+5, dataSize);
                        // Check if we already stored a value with this name
                        if (data.hasOwnProperty(fieldName)) {
                            // Value already stored with this name, create multivalue field
                            if (data[fieldName] instanceof Array) {
                                data[fieldName].push(fieldValue);
                            }
                            else {
                                data[fieldName] = [data[fieldName], fieldValue];
                            }
                        }
                        else {
                            data[fieldName] = fieldValue;
                        }
                    }

                }
                segmentStartPos++;
            }
            return data;
        }

        function findIPTCinJPEG(file) {
            var dataView = new DataView(file), offset = 2, length, isFieldSegmentStart, nameHeaderLength, startOffset, sectionLength;

            if (debug) console.log('Got file of length ' + file.byteLength); // eslint-disable-line no-console
            if (dataView.getUint8(0) !== 0xFF || dataView.getUint8(1) !== 0xD8) {
                if (debug) console.log('Not a valid JPEG'); // eslint-disable-line no-console
                return false; // eslint-disable-line no-console. not a valid jpeg
            }
            length = file.byteLength;

            isFieldSegmentStart = function(dataView, offset) {
                return (
                  dataView.getUint8(offset) === 0x38 &&
                  dataView.getUint8(offset+1) === 0x42 &&
                  dataView.getUint8(offset+2) === 0x49 &&
                  dataView.getUint8(offset+3) === 0x4D &&
                  dataView.getUint8(offset+4) === 0x04 &&
                  dataView.getUint8(offset+5) === 0x04
                );
            };

            while (offset < length) {

                if ( isFieldSegmentStart(dataView, offset )) {

                    // Get the length of the name header (which is padded to an even number of bytes)
                    nameHeaderLength = dataView.getUint8(offset+7);
                    if (nameHeaderLength % 2 !== 0) nameHeaderLength += 1;
                    // Check for pre photoshop 6 format
                    if (nameHeaderLength === 0) {
                        // Always 4
                        nameHeaderLength = 4;
                    }

                    startOffset = offset + 8 + nameHeaderLength;
                    sectionLength = dataView.getUint16(offset + 6 + nameHeaderLength);

                    return readIPTCData(file, startOffset, sectionLength);

                }

                // Not the marker, continue searching
                offset++;

            }
        }

        function getImageData(img, callback) {
            var http, arrayBuffer, fileReader;

            function handleBinaryFile(binFile) {

                /* global  FileReader, XMLHttpRequest */
                var data = findEXIFinJPEG(binFile), iptcdata = findIPTCinJPEG(binFile);

                img.exifdata = data || {};
                img.iptcdata = iptcdata || {};
                if (callback) {
                    callback.call(img);
                }
            }

            if (img.src) {
                if (/^data\:/i.test(img.src)) {
                    arrayBuffer = base64ToArrayBuffer(img.src);

                    handleBinaryFile(arrayBuffer);

                } else if (/^blob\:/i.test(img.src)) {
                    fileReader = new FileReader();

                    fileReader.onload = function(e) {
                        handleBinaryFile(e.target.result);
                    };
                    objectURLToBlob(img.src, function (blob) {
                        fileReader.readAsArrayBuffer(blob);
                    });
                } else {
                    http = new XMLHttpRequest();

                    http.onload = function() {
                        if (this.status === 200 || this.status === 0) {
                            handleBinaryFile(http.response);
                        } else {
                            throw new Error('Could not load image');
                        }
                        http = null;
                    };
                    http.open('GET', img.src, true);
                    http.responseType = 'arraybuffer';
                    http.send(null);
                }
            } else if (window.FileReader && (img instanceof window.Blob || img instanceof window.File)) {
                fileReader = new FileReader();

                fileReader.onload = function(e) {
                    if (debug) console.log('Got file of length ' + e.target.result.byteLength); // eslint-disable-line no-console
                    handleBinaryFile(e.target.result);
                };

                fileReader.readAsArrayBuffer(img);
            }
        }

        this.getData = function(img, callback) {

            /* global HTMLImageElement */
            if ((img instanceof Image || img instanceof HTMLImageElement) && !img.complete) return false;

            if (!imageHasData(img)) {
                getImageData(img, callback);
            } else if (callback) {
                callback.call(img);
            }
            return true;
        };

        this.getTag = function(img, tag) {
            if (!imageHasData(img)) return;
            return img.exifdata[tag];
        };

        this.getAllTags = function(img) {
            var a,
                data = img.exifdata,
                tags = {};

            if (!imageHasData(img)) return {};

            for (a in data) {
                if (data.hasOwnProperty(a)) {
                    tags[a] = data[a];
                }
            }
            return tags;
        };

        this.pretty = function(img) {
            var a,
                data = img.exifdata,
                strPretty = '';

            if (!imageHasData(img)) return '';
            for (a in data) {
                if (data.hasOwnProperty(a)) {
                    if (typeof data[a] === 'object') {
                        if (data[a] instanceof Number) {
                            strPretty += a + ' : ' + data[a] + ' [' + data[a].numerator + '/' + data[a].denominator + ']\r\n';
                        } else {
                            strPretty += a + ' : [' + data[a].length + ' values]\r\n';
                        }
                    } else {
                        strPretty += a + ' : ' + data[a] + '\r\n';
                    }
                }
            }
            return strPretty;
        };

        this.readFromBinaryFile = function(file) {
            return findEXIFinJPEG(file);
        };
    }]);

    crop.factory('cropHost', ['$document', 'cropAreaCircle', 'cropAreaSquare', 'cropEXIF', function($document, CropAreaCircle, CropAreaSquare, cropEXIF) {

    /* STATIC FUNCTIONS */

  // Get Element's Offset
        var getElementOffset=function(elem) {
            var box = elem.getBoundingClientRect();

            var body = document.body;
            var docElem = document.documentElement;

            var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
            var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

            var clientTop = docElem.clientTop || body.clientTop || 0;
            var clientLeft = docElem.clientLeft || body.clientLeft || 0;

            var top  = box.top +  scrollTop - clientTop;
            var left = box.left + scrollLeft - clientLeft;

            return { 'top': Math.round(top), 'left': Math.round(left) };
        };

        return function(elCanvas, opts, events) {

        /* PRIVATE VARIABLES */

            // Object Pointers
            var ctx=null,
                image=null,
                theArea=null;

            // Dimensions
            var minCanvasDims=[300, 300],
                maxCanvasDims=[800, 800];

            // Result Image size
            var resImgSize=200;

            // Result Image type
            var resImgFormat='image/png';

            // Result Image quality
            var resImgQuality=null;

            var resetCropHost;
            var getChangedTouches;
            var onMouseMove;
            var onMouseDown;
            var onMouseUp;

            /* PRIVATE FUNCTIONS */

            // Draw Scene
            function drawScene() {
                // clear canvas
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

                if (image!==null) {
                // draw source image
                    ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);
                    ctx.save();
                    // and make it darker
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
                    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    ctx.restore();
                    // draw Area
                    theArea.draw();
                }
            }

                // Resets CropHost
            resetCropHost=function() {
                var imageDims, imageRatio, canvasDims;

                if (image!==null) {
                    theArea.setImage(image);
                    imageDims=[image.width, image.height];
                    imageRatio=image.width/image.height;
                    canvasDims=imageDims;

                    if (canvasDims[0]>maxCanvasDims[0]) {
                        canvasDims[0]=maxCanvasDims[0];
                        canvasDims[1]=canvasDims[0]/imageRatio;
                    } else if (canvasDims[0]<minCanvasDims[0]) {
                        canvasDims[0]=minCanvasDims[0];
                        canvasDims[1]=canvasDims[0]/imageRatio;
                    }
                    if (canvasDims[1]>maxCanvasDims[1]) {
                        canvasDims[1]=maxCanvasDims[1];
                        canvasDims[0]=canvasDims[1]*imageRatio;
                    } else if (canvasDims[1]<minCanvasDims[1]) {
                        canvasDims[1]=minCanvasDims[1];
                        canvasDims[0]=canvasDims[1]*imageRatio;
                    }
                    elCanvas.prop('width', canvasDims[0]).prop('height', canvasDims[1]).css({'margin-left': -canvasDims[0]/2+'px', 'margin-top': -canvasDims[1]/2+'px'});

                    theArea.setX(ctx.canvas.width/2);
                    theArea.setY(ctx.canvas.height/2);
                    theArea.setSize(Math.min(200, ctx.canvas.width/2, ctx.canvas.height/2));
                } else {
                    elCanvas.prop('width', 0).prop('height', 0).css({'margin-top': 0});
                }

                drawScene();
            };

    /*
     * Returns event.changedTouches directly if event is a TouchEvent.
     * If event is a jQuery event, return changedTouches of event.originalEvent
     */
            getChangedTouches=function(event) {
                if (angular.isDefined(event.changedTouches)) {
                    return event.changedTouches;
                } else {
                    return event.originalEvent.changedTouches;
                }
            };

            onMouseMove=function(e) {
                var offset, pageX, pageY;

                if (image!==null) {
                    offset=getElementOffset(ctx.canvas);
                    if (e.type === 'touchmove') {
                        pageX=getChangedTouches(e)[0].pageX;
                        pageY=getChangedTouches(e)[0].pageY;
                    } else {
                        pageX=e.pageX;
                        pageY=e.pageY;
                    }
                    theArea.processMouseMove(pageX-offset.left, pageY-offset.top);
                    drawScene();
                }
            };

            onMouseDown=function(e) {
                var offset,
                    pageX, pageY;

                e.preventDefault();
                e.stopPropagation();
                if (image!==null) {
                    offset=getElementOffset(ctx.canvas);
                    if (e.type === 'touchstart') {
                        pageX=getChangedTouches(e)[0].pageX;
                        pageY=getChangedTouches(e)[0].pageY;
                    } else {
                        pageX=e.pageX;
                        pageY=e.pageY;
                    }
                    theArea.processMouseDown(pageX-offset.left, pageY-offset.top);
                    drawScene();
                }
            };

            onMouseUp=function(e) {
                var offset, pageX, pageY;

                if (image!==null) {
                    offset=getElementOffset(ctx.canvas);
                    if (e.type === 'touchend') {
                        pageX=getChangedTouches(e)[0].pageX;
                        pageY=getChangedTouches(e)[0].pageY;
                    } else {
                        pageX=e.pageX;
                        pageY=e.pageY;
                    }
                    theArea.processMouseUp(pageX-offset.left, pageY-offset.top);
                    drawScene();
                }
            };

            this.getResultImageDataURI=function() {
                var temp_ctx, temp_canvas;

                temp_canvas = angular.element('<canvas></canvas>')[0];
                temp_ctx = temp_canvas.getContext('2d');
                temp_canvas.width = resImgSize;
                temp_canvas.height = resImgSize;
                if (image!==null) {
                    temp_ctx.drawImage(image, (theArea.getX()-theArea.getSize()/2)*(image.width/ctx.canvas.width), (theArea.getY()-theArea.getSize()/2)*(image.height/ctx.canvas.height), theArea.getSize()*(image.width/ctx.canvas.width), theArea.getSize()*(image.height/ctx.canvas.height), 0, 0, resImgSize, resImgSize);
                }
                if (resImgQuality!==null ) {
                    return temp_canvas.toDataURL(resImgFormat, resImgQuality);
                }
                return temp_canvas.toDataURL(resImgFormat);
            };

            this.setNewImageSource=function(imageSource) {
                var newImage;

                image=null;
                resetCropHost();
                events.trigger('image-updated');
                if (!!imageSource) {
                    newImage = new Image();
                    if (imageSource.substring(0, 4).toLowerCase()==='http') {
                        newImage.crossOrigin = 'anonymous';
                    }
                    newImage.onload = function() {
                        events.trigger('load-done');

                        cropEXIF.getData(newImage, function() {
                            var orientation=cropEXIF.getTag(newImage, 'Orientation'), canvas, ctx, cw, ch, cx, deg, cy;

                            if ([3, 6, 8].indexOf(orientation)>-1) {
                                canvas = document.createElement('canvas');
                                ctx=canvas.getContext('2d');
                                cw = newImage.width;
                                ch = newImage.height;
                                cx = 0;
                                cy = 0;
                                deg=0;
                                switch (orientation) {
                                case 3:
                                    cx=-newImage.width;
                                    cy=-newImage.height;
                                    deg=180;
                                    break;
                                case 6:
                                    cw = newImage.height;
                                    ch = newImage.width;
                                    cy=-newImage.height;
                                    deg=90;
                                    break;
                                case 8:
                                    cw = newImage.height;
                                    ch = newImage.width;
                                    cx=-newImage.width;
                                    deg=270;
                                    break;
                                }

                                canvas.width = cw;
                                canvas.height = ch;
                                ctx.rotate(deg*Math.PI/180);
                                ctx.drawImage(newImage, cx, cy);

                                image=new Image();
                                image.src = canvas.toDataURL('image/png');
                            } else {
                                image=newImage;
                            }
                            resetCropHost();
                            events.trigger('image-updated');
                        });
                    };
                    newImage.onerror=function() {
                        events.trigger('load-error');
                    };
                    events.trigger('load-start');
                    newImage.src=imageSource;
                }
            };

            this.setMaxDimensions=function(width, height) {
                var curWidth, curHeight, imageDims, imageRatio, canvasDims, ratioNewCurWidth, ratioNewCurHeight, ratioMin;

                maxCanvasDims=[width, height];

                if (image!==null) {
                    curWidth=ctx.canvas.width;
                    curHeight=ctx.canvas.height;
                    imageDims=[image.width, image.height];
                    imageRatio=image.width/image.height;
                    canvasDims=imageDims;

                    if (canvasDims[0]>maxCanvasDims[0]) {
                        canvasDims[0]=maxCanvasDims[0];
                        canvasDims[1]=canvasDims[0]/imageRatio;
                    } else if (canvasDims[0]<minCanvasDims[0]) {
                        canvasDims[0]=minCanvasDims[0];
                        canvasDims[1]=canvasDims[0]/imageRatio;
                    }
                    if (canvasDims[1]>maxCanvasDims[1]) {
                        canvasDims[1]=maxCanvasDims[1];
                        canvasDims[0]=canvasDims[1]*imageRatio;
                    } else if (canvasDims[1]<minCanvasDims[1]) {
                        canvasDims[1]=minCanvasDims[1];
                        canvasDims[0]=canvasDims[1]*imageRatio;
                    }
                    elCanvas.prop('width', canvasDims[0]).prop('height', canvasDims[1]).css({'margin-left': -canvasDims[0]/2+'px', 'margin-top': -canvasDims[1]/2+'px'});

                    ratioNewCurWidth=ctx.canvas.width/curWidth;
                    ratioNewCurHeight=ctx.canvas.height/curHeight;
                    ratioMin=Math.min(ratioNewCurWidth, ratioNewCurHeight);

                    theArea.setX(theArea.getX()*ratioNewCurWidth);
                    theArea.setY(theArea.getY()*ratioNewCurHeight);
                    theArea.setSize(theArea.getSize()*ratioMin);
                } else {
                    elCanvas.prop('width', 0).prop('height', 0).css({'margin-top': 0});
                }
                drawScene();
            };

            this.setAreaMinSize=function(size) {
                size=parseInt(size, 10);
                if (!isNaN(size)) {
                    theArea.setMinSize(size);
                    drawScene();
                }
            };

            this.setResultImageSize=function(size) {
                size=parseInt(size, 10);
                if (!isNaN(size)) {
                    resImgSize=size;
                }
            };

            this.setResultImageFormat=function(format) {
                resImgFormat = format;
            };

            this.setResultImageQuality=function(quality) {
                quality = parseFloat(quality);
                if (!isNaN(quality) && quality>=0 && quality<=1) {
                    resImgQuality = quality;
                }
            };

            this.setAreaType=function(type) {
                var curSize=theArea.getSize(),
                    curMinSize=theArea.getMinSize(),
                    curX=theArea.getX(),
                    curY=theArea.getY(),
                    AreaClass;

                AreaClass=CropAreaCircle;
                if (type==='square') {
                    AreaClass=CropAreaSquare;
                }
                theArea = new AreaClass(ctx, events);
                theArea.setMinSize(curMinSize);
                theArea.setSize(curSize);
                theArea.setX(curX);
                theArea.setY(curY);

                // resetCropHost();
                if (image!==null) {
                    theArea.setImage(image);
                }
                drawScene();
            };

            /* Life Cycle begins */

            // Init Context var
            ctx = elCanvas[0].getContext('2d');

            // Init CropArea
            theArea = new CropAreaCircle(ctx, events);

            // Init Mouse Event Listeners
            $document.on('mousemove', onMouseMove);
            elCanvas.on('mousedown', onMouseDown);
            $document.on('mouseup', onMouseUp);

            // Init Touch Event Listeners
            $document.on('touchmove', onMouseMove);
            elCanvas.on('touchstart', onMouseDown);
            $document.on('touchend', onMouseUp);

            // CropHost Destructor
            this.destroy=function() {
                $document.off('mousemove', onMouseMove);
                elCanvas.off('mousedown', onMouseDown);
                $document.off('mouseup', onMouseMove);

                $document.off('touchmove', onMouseMove);
                elCanvas.off('touchstart', onMouseDown);
                $document.off('touchend', onMouseMove);

                elCanvas.remove();
            };
        };

    }]);


    crop.factory('cropPubSub', [function() {
        return function() {
            var events = {};

            // Subscribe
            this.on = function(names, handler) {
                names.split(' ').forEach(function(name) {
                    if (!events[name]) {
                        events[name] = [];
                    }
                    events[name].push(handler);
                });
                return this;
            };
            // Publish
            this.trigger = function(name, args) {
                angular.forEach(events[name], function(handler) {
                    handler.call(null, args);
                });
                return this;
            };
        };
    }]);

    crop.directive('imgCrop', ['$timeout', 'cropHost', 'cropPubSub', function($timeout, CropHost, CropPubSub) {
        return {
            'restrict': 'E',
            'scope': {
                'image': '=',
                'resultImage': '=',

                'changeOnFly': '=',
                'areaType': '@',
                'areaMinSize': '=',
                'resultImageSize': '=',
                'resultImageFormat': '@',
                'resultImageQuality': '=',

                'onChange': '&',
                'onLoadBegin': '&',
                'onLoadDone': '&',
                'onLoadError': '&'
            },
            'template': '<canvas></canvas>',
            'controller': ['$scope', function($scope) {
                $scope.events = new CropPubSub();
            }],
            'link': function(scope, element/* eslint-disable-line no-console. , attrs*/) {
                // Init Events Manager
                var events = scope.events;

                // Init Crop Host
                var cropHost=new CropHost(element.find('canvas'), {}, events);

                // Store Result Image to check if it's changed
                var storedResultImage;

                var updateResultImage=function(scope) {
                    var resultImage=cropHost.getResultImageDataURI();

                    if (storedResultImage!==resultImage) {
                        storedResultImage=resultImage;
                        if (angular.isDefined(scope.resultImage)) {
                            scope.resultImage=resultImage;
                        }
                        scope.onChange({'$dataURI': scope.resultImage});
                    }
                };

                // Wrapper to safely exec functions within $apply on a running $digest cycle
                var fnSafeApply=function(fn) {
                    return function() {
                        $timeout(function() {
                            scope.$apply(function(scope) {
                                fn(scope);
                            });
                        });
                    };
                };

            // Setup CropHost Event Handlers

                events.on('load-start', fnSafeApply(function(scope) {
                    scope.onLoadBegin({});
                }))
                .on('load-done', fnSafeApply(function(scope) {
                    scope.onLoadDone({});
                }))
                .on('load-error', fnSafeApply(function(scope) {
                    scope.onLoadError({});
                }))
                .on('area-move area-resize', fnSafeApply(function(scope) {
                    if (!!scope.changeOnFly) {
                        updateResultImage(scope);
                    }
                }))
                .on('area-move-end area-resize-end image-updated', fnSafeApply(function(scope) {
                    updateResultImage(scope);
                }));

                // Sync CropHost with Directive's options
                scope.$watch('image', function() {
                    cropHost.setNewImageSource(scope.image);
                });
                scope.$watch('areaType', function() {
                    cropHost.setAreaType(scope.areaType);
                    updateResultImage(scope);
                });
                scope.$watch('areaMinSize', function() {
                    cropHost.setAreaMinSize(scope.areaMinSize);
                    updateResultImage(scope);
                });
                scope.$watch('resultImageSize', function() {
                    cropHost.setResultImageSize(scope.resultImageSize);
                    updateResultImage(scope);
                });
                scope.$watch('resultImageFormat', function() {
                    cropHost.setResultImageFormat(scope.resultImageFormat);
                    updateResultImage(scope);
                });
                scope.$watch('resultImageQuality', function() {
                    cropHost.setResultImageQuality(scope.resultImageQuality);
                    updateResultImage(scope);
                });

                // Update CropHost dimensions when the directive element is resized
                scope.$watch(
                    function () {
                        return [element[0].clientWidth, element[0].clientHeight];
                    },
                    function (value) {
                        cropHost.setMaxDimensions(value[0], value[1]);
                        updateResultImage(scope);
                    },
                    true
      );

                // Destroy CropHost Instance when the directive is destroying
                scope.$on('$destroy', function() {
                    cropHost.destroy();
                });
            }
        };
    }]);
}());

(function () {
    'use strict';

    // creating directive
    function PlgInfiniteScroll($window, $document) {

        var directive;

        // directive
        function linkFunc(scope, elem, attrs) {
            var checkBounds;


            checkBounds = function (event) {
                if (scope.listType !== 'datatable') { // eslint-disable-line no-console. No paginate DATATABLE, only LISTING and CARDS

                    if ($window.innerHeight + $window.scrollY === $document[0].body.offsetHeight) {
                        if (scope.controlCount > 0) {
                            scope.showLoadingScroll = true;
                        }
                        scope.$apply(attrs.plgInfiniteScroll);
                    }
                    angular.noop(event, elem);

                }
            };

            angular.element($window).bind('scroll load', checkBounds);
        }

        directive = {
            'restrict' : 'A',
            'link'     : linkFunc
        };

        return directive;
    }

    // injecting dependencies
    PlgInfiniteScroll.$inject = ['$window', '$document'];

    // registering into angular
    angular.module('plingUi').directive('plgInfiniteScroll', PlgInfiniteScroll);
}());

(function () {
    'use strict';

    // creating directive
    function PlgLabelLoadingContent($log, $compile) {
        return {
            'restrict': 'E',
            'scope': {
                'label': '@label',
                'align': '@align'
            },
            'replace': true,

            // linking directive
            'link': function (scope, element) {

                var
                    builder,
                    compiledElm;

                // validating bind value
                if (scope.label) {
                    builder = {
                        'buildTemplate': function (scope, cb) {
                            var template;

                            template = '<div style="text-align: {{align}}">' +
                                       '    <small>{{label}}</small>' +
                                       '</div>';

                            cb(null, template);
                            angular.noop(scope);
                        }

                    };

                    // defining template
                    builder.buildTemplate(scope, function (err, template) {

                        // handling error
                        if (err) {
                            $log.warn(err);
                            return;
                        }

                        // compiling template
                        compiledElm = $compile(template)(scope);

                        // handling post compile hooks
                        if (builder.postCompile) {
                            builder.postCompile(compiledElm);
                        }

                        // replacing into DOM
                        element.replaceWith(compiledElm);

                    });
                }
            }
        };
    }

    PlgLabelLoadingContent.$inject = [ '$log', '$compile' ];

    angular.module('plingUi').directive('plgLabelLoadingContent', PlgLabelLoadingContent);
}());

(function () {
    'use strict';

    // creating directive
    function PlgListView($log, $compile) {
        return {
            'restrict': 'E',
            'scope': {
                'params': '=',
                'dynamicForm': '='
            },
            'replace': true,

            // linking directive
            'link': function (scope, element) {

                var builder, compiledElm;

                // validating bind value
                if (scope.params) {
                    builder = {
                        'buildTemplate': function (scope, cb) {
                            var template;

                            template = '<md-list-item layout="row" ng-repeat="item in dynamicForm.isListCollumn" style="border: 0px !important">' +
                                       '    <p flex>' +
                                       '        {{params[item.ref]}}' +
                                       '    </p>' +
                                       '</md-list-item>';

                            cb(null, template);
                            angular.noop(scope);
                        }

                    };

                    // defining template
                    builder.buildTemplate(scope, function (err, template) {

                        // handling error
                        if (err) {
                            $log.warn(err);
                            return;
                        }

                        // compiling template
                        compiledElm = $compile(template)(scope);

                        // handling post compile hooks
                        if (builder.postCompile) {
                            builder.postCompile(compiledElm);
                        }

                        // replacing into DOM
                        element.replaceWith(compiledElm);

                    });
                }
            }
        };
    }

    PlgListView.$inject = [ '$log', '$compile' ];

    angular.module('plingUi').directive('plgListView', PlgListView);
}());

/* global angular */
(function () {
    'use strict';

    // CREATING CONTROLLER
    function plgLoadingLayerController($rootScope) {
        var ctrl = this;

        ctrl.cancelRequest =  function () {
            $rootScope.$broadcast('CANCEL-REQUESTS');
        };
    }

    plgLoadingLayerController.$inject = ['$rootScope'];

    // CREATING COMPONENT WITH BINDINGS
    angular.module('plingUi').component('plgLoadingLayer', {
        'bindings'  : {
            'withLoader'        : '=',
            'withLayer'         : '=',
            'withCancelRequest' : '=',
            'isModalOfModal'    : '='
        },
        'template'    : '<div class="plg-loading-layer" ng-style=" $ctrl.isModalOfModal ? {\'z-index\': 5} : {\'z-index\': 3} " ng-show="$ctrl.withLayer"></div>' +
                        '<div class="load-container" ng-show="$ctrl.withLoader">' +
                            '<md-progress-circular md-mode="indeterminate"  md-diameter="300px" class="plg-loader-position"></md-progress-circular>' +
                            '<div ng-show="$ctrl.withCancelRequest">' +
                                '<md-button class="md-raised plg-button-position" ng-click="$ctrl.cancelRequest();">Cancelar</md-button>' +
                            '</div>' +
                        '</div>',
        'controller' : plgLoadingLayerController
    });
}());

(function(angular, undefined) { // eslint-disable-line
    'use strict';

    var
        bottom, top, right, left, module, getter;

    function createActivationState($parse, attr, scope) {
        function unboundState(initValue) {
            var activated = initValue;

            return {
                'getValue': function() {
                    return activated;
                },
                'setValue': function(value) {
                    activated = value;
                }
            };
        }

        function oneWayBindingState(getter, scope) {
            return {
                'getValue': function() {
                    return getter(scope);
                },
                'setValue': function(){} // eslint-disable-line
            };
        }

        function twoWayBindingState(getter, setter, scope) {
            return {
                'getValue': function() {
                    return getter(scope);
                },
                'setValue': function(value) {
                    if (value !== getter(scope)) {
                        scope.$apply(function() {
                            setter(scope, value);
                        });
                    }
                }
            };
        }

        if (attr !== "") { // eslint-disable-line
            getter = $parse(attr);

            if (getter.assign !== undefined) { // eslint-disable-line
                return twoWayBindingState(getter, getter.assign, scope);
            } else {
                return oneWayBindingState(getter, scope);
            }
        } else {
            return unboundState(true);
        }
    }

    function createDirective(module, attrName, direction) {
        module.directive(attrName, ['$parse', '$window', '$timeout', function($parse, $window, $timeout) {
            return {
                'priority': 1,
                'restrict': 'A',
                'link': function(scope, $el, attrs) {
                    var el = $el[0],
                        activationState = createActivationState($parse, attrs[attrName], scope);

                    function scrollIfGlued() {
                        if (activationState.getValue() && !direction.isAttached(el)) {
                            direction.scroll(el);
                        }
                    }

                    scope.$watch(scrollIfGlued);

                    $timeout(scrollIfGlued, 0, false);

                    $window.addEventListener('resize', scrollIfGlued, false);

                    $el.bind('scroll', function() {
                        activationState.setValue(direction.isAttached(el));
                    });
                }
            };
        }]);
    }

    bottom = {
        'isAttached': function(el) {
            // + 1 catches off by one errors in chrome
            return el.scrollTop + el.clientHeight + 1 >= el.scrollHeight;
        },
        'scroll': function(el) {
            el.scrollTop = el.scrollHeight;
        }
    };

    top = {
        'isAttached': function(el) {
            return el.scrollTop <= 1;
        },
        'scroll': function(el) {
            el.scrollTop = 0;
        }
    };

    right = {
        'isAttached': function(el) {
            return el.scrollLeft + el.clientWidth + 1 >= el.scrollWidth;
        },
        'scroll': function(el) {
            el.scrollLeft = el.scrollWidth;
        }
    };

    left = {
        'isAttached': function(el) {
            return el.scrollLeft <= 1;
        },
        'scroll': function(el) {
            el.scrollLeft = 0;
        }
    };

    module = angular.module('luegg.directives', []);

    createDirective(module, 'plgScroll', bottom);
    createDirective(module, 'plgScrollTop', top);
    createDirective(module, 'plgScrollBottom', bottom);
    createDirective(module, 'plgScrollLeft', left);
    createDirective(module, 'plgScrollRight', right);
}(angular));

(function () {
    function PlgScrollTo(plgScrollToService) {
        return {
            'restrict' : 'AC',
            'compile' : function() {
                return function (scope, element, attr) {
                    if (attr.now) {
                        setTimeout(function () {
                            plgScrollToService.idOrName(attr.plgScrollTo, attr.offset);
                        });
                    } else {
                        element.bind('click', function() {
                            plgScrollToService.idOrName(attr.plgScrollTo, attr.offset);
                        });
                    }
                };
            }
        };
    }
    PlgScrollTo.$inject = ['plgScrollToService'];

    angular.module('plingUi').directive('plgScrollTo', PlgScrollTo);
}());
(function () {
    function PlgScrollToOptions() {
        var top;

        this.options = {
            'handler' : function(el, offset, scrollFromElem) {
                if (offset) {
                    top = el.offsetTop - offset;
                    if (scrollFromElem) {
                        scrollFromElem.scrollTop = top;
                    } else {
                        window.scrollTo(0, top);
                    }
                }
                else {
                    el.scrollIntoView();
                }
            }
        };
        this.$get = function() {
            return this.options;
        };
        this.extend = function(options) {
            this.options = angular.extend(this.options, options);
        };
    }

    angular.module('plingUi').provider('plgScrollToOptions', PlgScrollToOptions);
}());
(function () {
    function PlgScrollToService($window, plgScrollToOptions) {
        this.idOrName = function (idOrName, offset, focus, scrollFrom) {
            var document = $window.document, el, scrollEl;

            if (!idOrName) {
                $window.scrollTo(0, 0);
            }

            if (typeof focus === 'undefined') {
                focus = true;
            }

            el = document.getElementById(idOrName);
            if (!el) {
                el = document.getElementsByName(idOrName);
                el = el && el.length > 0? el[0] : null;
            }

            if (el) {
                if (focus) {
                    el.focus();
                }
                scrollEl = document.getElementById(scrollFrom);
                if (!scrollEl && scrollFrom) {
                    scrollEl = document.getElementsByName(scrollFrom);
                }
                plgScrollToOptions.handler(el, offset, scrollEl);
            }
        };
    }
    PlgScrollToService.$inject = ['$window', 'plgScrollToOptions'];

    angular.module('plingUi').service('plgScrollToService', PlgScrollToService);
}());
(function () {
    'use strict';

    // Injeção de dependências
    plgServiceBarController.$inject = [
        '$scope',
        '$rootScope',
        '$timeout',
        'datetime',
        'credentialsService',
        'applicationsService',
        'coreApiService',
        'websocketService',
        '$location',
        '$localstorage'
    ];

    // Component configuration
    angular.module('plingUi').component('plgServiceBar', {
        'templateUrl' : 'plg-service-bar.html',
        'restrict'      : 'E',
        'controller'  : plgServiceBarController,
        'bindings'    : {}
    });

    // CREATING CONTROLLER
    function plgServiceBarController($scope, $rootScope, $timeout, datetime, credentialsService, applicationsService, coreApiService, websocketService, $location, $localstorage) {

        $scope.arrayNotifications  = [];
        $scope.isNotificationAdded = false;
        $scope.availableSubmenu    = [];

        function getSubmenu (path) {
            var i;

            if ($scope.submenu.length > 0)
                for (i = 0; i < $scope.submenu.length; i += 1)
                    if (path === $scope.submenu[i].parentRoute)
                        $scope.availableSubmenu.push($scope.submenu[i]);
        }

        function getMenuInfo (path) {
            var i;

            if (!path)
                path = $location.path();
            for (i = 0; i < $scope.menu.length; i += 1)
                if ($scope.menu[i].route === path) {
                    $scope.currentMenuIndex = i;
                    break;
                }
        }

        function getSubmenuInfo () {
            var i;

            for (i = 0; i < $scope.availableSubmenu.length; i += 1)
                if ($scope.availableSubmenu[i].route === $location.path()) {
                    $scope.currentSubmenuIndex = i;
                    break;
                }
        }

        $scope.myAccount = function () {
            coreApiService.redirectToControlPanel();
        };

        // Manipula o botão Logout do usuário
        $scope.logout = function () {
            credentialsService.logout();
        };

        $scope.reconnectWebsocket = function () {
            $rootScope.isWebsocketLoading   = false;
            $rootScope.isWebsocketConnected = true;
            websocketService.connect();
        };

        $scope.redirect = function (url) {
            applicationsService.redirect(url);
        };

        // Open Notifications Panel
        $scope.openMenu = function($mdOpenMenu, ev) {
            $mdOpenMenu(ev);
        };

        // Obtém notificações geradas pelo recebimento de message no Websocket
        $rootScope.$on('PLING-WEBSOCKET-NOTIFICATION', function(event, notifications) {
            var i, isExist;

            $timeout(function() {
                $scope.isNotificationAdded = true;

                if (Array.isArray(notifications)) {
                    for (i = 0; i < notifications.length; i += 1) {
                        if (notifications[i].doc) {

                            // Verificar se ja esta no array
                            if ($scope.arrayNotifications.length > 0) {
                                $scope.arrayNotifications.map(function(value) { // eslint-disable-line
                                    if (value._id === notifications[i]._id) {
                                        isExist = true;
                                    }
                                });
                            }

                            if (!isExist || $scope.arrayNotifications.length === 0)
                                $scope.arrayNotifications.push(notifications[i]);
                        }
                    }
                } else if (notifications) {
                    $scope.arrayNotifications.push(notifications);
                }
            });
        });

        $rootScope.$on('PLING-WEBSOCKET-EXTERNAL', function(event, externalData) {
            var doc = {
                'options': {
                    'key': externalData.caller
                },
                'doc': {
                    'description': externalData.message,
                    'data'       : externalData.date
                }
            };

            $timeout(function() {
                $scope.isNotificationAdded = true;
                $scope.arrayNotifications.push(doc);
            });
        });

        // Atualiza a imagem do usuário no topo da barra
        $rootScope.$on('PLING-SERVICE-BAR-USER-IMAGE-UPDATE', function (ev, image) {
            if (ev) {
                $scope.user = $scope.user || {};
                $scope.user.profileImage = image;
            }
        });

        //  MENU
        $scope.menu    = pling.loader.settings.menu;    // eslint-disable-line
        $scope.submenu = pling.loader.settings.submenu; // eslint-disable-line

        // change route on click
        $scope.changeRoute = function (path, isSubmenu) {
            if (isSubmenu)
                $location.path(path);
            else {
                $scope.currentSubmenuIndex = -1;
                $scope.availableSubmenu = [];

                getMenuInfo(path);
                getSubmenu(path);
                getSubmenuInfo();

                // Se não tem submenu OU Tem submenu e tem conteudo (hasContent) redireciona para conteudo.
                if ($scope.availableSubmenu.length === 0 || $scope.availableSubmenu && $scope.availableSubmenu[0].config.hasContent)
                    $location.path(path);
            }
        };

        $scope.$on('$routeChangeSuccess', function () {
            $scope.currentSubmenuIndex = -1;
            $scope.availableSubmenu = [];
            getMenuInfo('/' + $location.path().split('/')[1]);
            getSubmenu('/' + $location.path().split('/')[1]);
            getSubmenuInfo();
        });

        // Inicialização da Barra
        (function () {

            var localUser = credentialsService.getLocal();

            $rootScope.$emit('PLING-SERVICE-BAR-ISLOADING', true);

            credentialsService.getProfileImage(localUser.imageDriveId, function(profileImageData) {
                $scope.user = credentialsService.getLocal();

                if (profileImageData)
                    $scope.user.profileImage = profileImageData;

                $localstorage.set('PLING-USER', JSON.stringify($scope.user));

                $scope.currentAppModule = applicationsService.getCurrentAppModule();
                $scope.customerName     = localUser.customerName;

                // Websocket pipe start
                websocketService.connect($scope.user);

                $rootScope.$emit('PLING-SERVICE-BAR-ISLOADING', false);
            });

        }());
    }
}());

/* global angular */
(function () {
    'use strict';

    angular.module('plingUi').directive('plgSetFocus', [ '$parse', '$timeout', function ($parse, $timeout) {

        return {
            'restrict'    : 'A',
            'replace'     : true,
            'link'        : function ($scope, element, attrs) {

                var model = $parse(attrs.plgSetFocus);

                $scope.$watch(model, function (value) {
                    if (value === true) {
                        $timeout(function () {
                            element[0].focus();
                        });
                    }
                });

                element.bind('blur', function () {
                    $scope.$apply(model.assign($scope, false));
                });

            }
        };
    }]);
}());

(function () {

    angular.module('plingUi').directive('plgSimpleCombo', PlgSimpleComboCtrl);

    PlgSimpleComboCtrl.$inject = ['plgSimpleComboFactory'];

    function PlgSimpleComboCtrl(plgSimpleComboFactory) {
        return {
            'restrict': 'E',
            'scope': {
                'items'   : '=',
                'ngModel' : '=',
                'options' : '=?',
                'class'   : '@',
                'label'   : '@',
                'onClose' : '&?',
                'onChange': '&?',
                'multiple': '@?'
            },
            'templateUrl' : 'plgSimpleCombo.html',
            'compile': function compile(tElement, scope) {

                /* hack: remove atributo multiple do md-select antes da renderizacao do html. */
                if (tElement[0].children[0].children[1].hasAttribute('multiple') && scope.multiple === undefined) // eslint-disable-line no-undefined
                    tElement[0].children[0].children[1].removeAttribute('multiple');

                return {
                    'pre': function(scope) {
                        plgSimpleComboFactory.init(scope);
                    },
                    'post': function(scope, element) {
                        scope.getSelectedText = plgSimpleComboFactory.getSelectedText.bind(scope);

                        scope.onHandler = plgSimpleComboFactory.onHandler.bind(scope);

                        scope.$watch('ngModel', plgSimpleComboFactory.buildNGModel.bind(scope));

                        element.find('input').on('keydown', function(ev) {
                            ev.stopPropagation();
                        });
                    }
                };
            }
        };
    }
}());

(function () {
    'use strict';

    angular.module('plingUi').factory('plgSimpleComboFactory', PlgSimpleComboFactory);

    function PlgSimpleComboFactory() {

        function getTrackBy(scope) {
            var trackBy = scope.items[0].id ? 'id' : '_id';

            if (!scope.isArrayOfObjects) {
                return false;
            }

            return scope.items[0][trackBy] ? trackBy : scope.options.refName;
        }

        function every(a, b, cb) {
            var i, j, stop;

            for (i = a.length - 1; i >= 0; i--) {
                for (j = b.length - 1; j >= 0; j--) {
                    stop = cb(i, j, false);
                    if (stop > 0) {
                        break;
                    }
                }
                if (stop > 1) {
                    break;
                }
            }
        }

        return {
            'init': function init(scope) {
                scope.ngModel          = scope.ngModel || [];
                scope.ngModelCopy      = angular.copy(scope.ngModel);
                scope.options          = scope.options || {};
                scope.options.refName  = scope.options.refName || 'name';
                scope.isArrayOfObjects = scope.items && scope.items.length > 0 && typeof scope.items[0] === 'object';
                scope.onClose          = scope.onClose  || angular.noop;
                scope.onChange         = scope.onChange || angular.noop;

                if (scope.isArrayOfObjects) {
                    scope.trackBy = { 'trackBy': '$value.' + getTrackBy(scope) };
                } else {
                    scope.trackBy = { 'trackBy': '$value' };
                }
            },
            'getSelectedText': function () {
                if (this.multiple === undefined) // eslint-disable-line no-undefined
                    return this.ngModel.name;

                if (this.ngModel && this.ngModel.length > 0) {
                    if (this.ngModel.length > 1) {
                        return this.ngModel.length + ' Selecionados';
                    }
                    return this.isArrayOfObjects ? this.ngModel[0][this.options.refName] : this.ngModel[0];
                }
                return this.label;
            },
            'buildNGModel': function buildNGModel(ngModel) {
                var pk, self = this;

                if (ngModel && ngModel.length > 0 && this.items && this.items.length > 0 && this.isArrayOfObjects) {

                    pk = getTrackBy(this);

                    every(ngModel, self.items, function (i, j) {
                        if (ngModel[i][pk] === self.items[j][pk]) {
                            ngModel[i] = self.items[j];
                            return 1;
                        }
                        return 0;
                    });
                }
            },
            'onHandler': function onHandler() {
                var isChanged = false, self = this, trackBy, pk, fk;

                trackBy = getTrackBy(self);

                 /* combo simples de objetos */
                if (!self.multiple && self.ngModel[trackBy] !== self.ngModelCopy[trackBy])
                    isChanged =  true;

                else if (self.ngModel.length !== self.ngModelCopy.length) {
                    isChanged = true;
                }
                 else {

                    every(self.ngModelCopy, self.ngModel, function (i, j) {
                        pk = trackBy ? self.ngModelCopy[i][trackBy] : self.ngModelCopy[i];
                        fk = trackBy ? self.ngModel[j][trackBy]     : self.ngModel[j];

                        isChanged = true;
                        if (pk === fk) {
                            isChanged = false;
                            return 1;
                        }
                        return j === 0 && isChanged ? 2 : 0;
                    });
                }

                if (isChanged) {
                    this.ngModelCopy = angular.copy(this.ngModel);
                    return this.onChange();
                }

                return this.onClose();
            }
        };
    }
}());

var module = angular.module('plingUi');

function TimePickerCtrl($scope, $mdDialog, time, autoSwitch, $mdMedia) {
    var self = this;

    this.VIEW_HOURS = 1;
    this.VIEW_MINUTES = 2;
    this.currentView = this.VIEW_HOURS;
    this.time = moment(time);
    this.autoSwitch = !!autoSwitch;

    this.clockHours     = parseInt(this.time.format('h'), 10);
    this.clockMinutes   = parseInt(this.time.minutes(), 10);

    $scope.$mdMedia = $mdMedia;

    this.switchView = function() {
        self.currentView = self.currentView === self.VIEW_HOURS ? self.VIEW_MINUTES : self.VIEW_HOURS;
    };

    this.setAM = function() {
        if (self.time.hours() >= 12)
            self.time.hour(self.time.hour() - 12);
    };

    this.setPM = function() {
        if (self.time.hours() < 12)
            self.time.hour(self.time.hour() + 12);
    };

    this.cancel = function() {
        $mdDialog.cancel();
    };

    this.confirm = function() {
        $mdDialog.hide(this.time.toDate());
    };
}

function ClockCtrl() {
    var TYPE_HOURS = 'hours';
    var TYPE_MINUTES = 'minutes';
    var self = this;

    this.STEP_DEG = 360 / 12;
    this.steps = [];

    this.CLOCK_TYPES = {
        'hours': {
            'range': 12
        },
        'minutes': {
            'range': 60
        }
    };

    this.getPointerStyle = function() {
        var divider = 1, degrees;

        switch (self.type) {
        case TYPE_HOURS:
            divider = 12;
            break;
        case TYPE_MINUTES:
            divider = 60;
            break;
        }
        degrees = Math.round(self.selected * (360 / divider)) - 180;
        return {
            '-webkit-transform': 'rotate(' + degrees + 'deg)',
            '-ms-transform': 'rotate(' + degrees + 'deg)',
            'transform': 'rotate(' + degrees + 'deg)'
        };
    };

    this.setTimeByDeg = function(deg) {
        var divider = 0;

        deg = deg >= 360 ? 0 : deg;
        switch (self.type) {
        case TYPE_HOURS:
            divider = 12;
            break;
        case TYPE_MINUTES:
            divider = 60;
            break;
        }

        self.setTime(
            Math.round(divider / 360 * deg)
        );
    };

    this.setTime = function(time) {
        this.selected = time;

        switch (self.type) {
        case TYPE_HOURS:
            if (self.time.format('A') === 'PM') time += 12;
            this.time.hours(time);
            break;
        case TYPE_MINUTES:
            if (time > 59) time -= 60;
            this.time.minutes(time);
            break;
        }

    };

    this.init = function() {
        var i;

        self.type = self.type || 'hours';
        switch (self.type) {
        case TYPE_HOURS:
            for (i = 1; i <= 12; i++)
                self.steps.push(i);
            self.selected = self.time.hours() || 0;
            if (self.selected > 12) self.selected -= 12;

            break;
        case TYPE_MINUTES:
            for (i = 5; i <= 55; i+=5)
                self.steps.push(i);
            self.steps.push(0);
            self.selected = self.time.minutes() || 0;

            break;
        }
    };

    this.init();
}

module.directive('mdpClock', ['$animate', '$timeout', function($animate, $timeout) {
    return {
        'restrict': 'E',
        'bindToController': {
            'type': '@?',
            'time': '=',
            'autoSwitch': '=?'
        },
        'replace': true,
        'template': '<div class="plgTimePicker-clock">' +
                        '<div class="plgTimePicker-clock-container">' +
                            '<md-toolbar class="plgTimePicker-clock-center md-primary"></md-toolbar>' +
                            '<md-toolbar ng-style="clock.getPointerStyle()" class="plgTimePicker-pointer md-primary">' +
                                '<span class="plgTimePicker-clock-selected md-button md-raised md-primary"></span>' +
                            '</md-toolbar>' +
                            '<md-button ng-class="{ \'md-primary\': clock.selected == step }" class="md-icon-button md-raised plgTimePicker-clock-deg{{ ::(clock.STEP_DEG * ($index + 1)) }}" ng-repeat="step in clock.steps" ng-click="clock.setTime(step)">{{ step }}</md-button>' +
                        '</div>' +
                    '</div>',
        'controller': ['$scope', ClockCtrl],
        'controllerAs': 'clock',
        'link': function(scope, element, attrs, ctrl) {
            var timepickerCtrl = scope.$parent.timepicker;

            var onEvent = function(event) {
                var containerCoords = event.currentTarget.getClientRects()[0];
                var x = event.currentTarget.offsetWidth / 2 - (event.pageX - containerCoords.left),
                    y = event.pageY - containerCoords.top - event.currentTarget.offsetHeight / 2;

                var deg = Math.round(Math.atan2(x, y) * (180 / Math.PI));

                $timeout(function() {
                    ctrl.setTimeByDeg(deg + 180);
                    if (ctrl.autoSwitch && ['mouseup', 'click'].indexOf(event.type) !== -1 && timepickerCtrl) timepickerCtrl.switchView();
                });
            };

            element.on('mousedown', function() {
                element.on('mousemove', onEvent);
            });

            element.on('mouseup', function() {
                element.off('mousemove');
            });

            element.on('click', onEvent);
            scope.$on('$destroy', function() {
                element.off('click', onEvent);
                element.off('mousemove', onEvent);
            });
        }
    };
}]);

module.provider('$mdpTimePicker', function() {
    var LABEL_OK = 'Selecionar',
        LABEL_CANCEL = 'Cancelar';

    this.setOKButtonLabel = function(label) {
        LABEL_OK = label;
    };

    this.setCancelButtonLabel = function(label) {
        LABEL_CANCEL = label;
    };

    this.$get = ['$mdDialog', function($mdDialog) {
        var timePicker = function(time, options) {
            if (!angular.isDate(time)) time = Date.now();
            if (!angular.isObject(options)) options = {};

            return $mdDialog.show({
                'controller':  ['$scope', '$mdDialog', 'time', 'autoSwitch', '$mdMedia', TimePickerCtrl],
                'controllerAs': 'timepicker',
                'clickOutsideToClose': true,
                'template': '<md-dialog aria-label="" class="plgTimePicker-timepicker" ng-class="{ \'portrait\': !$mdMedia(\'gt-xs\') }">' +
                            '<md-dialog-content layout-gt-xs="row" layout-wrap>' +
                                '<md-toolbar layout-gt-xs="column" layout-xs="row" layout-align="center center" flex class="plgTimePicker-timepicker-time md-primary">' +
                                    '<div class="plgTimePicker-timepicker-selected-time">' +
                                        '<span ng-class="{ \'active\': timepicker.currentView == timepicker.VIEW_HOURS }" ng-click="timepicker.currentView = timepicker.VIEW_HOURS">{{ timepicker.time.format("h") }}</span>:' +
                                        '<span ng-class="{ \'active\': timepicker.currentView == timepicker.VIEW_MINUTES }" ng-click="timepicker.currentView = timepicker.VIEW_MINUTES">{{ timepicker.time.format("mm") }}</span>' +
                                    '</div>' +
                                    '<div layout="column" class="plgTimePicker-timepicker-selected-ampm">' +
                                        '<span ng-click="timepicker.setAM()" ng-class="{ \'active\': timepicker.time.hours() < 12 }">AM</span>' +
                                        '<span ng-click="timepicker.setPM()" ng-class="{ \'active\': timepicker.time.hours() >= 12 }">PM</span>' +
                                    '</div>' +
                                '</md-toolbar>' +
                                '<div>' +
                                    '<div class="plgTimePicker-clock-switch-container" ng-switch="timepicker.currentView" layout layout-align="center center">' +
                                        '<mdp-clock class="plgTimePicker-animation-zoom" auto-switch="timepicker.autoSwitch" time="timepicker.time" type="hours" ng-switch-when="1"></mdp-clock>' +
                                        '<mdp-clock class="plgTimePicker-animation-zoom" auto-switch="timepicker.autoSwitch" time="timepicker.time" type="minutes" ng-switch-when="2"></mdp-clock>' +
                                    '</div>' +

                                    '<md-dialog-actions layout="row">' +
                                        '<span flex></span>' +
                                        '<md-button ng-click="timepicker.cancel()" aria-label="' + LABEL_CANCEL + '">' + LABEL_CANCEL + '</md-button>' +
                                        '<md-button ng-click="timepicker.confirm()" class="md-primary" aria-label="' + LABEL_OK + '">' + LABEL_OK + '</md-button>' +
                                    '</md-dialog-actions>' +
                                '</div>' +
                            '</md-dialog-content>' +
                        '</md-dialog>',
                'targetEvent': options.targetEvent,
                'locals': {
                    'time': time,
                    'autoSwitch': options.autoSwitch
                },
                'skipHide': true
            });
        };

        return timePicker;
    }];
});

module.directive('mdpTimePicker', ['$mdpTimePicker', function($mdpTimePicker) {
    return  {
        'restrict': 'E',
        'require': 'ngModel',
        'replace': true,
        'transclude': true,
        'template': function(element, attrs) {
            var noFloat = angular.isDefined(attrs.mdpNoFloat),
                placeholder = angular.isDefined(attrs.mdpPlaceholder) ? attrs.mdpPlaceholder : '',
                openOnClick = angular.isDefined(attrs.mdpOpenOnClick) ? true : false;

            return  '<md-input-container class="md-icon-float md-block" ' + (noFloat ? ' md-no-float' : '') + ' md-is-error="isError()" style="position:relative;">' +
                        '<label ng-if="label">{{label}}</label>' +
                        '<md-icon class="material-icons plgTimePicker-clock-button" ng-click="showPicker($event)"' + (angular.isDefined(attrs.mdpDisabled) ? ' ng-disabled="disabled"' : '') + '>access_time</md-icon>'+
                        '<input type="{{ ::type }}"' + (angular.isDefined(attrs.mdpDisabled) ? ' ng-disabled="disabled"' : '') + ' aria-label="' + placeholder + '" placeholder="' + placeholder + '"' + (openOnClick ? ' ng-click="showPicker($event)" ' : '') + ' />' +
                        '<!--md-button class="md-icon-button plgTimePicker-clock-button" ng-click="showPicker($event)"' + (angular.isDefined(attrs.mdpDisabled) ? ' ng-disabled="disabled"' : '') + '>' +
                            '<md-icon>access_time</md-icon>' +
                        '</md-button-->' +
                    '</md-input-container>';
        },
        'scope': {
            'timeFormat': '@mdpFormat',
            'placeholder': '@mdpPlaceholder',
            'autoSwitch': '=?mdpAutoSwitch',
            'label': '@',
            'disabled': '=?mdpDisabled'
        },
        'link': function(scope, element, attrs, ngModel, $transclude) {
            var inputElement = angular.element(element[0].querySelector('input')),
                inputContainer = angular.element(element[0]),
                inputContainerCtrl = inputContainer.controller('mdInputContainer'),
                messages;

            $transclude(function(clone) {
                inputContainer.append(clone);
            });

            messages = inputContainer && inputContainer.length > 0 ? angular.element(inputContainer[0].querySelector('[ng-messages]')) : {};

            scope.type = scope.timeFormat ? 'text' : 'time';
            scope.timeFormat = scope.timeFormat || 'HH:mm';
            scope.autoSwitch = scope.autoSwitch || false;

            scope.$watch(function() { return ngModel.$error; }, function() {
                inputContainerCtrl.setInvalid(!ngModel.$pristine && !!Object.keys(ngModel.$error).length);
            }, true);

            // update input element if model has changed
            ngModel.$formatters.unshift(function(value) {
                var time = angular.isDate(value) && moment(value);

                if (time && time.isValid())
                    updateInputElement(time.format(scope.timeFormat));
                else
                    updateInputElement(null);
            });

            ngModel.$validators.format = function(modelValue, viewValue) {
                return !viewValue || angular.isDate(viewValue) || moment(viewValue, scope.timeFormat, true).isValid();
            };

            ngModel.$validators.required = function(modelValue, viewValue) {
                return angular.isUndefined(attrs.required) || !ngModel.$isEmpty(modelValue) || !ngModel.$isEmpty(viewValue);
            };

            ngModel.$parsers.unshift(function(value) {
                var parsed = moment(value, scope.timeFormat, true), originalModel;

                if (parsed.isValid()) {
                    if (angular.isDate(ngModel.$modelValue)) {
                        originalModel = moment(ngModel.$modelValue);

                        originalModel.minutes(parsed.minutes());
                        originalModel.hours(parsed.hours());
                        originalModel.seconds(parsed.seconds());

                        parsed = originalModel;
                    }
                    return parsed.toDate();
                } else
                    return null;
            });

            // update input element value
            function updateInputElement(value) {
                inputElement[0].value = value;
                inputContainerCtrl.setHasValue(!ngModel.$isEmpty(value));
            }

            function updateTime(time) {
                var value = moment(time, angular.isDate(time) ? null : scope.timeFormat, true),
                    strValue = value.format(scope.timeFormat);

                if (value.isValid()) {
                    updateInputElement(strValue);
                    ngModel.$setViewValue(strValue);
                } else {
                    updateInputElement(time);
                    ngModel.$setViewValue(time);
                }

                if (!ngModel.$pristine &&
                    messages.hasClass('md-auto-hide') &&
                    inputContainer.hasClass('md-input-invalid')) messages.removeClass('md-auto-hide');

                ngModel.$render();
            }

            scope.showPicker = function(ev) {
                $mdpTimePicker(ngModel.$modelValue, {
                    'targetEvent': ev,
                    'autoSwitch': scope.autoSwitch
                }).then(function(time) {
                    updateTime(time, true);
                });
            };

            function onInputElementEvents(event) {
                if (event.target.value !== ngModel.$viewVaue)
                    updateTime(event.target.value);
            }

            inputElement.on('reset input blur', onInputElementEvents);

            scope.$on('$destroy', function() {
                inputElement.off('reset input blur', onInputElementEvents);
            });
        }
    };
}]);

module.directive('mdpTimePicker', ['$mdpTimePicker', function($mdpTimePicker) {
    return  {
        'restrict': 'A',
        'require': 'ngModel',
        'scope': {
            'timeFormat': '@mdpFormat',
            'autoSwitch': '=?mdpAutoSwitch'
        },
        'link': function(scope, element, attrs, ngModel) {
            scope.format = scope.format || 'HH:mm';
            function showPicker(ev) {
                $mdpTimePicker(ngModel.$modelValue, {
                    'targetEvent': ev,
                    'autoSwitch': scope.autoSwitch
                }).then(function(time) {
                    ngModel.$setViewValue(moment(time).format(scope.format));
                    ngModel.$render();
                });
            }

            element.on('click', showPicker);

            scope.$on('$destroy', function() {
                element.off('click', showPicker);
            });
        }
    };
}]);

/* global angular, console, document, $, window */
(function () {
    'use strict';

    // creating directive
    function PlgToolbarList($log, $compile, $rootScope) {
        return {
            'restrict': 'E',
            'scope': {
                'chkList': '=',
                'checkedItens': '='
            },
            'replace': true,

            // linking directive
            'link': function (scope, element) {

                var builder, compiledElm;

                // validating bind value
                if (scope.chkList) {
                    builder = {
                        'buildTemplate': function (scope, cb) {
                            var template;


                            scope.chkItens    = this.chkItens;

                            template = '<div class="label">' +
                                       '    <small><font color="#5c99ff">{{chkList.length}} selecionado<span ng-show="chkList.length > 1">s</span> </font></small>' +
                                       '</div>' +
                                       '<md-menu md-offset="13 50">' +
                                       '    <md-button aria-label="selecione" class="md-icon-button containerIconSeta" ng-click="$mdOpenMenu($event);" md-prevent-menu-close="md-prevent-menu-close">' +
                                       '        <md-icon class="iconSeta">arrow_drop_down</md-icon>' +
                                       '    </md-button>' +
                                       '    <md-menu-content layout="column" layout-wrap width="3">' +
                                       '        <md-menu-item flex ng-show="module" class="filterDataTableItem">' +
                                       '            <p><font color="#959595" style="font-size: 13px !important">Alterar Status</font></p>' +
                                       '        </md-menu-item>' +
                                       '        <md-menu-item flex ng-repeat="item in checkedItens" class="filterDataTableItem">' +
                                       '            <md-button ng-click="chkItens(item.value)">' +
                                       '                <font color="#505050" size="2">{{item.label}}</font>' +
                                       '            </md-button>' +
                                       '        </md-menu-item>' +
                                       '    </md-menu-content>' +
                                       '</md-menu>';

                            cb(null, template);
                        },

                        // $on in directive "plgPeopleList"
                        'chkItens': function (val) {
                            $rootScope.$broadcast('checkedAllItens', val);
                        }

                    };

                    // defining template
                    builder.buildTemplate(scope, function (err, template) {

                        // handling error
                        if (err) {
                            $log.warn(err);
                            return;
                        }

                        // compiling template
                        compiledElm = $compile(template)(scope);

                        // handling post compile hooks
                        if (builder.postCompile) {
                            builder.postCompile(compiledElm);
                        }

                        // replacing into DOM
                        element.replaceWith(compiledElm);

                    });
                }
            }
        };
    }

    // injecting dependencies
    PlgToolbarList.$inject = ['$log', '$compile', '$rootScope'];

    // registering into angular
    angular.module('plingUi').directive('plgToolbarList', PlgToolbarList);
}());

(function () {

    'use strict';

    function ApplicationsService($window, $localstorage, httpService, tokenService) {

        this.getLocal = function() {
            var localAppData = $localstorage.get('PLING-APPS');

            localAppData = localAppData ? JSON.parse(localAppData) : {};
            return localAppData;
        };

        this.getCurrentAppModule = function() {
            var currentAppModule = $localstorage.get('PLING-CURRENT-APP');

            return currentAppModule;
        };

        this.getCurrentApp = function() {
            var currentApp = {
                'appModule': $localstorage.get('PLING-CURRENT-APP'),
                'env': $localstorage.get('PLING-CURRENT-ENV')
            };

            return currentApp;
        };

        this.getCallbackUrl = function(appId, cb) {
            httpService.post('accounts', '_oauth', { 'appid': appId })
                .success(function (data) {
                    if (data.callbackUrl) {
                        cb(null, data.callbackUrl + '?token=' + tokenService.get());
                    } else {
                        cb('Callback url not found');
                    }
                })
                .error(function (reason) {
                    cb(reason || 'Server Unavailable', null);
                });
        };

        this.redirect = function(url) {
            $window.location.href = url;
        };

    }

    ApplicationsService.$inject = [ '$window', '$localstorage', 'httpService', 'tokenService' ];

    angular.module('plingUi').service('applicationsService', ApplicationsService);

}());

(function () {
    'use strict';

    function CepService(httpService) {

        this.getCep = function (cep) {
            return httpService.get('smart', 'cep', cep);
        };
    }

    CepService.$inject = [ 'httpService' ];

    angular.module('plingUi').service('cepService', CepService);

}());


(function () {
    'use strict';

    CoreApiService.$inject = [ 'boot.options', '$window', '$rootScope', '$http' ];

    angular.module('plingUi').service('coreApiService', CoreApiService);

    function CoreApiService(options, $window, $rootScope, $http) {

        var self = this;

        /*
        *  url do core obtido do conf.json da aplicacao corrente concatenado com parametros
        * @param {string} nome da aplicacao. ex: 'accounts', 'drive', 'integra'
        * @param {string} nome do modulo. ex: 'contactPreferences', 'users/list'.
        * @returns {string} concatenacao da url do core com parametros.
        */
        this.getAppCoreUrl = function (app, module) {
            var url;

            url = options.core_url + options.def_api_version;

            url += app ? '/' + app : '';
            url += module ? '/' + module : '';

            return url;
        };

        // Returns Application name capitalizing the first letter with UpperCase
        this.getApplicationName = function () {
            return options.def_api_app.charAt(0).toUpperCase() + options.def_api_app.slice(1);
        };

        this.redirectToLoginWithCallback = function(callbackUrl) {
            var callbackQueryString;

            $rootScope.$emit('PLING-SERVICE-BAR-ISLOADING', true);

            // Seta callback url
            callbackQueryString = callbackUrl ? '?callbackurl=' + callbackUrl : '';

            // Busca a URL do login por ambiente (conf.json)
            $http.get(self.getAppCoreUrl('accounts', 'products/Login/' + options.environment))
                .success(function(data) {
                    if (data)
                        $window.location.href = data.callbackUrl + callbackQueryString;
                })
                .error(function() {
                    $rootScope.toast('Erro ao obter URL para aplicação de Login');
                    $rootScope.$emit('PLING-SERVICE-BAR-ISLOADING', false);
                    return false;
                });
        };

        this.redirectToControlPanel = function() {
            $rootScope.$emit('PLING-SERVICE-BAR-ISLOADING', true);

            $http.get(self.getAppCoreUrl('accounts', 'products/Painel/' + options.environment))
                .success(function(data) {
                    if (data)
                        $window.location.href = data.callbackUrl;
                })
                .error(function() {
                    $rootScope.toast('Erro ao obter URL para Minha Conta');
                    $rootScope.$emit('PLING-SERVICE-BAR-ISLOADING', false);
                    return false;
                });
        };
    }

}());

(function () {

    'use strict';

    CredentialsService.$inject = [
        'httpService', '$localstorage', 'driveService', 'coreApiService', '$location' ];

    angular.module('plingUi').service('credentialsService', CredentialsService);

    function CredentialsService(httpService, $localstorage, driveService, core, $location) {

        this.logout = function () {
            // Consumir o Core para o token entrar em Blacklist
            httpService.post('accounts', 'logout')
                .success(function() {
                    $localstorage.clearAll();
                    core.redirectToLoginWithCallback();
                })
                .error(function(reason) {
                    // Chamar Toastr
                    console.log(reason); // eslint-disable-line no-console
                });
        };

        this.get = function (id, cb) {
            httpService.get('accounts', 'credentials', id ? id : '')
            .success(function (data) {
                cb(null, data);
            })
            .error(function (reason) {
                cb(reason);
            });
        };

        this.create = function (user) {
            return httpService
                .post('accounts', 'credentials', user);
        };

        this.update = function (user, cb) {
            httpService.put('accounts', 'credentials', user)
                .success(function (data) {
                    cb(null, data);
                })
                .error(function (reason) {
                    cb(reason);
                });
        };

        this.delete = function (userId, cb) {
            httpService.delete('accounts', 'credentials/delete', userId)
                .success(function (data) {
                    cb(null, data);
                })
                .error(function (reason) {
                    cb(reason);
                });
        };

        this.getLocal = function () {
            var userData = $localstorage.get('PLING-USER');

            if (!userData) return null;

            userData = JSON.parse(userData);
            return userData;
        };

        this.getProfileImage =  function (imageDriveId, cb) {
            var type = 'base64';

            if (!imageDriveId)
                return cb(null);

            driveService.getFile(imageDriveId, type)
                .success(function(data) {
                    return cb(data);
                })
                .error(function() {
                    return cb(null);
                });

        };

        this.setViewPreference = function (view, cb) {
            var currentApp, currentModule;

            cb = cb || function () {};

            currentApp = JSON.parse($localstorage.get('PLING-APPS')).filter(function(appItem) {
                return appItem.appModule === $localstorage.get('PLING-CURRENT-APP');
            });

            currentModule = JSON.parse($localstorage.get('PLING-MODULES')).filter(function(moduleItem) {
                return moduleItem.route === $location.path();
            });

            if (currentApp.length === 0 || currentModule.length === 0)
                return cb('Modulo não encontrado');

            httpService.post('accounts', 'credentials/view-preference', { 'module_id': currentModule[0]._id, 'product_id': currentApp[0]._id, 'viewPreference': view })
                .success(function(viewPreference) {
                    var items = JSON.parse($localstorage.get('PLING-CURRENT-VIEW-PREFERENCES'));

                    if (items.length > 0) {
                        items.map(function(item) {
                            if (item.product_id === currentApp[0]._id && item.module_id === currentModule[0]._id)
                                item.viewPreference = viewPreference.viewPreference;

                            return item;
                        });
                    } else {
                        items.push(viewPreference);
                    }

                    $localstorage.set('PLING-CURRENT-VIEW-PREFERENCES', JSON.stringify(items));

                    cb(null, viewPreference);
                })
                .error(function (reason) {
                    cb(reason);
                });
        };

        this.getViewPreference = function() {
            var currentApp, currentModule, viewPreferences;

            viewPreferences = $localstorage.get('PLING-CURRENT-VIEW-PREFERENCES');
            if (!viewPreferences)
                return null;

            currentApp = JSON.parse($localstorage.get('PLING-APPS')).filter(function(appItem) {
                return appItem.appModule === $localstorage.get('PLING-CURRENT-APP');
            });

            currentModule = JSON.parse($localstorage.get('PLING-MODULES')).filter(function(moduleItem) {
                return moduleItem.route === $location.path();
            });

            if (currentApp.length === 0 || currentModule.length === 0)
                return null;

            viewPreferences = JSON.parse(viewPreferences).filter(function(item) {
                return currentApp[0]._id === item.product_id && currentModule[0]._id === item.module_id;
            });

            if (viewPreferences.length > 0)
                return viewPreferences[0].viewPreference;

            return null;
        };

    }

}());

(function () {
    'use strict';

    function DriveService(httpService) {

        this.getFile = function(imageDriveId, type) {
            return httpService.get('drive', '', imageDriveId + '/' + type);
        };

        this.getTree = function (credential_id) {
            return httpService.get('drive', credential_id);
        };

    }

    DriveService.$inject = [ 'httpService' ];

    angular.module('plingUi').service('driveService', DriveService);

}());

(function() {
    'use strict';

    angular
        .module('plingUi')
        .service('elasticSearchApiService', ElasticSearchApi);

    ElasticSearchApi.$inject = ['httpService'];

    function ElasticSearchApi(httpService) {

        this.getDocument = getDocument;
        this.suggest     = suggest;

        /**
         * Get a document by id
         * @param {String} index Index name
         * @param {String} entity Type name
         * @param {String} id primarykey
         * @param {Function} cb callback
         * @public
         */
        function getDocument(index, entity, id, cb) {
            if (index && entity) {
                httpService.get('smart', buildUrl(index, entity), id ? id : '').success(function (data) {
                    cb(null, data);
                }).error(function (reason) {
                    cb(reason);
                });
            } else {
                cb(new Error('ElasticSearch paramenters missed'));
            }
        }

        /**
         * Get documents by a suggest query
         * @param {String} index Index name
         * @param {String} entity Type name
         * @param {String} term Search term
         * @param {String[]|null} source Fields to return
         * @param {Object[]|null} additionalQuery API query
         * @param {Integer} size Limit documents
         * @param {Function} cb callback
         * @public
         */
        function suggest(index, entity, term, source, additionalQuery, size, cb) {

            if (term && index && entity) {
                httpService.post('smart', buildUrl(index, entity + '/suggest/'), {
                    'term'            : term,
                    'source'          : source,
                    'additionalQuery' : additionalQuery,
                    'size'            : size
                }).success(function (data) {
                    data = data && data.hits && data.hits.hits ? data.hits.hits : [];
                    cb(null, data);
                }).error(function (reason) {
                    cb(reason);
                });
            } else {
                cb(new Error('ElasticSearch paramenters missed'));
            }
        }

        /**
         * Build ElasticSearch api url
         * @param {String} index Index name
         * @param {String} entity Type name
         * @returns {String} complete url
         */
        function buildUrl(index, entity) {
            return 'elastic/' + index + '/' + entity;
        }
    }

}());
(function () {
    'use strict';

    function HttpHelperService($http, core, $q) {

        var groups = {};

        this.registerUrl = function (url, groupName) {
            var defer;

            if (!groupName)
                groupName = 'default';

            if (!groups[groupName]) {
                defer = $q.defer();
                groups[groupName] = defer;
            } else
                defer = groups[groupName];

            return defer.promise;
        };

        this.cancelRequest = function (groupName) {
            if (!groupName)
                groupName = 'default';

            groups[groupName].resolve('cancelled');
            delete groups[groupName];
        };
    }

    HttpHelperService.$inject = [ '$http', 'coreApiService', '$q' ];

    angular.module('plingUi').service('httpHelperService', HttpHelperService);

}());

(function () {
    'use strict';

    function HttpService($http, core) {

        this.save = function (app, module, data) {
            return $http.post(core.getAppCoreUrl(app, module), data);
        };

        this.update = function (app, module, data) {
            return $http.put(core.getAppCoreUrl(app, module), data);
        };

        this.upload = function (app, module, file) {
            return $http
               .post(core.getAppCoreUrl(app, module), file, {
                   'transformRequest' : angular.identity,
                   'headers'          : { 'Content-Type': undefined }  // eslint-disable-line
               });
        };

        this.get = function (app, module, id) {
            var url = core.getAppCoreUrl(app, module),
                type;

            if (id) {
                url += '/' + id;
            } else if (module.indexOf('public') > 0) {
                type = {
                    'responseType': 'arraybuffer'
                };
            }
            return $http.get(url, type);
        };

        this.getImage = function (url, cb) {
            this.get('credentials/public?imagepath=' + url)
                .success(function (imageDownloadData) {
                    var blob   = new Blob([ imageDownloadData ], { 'type': 'image/jpeg' }),
                        reader = new FileReader();

                    reader.readAsDataURL(blob);
                    reader.onloadend = function () {
                        cb(null, reader.result);
                    };
                    // cb(null, objectUrl);
                })
                .error(function (err) {
                    cb(err);
                });
        };

        this.post = function (app, module, data) {
            var req = {
                'method'  : 'POST',
                'url'     : core.getAppCoreUrl(app, module),
                'headers' : {
                    'Content-Type': 'application/json'
                },
                'data': data
            };

            return $http(req);
        };

        this.put = function (app, module, data) {
            var req = {
                'method'  : 'PUT',
                'url'     : core.getAppCoreUrl(app, module),
                'headers' : {
                    'Content-Type': 'application/json'
                },
                'data': data
            };

            return $http(req);
        };

        this.delete = function (app, module, id) {
            var req = {
                'method'  : 'DELETE',
                'url'     : core.getAppCoreUrl(app, module) + '/' + id,
                'headers' : {
                    'Content-Type': 'application/json'
                }
            };

            return $http(req);
        };

    }

    HttpService.$inject = [ '$http', 'coreApiService', 'httpHelperService' ];

    angular.module('plingUi').service('httpService', HttpService);

}());

(function () {

    'use strict';

    function ProfilesService(httpService) {

        this.getProfileDefault = function (cb) {
            httpService.get('accounts', 'profiles/profile-default')
            .success(function (data) {
                cb(null, data);
            })
            .error(function (reason) {
                cb(reason);
            });
        };

    }

    ProfilesService.$inject = [
        'httpService' ];

    angular.module('plingUi').service('profilesService', ProfilesService);

}());

(function () {
    'use strict';

    function TokenService($http, $localstorage, coreApiService) {

        this.get = function() {
            return $localstorage.get('PLING-TOKEN');
        };

        this.set = function(token) {
            if (token) {
                $localstorage.set('PLING-TOKEN', token);
                return true;
            }

            return false;
        };

        this.validate = function (cb) {
            $http.get(coreApiService.getAppCoreUrl('accounts', 'me'))
                .success(function(credentialData) {
                    cb(null, credentialData);
                })
                .error(function(reason) {
                    cb(reason);
                });
        };

    }

    TokenService.$inject = [ '$http', '$localstorage', 'coreApiService' ];

    angular.module('plingUi').service('tokenService', TokenService);

}());

(function () {
    'use strict';

    function WebsocketService($rootScope, $window, $timeout, core) {

        var
            socket,
            currentToken = $window.localStorage.getItem('PLING-TOKEN'),
            coreUrl      = core.getAppCoreUrl().replace('/api/v1', '');

        this.getInstance = function() {
            return socket;
        };

        this.connect = function() {

            try {

                if ($rootScope.websocket) return false;
                if (!io) return false; // eslint-disable-line

                $rootScope.isWebsocketConnected = false;
                $rootScope.isWebsocketLoading   = true;

                socket = io(coreUrl, { // eslint-disable-line
                    'query'      : 'token=' + currentToken,
                    'transports' : [ 'websocket' ]
                });

                socket.on('connect_timeout', function() {
                    $timeout(function() {
                        $rootScope.isWebsocketLoading   = false;
                        $rootScope.isWebsocketConnected = false;
                        $rootScope.websocket            = null;
                    });
                });

                socket.on('connect_error', function() {
                    $timeout(function() {
                        var errorObj = {
                            'error': 'CONNECTION_ERROR'
                        };

                        $rootScope.isWebsocketLoading   = false;
                        $rootScope.isWebsocketConnected = false;
                        $rootScope.websocket            = null;

                        $rootScope.$broadcast('PLING-WEBSOCKET-ERROR', errorObj);
                    });
                });

                socket.on('connect', function() {
                    var self = this;

                    $timeout(function() {
                        $rootScope.websocket            = self;
                        $rootScope.isWebsocketConnected = true;
                        $rootScope.isWebsocketLoading   = false;
                    });
                });

                socket.on('reconnecting', function() {
                    $timeout(function() {
                        $rootScope.isWebsocketConnected = false;
                        $rootScope.isWebsocketLoading   = true;
                        $rootScope.websocket            = null;
                    });
                });

                socket.on('reconnect_error', function() {
                    $timeout(function() {
                        $rootScope.isWebsocketLoading   = false;
                        $rootScope.isWebsocketConnected = false;
                        $rootScope.websocket            = null;
                    });
                });

                socket.on('error', function() {
                    $timeout(function() {
                        $rootScope.isWebsocketLoading   = false;
                        $rootScope.isWebsocketConnected = false;
                        $rootScope.websocket            = null;
                    });
                });

            } catch (err) {
                $timeout(function() {
                    $rootScope.isWebsocketLoading   = false;
                    $rootScope.isWebsocketConnected = false;
                    $rootScope.websocket            = null;
                });
            }
        };

        this.send = function(channel, message) {
            if (!$rootScope.websocket) throw new Error('Websocket is null');

            $rootScope.websocket.emit(channel, message);
        };
    }

    WebsocketService.$inject = [ '$rootScope', '$window', '$timeout', 'coreApiService' ];

    angular.module('plingUi').service('websocketService', WebsocketService);

}());

(function (context, logger) {
    'use strict';

    // creating namespace
    function Bootstrapper() {
        this.isBootstrapped = false;
    }

    // boot a module
    Bootstrapper.prototype.Angular = function (root, appname, source, cb) {
        var self = this;

        window.localStorage.setItem('PLING-CURRENT-APP', appname);

        // loading file
        context.loader.load(source, function (err, options) {

            var
                token         = window.localStorage['PLING-TOKEN'],
                queryString   = window.localStorage['PLING-QUERY-STRING'] || window.location.search,
                coreUrl       = options.core_url,
                environment   = options.environment,
                defApiVersion = options.def_api_version,
                initInjector  = angular.injector(['ng']),
                $http         = initInjector.get('$http'),
                currentUrl    = window.location.href,
                localCallbackUrl;

            window.localStorage.setItem('PLING-CURRENT-ENV', environment);

            // checking errors...
            if (err) {
                logger.warn('Arquivo de configuracao nao encontrado!');
                logger.debug(err);

                return false;
            }

            // Sem validacao, aplicacao site
            if ('auth' in options && options.auth === false) {
                window.localStorage.setItem('PLING-TOKEN', false);
                return false;
            }

            // checking for the token
            if (!token && queryString.indexOf('token=') === 1) {
                window.localStorage.setItem('PLING-TOKEN', queryString.split('=')[1]);
            }

            // if there's no token it must redirect to login
            if (!token && coreUrl) {
                window.localStorage.clear();
                localCallbackUrl = currentUrl ? '?callbackurl=' + currentUrl : '';
                $http
                    .get(coreUrl + defApiVersion + '/accounts/products/Login/' + environment)
                    .success(function(urlData) {
                        window.location.href = urlData.callbackUrl + localCallbackUrl;
                        return false;
                    })
                    .error(function(reason) {
                        logger.error(reason);
                        return false;
                    });
            }

            // else it must validate it and then start the application
            else {
                $http
                    .get(coreUrl + defApiVersion + '/accounts/me' + '?appmodule=' + appname + '&environment=' + environment, {
                        'headers': { 'Authorization': token }
                    })
                    .success(function(credentialData) {

                        window.localStorage.setItem('PLING-APPS', JSON.stringify(credentialData.profilesProducts));

                        if (credentialData.modules) {
                            window.localStorage.setItem('PLING-MODULES', JSON.stringify(credentialData.modules));

                            pling.loader.settings.menu    = []; // eslint-disable-line
                            pling.loader.settings.submenu = []; // eslint-disable-line

                            credentialData.modules.forEach(function(module) {
                                if (module.config.isSubMenu) {
                                    pling.loader.settings.submenu.push(module); // eslint-disable-line
                                } else if (module.config.isMenu && !module.config.isSubMenu) {
                                    pling.loader.settings.menu.push(module);    // eslint-disable-line
                                }
                            });
                        }

                        if (credentialData.viewPreferences)
                            window.localStorage.setItem('PLING-CURRENT-VIEW-PREFERENCES', JSON.stringify(credentialData.viewPreferences));

                        delete credentialData.profilesProducts;
                        delete credentialData.iat;
                        delete credentialData.exp;

                        window.localStorage.setItem('PLING-USER', JSON.stringify(credentialData));

                        // saving boot settings
                        angular.module(appname).value('boot.options', options); // eslint-disable-line

                        // starting app
                        angular.bootstrap(root, [appname]);
                        self.isBootstrapped = true;

                        // calling callback
                        if (cb) cb();
                    })
                    .error(function(reason) {
                        logger.error(reason);
                        window.localStorage.clear();
                        localCallbackUrl = currentUrl ? '?callbackurl=' + currentUrl : '';
                        $http
                            .get(coreUrl + defApiVersion + '/accounts/Login/' + environment)
                            .success(function(urlData) {
                                window.location.href = urlData.callbackUrl + localCallbackUrl;
                                return false;
                            })
                            .error(function(reason) {
                                logger.error(reason);
                                return false;
                            });
                    });
            }
        });
    };

    // creating instance
    context.boot = new Bootstrapper();

}(window.pling, window.console));

(function (dom, logger, context) {
    'use strict';

    // Content Loaded listener
    function onDOMLoaded() {

        // detect angular application 'directive'
        var root,
            directive = 'plg-app',
            source    = 'src',
            filter    = '[' + directive + ']';

        // retrieving root element
        root = dom.querySelector(filter);

        // working on root
        if (root) {

            // retrieving app name
            context.name   = root.getAttribute(directive);
            context.source = root.getAttribute(source) || 'pling.conf.json';

            // loading config file
            logger.info('AngularJS 1.5.x spa check:', true);
            context.boot.Angular(root, context.name, context.source, function (err) {

                if (err) logger.error('Could not boot app ', context.name);
                else logger.info('Bootstrapped:', context.boot.isBootstrapped);

            });

        } else {
            logger.info('AngularJS 1.5.x spa check:', false);
        }
    }

    dom.addEventListener('DOMContentLoaded', onDOMLoaded);

}(document, window.console, window.pling));

/* global window, XMLHttpRequest */
(function (context) {
    'use strict';
    // creating namespace
    function ConfLoader() {
        this.settings = null;
    }

    // loading file
    ConfLoader.prototype.load = function (filepath, cb) {
        var self = this,
            parsed,
            xhr = new XMLHttpRequest();

        // sending result
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {

                    parsed = JSON.parse(xhr.responseText);
                    self.settings = parsed;

                    cb(null, parsed);
                } else {
                    cb('Error loading file - status ' + xhr.status, {});
                }
            }
        };

        // handling error
        xhr.onerror = function (err) {
            cb(err);
        };

        // fetching file
        xhr.open('GET', filepath, true);
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.send();
    };

    // creating instance
    context.loader = new ConfLoader();
}(window.pling));

/* global angular */
(function () {
    'use strict';

    function CachingService($templateCache, $route, $http) {


        this.cacheViews = function (cacheObj, routeObj) {
            // setting defaults
            var partial, r,
                viewCache = cacheObj || $templateCache,
                router = routeObj || $route;

            // looping routes
            for (r in router.routes) {
                // jslint -object protection
                if (router.routes.hasOwnProperty(r)) {
                    // evaluate partial
                    partial = router.routes[r].templateUrl;
                    if (partial) {
                        // caching route
                        $http.get(partial, {'cache': viewCache});
                    }
                }
            }
        };
    }

    CachingService.$inject = ['$templateCache', '$route', '$http'];

    // registering service
    angular.module('plingUi').service('cacheService', CachingService);

}());

(function () {
    'use strict';

    function $LocalStorage($window) {
        return {

            'clearAll': function () {
                $window.localStorage.clear();
            },

            'set': function (key, value) {
                $window.localStorage[key] = value;
            },

            'get': function (key) {
                return $window.localStorage[key];
            },

            'setObject': function (key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },

            'getObject': function (key) {
                return JSON.parse($window.localStorage[key] || '{}');
            }
        };
    }

    $LocalStorage.$inject = [ '$window' ];

    angular.module('plingUi').service('$localstorage', $LocalStorage);

}());

(function () {
    'use strict';

    function $SessionStorage($window) {
        return {

            'clearAll': function () {
                $window.localStorage.clear();
            },

            'set': function (key, value) {
                $window.localStorage[key] = value;
            },

            'get': function (key) {
                return $window.localStorage[key];
            },

            'setObject': function (key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },

            'getObject': function (key) {
                return JSON.parse($window.localStorage[key] || '{}');
            }
        };
    }

    $SessionStorage.$inject = [ '$window' ];

    angular.module('plingUi').service('sessionstorage', $SessionStorage);

}());

(function () {
    'use strict';

    function ToastrService() {

        // this.emit = function(message, type) {
        //     $mdToast.show(
        //         $mdToast.simple()
        //             .textContent(message)
        //             .position($scope.getToastPosition())
        //             .hideDelay(delay || 2000)
        //     );
        // };

    }

    ToastrService.$inject = [ '$mdToast' ];

    angular.module('plingUi').service('toastrService', ToastrService);

}());

(function () {
    'use strict';

    PlingRequestInterceptor.$inject = [ '$q', '$window' ];

    angular.module('plingUi').factory('plingRequestInterceptor', PlingRequestInterceptor);

    function PlingRequestInterceptor($q, $window) {

        return {

            // On request
            'request': function (config) {
                var isAuth = $window.localStorage.getItem('PLING-TOKEN');

                // Add Token info to every request
                if (isAuth !== false)
                    config.headers.Authorization = $window.localStorage.getItem('PLING-TOKEN');

                return config;
            },

            // On request error
            'requestError': function (reason) {

                // Return the promise error reason.
                return $q.reject(reason);
            },

            // On response success
            'response': function (response) {

                // Return the response or promise.
                return response || $q.when(response);
            },

            // On response error
            'responseError': function (reason) {

                // Return the promise error reason.
                return $q.reject(reason);
            }

        };
    }

}(document, window.console, window.pling));

/* global angular, console */
(function () {
    'use strict';

    // defining behaviour
    function PlingUiExceptionHandler($injector) {

        return function (exception, cause) {

            // preparing message to be dispatched
            var dispatcher = null,
                logger = null,
                data = {
                    'error': exception,
                    'details': cause
                };

            // logging
            logger = $injector.get('$log');
            logger.error(exception);

            if (cause) {
                logger.debug(cause);
            }

            // dispatching message
            dispatcher = $injector.get('$rootScope');
            dispatcher.$broadcast('PLINGUI_INTERNAL_ERROR', data);
        };
    }

    // injecting
    PlingUiExceptionHandler.$inject = ['$injector'];

    // registering on angular
    angular
        .module('plingUi')
        .factory('$exceptionHandler', PlingUiExceptionHandler);

}());

/* global angular, console */
(function () {
    'use strict';

    // logger definition
    function PlingUiLogger() {
        return function ($delegate) {
            return {
                'dispatch': function (method, params) {
                    // defining method
                    var proc = $delegate[method] || $delegate.log,
                        stamp = new Date().toString(),
                        prefix = '[' + stamp + '][' + method + ']::',
                        msg = [],
                        arg;

                    if (method) {
                        // preparing msg
                        msg.push(prefix);

                        // joining params
                        for (arg in params) {
                            if (params.hasOwnProperty(arg)) {
                                msg.push(params[arg]);
                            }
                        }

                        // applying log info
                        proc.apply(null, msg);
                    }
                },

                'log': function () {
                    this.dispatch('log', arguments);
                },

                'info': function () {
                    this.dispatch('info', arguments);
                },

                'error': function () {
                    this.dispatch('error', arguments);
                },

                'warn': function () {
                    this.dispatch('warn', arguments);
                }
            };
        };
    }

    // registering on angular
    angular
        .module('plingUi')
        .factory('shadowLogger', PlingUiLogger);
}());

angular.module("plingUi.templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("plg-app-bar.html","<md-toolbar ng-class=\"{\'toolbar-container-with-menu\': hasMenu}\" class=toolbar-container><md-menu class=menu-content md-offset=\"0 47\"><md-button class=current-app-button ng-click=\"openMenu($mdOpenMenu, $event)\"><div layout=row><md-icon class=\"icon app-icon\" md-svg-src=\"{{ currentApp.iconPath }}\"></md-icon>{{currentApp.name}}<md-icon class=icon md-svg-src=../../../vendor/pling-ui/assets/icons/icon_expand.svg></md-icon></div></md-button><md-menu-content width=4 class=menu-content-app><md-menu-item ng-repeat=\"app in applications\"><md-button ng-click=getCallbackUrl(app)><div layout=row><md-icon class=\"icon apps-icon-menu\" md-svg-src=\"{{ app.iconPath }}\"></md-icon><p flex=\"\">{{ app.name }}</p></div></md-button></md-menu-item></md-menu-content></md-menu><md-divider></md-divider></md-toolbar>");
$templateCache.put("myComponentSample.html","<div class=myComponentSample>My Component Sample: <span ng-bind=tagline></span></div>");
$templateCache.put("plgCalendar.html","<div class=plg-calendar-container><div layout=row layout-align=\"space-between center\" class=plg-calendar-sidebarCalendar-header><div class=plg-calendar-sidebarCalendar-sub-header layout=row ng-class=\"{ \'plg-calendar-year-colunm\': $ctrl.monthsLimit < 2, \'plg-calendar-sidebarCalendar-sub-header-2\': $ctrl.monthsLimit > 1 }\"><div flex=100><md-button aria-label=\"previous month\" class=\"md-icon-button plg-calendar-year-button\" ng-click=\"$ctrl.prevDate(\'year\');\" md-prevent-menu-close=true><md-icon>keyboard_arrow_left</md-icon></md-button></div><span flex=100 style=\"margin-top:11px;min-width: 55px;font-size: 14px;\">{{ $ctrl.todayYear }}</span><div flex=100><md-button aria-label=\"next month\" class=\"md-icon-button plg-calendar-year-button\" ng-click=\"$ctrl.nextDate(\'year\');\" md-prevent-menu-close=true><md-icon>keyboard_arrow_right</md-icon></md-button></div></div><div layout=row layout-align=\"space-between center\" class=plg-calendar-monthyear ng-if=\"$ctrl.monthsLimit < 2\" style=\"margin-bottom: 10px;\"><md-button aria-label=\"previous month\" class=\"md-icon-button plg-calendar-year-button\" ng-click=\"$ctrl.prevDate(\'month\');\" md-prevent-menu-close=true><md-icon>keyboard_arrow_left</md-icon></md-button>{{ $ctrl.getMonth(i) }}<md-button aria-label=\"next month\" class=\"md-icon-button plg-calendar-year-button\" ng-click=\"$ctrl.nextDate(\'month\');\" md-prevent-menu-close=true><md-icon>keyboard_arrow_right</md-icon></md-button></div><div class=plg-calendar-fast-actions ng-class=\"{\'plg-calendar-fast-actions-2\': $ctrl.monthsLimit > 1 }\"><md-button ng-if=!$ctrl.disableDayChoice class=md-primary md-prevent-menu-close=true ng-click=$ctrl.setToday()>Hoje</md-button><md-button ng-if=\"!$ctrl.disableRange && !$ctrl.disableMonthChoice\" class=md-primary md-prevent-menu-close=true ng-click=$ctrl.setThisMonth()>Mês</md-button><md-button ng-if=\"!$ctrl.disableRange && !$ctrl.disableYearChoice\" class=md-primary md-prevent-menu-close=true ng-click=$ctrl.setThisYear()>Ano</md-button></div></div><div class=plg-calendar-sidebarCalendar><div layout=column layout-align=\"start center\" class=plg-calendar-calendar ng-repeat=\"i in $ctrl.monthsNumbers\"><div layout=row layout-align=\"space-between center\" class=plg-calendar-monthyear ng-if=\"$ctrl.monthsLimit > 1\"><md-button aria-label=\"previous month\" class=md-icon-button ng-click=\"$ctrl.prevDate(\'month\');\" md-prevent-menu-close=true><md-icon>keyboard_arrow_left</md-icon></md-button>{{ $ctrl.getMonth(i) }}<md-button aria-label=\"next month\" class=md-icon-button ng-click=\"$ctrl.nextDate(\'month\');\" md-prevent-menu-close=true><md-icon>keyboard_arrow_right</md-icon></md-button></div><div layout=row layout-align=\"space-around center\" class=plg-calendar-week-days><div class=md-body-2 layout=\"\" layout-align=\"center center\" ng-repeat=\"d in $ctrl.weekDays track by $index\">{{ d }}</div></div><div layout=row layout-wrap=\"\" class=plg-calendar-days><div layout=\"\" layout-align=\"center center\" ng-repeat-start=\"objD in $ctrl.daysInMonth[i] track by $index\"><md-button class=\"md-icon-button md-raised\" aria-label=\"Selecionar dia\" ng-if=\"objD.day !== false\" md-prevent-menu-close=true ng-class=\"{\'md-primary\': $ctrl.isSelected(objD.day, i), \'plg-calendar-days-in-range\': $ctrl.isInRange(objD.day, i), \'plg-calendar-today\': $ctrl.isToday(objD.day, i), \'plg-calendar-event\': objD.events && objD.events.length > 0 && !$ctrl.isSelected(objD.day, i) && !$ctrl.isInRange(objD.day, i)}\" ng-click=\"$ctrl.selectDate(objD.day, i)\">{{ objD.day }}</md-button></div><div flex=\"\" ng-if=\"($index + 1) % 7 == 0\" ng-repeat-end=\"\"></div></div></div><div style=\"clear: both;\"></div></div></div>");
$templateCache.put("plgComboBox.html","<span class=formCombo ng-if=$ctrl.loadingStart><md-input-container><label ng-class=\"{\'md-multiple-select-label\': $ctrl.focusChoice || $ctrl.selectChoiceName.length > 0, \'md-multiple-select-label-nofocus\': $ctrl.focusBlur && !$ctrl.focusChoice && $ctrl.selectChoiceName.length === 0, \'errors-combo-box-label\': $ctrl.params.isRequired && $ctrl.focusBlur && !$ctrl.focusChoice && $ctrl.selectChoiceName.length === 0}\">{{$ctrl.params.label}}</label><div flex=\"\" class=md-multiple-select ng-click=\"$ctrl.focus(this, $event)\"><span class=md-multiple-select-text>{{$ctrl.selectChoiceName}}</span> <span class=md-multiple-select-icon><i class=material-icons>arrow_drop_down</i></span><md-divider class=md-default-theme ng-class=\"{\'errors-combo-box-divider\': $ctrl.params.isRequired && $ctrl.focusBlur && !$ctrl.focusChoice && $ctrl.selectChoiceName.length === 0}\"></md-divider></div><div class=errors-combo-box ng-if=\"$ctrl.params.isRequired && $ctrl.focusBlur && !$ctrl.focusChoice && $ctrl.selectChoiceName.length === 0\"><div>{{$ctrl.params.requiredMessage}}</div></div><div flex=\"\" class=\"md-multiple-select-choice md-whiteframe-1dp\" ng-if=$ctrl.focusChoice><span flex=\"\" class=md-multiple-select-choice-insert ng-show=!$ctrl.params.isNotSearch><input type=text placeholder=Pesquisar ng-model=$ctrl.filterSelect id=$ctrl.params.ref {$ctrl.params.maxlength=\"\" ?=\"\" maxlength=$ctrl.params.maxlength }=\"\"> <a ng-show=!$ctrl.loading ng-click=$ctrl.saveChoice(this) ng-if=\"$ctrl.addChoice && $ctrl.params.isInsert\" md-prevent-menu-close=md-prevent-menu-close>Adicionar</a><md-icon ng-show=$ctrl.loading md-svg-src=/assets/img/icone_loading.svg aria-label=loading></md-icon></span> <span flex=\"\" ng-class=\"{\'md-multiple-select-padding\': $ctrl.params.isNotSearch}\" layout=row layout-align=\"start center\" class=md-multiple-select-choice-all-none ng-if=\"$ctrl.filterChoices(this, $ctrl.filterSelect).length > 0 && ($ctrl.params.isMultiple || (!$ctrl.params.isMultiple && !$ctrl.params.isRequired))\"><a ng-if=$ctrl.params.isMultiple ng-click=\"$ctrl.allNoneChoice(this, $ctrl.filterChoices(this, $ctrl.filterSelect), \'check_box\')\" md-prevent-menu-close=md-prevent-menu-close>Todos</a> <a ng-if=$ctrl.params.isMultiple ng-click=\"$ctrl.allNoneChoice(this, $ctrl.filterChoices(this, $ctrl.filterSelect), \'check_box_outline_blank\')\" md-prevent-menu-close=md-prevent-menu-close>Nenhum</a> <a ng-if=\"!$ctrl.params.isMultiple && !$ctrl.params.isRequired\" ng-click=$ctrl.noneChoice(this)>Nenhum</a></span> <span layout=column layout-align=\"start top\" ng-class=\"{\'md-multiple-select-choice-list\': $ctrl.filterChoices(this, $ctrl.filterSelect).length > 5}\"><span flex=\"\" ng-repeat=\"choice in $ctrl.filterChoices(this, $ctrl.filterSelect) | orderBy: name\" class=md-multiple-select-choice-line ng-class=\"{\'action-mouse\': actionMouse || choice._id === $ctrl.ngModel || choice.id === $ctrl.ngModel}\" ng-click=\"$ctrl.selectChoice(this.$ctrl, choice)\" ng-mouseover=\"actionMouse = true\" ng-mouseleave=\"actionMouse = false\" md-prevent-menu-close=md-prevent-menu-close ng-if=$ctrl.params.isMultiple><span class=md-multiple-select-span-icon><i class=material-icons ng-class=\"{\'action-selected\': choice.icon === check_box}\">{{choice.icon}}</i></span> <span>{{ choice[$ctrl.params.refName] }}</span></span> <span flex=\"\" ng-repeat=\"choice in $ctrl.filterChoices(this, $ctrl.filterSelect) | orderBy: name\" class=md-multiple-select-choice-line ng-class=\"{\'action-mouse\': actionMouse || choice._id === $ctrl.ngModel || choice.id === $ctrl.ngModel}\" ng-click=\"$ctrl.selectChoice(this.$ctrl, choice)\" ng-mouseover=\"actionMouse = true\" ng-mouseleave=\"actionMouse = false\" ng-if=!$ctrl.params.isMultiple><span>{{ choice[$ctrl.params.refName] }}</span></span></span></div></md-input-container></span><div ng-class=\"{\'md-multiple-select-div\': $ctrl.focusChoice}\" ng-click=$ctrl.getOut(this)></div><input type=hidden ng-model=$ctrl.ngModel>");
$templateCache.put("plgDatePicker.html","<form name=datePickerForm><md-menu off-set=\"0 10\"><md-input-container layout=row class=\"md-icon-float md-block plg-date-picker-input-container\" ng-class=\"{\'plg-date-picker-input-size-min\': $ctrl.disableRange}\"><label ng-if=$ctrl.label>{{ $ctrl.label }}</label><md-icon ng-click=$mdOpenMenu($event)>date_range</md-icon><input flex=100 ng-model=$ctrl.selected.display ui-mask={{$ctrl.mask}} model-view-value=true ui-options=\"{ \'clearOnBlur\': false }\" aria-label=hidden ng-change=$ctrl.validate($ctrl.selected); ng-blur=$ctrl.setDates($ctrl.selected) ng-class=\"{\'plg-date-picker-input-size-min\': $ctrl.disableRange}\" md-menu-origin=\"\"><p ng-show=\"$ctrl.selected.$invalid && $ctrl.selected && $ctrl.selected.display && $ctrl.selected.display.length > 0\" class=help-block>Por favor informe uma data valida.</p></md-input-container><md-menu-content><plg-calendar disable-range=$ctrl.disableRange months-limit=$ctrl.monthsLimit selected=$ctrl.selected disable-day-choice=true disable-month-choice=true disable-year-choice=true style=\"margin-top: -5px;overflow: hidden;\"></plg-calendar></md-menu-content></md-menu></form>");
$templateCache.put("plgEditFabSpeedDial.template.html","");
$templateCache.put("plgElasticSearch.html","<div layout=column style=\"position: relative;\"><md-autocomplete flex=\"\" placeholder=Pesquisa md-selected-item=$ctrl.selectedItem md-search-text=$ctrl.searchText md-item-text=item._source[$ctrl.getDocumentName()] md-min-length=1 md-items=\"item in $ctrl.querySearch($ctrl.searchText)\" md-search-text-change=$ctrl.searchTextChange($ctrl.searchText) md-selected-item-change=$ctrl.selectedItemChange(item) md-no-cache=true ng-keyup=\"$event.keyCode == 13 && $ctrl.selectedItemChange($ctrl.items)\" ng-click=\"$ctrl.showMenu = true\"><md-item-template><span md-highlight-text=$ctrl.searchText md-highlight-flags=^i>{{item._source[$ctrl.getDocumentName()]}}</span></md-item-template><md-not-found>Nenhum resultado para \"{{$ctrl.searchText}}\".</md-not-found></md-autocomplete><div flex=\"\" ng-if=$ctrl.showMenu class=plg-elastic-search-shit2 layout=row><md-button class=plg-elastic-search-shit ng-repeat=\"f in $ctrl.getFields()\" ng-click=\"f.isSelected = !f.isSelected;\" ng-class=\"{ \'plg-es-selected\': f.isSelected }\">{{ f.label }}</md-button></div></div>");
$templateCache.put("plg-service-bar.html","<md-toolbar class=plg-service-bar-background><div class=md-toolbar-tools><div flex=50 layout=row style=\"margin-left: -12px;\" class=\"flex flex-40 layout layout-row\"><div class=plg-service-bar-app-name-container><img src=../../vendor/pling-ui/assets/img/pling_topbar_logo.png class=plg-service-bar-app-name></div><span class=plg-service-bar-current-customer ng-bind=customerName></span></div><section class=plg-service-bar-container style=\"flex: 1\"><div class=md-toolbar-tools><span flex=\"\"></span><md-menu md-position-mode=\"target-right target\" md-offset=\"0 68\"><md-button class=md-icon-button aria-label=Notificações ng-click=\"openMenu($mdOpenMenu, $event)\"><i class=material-icons ng-class=\"{ \'plg-service-bar-anim-rotate\': isNotificationAdded }\">notifications</i><div ng-show=\"arrayNotifications.length > 0 && $root.isWebsocketConnected && !$root.isWebsocketLoading\" class=plg-service-bar-notification-badge>5</div><div ng-hide=\"$root.isWebsocketLoading || $root.isWebsocketConnected\" style=\"color: black\" class=\"plg-service-bar-notification-badge plg-service-bar-notification-error\"><i class=material-icons style=\"font-size: 8pt; top: 2px; left: 1px; position: absolute;\">close</i></div><div ng-show=$root.isWebsocketLoading class=\"plg-service-bar-notification-badge plg-service-bar-notification-loading\" style=\"color: black\"><i class=\"material-icons plg-service-bar-refresh-animate\" style=\"top: 0px; left: 0px;\">refresh</i></div></md-button><md-menu-content class=plg-service-bar-notification-window><div class=plg-service-bar-no-notifications ng-show=\"arrayNotifications.length === 0 && $root.isWebsocketConnected\"><h4 class=plg-service-bar-notifications>Não existem notificações no momento</h4></div><md-menu-item class=plg-service-bar-notification-window-header ng-show=\"arrayNotifications.length > 0 && $root.isWebsocketConnected\"><h4 class=plg-service-bar-notifications>Notificações ({{ arrayNotifications.length }})</h4></md-menu-item><md-menu-item class=plg-service-bar-notification-window-connection-lost ng-hide=$root.isWebsocketConnected><h4 class=plg-service-bar-notifications>Conexão indisponível com o servidor</h4><div><md-button aria-label=Reconectar class=md-raised ng-disabled=$root.isWebsocketLoading ng-click=reconnectWebsocket();>{{ $root.isWebsocketLoading ? \'Aguarde..\' : \'Reconectar\' }}</md-button></div></md-menu-item><div class=plg-service-bar-notification-items ng-hide=\"arrayNotifications.length === 0 || !$root.isWebsocketConnected\"><md-menu-item class=plg-service-bar-notification-item-bind ng-repeat=\"not in arrayNotifications\" ng-show=$root.isWebsocketConnected><md-item class=plg-service-bar-notification-item-bind-content><div layout=row><div class=plg-service-bar-notification-item-bind-description><span style=\"font-weight: bold;\">{{ not.options.key }}</span> <span class=truncate style=\"margin-left: 20px; margin-top: 10px;\">{{ not.doc.description }}</span></div><div class=plg-service-bar-notification-item-bind-datetime><span>{{ not.doc.date | date}}</span></div></div></md-item></md-menu-item></div><div class=plg-service-bar-notification-footer ng-hide=\"arrayNotifications.length === 0 || !$root.isWebsocketConnected\"><span>Ver todas notificações</span></div></md-menu-content></md-menu><md-menu md-position-mode=\"target-right target\" md-offset=\"0 60\"><div class=plg-service-bar-user-actions ng-click=\"openMenu($mdOpenMenu, $event)\" ng-class=\"{ \'plg-service-bar-scale-up\': user }\"><img ng-if=\"user && user.profileImage\" ng-src=\"{{ user.profileImage }}\" class=plg-service-bar-avatar alt=foto><div ng-if=\"user && !user.profileImage\" class=\"plg-service-bar-avatar plg-service-bar-no-avatar\"><i class=material-icons>person<i></i></i></div><md-progress-circular ng-if=!user style=float:left;top:-25px;right:0px; md-mode=indeterminate md-diameter=30></md-progress-circular><span ng-show=user class=plg-service-bar-avatar-message>Olá {{ user.fullname }}</span></div><md-menu-content width=4><md-menu-item ng-hide=\"currentAppModule === \'painelDoClienteApp\'\"><md-button ng-click=myAccount()>Minha Conta</md-button></md-menu-item><md-menu-item><md-button ng-click=\"redirect(\'/configuracoes\')\">Configurações</md-button></md-menu-item><md-menu-divider></md-menu-divider><md-menu-item><md-button ng-click=logout()>Logout</md-button></md-menu-item></md-menu-content></md-menu></div></section></div></md-toolbar><md-tabs ng-if=\"menu && menu.length > 0 && currentMenuIndex !== undefined\" md-selected=currentMenuIndex class=plg-service-bar-menu><md-tab ng-repeat=\"item in menu\" ng-click=\"changeRoute(item.route, false)\"><md-icon class=\"plg-service-bar-horizontal-menu plg-service-bar-horizontal-menu-position plg-service-bar-icon\" md-svg-src=\"../../assets/icons/icone_{{ item.icon }}.svg\" aria-label={{item.icon}}></md-icon><span class=plg-service-bar-menu-text ng-bind=item.name></span></md-tab></md-tabs><md-tabs md-selected=currentSubmenuIndex ng-hide=\"availableSubmenu.length === 0\" class=plg-service-bar-submenu><md-tab ng-repeat=\"item in availableSubmenu track by $index\" ng-click=\"changeRoute(item.route, true)\"><span class=plg-service-bar-menu-text ng-bind=item.name></span></md-tab></md-tabs>");
$templateCache.put("plgSimpleCombo.html","<md-input-container md-position-mode=\"target-right target\" class=\"{{ class }} plgSimpleCombo-container\"><label for=\"{{\'plgsc-\' + label }}\" ng-hide=\"ngModel && ngModel.length < 1\">{{ label }}</label><md-select md-position-mode=\"target-right target\" ng-model=ngModel class=plgSimpleCombo-text id=\"{{\'plgsc-\' + label }}\" md-on-close=\"searchTermPSC = \'\'; onHandler()\" data-md-container-class=selectdemoSelectHeader md-selected-text=getSelectedText() ng-model-options=trackBy multiple=\"\"><md-select-header class=demo-select-header><input ng-model=searchTermPSC type=search placeholder=Pesquisar class=\"demo-header-searchbox _md-text\"></md-select-header><md-optgroup><div layout=row layout-align=\"start center\" class=plg-simplecombo-smart-options ng-hide=\"multiple === undefined\"><a ng-click=\"ngModel = items\">Todos</a><a ng-click=\"ngModel = []\">Nenhum</a></div><md-option ng-value=item ng-repeat=\"item in items | filter:searchTermPSC\">{{ isArrayOfObjects ? item[options.refName] : item}}</md-option></md-optgroup></md-select></md-input-container>");}]);