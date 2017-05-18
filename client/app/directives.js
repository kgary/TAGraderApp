'use-strict'
/*
 * File: directives.js
 * Description: Used for dynamically adding elements to the DOM with angular control
 */

// setup directives module
var directives = angular.module('app.directives',[]);

/*
 * Displays notice items for admin users. These include count of incomplete applications, count of complete applications, and a notices if the deadline is within a week, that day, or has past. 
 */
directives.directive('adminNoticeDirective', function($compile, DeadlineDateCheckService, PCActionsService) {
    function notices(scope, element, attrs) {
        if (DeadlineDateCheckService.deadlineNotice === 0) {
            angular.element(document.getElementById('adminNoticeCalls')).append($compile("<div>The application deadline is today! The Program Chair should set a new deadline as soon as possible for the next session of applications!</div>")(scope));
        }
        if (DeadlineDateCheckService.deadlineNotice === 1) {
                angular.element(document.getElementById('adminNoticeCalls')).append($compile("<div>Note, the application deadline is coming up soon! Students should have applications completed by the deadline!</div>")(scope));
        }
        if (DeadlineDateCheckService.deadlineNotice === 2) {
            angular.element(document.getElementById('adminNoticeCalls')).append($compile("<div>The application deadline has passed! The Program Chair should set a new deadline as soon as possible for the next session of applications!</div>")(scope));
        }
        angular.element(document.getElementById('adminNoticeCalls')).append($compile("<div>" + PCActionsService.callTo.incompleteApps + " student applications are still incomplete!</div><div>" + PCActionsService.callTo.completeApps + " student applications are complete!</div>")(scope));
    }
    return {
        link: notices
    };
});

/*
 * Displays the PC call to action items for admin users, however for an admin they are shown as status updates.
 */
directives.directive('adminActionsDirective', function($compile, DeadlineDateCheckService, PCActionsService, StudentActionsService) {
    function actions(scope, element, attrs) {
        if (PCActionsService.callTo.hasActions === 0) {
            angular.element(document.getElementById('adminActions')).append($compile("<div>No actions needed!</div>")(scope));
        }
        else {
            if (PCActionsService.callTo.incompleteClasses.length > 0) {
                angular.element(document.getElementById('adminActions')).append($compile("<div>There are still " + PCActionsService.callTo.incompleteClasses.length + " class(es) indicated as incomplete:<div ng-repeat='class in incompleteClasses'><strong>{{class.class}}</strong></div></div><br>")(scope));           
            }
            if (PCActionsService.callTo.placements.missingPlacements.length > 0) {
                angular.element(document.getElementById('adminActions')).append($compile("<div>There are still " + PCActionsService.callTo.placements.missingPlacements.length + " class(es) with no student assignments:<div ng-repeat='class in missingPlacementClasses'><strong>{{class.class}}</strong></div></div><br>")(scope));           
            }
            if (PCActionsService.callTo.placements.missingTA.length > 0) {
                angular.element(document.getElementById('adminActions')).append($compile("<div>There are still " + PCActionsService.callTo.placements.missingTA.length + " class(es) without a TA in place:<div ng-repeat='class in missingTAClasses'><strong>{{class.class}}</strong></div></div><br>")(scope));  
            }
            if (PCActionsService.callTo.placements.missingGrader.length > 0) {
                angular.element(document.getElementById('adminActions')).append($compile("<div>There are still " + PCActionsService.callTo.placements.missingGrader.length + " class(es) without a Grader in place:<div ng-repeat='class in missingGraderClasses'><strong>{{class.class}}</strong></div></div><br>")(scope));  
            }
            if (PCActionsService.callTo.placements.needTAConfirmation.length > 0) {
                angular.element(document.getElementById('adminActions')).append($compile("<div>There are still " + PCActionsService.callTo.placements.needTAConfirmation.length + " class(es) without a TA confirmed:<div ng-repeat='class in needTAConfirmation'><strong>{{class.class}}</strong></div></div><br>")(scope));  
            }
            if (PCActionsService.callTo.placements.needGraderConfirmation.length > 0) {
                angular.element(document.getElementById('adminActions')).append($compile("<div>There are still " + PCActionsService.callTo.placements.needGraderConfirmation.length + " class(es) without a Grader confirmed:<div ng-repeat='class in needGraderConfirmation'><strong>{{class.class}}</strong></div></div><br>")(scope));  
            }
            if (PCActionsService.callTo.placements.needTAHours.length > 0) {
                angular.element(document.getElementById('adminActions')).append($compile("<div>There are still " + PCActionsService.callTo.placements.needTAHours.length + " class(es) lacking assigned TA hours:<div ng-repeat='class in needTAHours'><strong>{{class.class}}</strong></div></div><br>")(scope));  
            }
            if (PCActionsService.callTo.placements.needGraderHours.length > 0) {
                angular.element(document.getElementById('adminActions')).append($compile("<div>There are still " + PCActionsService.callTo.placements.needGraderHours.length + " class(es) lacking assigned Grader hours:<div ng-repeat='class in needGraderHours'><strong>{{class.class}}</strong></div></div>")(scope));  
            }
        }
    }
    return {
        link: actions
    };
});

