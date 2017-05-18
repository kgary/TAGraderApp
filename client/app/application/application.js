/*
 * File: application.js
 * Description: Module and controllers to handle pages of the TA/Grader application process.
 */

// setup module
var application = angular.module('app.application', []);

application.constant('WORK_HOURS', {
    international: 20,
    us: 25
});

application.controller('contactInfoController', function($scope, $location, $http, $timeout, UserInfoService, PageCompletionService, AppStatusService) {
    $scope.logout = function() {
        UserInfoService.clearUserSession();
        $location.path('/login');
    }
    // populates the Contact Info page        
    angular.element(document).ready(function() {
        $http.get('/contactInfo').then(function successCallback(response) {           
            $scope.phoneNumber = response.data.PhoneNumber;
            $scope.mobileNumber = response.data.MobileNumber;
            $scope.country = response.data.AddressCountry;
            $scope.addressOne = response.data.AddressOne;
            if (response.data.AddressTwo != null) {
                $scope.addressTwo = response.data.AddressTwo;
            }
            $scope.city = response.data.AddressCity;
            $scope.state = response.data.AddressState;
            $scope.zip = response.data.AddressZip;  
            $scope.name = UserInfoService.getFullName();      
        }, function errorCallback(response) {
            //TODO
        });   
    });
    // Saves Contact Information into Database
    $scope.saveContact = function(doRoute) {
        var pageStatus = PageCompletionService.checkFields($scope, 'contact');
        var dateObj = new Date().toISOString().slice(0, 19).replace('T', ' ');
        // Maybe Change do Route to pass a number, 1 for true, 2 for false, 3 for changing status to complete
        var contactInfoData = {
                PhoneNumber       : $scope.phoneNumber,
                MobileNumber      : $scope.mobileNumber,
                AddressOne        : $scope.addressOne,
                AddressTwo        : $scope.addressTwo,
                AddressCountry    : $scope.country,
                AddressCity       : $scope.city,
                AddressState      : $scope.state,
                AddressZip        : $scope.zip,
                AppStatus         : AppStatusService.checkStatus('contact', pageStatus),
                isContactComplete : pageStatus,
                ModifiedDate      : dateObj,
                ASURITE_ID        : UserInfoService.getUserId()
            };
        $http.post('/contactInfo', contactInfoData).then(function successCallback(response) {
            if (doRoute === true) {
                $location.path('/education'); 
            } else {
                $scope.saveMessage = 'Save Successful!';
                $timeout(function() { 
                    $scope.saveMessage = '';
                }, 1500);
            }
        }, function errorCallback(response) {
            //TODO
        });
    }
});