/*
 * Displays notice items for PC. These include count of newly started applications since last login, count of
 * incomplete applications, count of complete applications, and a notice if the deadline is within a week. 
 */
directives.directive('pcNoticeDirective', function($compile, DeadlineDateCheckService, PCActionsService) {
    function notices(scope, element, attrs) {
        if (DeadlineDateCheckService.deadlineNotice === 1) {
                angular.element(document.getElementById('pcNoticeCalls')).append($compile("<div>The application deadline is coming up soon!</div>")(scope));
        }
        angular.element(document.getElementById('pcNoticeCalls')).append($compile("<div>" + PCActionsService.callTo.newApps + " student applications have been started since you last logged in!</div><div>" + PCActionsService.callTo.incompleteApps + " student applications are still incomplete!</div><div>" + PCActionsService.callTo.completeApps + " student applications are complete!</div>")(scope));
    }
    return {
        link: notices
    };
});

/*
 * Displays call to action items for PC. These include if the deadline is that day or the deadline has passed, classes that 
 * are incomplete, classes missing student assignments, classes without confirmed students, and classes with missinged 
 * assigned hours. 
 */
directives.directive('pcActionsDirective', function($compile, DeadlineDateCheckService, PCActionsService, StudentActionsService) {
    function actions(scope, element, attrs) {
        if (PCActionsService.callTo.hasActions === 0 && (DeadlineDateCheckService.deadlineNotice === 1 || DeadlineDateCheckService.deadlineNotice === 3) && PCActionsService.callTo.compliedStudents.length ===0) {
            angular.element(document.getElementById('pcActions')).append($compile("<div>You have nothing to do!</div>")(scope));
        }
        else {
            if (DeadlineDateCheckService.deadlineNotice === 0) {
                angular.element(document.getElementById('pcActions')).append($compile("<div>The application deadline is today! Remember to set a new deadline as soon as possible for the next session of applications!</div>")(scope));
            }
            if (DeadlineDateCheckService.deadlineNotice === 2) {
                angular.element(document.getElementById('pcActions')).append($compile("<div>The application deadline has passed! Remember to set a new deadline as soon as possible for the next session of applications!</div>")(scope));
            }
            if (PCActionsService.callTo.compliedStudents.length > 0) {
                angular.element(document.getElementById('pcActions')).append($compile("<div>The following students have indicated they have complied with your application feedback:<div ng-repeat='name in names'>Name: <a ng-href='#!/studentInfoPC/{{name.ASURITE_ID}}'>{{name.StudentName}}</a> ({{name.ASURITE_ID}})</div></div><br>")(scope));  
            }
            if (PCActionsService.callTo.incompleteClasses.length > 0) {
                angular.element(document.getElementById('pcActions')).append($compile("<div>You still have " + PCActionsService.callTo.incompleteClasses.length + " class(es) indicated as incomplete. Select a class to continue working<select ng-model='incompleteClass' ng-options='class as class.class for class in incompleteClasses' ng-change='go(incompleteClass)'><option value=''>Select Class</option></select></div>")(scope));           
            }
            if (PCActionsService.callTo.placements.missingPlacements.length > 0) {
                angular.element(document.getElementById('pcActions')).append($compile("<div>You still have " + PCActionsService.callTo.placements.missingPlacements.length + " class(es) with no student assignments. Select a class to continue working<select ng-model='missingPlacementClass' ng-options='class as class.class for class in missingPlacementClasses' ng-change='go(missingPlacementClass)'><option value=''>Select Class</option></select></div>")(scope));           
            }
            if (PCActionsService.callTo.placements.missingTA.length > 0) {
                angular.element(document.getElementById('pcActions')).append($compile("<div>You still have " + PCActionsService.callTo.placements.missingTA.length + " class(es) without a TA in place. Select a class to continue working<select ng-model='missingTAClass' ng-options='class as class.class for class in missingTAClasses' ng-change='go(missingTAClass)'><option value=''>Select Class</option></select></div>")(scope));  
            }
            if (PCActionsService.callTo.placements.missingGrader.length > 0) {
                angular.element(document.getElementById('pcActions')).append($compile("<div>You still have " + PCActionsService.callTo.placements.missingGrader.length + " class(es) without a Grader in place. Select a class to continue working<select ng-model='missingGraderClass' ng-options='class as class.class for class in missingGraderClasses' ng-change='go(missingGraderClass)'><option value=''>Select Class</option></select></div>")(scope));  
            }
            if (PCActionsService.callTo.placements.needTAConfirmation.length > 0) {
                angular.element(document.getElementById('pcActions')).append($compile("<div>You still have " + PCActionsService.callTo.placements.needTAConfirmation.length + " class(es) without a TA confirmed. Select a class to continue working<select ng-model='needTAConfirmationClass' ng-options='class as class.class for class in needTAConfirmation' ng-change='go(needTAConfirmationClass)'><option value=''>Select Class</option></select></div>")(scope));  
            }
            if (PCActionsService.callTo.placements.needGraderConfirmation.length > 0) {
                angular.element(document.getElementById('pcActions')).append($compile("<div>You still have " + PCActionsService.callTo.placements.needGraderConfirmation.length + " class(es) without a Grader confirmed. Select a class to continue working<select ng-model='needGraderConfirmationClass' ng-options='class as class.class for class in needGraderConfirmation' ng-change='go(needGraderConfirmationClass)'><option value=''>Select Class</option></select></div>")(scope));  
            }
            if (PCActionsService.callTo.placements.needTAHours.length > 0) {
                angular.element(document.getElementById('pcActions')).append($compile("<div>You still have " + PCActionsService.callTo.placements.needTAHours.length + " class(es) lacking assigned TA hours. Select a class to continue working<select ng-model='needTAHoursClass' ng-options='class as class.class for class in needTAHours' ng-change='go(needTAHoursClass)'><option value=''>Select Class</option></select></div>")(scope));  
            }
            if (PCActionsService.callTo.placements.needGraderHours.length > 0) {
                angular.element(document.getElementById('pcActions')).append($compile("<div>You still have " + PCActionsService.callTo.placements.needGraderHours.length + " class(es) lacking assigned Grader hours. Select a class to continue working<select ng-model='needGraderHoursClass' ng-options='class as class.class for class in needGraderHours' ng-change='go(needGraderHoursClass)'><option value=''>Select Class</option></select></div>")(scope));  
            }
        }
    }
    return {
        link: actions
    };
});

/*
 * Displays call to action for application fields
 */
directives.directive('studentActionsDirective', function($compile, StudentActionsService, APPLICATION_LINKS) {
   function actions(scope, element, attrs) {
        if (StudentActionsService.callTo.hasAppActions === 0) {
            angular.element(document.getElementById('appCalls')).append($compile("<div>Your application has not been started!</div>")(scope));
        } else if (StudentActionsService.callTo.hasAppActions === 1) {
            for (var i = 0; i < StudentActionsService.callTo.appActions.length; i++) {
                var pageName = StudentActionsService.callTo.appActions[i].page;
                var missingItemsName = pageName + '_items';
                angular.element(document.getElementById('appCalls')).append($compile("<label><b>You have some missing items from the "+ pageName +" page. Please provide the following info:</b></label><div ng-repeat='item in "+ missingItemsName +"'>{{item}}</div><b><a href='"+ APPLICATION_LINKS[pageName] +"'>Go to "+ pageName +" page</a></b><br><br>")(scope));
            }
        } else if (StudentActionsService.callTo.hasAppActions === 2) {
            angular.element(document.getElementById('appCalls')).append($compile("<div>Your application is not missing anything!</div>")(scope));
        }
    }
    return {
        link: actions
    };
});

/*
 * Displays call to action notice of the application deadline and if the student is on probation
 */