application.controller('educationInfoController', function($scope, $location, $http, $timeout, UserInfoService, PageCompletionService, AppStatusService) {
    $scope.logout = function() {
        UserInfoService.clearUserSession();
        $location.path('/login');
    }
    // degree options - possbily move to more configurable location
    $scope.degrees = ["Ph.D Computer Science",
                      "Ph.D Computer Engineering",
                      "Ph.D SMACS",
                      "Ph.D Other",
                      "M.S. Software Engineering",
                      "M.S. Computer Engineering",
                      "M.S. Computer Science",
                      "M.C.S Computer Science",
                      "M.S. Other",
                      "Undergraduate"];
    $scope.gradDates = [];

    var today = new Date();
    var year = today.getFullYear();

    for(var i = 0; i < 3; i++) {
        $scope.gradDates.push("Fall " + (year + i));
        $scope.gradDates.push("Spring " + (year + (i + 1)));
        $scope.gradDates.push("Summer " + (year + (i + 1)));
    }
    
    // populates the Education page        
    angular.element(document).ready(function() {    
        $http.get('programChair/getDeadline').then(function successCallback(response) {
            var year = new Date(response.data.date).getFullYear();
            $scope.semesterName = response.data.semester;
        }, function errorCallback(response) {
            // empty
        });    
        $http.get('/education').then(function successCallback(response) { 
            $scope.selectedDegree = response.data.EducationLevel;
            $scope.gpa = response.data.GPA;
            $scope.otherDegree = response.data.DegreeProgram;
            $scope.probation = response.data.isAcademicProbation;
            $scope.fourPlusOne = response.data.isFourPlusOne;
            $scope.fullTime = response.data.isFullTime;
            if (response.data.FirstSession != null) {
                $scope.session = new Date(response.data.FirstSession);    
            } 
            $scope.gradDate = response.data.GraduationDatel;
            $scope.iposInput = response.data.ipos;
            $scope.transcriptInput = response.data.transcript;
        }, function errorCallback(response) {
            //TODO
        });
    });
    
    // saves data and posts - routes if the user chose to continue
    $scope.saveEducation = function(doRoute) {
        var pageStatus = PageCompletionService.checkFields($scope, 'education');
        var requiredFields = [];
        var dateObj = new Date().toISOString().slice(0, 19).replace('T', ' ');
        var fSession;
        
        if (!$scope.session) {
            fSession = null;   
        } else {
            fSession = new Date($scope.session).toISOString().slice(0, 19).replace('T', ' ')
        }

        var educationData = {
                EducationLevel            : $scope.selectedDegree,
                GPA                       : $scope.gpa,
                DegreeProgram             : $scope.otherDegree,
                isAcademicProbation       : $scope.probation,
                isFourPlusOne             : $scope.fourPlusOne,
                isFullTime                : $scope.fullTime,
                FirstSession              : fSession,
                GraduationDate            : $scope.gradDate,
                AppStatus                 : AppStatusService.checkStatus('education', pageStatus),
                isEducationComplete       : pageStatus,
                ModifiedDate              : dateObj,
                ASURITE_ID                : UserInfoService.getUserId()
            };
        
        $http.post('/education', educationData).then(function successCallback(response) {
            if (doRoute === true && ($scope.iposUploadErrorMessage === true || $scope.transcriptUploadErrorMessage === true)) {
                if (confirm("One or More Files Failed to Upload. Continue Anyways?") == true) {
                    $location.path('/employment');
                } 
            } else if (doRoute === true) {
                $location.path('/employment');
            } else {
                $scope.saveMessage = 'Save Successful!';
                $timeout(function() { 
                    $scope.saveMessage = '';
                }, 1500);
            }
        }, function errorCallback(response) {
            //TODO
        });
    }

    $scope.iposFileNameChanged = function(file) {
        if (file[0]) {
            $scope.iposInput = file[0].name;
            $scope.iposUploadErrorMessage = false;
            $scope.$apply();   
        }  
    }

    $scope.transcriptFileNameChanged = function(file) {
        if (file[0]) {
            $scope.transcriptInput = file[0].name;
            $scope.transcriptUploadErrorMessage = false;
            $scope.$apply();   
        }  
    }

    $scope.uploadIpos = function() {
        if ($scope.iposFile) {
            var extension = $scope.iposFile.name.split('.');
            if (extension[extension.length - 1].toLowerCase() === 'pdf') {
                var uploadUrl = "/iposUpload";
                var fd = new FormData();
                fd.append('file', $scope.iposFile);

                $http.post(uploadUrl,fd, {
                    transformRequest: angular.identity,
                    headers: {'Content-Type': undefined}
                }).then(function successCallback(response) {
                    $scope.iposFile = null;
                }, function errorCallback(response) {
                    //TODO
                });   
            } else {
                $scope.iposFile = null;
                $scope.iposErrorMessage = 'Upload Failed. PDF Files only. Please Select a Different File';
                $scope.iposUploadErrorMessage = true;
            }    
        }    
    };

    $scope.uploadTranscript = function() {
        if ($scope.tranFile) {
            var extension = $scope.tranFile.name.split('.');
            if (extension[extension.length - 1].toLowerCase() === 'pdf') {
                var uploadUrl = "/transcriptUpload";
                var fd = new FormData();
                fd.append('file', $scope.tranFile);

                $http.post(uploadUrl,fd, {
                    transformRequest: angular.identity,
                    headers: {'Content-Type': undefined}
                }).then(function successCallback(response) {
                    $scope.tranFile = null;
                }, function errorCallback(response) {
                    //TODO
                }); 
            } else {
                $scope.tranFile = null;
                $scope.transcriptErrorMessage = 'Upload Failed. PDF Files only. Please Select a Different File';
                $scope.transcriptUploadErrorMessage = true;
            }    
        } 
    };
});