app.directive('studentNoticeDirective', function($compile, UserInfoService, StudentActionsService, DeadlineDateCheckService, APPLICATION_LINKS) {
    function notices(scope, element, attrs) {
        if (DeadlineDateCheckService.deadlineNotice === 0) {
            angular.element(document.getElementById('noticeCalls')).append($compile("<div>Applications are due today! Please have your application complete by the deadline!</div>")(scope));
        }
        if (DeadlineDateCheckService.deadlineNotice === 1) {
            angular.element(document.getElementById('noticeCalls')).append($compile("<div>Applications are due within the next 7 days! Please have your application complete by the deadline!</div>")(scope));
        }
        if (StudentActionsService.callTo.onProbation === 1) {
            angular.element(document.getElementById('noticeCalls')).append($compile("<div>You have indicated on your application that you are on academic probation. Your application won't be considered until the academic probation has been cleared!<br><a href='"+ APPLICATION_LINKS.Education +"'>Go to Education page</div>")(scope));
        } 
        if (StudentActionsService.callTo.onProbation === 0 && (DeadlineDateCheckService.deadlineNotice === 2 || DeadlineDateCheckService.deadlineNotice === 3)) {
            angular.element(document.getElementById('noticeCalls')).append($compile("<div>You have no current notices.</div>")(scope));
        } 
    }
    return {
        link: notices
    };
});

// Directive for adding add language button
directives.directive('addlanguagesbutton', function () {
    return {
        restrict: "E",
		template: "<button addlanguages class='myButton'>Add Another Language</button>"
    };
});

// Directive for text input and radio buttons on click of add languages button
directives.directive("addlanguages", function($compile){
    return function(scope, element, attrs){
        var count = '';
        var model = '';
        element.bind("click", function(){
            if (document.getElementById('spaceforlanguages').getElementsByTagName('input').length === 0) {
                count = (document.getElementById('spaceforlanguages').getElementsByTagName('input').length + 1);    
            } else {
                count = ((document.getElementById('spaceforlanguages').getElementsByTagName('input').length / 4) + 1);
            }
            scope.message = "*You must select a level to save additional language";         
            angular.element(document.getElementById('spaceforlanguages')).append($compile("<input type='text' ng-model='otherLanguage["+count+"]' placeholder='Language Name'><div class='otherl'><span><input type='radio' ng-model='otherLanguageLevel["+count+"]' value='Expert' ng-dblclick='deselectLevel(this, "+count+")'><label>Expert</label><input type='radio' ng-model='otherLanguageLevel["+count+"]' value='Proficient' ng-dblclick='deselectLevel(this, "+count+")'><label>Proficient</label><input type='radio' ng-model='otherLanguageLevel["+count+"]' value='Novice' ng-dblclick='deselectLevel(this, "+count+")'><label>Novice</label></div><br><br></span>")(scope));        
        });
    };
});

// Directive for add ides button
directives.directive('addidesbutton', function () {
    return {
        restrict: "E",
		template: "<button addides class='myButton'>Add Another IDE</button>"
    };
});

// Directive for text input on click of add ides button
directives.directive("addides", function($compile){
	return function(scope, element, attrs){
		element.bind("click", function(){
			var count = (document.getElementById('spaceforides').getElementsByTagName('input').length + 1);
			angular.element(document.getElementById('spaceforides')).append($compile("<input type='text' ng-model='otherIDE["+count+"]' placeholder='IDE Name'><br>")(scope));        
		});
	};
});

// Directive for add tools button
directives.directive('addtoolsbutton', function () {
        return {
            restrict: "E",
			template: "<button addtools class='myButton'>Add Another Tool</button>"
        };
    });

// Directive for text input on click of add tools button
directives.directive("addtools", function($compile){
	return function(scope, element, attrs){
		element.bind("click", function(){
			var count = (document.getElementById('spacefortools').getElementsByTagName('input').length + 1);
			angular.element(document.getElementById('spacefortools')).append($compile("<input type='text' ng-model='otherTool["+count+"]' placeholder='Tool Name'><br>")(scope));        
		});
	};
});

// Directive for file upload (ipos, transcript, resume)
directives.directive('fileInput', ['$parse', function ($parse) {
	return {
    	restrict: 'A',
    	link: function(scope, element, attrs) {
        	var model = $parse(attrs.fileInput);
        	var modelSetter = model.assign;
	        element.bind('change', function(){
	            scope.$apply(function(){
	                modelSetter(scope, element[0].files[0]);
	            });
        	});
    	}
	};
}]);

// Directive for adding add courses button
directives.directive('addcoursesbutton', function () {
    return {
        restrict: "E",
		template: "<button addcourses class='myButton'>Add Another Course</button>"
    };
});