application.controller('employmentInfoController', function($scope, $location, $http, $timeout, UserInfoService, WorkHoursCheckService, PageCompletionService, AppStatusService) {  
    $scope.logout = function() {
        UserInfoService.clearUserSession();
        $location.path('/login');
    }
    $scope.doHoursCheck = function() {
        var result = WorkHoursCheckService.checkHours($scope.hours, $scope.international, $scope.workHours);
        $scope.hoursWarning = result.isOver;
        $scope.enteredHours = result.hours;
    }
    
    angular.element(document).ready(function(){
        $http.get('/employment', user ).then(function successCallback(response) {
            $scope.hours = response.data.TimeCommitment + ' hours per week';
            $scope.international = response.data.isInternationalStudent;
            $scope.speakTest = response.data.SpeakTest;
            $scope.ta = response.data.isTA;
            $scope.grader = response.data.isGrader;
            $scope.employer = response.data.CurrentEmployer;
            $scope.workHours = response.data.WorkHours;
            $scope.hasWorked = response.data.isWorkedASU;
            $scope.resumeInput = response.data.resume;
        }, function errorCallback(response) {
            //TODO
        });
    });
    
    // saves data and posts - routes if the user chose to continue
    $scope.saveEmployment = function(doRoute) {
        var pageStatus = PageCompletionService.checkFields($scope, 'employment');
        var dateObj = new Date().toISOString().slice(0, 19).replace('T', ' ');
        var hoursParse;
        if ($scope.hours === 'null hours per week') {
            hoursParse = null;
        } else {
            hoursParse = parseInt($scope.hours.substr(0, $scope.hours.indexOf(' ')));    
        }
        if ($scope.international === 0) {
            $scope.speakTest = null;
        }
        var employmentData = {
                TimeCommitment            : hoursParse,
                isInternationalStudent    : $scope.international,
                SpeakTest                 : $scope.speakTest,
                isTA                      : $scope.ta,
                isGrader                  : $scope.grader,
                CurrentEmployer           : $scope.employer,
                WorkHours                 : $scope.workHours,
                isWorkedASU               : $scope.hasWorked,
                AppStatus                 : AppStatusService.checkStatus('employment', pageStatus),
                isEmploymentComplete      : pageStatus,
                ModifiedDate              : dateObj,
                ASURITE_ID                : UserInfoService.getUserId()
            };
        
        $http.post('/employment', employmentData).then(function successCallback(response) {
            if (doRoute === true && $scope.resumeUploadErrorMessage === true) {
                if (confirm("One or More Files Failed to Upload. Continue Anyways?") == true) {
                    $location.path('/availability');
                } 
            } else if (doRoute === true) {
                $location.path('/availability');
            } else {
                $scope.saveMessage = 'Save Successful!';
                $timeout(function() { 
                    $scope.saveMessage = '';
                }, 1500);
            }
        }, function errorCallback(response) {
            //TODO
        });
    }

    $scope.resumeFileNameChanged = function(file) {
        if (file[0]) {
            $scope.resumeInput = file[0].name;
            $scope.resumeUploadErrorMessage = false;
            $scope.$apply();   
        } 
    }

    $scope.uploadResume = function() {
        if ($scope.resumeFile) {
            var extension = $scope.resumeFile.name.split('.');
            if (extension[extension.length - 1].toLowerCase() === 'pdf') {
                var uploadUrl = "/resumeUpload";
                var fd = new FormData();
                fd.append('file', $scope.resumeFile);

                $http.post(uploadUrl,fd, {
                    transformRequest: angular.identity,
                    headers: {'Content-Type': undefined}
                }).then(function successCallback(response) {
                    $scope.resumeFile = null;
                }, function errorCallback(response) {
                    //TODO
                });
            } else {
                $scope.resumeFile = null;
                $scope.resumeErrorMessage = 'Upload Failed. PDF Files only. Please Select a Different File';
                $scope.resumeUploadErrorMessage = true; 
            }     
        }
    };
});

application.controller('availabilityInfoController', function($scope, $location, $http, $timeout, UserInfoService, AppStatusService) {
    $scope.logout = function() {
        UserInfoService.clearUserSession();
        $location.path('/login');
    }
    $scope.times = [
        {'startHour':'8:00 AM','stopHour':'10:00 AM'},
        {'startHour':'10:00 AM','stopHour':'12:00 PM'},
        {'startHour':'12:00 PM','stopHour':'2:00 PM'},
        {'startHour':'2:00 PM','stopHour':'4:00 PM'},
        {'startHour':'4:00 PM','stopHour':'6:00 PM'},
        {'startHour':'6:00 PM','stopHour':'8:00 PM'}];
        
    $scope.days = ['Monday',
                   'Tuesday',
                   'Wednesday',
                   'Thursday',
                   'Friday'];    

    // saves data and posts - routes if the user chose to continue
    $scope.saveAvailability = function(doRoute) {
        var availableSlots = [];
        var user = UserInfoService.getUserId();
        var user2 = { 'user' : UserInfoService.getUserId(), isAvailabilityComplete:0 };
        $scope.processAvailability(user, availableSlots);
        if (availableSlots.length > 0) {
            var data = {availableSlots:availableSlots, isAvailabilityComplete:1, appStatus:AppStatusService.checkStatus('availability', 1)};           
            $http.post('/availability', data).then(function successCallback(response) {
                if (doRoute === true) {
                    $location.path('/languages'); 
                } else {
                $scope.saveMessage = 'Save Successful!';
                $timeout(function() { 
                    $scope.saveMessage = '';
                }, 1500);
            }
            }, function errorCallback(response) {
                //TODO
            });     
        } else {
            user2.appStatus = AppStatusService.checkStatus('availability', 0);
            $http.post('/availability', user2).then(function successCallback(response) {
                if (doRoute === true) {
                    $location.path('/languages'); 
                } else {
                    $scope.saveMessage = 'Save Successful!';
                    $timeout(function() { 
                        $scope.saveMessage = '';
                    }, 1500);
                }
            }, function errorCallback(response) {
                //TODO
            }); 
        } 
    }

    // saves all checked values
    $scope.processAvailability = function(user, availableSlots) {
        var timeslotObj = [];
        var hours = '';
        var day = '';
        for (var x = 0; x < 5; x++) {
            day = $scope.days[x];
            for (var i = 0; i < 6; i++) {
                if (document.getElementsByName(day)[i].checked === true) {
                    hours = JSON.parse(document.getElementsByName(day)[i].value);
                    timeslotObj = [day, convertTime12to24(hours.startHour), convertTime12to24(hours.stopHour), user];
                    availableSlots.push(timeslotObj);
                }
            }
        }
    }

    function convertTime12to24(time12h) {
        const [time, modifier] = time12h.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') {
            hours = '00';
        }
          
        if (modifier === 'PM') {
            hours = parseInt(hours, 10) + 12;
        }
        return hours + ':' + minutes + ':' + '00';
    }   
    
    // unchecks all boxes
    $scope.resetAll = function() {
        for (var x = 0; x < 5; x++) {
            day = $scope.days[x];
            for (var i = 0; i < 6; i++) {
                document.getElementsByName(day)[i].checked = false;
            }
        }
    } 
    
    // checks all boxes
    $scope.checkAll = function() {
        for (var x = 0; x < 5; x++) {
            day = $scope.days[x];
            for (var i = 0; i < 6; i++) {
                document.getElementsByName(day)[i].checked = true;
            }
        }
    }
    
    // when page loads, runs setPreviousSchedule which poplulates fiels with 
    // previously saved data
    angular.element(document).ready(function(){       
        // displays the current semester and year for which the student is applying. comes from PC-set deadline
        $http.get('programChair/getDeadline').then(function successCallback(response) {
            var year = new Date(response.data.date).getFullYear();
            $scope.semesterName = response.data.semester + ' ' + year;
        }, function errorCallback(response) {
            // empty
        });  
        $scope.setPreviousSchedule();
    });
  
    $scope.setPreviousSchedule = function() {
        $scope.resetAll();
        $http.get('/availability').then(function successCallback(response) {
            var res = JSON.parse(JSON.stringify(response.data));
            if (res.data) {
                var slots = [];
                var hour = '';
                var day = '';
                for (var x = 0; x < 5; x++) {
                    day = $scope.days[x];
                    for (var i = 0; i < 6; i++) {
                        for (var y = 0; y < res.data.length; y++) {
                            if(day === res.data[y].calendarDay && 
                           (JSON.parse(document.getElementsByName(day)[i].value).startHour) === convertTime24to12(res.data[y].startHour)) {
                               document.getElementsByName(day)[i].checked = true;
                           }
                        }
                    }
                }
            }
        }, function errorCallback(response) {
            //TODO
        });
    }

    function convertTime24to12(isoTime) {
        var hours   = parseInt(isoTime.substring(0, 2), 10),
        minutes = isoTime.substring(3, 5),
        ampm    = 'AM';

        if (hours == 12) {
            ampm = 'PM';
        } else if (hours == 0) {
            hours = 12;
        } else if (hours > 12) {
            hours -= 12;
            ampm = 'PM';
        }
        return hours + ':' + minutes + ' ' + ampm;
    }
});