// Directive for text input and radio buttons on click of add courses button
directives.directive("addcourses", function($compile){
    return function(scope, element, attrs){
        var count = '';
        var model = '';
        element.bind("click", function(){
            if (document.getElementById('spaceforcourses').getElementsByTagName('input').length === 0) {
                count = (document.getElementById('spaceforcourses').getElementsByTagName('input').length + 1);  
            } else {
                count = ((document.getElementById('spaceforcourses').getElementsByTagName('input').length / 5) + 1);
            }
            scope.message = "*You must select a level to save additional course";   
            angular.element(document.getElementById('spaceforcourses')).append($compile("<input type='text' ng-model='otherCourse["+count+"]' placeholder='Course Name'><div class='otherc'><span><input type='checkbox' ng-model='otherPrefer["+count+"]' ng-true-value='1' ng-false-value='0' ng-init='otherPrefer["+count+"]=0'><label>Prefer</label><input type='checkbox' ng-model='otherQualified["+count+"]' ng-true-value='1' ng-false-value='0' ng-init='otherQualified["+count+"]=0'><label>Qualified</label><input type='checkbox' ng-model='otherPrevTA["+count+"]' ng-true-value='1' ng-false-value='0' ng-init='otherPrevTA["+count+"]=0'><label>Previously TA</label><input type='checkbox' ng-model='otherPrevGrader["+count+"]' ng-true-value='1' ng-false-value='0' ng-init='otherPrevGrader["+count+"]=0'><label>Previously Grader</label></div><br><br></span>")(scope));               
        });
    };
});

// Directive for add status button on program chair class summary page
directives.directive('addstatusbutton', function () {
    return {
        restrict: "E",
		template: "<button addstatus ng-disabled='disableUpdateStatus' ng-click='showStatusUpdate = true; disableUpdateStatus = true' class='myButton'>Update Status</button>"
    };
});

// Directive for radio button buttons and save/cancel buttons on click of addsatausbutton on program chair class summary page
directives.directive("addstatus", function($compile){
    return function(scope, element, attrs){
        element.bind("click", function(){
            angular.element(document.getElementById('spaceforstatus')).append($compile("<br><input type='radio' ng-model=status required value='Incomplete' name='status'>Incomplete</input><input type='radio' ng-model=status value='Complete' name='status' style='margin-left: 10px;'>Complete<br><br><input type='button' ng-click='saveStatus()' value='Save' style='margin-right: 10px;'></input><input type='button' ng-click='cancelStatusUpdate()' value='Cancel'></input><br>")(scope));    
        });
    };
});

// Directive for add enrollment button on program chair class summary page
directives.directive('addenrollmentbutton', function () {
    return {
        restrict: "E",
		template: "<button addenrollment ng-disabled='disableUpdateEnrollment' ng-click='showEnrollmentUpdate = true; disableUpdateEnrollment = true' class='myButton'>Update Enrollment</button>"
    };
});

// Directive for text input and save/cancel button on click of add enrollment button on program chair class summary page
directives.directive("addenrollment", function($compile){
	return function(scope, element, attrs){
		element.bind("click", function(){
			angular.element(document.getElementById('spaceforenrollment')).append($compile("<br><input type='number' ng-model='enrollmentUpdate' placeholder='Input Enrollment'><input type='button' ng-click='saveEnrollment(enrollmentUpdate)' value='Save' style='margin-left: 10px; margin-right: 10px'></input><input type='button' ng-click='cancelEnrollmentUpdate()' value='Cancel'></input><br><label ng-show='enrollmentError' style='color:red;'>Please enter a value or hit Cancel</label>")(scope));     
		});
	};
});

// Directive for add required hours button on program chair class summary page
directives.directive('addrequiredhoursbutton', function () {
    return {
        restrict: "E",
		template: "<button addrequiredhours ng-disabled='disableUpdateRequiredHours' ng-click='showRequiredHoursUpdate = true; disableUpdateRequiredHours = true' class='myButton'>Update Required Hours</button>"
    };
});

// Directive for two text inputs and save/cancel button on click of add required hours button on program chair class summary page
directives.directive("addrequiredhours", function($compile){
	return function(scope, element, attrs){
		element.bind("click", function(){
			angular.element(document.getElementById('spaceforrequiredhours')).append($compile("<br>TA: <input type='number' ng-model='requiredTAHoursUpdate' placeholder='Input Required TA Hours'>Grader: <input type='number' ng-model='requiredGraderHoursUpdate' placeholder='Input Required Grader Hours'><input type='button' ng-click='saveRequiredHours(requiredTAHoursUpdate, requiredGraderHoursUpdate)' value='Save' style='margin-left: 10px; margin-right: 10px'></input><input type='button' ng-click='cancelRequiredHoursUpdate()' value='Cancel'></input><br><label ng-show='requiredHoursError' style='color:red;'>Please enter a value or hit Cancel</label>")(scope));     
		});
	};
});