application.controller('languagesInfoController', function($scope, $location, $http, $timeout, UserInfoService, AppStatusService) {
    $scope.logout = function() {
        UserInfoService.clearUserSession();
        $location.path('/login');
    }
    // try moving this to Service as an angular.value or constant
    // ordered as in the database
    $scope.languages = [{'name':'C','level':'c_group'},
                        {'name':'C++','level':'cpp_group'},
                        {'name':'CSS','level':'css_group'},
                        {'name':'HTML','level':'html_group'},
                        {'name':'Java','level':'java_group'},
                        {'name':'Javascript','level':'js_group'},
                        {'name':'JSON','level':'json_group'},
                        {'name':'Python','level':'python_group'},
                        {'name':'SQL','level':'sql_group'},
                        {'name':'Swift','level':'swift_group'},
                        {'name':'Verilog','level':'verilog_group'},
                        {'name':'XML','level':'xml_group'}
                       ];
                       
     $scope.ides = [{'name':'Android Studio','box':'as_box'},
                    {'name':'Brackets','box':'brackets_box'},
                    {'name':'IntelliJ','box':'intellij_box'},
                    {'name':'NetBeans','box':'netbeans_box'},
                    {'name':'Xcode','box':'xcode_box'}
                   ];
                   
     $scope.tools = [{'name':'GitHub','box':'github_box'},
                     {'name':'Taiga','box':'taiga_box'},
                     {'name':'Slack','box':'slack_box'}
                    ];
                 
    // on page load, retrieve prior saved data                  
    angular.element(document).ready(function(){
        $http.get('/languages').then(function successCallback(response) {
            var res = JSON.parse(JSON.stringify(response.data));
            // fill previous saved language selections
            // loads all other languages into array
            for (var k = 0; k < res.data.languageData.length; k++) {
                if(res.data.languageData[k].OtherLanguage != null) {
                    $scope.languages.push({'name' : res.data.languageData[k].OtherLanguage, 'level' : res.data.languageData[k].OtherLevel});   
                }
            }
            // populates page of previous language selections
            for (var i = 0; i < $scope.languages.length; i++) {
                for (var j = 0; j < res.data.languageData.length; j++) {
                    if ($scope.languages[i].name === res.data.languageData[j].isLanguage) {
                        $scope.languages[i].level = res.data.languageData[j].LanguageLevel;
                    }
                }
            }
            // fill previous saved ide selections
            // loads all other ides into array
            for (var p = 0; p < res.data.ideData.length; p++) {
                if(res.data.ideData[p].OtherIDE != null) {
                    $scope.ides.push({'name' : res.data.ideData[p].OtherIDE, 'box' : 1});     
                }
            }
            // populates page of previous ide selections
            for (var m = 0; m < $scope.ides.length; m++) {
                for (var n = 0; n < res.data.ideData.length; n++) {
                    if ($scope.ides[m].name === res.data.ideData[n].isIDE) {
                        $scope.ides[m].box = 1;
                    }  
                }
            }
            // fill previous saved tools selections
            // loads all other tools into array
            for (var s = 0; s < res.data.toolData.length; s++) {
                if(res.data.toolData[s].OtherTool != null) {
                    $scope.tools.push({'name' : res.data.toolData[s].OtherTool, 'box' : 1});     
                }
            }
            // populates page of previous tool selections
            for (var q = 0; q < $scope.tools.length; q++) {
                for (var r = 0; r < res.data.toolData.length; r++) {
                    if ($scope.tools[q].name === res.data.toolData[r].isTool) {
                        $scope.tools[q].box = 1;
                    }  
                }
            }
        }, function errorCallback(response) {
            //TODO
        });
    });

    // saves all data on page
    $scope.saveLanguages= function(doRoute) {
        var data = [];
        var languages = [];
        var ides = [];
        var tools = [];
        var user = [];
        // 12 is number of hard coded languages in $scope.languages
        for (var i = 0; i < 12; i++) {
            if ($scope.languages[i].level === 'Expert' || $scope.languages[i].level === 'Proficient' || $scope.languages[i].level === 'Novice') {
                var arr = [$scope.languages[i].name, $scope.languages[i].level, null, null, UserInfoService.getUserId()];
                languages.push(arr);
            }   
        }
        // Grabs any pre-populated Other Languages
        for (var j = 12; j < $scope.languages.length; j++) {
            if ($scope.languages[j].level === 'Expert' || $scope.languages[j].level === 'Proficient' || $scope.languages[j].level === 'Novice') {
                var arr = [null, null, $scope.languages[j].name, $scope.languages[j].level, UserInfoService.getUserId()];
                languages.push(arr);
            }
        }
        // Grabs any new Other Languages
        var count = document.getElementById('spaceforlanguages').getElementsByTagName('input').length / 4; // Each other language has 4 inputs (text, 3 radio buttons)
        if ($scope.otherLanguage != null) {
            for (var k = 0; k < count; k++) {    
                if ($scope.otherLanguage[k+1] != null && $scope.otherLanguage[k+1] != '' && $scope.otherLanguageLevel[k+1] != null) {
                    var arr = [null, null, $scope.otherLanguage[k+1], $scope.otherLanguageLevel[k+1], UserInfoService.getUserId()]; 
                    languages.push(arr);  
                }
            } 
        }      
        data.push(languages);

        // 5 is number of hard coded ides in $scope.ides
        for (var i = 0; i < 5; i++) {
            if ($scope.ides[i].box === 1) {
                var arr = [$scope.ides[i].name, null, UserInfoService.getUserId()];
                ides.push(arr);
            }   
        }
        // Grabs any pre-populated Other IDEs
        for (var j = 5; j < $scope.ides.length; j++) {
            if ($scope.ides[j].box === 1) {
                var arr = [null, $scope.ides[j].name, UserInfoService.getUserId()];
                ides.push(arr);
            }
        }
        // Grabs any new Other IDEs
        var count = document.getElementById('spaceforides').getElementsByTagName('input').length;
        if ($scope.otherIDE != null) {
            for (var k = 0; k < count; k++) {
                if ($scope.otherIDE[k+1] != null && $scope.otherIDE[k+1] != '') {
                    var arr = [null, $scope.otherIDE[k+1], UserInfoService.getUserId()]; 
                    ides.push(arr);  
                }
            }   
        }       
        data.push(ides);

        // 3 is number of hard coded tools in $scope.tools
        for (var i = 0; i < 3; i++) {
            if ($scope.tools[i].box === 1) {
                var arr = [$scope.tools[i].name, null, UserInfoService.getUserId()];
                tools.push(arr);
            }   
        }
        // Grabs any pre-populated Other Tools
        for (var j = 3; j < $scope.tools.length; j++) {
            if ($scope.tools[j].box === 1) {
                var arr = [null, $scope.tools[j].name, UserInfoService.getUserId()];
                tools.push(arr);
            }
        }
        // Grabs any new Other Tools
        var count = document.getElementById('spacefortools').getElementsByTagName('input').length;
        if ($scope.otherTool != null) {
            for (var k = 0; k < count; k++) {
                if ($scope.otherTool[k+1] != null && $scope.otherTool[k+1] != '') {
                    var arr = [null, $scope.otherTool[k+1], UserInfoService.getUserId()]; 
                    tools.push(arr);  
                }
            }
        }
        data.push(tools);
        user.push(UserInfoService.getUserId());
        data.push(user);
        var pkgData = {data:data};
        if (data[0].length > 0 && data[1].length > 0 && data[2].length > 0) {
            pkgData.isLanguagesComplete = 1;
            pkgData.appStatus = AppStatusService.checkStatus('languages', 1);
        } else {
            pkgData.isLanguagesComplete = 0;
            pkgData.appStatus = AppStatusService.checkStatus('languages', 0);
        }
        $http.post('/languages', pkgData).then(function successCallback(response) {
            if (doRoute === true) {
                $location.path('/courses'); 
            } else {
                $scope.saveMessage = 'Save Successful!';
                $timeout(function() { 
                    $scope.saveMessage = '';
                }, 1500);
            }
        }, function errorCallback(response) {
            // TO DO
        });
    } // end saveLanguages

    $scope.deselectLevel = function(element, count) {
        if (element.language) {
            element.language.level = null;   
        } else if (count)  {
            element.otherLanguageLevel[count] = null;
        }  
    }

    // Not functioning -- Still need to clear ides and tools
    /*$scope.clearUnselected = function() {
        for (var i = 0; i < $scope.languages.length; i++) {
            if ($scope.languages[i].box === 0) {
                $scope.languages[i].level = null;
            }
        }
    }*/       
});

application.controller('coursesInfoController', function($scope, $location, $http, $timeout, UserInfoService, AppStatusService) {
    $scope.courses = [];
    
    $scope.logout = function() {
        UserInfoService.clearUserSession();
        $location.path('/login');
    }
     // populates courses table
    $http.get('/courses/courseTable').then(function successCallback(response) {
                $scope.courses = response.data;
                $scope.courseLength = response.data.length;
            }, function errorCallback(response) {
                //TODO
            });
                         
    // on page load, retrieve prior saved data                  
    angular.element(document).ready(function(){
        $http.get('/courses').then(function successCallback(response) {
            var res = JSON.parse(JSON.stringify(response.data));
            // fill previous saved course selections
            // loads all other courses into array
            for (var k = 0; k < res.data.courseData.length; k++) {
                if(res.data.courseData[k].OtherCourse != null) {
                    $scope.courses.push({'name' : res.data.courseData[k].OtherCourse, prefer: res.data.courseData[k].isOtherPrefer, qualified: res.data.courseData[k].isOtherQualified, prevTA: res.data.courseData[k].isOtherPreviouslyTA, prevGrader: res.data.courseData[k].isOtherPreviouslyGrader});   
                }
            }
            // populates page of previous course selections
            for (var i = 0; i < $scope.courses.length; i++) {
                for (var j = 0; j < res.data.courseData.length; j++) {
                    if ($scope.courses[i].CourseSection === res.data.courseData[j].isCourse) {
                        $scope.courses[i].prefer = res.data.courseData[j].isPrefer;
                        $scope.courses[i].qualified = res.data.courseData[j].isQualified;
                        $scope.courses[i].prevTA = res.data.courseData[j].isPreviouslyTA;
                        $scope.courses[i].prevGrader = res.data.courseData[j].isPreviouslyGrader;
                    }
                }
            }
        }, function errorCallback(response) {
            //TODO
        });
    });

    // saves all data on page
    $scope.saveCourses= function(doRoute) {
        var data = [];
        var courses = [];
        var user = [];
        // gets length of courses in database
        for (var i = 0; i < $scope.courseLength; i++) {
            if ($scope.courses[i].prefer === 1 || $scope.courses[i].qualified === 1 || $scope.courses[i].prevTA === 1 || $scope.courses[i].prevGrader === 1) {
                var arr = [$scope.courses[i].CourseSection, $scope.courses[i].prefer, $scope.courses[i].qualified, $scope.courses[i].prevTA, $scope.courses[i].prevGrader, null, null, null, null, null, UserInfoService.getUserId()];
                courses.push(arr);
            }   
        }
        // Grabs any pre-populated Other Courses
        for (var j = $scope.courseLength; j < $scope.courses.length; j++) {
            if ($scope.courses[j].prefer === 1 || $scope.courses[j].qualified === 1 || $scope.courses[j].prevTA === 1 || $scope.courses[j].prevGrader === 1) {
                var arr = [null, null, null, null, null, $scope.courses[j].name, $scope.courses[j].prefer, $scope.courses[j].qualified, $scope.courses[j].prevTA, $scope.courses[j].prevGrader, UserInfoService.getUserId()];
                courses.push(arr);
            }
        }
        // Grabs any new Other Courses
        var count = document.getElementById('spaceforcourses').getElementsByTagName('input').length / 5; // Each other course has 4 inputs (text, 4 radio buttons)
        if ($scope.otherCourse != null) {
            for (var k = 0; k < count; k++) {  
                if ($scope.otherCourse[k+1] != null && $scope.otherCourse[k+1] != '' && ($scope.otherPrefer[k+1] === 1 || $scope.otherQualified[k+1] === 1 || $scope.otherPrevTA[k+1] === 1 || $scope.otherPrevGrader[k+1] === 1)) {
                    var arr = [null, null, null, null, null, $scope.otherCourse[k+1], $scope.otherPrefer[k+1], $scope.otherQualified[k+1], $scope.otherPrevTA[k+1], $scope.otherPrevGrader[k+1], UserInfoService.getUserId()]; 
                    courses.push(arr);  
                }
            } 
        }      
        data.push(courses);
        user.push(UserInfoService.getUserId());
        data.push(user);
        var pkgData = {data:data};
        if (data[0].length > 0) {
            pkgData.isCoursesComplete = 1;
            pkgData.appStatus = AppStatusService.checkStatus('courses', 1);
        } else {
            pkgData.isCoursesComplete = 0;
            pkgData.appStatus = AppStatusService.checkStatus('courses', 0);
        }
        $http.post('/courses', pkgData).then(function successCallback(response) {
            if (doRoute === true) {
                $location.path('/studentHome'); 
            } else {
                $scope.saveMessage = 'Save Successful!';
                $timeout(function() { 
                    $scope.saveMessage = '';
                }, 1500);
            }
        }, function errorCallback(response) {
            // TO DO
        });
    }
});