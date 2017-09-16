'use-strict'
/*
 * programChair.js used to modularize (module) and control (controllers) the Program Chair User (other than homepage)
 * It will control what content is displayed and launching of Program Chair tasks
 */

// setup user module
var programChair = angular.module('app.programChair', []);

programChair.controller('classSummaryController', function($route, $scope, $http, $location, $timeout, $anchorScroll, SendClassService, SendStudentService) {
    $scope.enrollments = [];
    var studentsToAssign = [];
    $scope.toSave = [];
    $scope.studentsToAssignInfo = [];
    angular.element(document).ready(function() {
        if (SendClassService.getClassNumber() != null) {
            if (showAssignNewStudents()) {
                $scope.studentsToAssignInfo = SendStudentService.getStudentsToAssign();
                $scope.assignNewStudents = true;
                $scope.showNewTA = true;
                $scope.showNewTATwo = true;
                $scope.showNewGraderOne = true;
                $scope.showNewGraderTwo = true;
            }
            var className = { 'class' : SendClassService.getClassNumber() };
            $http.post('/programChair/getClassInfo', className).then(function successCallback(response) {
                if (response.data[0] != null) {
                    $scope.populateSelectedClassInfo(response)
                    $scope.populateClassRequirements(response);
                }
                // Populate Enrollment Section
                if (response.data[1] != null) {
                    $scope.populateEnrollment(response);
                } else {
                    $scope.previousEnrollment = response.data[0][0].EnrollmentNumPrev;
                    $scope.enrollmentDifference = 0 - response.data[0][0].EnrollmentNumPrev;
                }
                // Populate Assigned Students Section
                if (response.data[2] != null) {
                    $scope.populateAssignedStudents(response);
                } else {
                    $scope.noneAssigned = 'No Students Currently Assigned';
                    $scope.noAssigned = true;
                }
                // Populate Faculty Requests Section
                if (response.data[3] != null && (response.data[3][0].Rank1 != null || response.data[3][0].Rank2 != null)) {
                    $scope.populateFacultyRequests(response);
                } else {
                    $scope.noneRequested = response.data[0][0].FirstName + ' ' + response.data[0][0].LastName + ' has not made any requests'
                    $scope.noRequested = true;
                }
            }, function errorCallback(response) {
                //TODO
            });
        }
    });

    // Method to populate selected class section of class summary page
    $scope.populateSelectedClassInfo = function(response) {
        $scope.classTitle = response.data[0][0].Subject + ' ' + response.data[0][0].CatalogNumber + ' - ' + response.data[0][0].CourseTitle;
        $scope.instructor = response.data[0][0].FirstName + ' ' + response.data[0][0].LastName;
        if (response.data[0][0].Days != null && response.data[0][0].StartHours != null && response.data[0][0].EndHours != null) {
            var dayString = '';
            var day = response.data[0][0].Days.split("/");
            for (var i = 0; i < day.length; i++) {
                if (i = day.length - 1) {
                    dayString += day[i];
                } else {
                    dayString += day[i] + ' ';
                }
            }
            $scope.showSchedule = true;
            $scope.days = dayString;
            $scope.hours = response.data[0][0].StartHours.slice(0, -3) + ' - ' + response.data[0][0].EndHours.slice(0, -3);
        }
        else {
            $scope.showSchedule = false;
        }
        $scope.location = response.data[0][0].Location;
        $scope.classStatus = response.data[0][0].AssignedStatus;
        $scope.status = response.data[0][0].AssignedStatus;
    }

    // Method to populate class requirements section of class summary page
    $scope.populateClassRequirements = function(response) {
        $scope.reqTaHours = response.data[0][0].TARequiredHours;
        $scope.reqGraderHours = response.data[0][0].GraderRequiredHours;
    }

    // Method to populate enrollment section of class summary page
    $scope.populateEnrollment = function(response) {
        $scope.showPastEnrollments = true;
        for (var i in response.data[1]) {
            var dateObj = new Date(response.data[1][i].DateEntered).toISOString().slice(0, 19).replace('T', ' ').toString();
            var dateArray = dateObj.substr(0,dateObj.indexOf(' ')).split("-");
            var en = dateArray[1] + '/' + dateArray[2] + '/' + dateArray[0] + ': ' + response.data[1][i].EnrollmentNumCurrent;
            $scope.enrollments.push(en);
        }
        $scope.previousEnrollment = response.data[0][0].EnrollmentNumPrev;
        $scope.enrollmentDifference = response.data[1][response.data[1].length - 1].EnrollmentNumCurrent - response.data[0][0].EnrollmentNumPrev;
    }

    // Method to populate assigned students section of page
    $scope.populateAssignedStudents = function(response) {
        if (response.data[2] != null) {
            // TA 1
            if (response.data[2][0].TA != null) {
                $scope.taIdLink = response.data[2][0].TA;
                $scope.taAssignedHours = response.data[2][0].TAHours;
                $scope.taStatus = response.data[2][0].TAStatus;
                $scope.showTA = true;
                $scope.showNewTA = false;
                var studentID = { 'studentID' : response.data[2][0].TA };
                $http.post('/programChair/getStudentNameHours', studentID).then(function successCallback(response) {
                    var commitHours = sumUpHours(response.data);
                    $scope.taAvailableHours = response.data[1][0].TimeCommitment - commitHours;
                    $scope.taHoursMax = $scope.taAssignedHours + $scope.taAvailableHours;
                    $scope.ta = response.data[0][0].FirstName + ' ' + response.data[0][0].LastName;
                }, function errorCallback(response) {
                    //TODO
                });
            }
            // TA 2
            if (response.data[2][0].TATwo != null) {
                $scope.taTwoIdLink = response.data[2][0].TATwo;
                $scope.taTwoAssignedHours = response.data[2][0].TATwoHours;
                $scope.taTwoStatus = response.data[2][0].TATwoStatus;
                $scope.showTATwo = true;
                $scope.showNewTATwo = false;
                var studentID = { 'studentID' : response.data[2][0].TATwo };
                $http.post('/programChair/getStudentNameHours', studentID).then(function successCallback(response) {
                    var commitHours = sumUpHours(response.data);
                    $scope.taTwoAvailableHours = response.data[1][0].TimeCommitment - commitHours;
                    $scope.taTwoHoursMax = $scope.taTwoAssignedHours + $scope.taTwoAvailableHours;
                    $scope.taTwo = response.data[0][0].FirstName + ' ' + response.data[0][0].LastName;
                }, function errorCallback(response) {
                    //TODO
                });
            }
            // Grader 1
            if (response.data[2][0].GraderOne != null) {
                $scope.graderOneIdLink = response.data[2][0].GraderOne;
                $scope.graderOneAssignedHours = response.data[2][0].GraderOneHours;
                $scope.graderOneStatus = response.data[2][0].GraderOneStatus;
                $scope.showGraderOne = true;
                $scope.showNewGraderOne = false;
                var studentID = { 'studentID' : response.data[2][0].GraderOne };
                $http.post('/programChair/getStudentNameHours', studentID).then(function successCallback(response) {
                    var commitHours = sumUpHours(response.data);
                    $scope.graderOneAvailableHours = response.data[1][0].TimeCommitment - commitHours;
                    $scope.graderOneHoursMax = $scope.graderOneAssignedHours + $scope.graderOneAvailableHours;
                    $scope.graderOne = response.data[0][0].FirstName + ' ' + response.data[0][0].LastName;
                }, function errorCallback(response) {
                    //TODO
                });
            }
            // Grader 2
            if (response.data[2][0].GraderTwo != null) {
                $scope.graderTwoIdLink = response.data[2][0].GraderTwo;
                $scope.graderTwoAssignedHours = response.data[2][0].GraderTwoHours;
                $scope.graderTwoStatus = response.data[2][0].GraderTwoStatus;
                $scope.showGraderTwo = true;
                $scope.showNewGraderTwo = false;
                var studentID = { 'studentID' : response.data[2][0].GraderTwo };
                $http.post('/programChair/getStudentNameHours', studentID).then(function successCallback(response) {
                    var commitHours = sumUpHours(response.data);
                    $scope.graderTwoAvailableHours = response.data[1][0].TimeCommitment - commitHours;
                    $scope.graderTwoHoursMax = $scope.graderTwoAssignedHours + $scope.graderTwoAvailableHours;
                    $scope.graderTwo = response.data[0][0].FirstName + ' ' + response.data[0][0].LastName;
                }, function errorCallback(response) {
                    //TODO
                });
            }
            if ($scope.showTA && $scope.showTATwo && $scope.showGraderOne && $scope.showGraderTwo) {
                $scope.noAvailablePositions = true;
                $scope.noneAvailable = true;
            }
        } else {
            $scope.noneAssigned = 'No Students Currently Assigned';
        }
    }

    function sumUpHours(data) {
        var hours = 0;
        for (var i = 2; i < data.length; i++) {
            for (var j = 0; j < data[i].length; j++) {
                if (data[i][j].TAHours) {
                    hours += data[i][j].TAHours;
                } else if (data[i][j].TATwoHours) {
                    hours += data[i][j].TATwoHours;
                } else if (data[i][j].GraderOneHours) {
                    hours += data[i][j].GraderOneHours;
                } else if (data[i][j].GraderTwoHours) {
                    hours += data[i][j].GraderTwoHours;
                }
            }
            if (i === data.length - 1) {
                return hours;
            }
        }
    }

    // Method to populate faculty requests section of class summary page
    $scope.populateFacultyRequests = function(response) {
        $scope.showFacultyRequests = true;
        if (response.data[3][0].Rank1 != null) {
            var studentID = { 'studentID' : response.data[3][0].Rank1 };
            $http.post('/programChair/getStudentNameHours', studentID).then(function successCallback(response) {
                $scope.requestOne = response.data[0][0].FirstName + ' ' + response.data[0][0].LastName;
            }, function errorCallback(response) {
                //TODO
            });
            $scope.firstChoice = true;
            $scope.requestOneIdLink = response.data[3][0].Rank1;
        }
        if (response.data[3][0].Rank2 != null) {
            var studentID = { 'studentID' : response.data[3][0].Rank2 };
            $http.post('/programChair/getStudentNameHours', studentID).then(function successCallback(response) {
                $scope.requestTwo = response.data[0][0].FirstName + ' ' + response.data[0][0].LastName;
            }, function errorCallback(response) {
                //TODO
            });
            $scope.secondChoice = true;
            $scope.requestTwoIdLink = response.data[3][0].Rank2;
        }
    }

    // Method to save class stauts in database
    $scope.saveStatus = function() {
        var postData = { 'status' : $scope.status, 'class' : SendClassService.getClassNumber() };
        $http.post('/programChair/updateStatus', postData).then(function successCallback(response) {
            $scope.classStatus = $scope.status;
        }, function errorCallback(response) {
            //TODO
        });
        $scope.cancelStatusUpdate();
    }

    // Method to cancel status change
    $scope.cancelStatusUpdate = function() {
        $scope.showStatusUpdate = false;
        $scope.disableUpdateStatus = false;
        var element = document.getElementById('spaceforstatus');
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    // Method to save enrollment in database
    // Add enrollment thresholds to update required hours
    $scope.saveEnrollment = function(enrollmentUpdate) {
        $scope.showPastEnrollments = true;
        if (enrollmentUpdate != null) {
            // Possibly set time zone of date object
            var dateObj = new Date().toISOString().slice(0, 19).replace('T', ' ').toString();
            var dateArray = dateObj.substr(0,dateObj.indexOf(' ')).split("-");
            var en = dateArray[1] + '/' + dateArray[2] + '/' + dateArray[0] + ': ' + enrollmentUpdate;
            $scope.enrollments.push(en);

            var postData = { 'class' : SendClassService.getClassNumber(), 'enrollment' : enrollmentUpdate };
            $http.post('/programChair/updateEnrollment', postData).then(function successCallback(response) {
                $scope.enrollmentDifference = enrollmentUpdate - $scope.previousEnrollment;
            }, function errorCallback(response) {
                //TODO
            });
            $scope.cancelEnrollmentUpdate();
        } else {
            $scope.enrollmentError = true;
        }
    }

    // Method to cancel enrollment update
    $scope.cancelEnrollmentUpdate = function() {
        $scope.showEnrollmentUpdate = false;
        $scope.disableUpdateEnrollment = false;
        $scope.enrollmentUpdate = null;
        $scope.enrollmentError = false;
        var element = document.getElementById('spaceforenrollment');
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    // Method to save required hours in database
    $scope.saveRequiredHours = function(taHours, graderHours) {
        var postData,
            ta = taHours,
            grader = graderHours,
            send = false;
        if (taHours && graderHours) {
            postData = { 'class' : SendClassService.getClassNumber(), 'taHours' : taHours, 'graderHours' : graderHours };
            send = true;
        } else if (!taHours && graderHours) {
            postData = { 'class' : SendClassService.getClassNumber(), 'taHours' : $scope.reqTaHours, 'graderHours' : graderHours };
            send = true;
        } else if (taHours && !graderHours) {
            postData = { 'class' : SendClassService.getClassNumber(), 'taHours' : taHours, 'graderHours' : $scope.reqGraderHours };
            send = true;
        } else {
            $scope.requiredHoursError = true;
        }
        if (send) {
            $http.post('/programChair/updateRequiredHours', postData).then(function successCallback(response) {
                $scope.reqTaHours = response.data[0];
                $scope.reqGraderHours = response.data[1];
            }, function errorCallback(response) {
                //TODO
            });
            $scope.cancelRequiredHoursUpdate();
        }
    }

    // Method to cancel required hours update
    $scope.cancelRequiredHoursUpdate = function() {
        $scope.showRequiredHoursUpdate = false;
        $scope.disableUpdateRequiredHours = false;
        $scope.requiredTAHoursUpdate = null;
        $scope.requiredGraderHoursUpdate = null;
        $scope.requiredHoursError = false;
        var element = document.getElementById('spaceforrequiredhours');
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    // Method to update available hours when assigned hours changes
    $scope.updateAvailableHours = function(student) {
        if (student === 0) {
            if (!$scope.taAssignedHours && $scope.taAssignedHours != 0) {
                $scope.taAssignedHours = $scope.taHoursMax;
                $scope.taAvailableHours = $scope.taHoursMax - $scope.taAssignedHours;
            } else {
                $scope.taAvailableHours = $scope.taHoursMax - $scope.taAssignedHours;
            }
        } else if (student === 1) {
            if (!$scope.taTwoAssignedHours && $scope.taTwoAssignedHours != 0) {
                $scope.taTwoAssignedHours = $scope.taTwoHoursMax;
                $scope.taTwoAvailableHours = $scope.taTwoHoursMax - $scope.taTwoAssignedHours;
            } else {
                $scope.taTwoAvailableHours = $scope.taTwoHoursMax - $scope.taTwoAssignedHours;
            }
        } else if (student === 2) {
            if (!$scope.graderOneAssignedHours && $scope.graderOneAssignedHours != 0) {
                $scope.graderOneAssignedHours = $scope.graderOneHoursMax;
                $scope.graderOneAvailableHours = $scope.graderOneHoursMax - $scope.graderOneAssignedHours;
            } else {
                $scope.graderOneAvailableHours = $scope.graderOneHoursMax - $scope.graderOneAssignedHours;
            }
        } else if (student === 3) {
            if (!$scope.graderTwoAssignedHours && $scope.graderTwoAssignedHours != 0) {
                $scope.graderTwoAssignedHours = $scope.graderTwoHoursMax;
                $scope.graderTwoAvailableHours = $scope.graderTwoHoursMax - $scope.graderTwoAssignedHours;
            } else {
                $scope.graderTwoAvailableHours = $scope.graderTwoHoursMax - $scope.graderTwoAssignedHours;
            }
        } else {
            if (!student.assignHours && student.assignHours != 0) {
                student.assignHours = student.maxHours;
                student.availableHours = student.maxHours - student.assignHours;
            } else {
                student.availableHours = student.maxHours - student.assignHours;
            }
        }
    }

    // Method to save updated student assignments
    $scope.saveUpdatedAssignments = function(ta, taAssignedHours, taStatus, taTwo, taTwoAssignedHours, taTwoStatus, graderOne, graderOneAssignedHours, graderOneStatus, graderTwo, graderTwoAssignedHours, graderTwoStatus) {
        if (!taAssignedHours || taAssignedHours === 0) {
            ta = null;
            taAssignedHours = null;
            taStatus = null
        }
        if (!taTwoAssignedHours || taTwoAssignedHours === 0) {
            taTwo = null;
            taTwoAssignedHours = null;
            taTwoStatus = null
        }
        if (!graderOneAssignedHours || graderOneAssignedHours === 0) {
            graderOne = null;
            graderOneAssignedHours = null;
            graderOneStatus = null
        }
        if (!graderTwoAssignedHours || graderTwoAssignedHours === 0) {
            graderTwo = null;
            graderTwoAssignedHours = null;
            graderTwoStatus = null
        }
        if ((!taAssignedHours || taAssignedHours === 0) && (!taTwoAssignedHours || taTwoAssignedHours === 0) && (!graderOneAssignedHours || graderOneAssignedHours === 0) && (!graderTwoAssignedHours || graderTwoAssignedHours === 0)) {
            var postData = { 'deleteClass' : SendClassService.getClassNumber()};
        } else {
            var postData = { 'class' : SendClassService.getClassNumber(), 'ta' : ta, 'taAssignedHours' : taAssignedHours, 'taStatus' : taStatus, 'taTwo' : taTwo, 'taTwoAssignedHours' : taTwoAssignedHours, 'taTwoStatus' : taTwoStatus, 'graderOne' : graderOne, 'graderOneAssignedHours' : graderOneAssignedHours, 'graderOneStatus' : graderOneStatus, 'graderTwo' : graderTwo, 'graderTwoAssignedHours' : graderTwoAssignedHours, 'graderTwoStatus' : graderTwoStatus };
        }
        $http.post('/programChair/updateAssignedStudents', postData).then(function successCallback(response) {
            $scope.cancelUpdatedAssignments();
        }, function errorCallback(response) {
            //TODO
        });
    }

    $scope.saveNewStudents = function() {
        for (var h = 0; h < $scope.studentsToAssignInfo.length; h++) {
            if ($scope.studentsToAssignInfo[h].position === null || $scope.studentsToAssignInfo[h].assignHours === 0 || $scope.studentsToAssignInfo[h].assignedStatus === null) {
                if (confirm("You have incomplete student assignments!\n\nIf you choose to continue they will be removed\n\nContinue?") == true) {
                    if ($scope.studentsToAssignInfo.length === 1) {
                        $scope.assignNewStudents = false;
                        break;
                    } else {
                        checkForNull();
                    }
                } else {
                    break;
                }
            }
            if (h === $scope.studentsToAssignInfo.length - 1 || $scope.studentsToAssignInfo.length === 1) {
                checkForNull();
            }
        }
    }

    function checkForNull() {
        for (var h = 0; h < $scope.studentsToAssignInfo.length; h++) {
            if ($scope.studentsToAssignInfo[h].position === null || $scope.studentsToAssignInfo[h].assignHours === 0 || $scope.studentsToAssignInfo[h].assignedStatus === null) {
                $scope.studentsToAssignInfo.splice(h, 1);
                checkForNull();
            }
            if (h === $scope.studentsToAssignInfo.length - 1 || $scope.studentsToAssignInfo.length === 1) {
                if (!checkDuplicatePositions()) {
                    for (var i = 0; i < $scope.studentsToAssignInfo.length; i++) {
                        if ($scope.studentsToAssignInfo[i].position != null && $scope.studentsToAssignInfo[i].assignHours != 0 && $scope.studentsToAssignInfo[i].assignedStatus != null) {
                            var postData = {'class' : SendClassService.getClassNumber(), 'position' : $scope.studentsToAssignInfo[i].position, 'assignHours' : $scope.studentsToAssignInfo[i].assignHours, 'assignedStatus' : $scope.studentsToAssignInfo[i].assignedStatus, 'ASURITE_ID' : $scope.studentsToAssignInfo[i].ASURITE_ID};
                            gatherAll(postData);
                        }
                    }
                }
            }
        }
    }

    function gatherAll(postData) {
        $scope.toSave.push(postData)
        if ($scope.toSave.length === $scope.studentsToAssignInfo.length) {
            saveNewStudentsToDatabase($scope.toSave);
        }
    }

    function saveNewStudentsToDatabase(postData) {
        $http.post('/programChair/saveNewStudents', postData).then(function successCallback(response) {
            SendStudentService.clearStudentsToAssign();
            $scope.assignNewStudents = false;
            $scope.cancelUpdatedAssignments();
            $scope.studentsToAssignInfo = [];
            $scope.toSave = [];
            $scope.noAssigned = false;
        }, function errorCallback(response) {
            //TODO
        });
    }

    function checkDuplicatePositions() {
        for (var g = 0; g < $scope.studentsToAssignInfo.length; g++) {
            for (var h = 0; h < $scope.studentsToAssignInfo.length; h++) {
                if ($scope.studentsToAssignInfo[g].position === $scope.studentsToAssignInfo[h].position && g != h && $scope.studentsToAssignInfo[g].position != null && $scope.studentsToAssignInfo[h].position != null) {
                    $scope.duplicatePositions = true;
                    return true;
                }
            }
            if (g === $scope.studentsToAssignInfo.length) {
                return false;
            }
        }
    }

    // Method to cancel updating student assignments
    $scope.cancelUpdatedAssignments = function() {
        var className = { 'class' : SendClassService.getClassNumber() };
        $http.post('/programChair/getClassInfo', className).then(function successCallback(response) {
            $scope.showTA = false;
            $scope.showTATwo = false;
            $scope.showGraderOne = false;
            $scope.showGraderTwo = false;
            $scope.showUpdatedAssignments = false;
            $scope.populateAssignedStudents(response);
        }, function errorCallback(response) {
            //TODO
        });
    }

    // Method to cancel saving new students
    $scope.cancelNewAssignments = function() {
        SendStudentService.clearStudentsToAssign();
        $scope.assignNewStudents = false;
        $scope.addStudentError = false;
        $scope.studentsToAssignInfo = [];
        studentsToAssign = [];
    }

    // Method to cancel saving new students
    $scope.cancelStudentsToAssign = function() {
        $location.path("/classSummary");
    }

    // Method to delete assigned student
    $scope.deleteStudent = function(student) {
        var studentDeleted;
        var studentDeletedHours;
        if (confirm("Are you sure you want to delete?") == true) {
            if (student === 1) {
                studentDeleted = $scope.taIdLink;
                studentDeletedHours = $scope.taAssignedHours;
                $scope.showTA = false;
                $scope.showNewTA = true;
                $scope.taIdLink = null;
                for (var i = 0; i < $scope.studentsToAssignInfo.length; i++) {
                    if ($scope.taIdLink === $scope.studentsToAssignInfo[i].ASURITE_ID) {
                        $scope.studentsToAssignInfo[i].availableHours = $scope.taAssignedHours;
                        $scope.studentsToAssignInfo[i].maxHours = $scope.studentsToAssignInfo[i].maxHours + $scope.taAssignedHours;
                    }
                }
            } else if (student === 2) {
                studentDeleted = $scope.taTwoIdLink;
                studentDeletedHours = $scope.taTwoAssignedHours;
                $scope.showTATwo = false;
                $scope.showNewTATwo = true;
                $scope.taTwoIdLink = null;
                for (var i = 0; i < $scope.studentsToAssignInfo.length; i++) {
                    if ($scope.taTwoIdLink === $scope.studentsToAssignInfo[i].ASURITE_ID) {
                        $scope.studentsToAssignInfo[i].availableHours = $scope.taTwoAssignedHours;
                        $scope.studentsToAssignInfo[i].maxHours = $scope.studentsToAssignInfo[i].maxHours + $scope.taTwoAssignedHours;
                    }
                }
            } else if (student === 3) {
                studentDeleted = $scope.graderOneIdLink;
                studentDeletedHours = $scope.graderOneAssignedHours;
                $scope.showGraderOne = false;
                $scope.showNewGraderOne = true;
                $scope.graderOneIdLink = null;
                for (var i = 0; i < $scope.studentsToAssignInfo.length; i++) {
                    if ($scope.graderOneIdLink === $scope.studentsToAssignInfo[i].ASURITE_ID) {
                        $scope.studentsToAssignInfo[i].availableHours = $scope.graderOneAssignedHours;
                        $scope.studentsToAssignInfo[i].maxHours = $scope.studentsToAssignInfo[i].maxHours + $scope.graderOneAssignedHours;
                    }
                }
            } else if (student === 4) {
                studentDeleted = $scope.graderTwoIdLink;
                studentDeletedHours = $scope.graderTwoAssignedHours;
                $scope.showGraderTwo = false;
                $scope.showNewGraderTwo = true;
                $scope.graderTwoIdLink = null;
                for (var i = 0; i < $scope.studentsToAssignInfo.length; i++) {
                    if ($scope.graderTwoIdLink === $scope.studentsToAssignInfo[i].ASURITE_ID) {
                        $scope.studentsToAssignInfo[i].availableHours = $scope.graderTwoAssignedHours;
                        $scope.studentsToAssignInfo[i].maxHours = $scope.studentsToAssignInfo[i].maxHours + $scope.graderTwoAssignedHours;
                    }
                }
            }
            var postData = { 'deleteStudent' : student, 'class' : SendClassService.getClassNumber()};
            $http.post('/programChair/updateAssignedStudents', postData).then(function successCallback(response) {
                if ($scope.showTA === false && $scope.showTATwo === false && $scope.showGraderOne === false && $scope.showGraderTwo === false) {
                    $scope.noneAssigned = 'No Students Currently Assigned';
                    $scope.noAssigned = true;
                }
                updateHoursAfterDelete(studentDeleted, studentDeletedHours);
                $scope.noAvailablePositions = false;
                $scope.noneAvailable = false;
                $scope.cancelUpdatedAssignments();
            }, function errorCallback(response) {
                //TODO
            });
        }
    }

    function updateHoursAfterDelete(student, hours) {
        for (var i = 0; i < $scope.studentsToAssignInfo.length; i++) {
            if (student === $scope.studentsToAssignInfo[i].ASURITE_ID) {
                $scope.studentsToAssignInfo[i].availableHours = hours;
                $scope.studentsToAssignInfo[i].maxHours += hours;
            }
        }
    }

    // Method to delete assigned student
    $scope.deleteNewStudent = function(student) {
        if (confirm("Are you sure you want to delete?") == true) {
            for (var i = 0; i < $scope.studentsToAssignInfo.length; i++) {
                if (student === $scope.studentsToAssignInfo[i].ASURITE_ID) {
                    $scope.studentsToAssignInfo.splice(i, 1);
                }
            }
            if ($scope.studentsToAssignInfo.length === 0) {
                $scope.cancelNewAssignments();
            }
        }
    }

    // On click of Assign faculty request student, set student id, direct to assign student page
    $scope.addRequestedStudent = function (student) {
        $scope.addStudentError = false;
        SendClassService.setAssignStudentRoute(false);
        var found = false;
        if (student === $scope.taIdLink || student === $scope.taTwoIdLink || student === $scope.graderOneIdLink || student === $scope.graderTwoIdLink) {
            found === true;
            $scope.addStudentError = true;
        } else {
            if ($scope.studentsToAssignInfo.length === 0) {
                studentsToAssign[0] = student;
                getStudentsNameHours();
            } else {
                for (var i = 0; i < $scope.studentsToAssignInfo.length; i++) {
                    if (student === $scope.studentsToAssignInfo[i].ASURITE_ID) {
                        found = true;
                        $scope.addStudentError = true;
                    }
                    if (i === $scope.studentsToAssignInfo.length - 1 && !found) {
                        for (var j = 0; j < $scope.studentsToAssignInfo.length; j++) {
                            studentsToAssign[j] = $scope.studentsToAssignInfo[j].ASURITE_ID;
                            if (j === $scope.studentsToAssignInfo.length - 1) {
                                SendStudentService.clearStudentsToAssign();
                                $scope.studentsToAssignInfo = [];
                                studentsToAssign.push(student);
                                getStudentsNameHours();
                            }
                        }
                    }
                }
            }
        }
        if ($scope.showTA) {
            $scope.showNewTA = false;
        } else {
            $scope.showNewTA = true;
        }
        if ($scope.showTATwo) {
            $scope.showNewTATwo = false;
        } else {
            $scope.showNewTATwo = true;
        }
        if ($scope.showGraderOne) {
            $scope.showNewGraderOne = false;
        } else {
            $scope.showNewGraderOne = true;
        }
        if ($scope.showGraderTwo) {
            $scope.showNewGraderTwo = false;
        } else {
            $scope.showNewGraderTwo = true;
        }
        if ($scope.showTA && $scope.showTATwo && $scope.showGraderOne && $scope.showGraderTwo) {
            $scope.noAvailablePositions = true;
            $scope.noneAvailable = true;
        }
    }

    $scope.goToAssignStudent = function() {
        SendClassService.setAssignStudentRoute(true);
        $location.path('/viewApplicationsPC');
    }

    $scope.getStudentsToAssign = function() {
        for (var i = 0; i < $scope.names.length; i++) {
            if ($scope.names[i].selected === 1) {
                studentsToAssign.push($scope.names[i].ASURITE_ID)
            }
            if (i === $scope.names.length - 1) {
                if (studentsToAssign.length > 0) {
                    SendClassService.setAssignStudentRoute(true)
                }
                getStudentsNameHours();
            }
        }
    }

    function getStudentsNameHours() {
        for (var i = 0; i < studentsToAssign.length; i++) {
            var studentID = { 'studentID' : studentsToAssign[i] };
            $http.post('/programChair/getStudentNameHours', studentID).then(function successCallback(response) {
                var commitHours = sumUpHours(response.data);
                //var commitHours = response.data[2][0].TAHours + response.data[3][0].TATwoHours + response.data[4][0].GraderOneHours + response.data[5][0].GraderTwoHours;
                var student = {
                    'name'       : response.data[0][0].FirstName + ' ' + response.data[0][0].LastName,
                    'position' : null,
                    'assignHours' : 0,
                    'availableHours' : response.data[1][0].TimeCommitment - commitHours,
                    'maxHours' : response.data[1][0].TimeCommitment - commitHours,
                    'assignStatus' : null};
                saveStudentInfo(student);
            }, function errorCallback(response) {
                //TODO
            });
        }
    }

    function saveStudentInfo(student) {
        $scope.studentsToAssignInfo.push(student);
        if ($scope.studentsToAssignInfo.length === studentsToAssign.length) {
            for (var i = 0; i < studentsToAssign.length; i++) {
                $scope.studentsToAssignInfo[i].ASURITE_ID = studentsToAssign[i];
                if (i === studentsToAssign.length - 1) {
                    SendStudentService.setStudentsToAssign($scope.studentsToAssignInfo);
                    if (SendClassService.getAssignStudentRoute() === 'true') {
                        $scope.goToClassSummary('newStudents');
                        $scope.selectStudent = false;
                    } else {
                        if (showAssignNewStudents()) {
                            $scope.studentsToAssignInfo = SendStudentService.getStudentsToAssign();
                            $scope.assignNewStudents = true;
                        }
                    }
                }
            }
        }
    }

    $scope.goToClassSummary= function(id) {
        SendClassService.setAssignStudentRoute(false);
        $location.path("/classSummary");
        $timeout(function(){
            $location.hash(id);
            $anchorScroll();
        }, 1000);
    }

    function showAssignNewStudents() {
        if (SendStudentService.getStudentsToAssign()) {
            return true;
        } else {
            return false;
        }
    }
});

programChair.controller('pcEditScheduleController', function($scope, $http, $location, $route, UserInfoService, UserAuthService, SendClassService) {
    $scope.classes = [];

    angular.element(document).ready(function() {
        $http.get('/programChair/getClassNames').then(function successCallback(response) {
           if (response.data[0].ScheduleID) {
                $scope.classes = setClassOptions(response.data);
                $scope.pcSelectCourse = SendClassService.getClassName();
                $scope.session = null;
                $scope.location = null;
                $scope.subject = null;
                $scope.catalog = null;
                $scope.course = null;
                $scope.title = null;
                $scope.firstName = null;
                $scope.lastName = null;
                $scope.enrollment = null;
           }
        }, function errorCallback(response) {
            //TODO
        });
    });

    $scope.editInfo = function(selectedClass) {
        $scope.courseSelected = true;
        var className = { 'class' : selectedClass.courseNumber };
        $http.post('/programChair/getClassInfo', className).then(function successCallback(response) {
            $scope.session = response.data[0][0].SessionIs;
            $scope.location = response.data[0][0].Location;
            $scope.subject = response.data[0][0].Subject;
            $scope.catalog = response.data[0][0].CatalogNumber;
            $scope.course = response.data[0][0].CourseNumber;
            $scope.title = response.data[0][0].CourseTitle;
            $scope.firstName = response.data[0][0].FirstName;
            $scope.lastName = response.data[0][0].LastName;
            $scope.enrollment = response.data[0][0].EnrollmentNumPrev;
        }, function errorCallback(response) {
            //TODO
        });
    }

    $scope.saveEdits = function() {
        var sendData = {
            session : $scope.session,
            location : $scope.location,
            subject : $scope.subject,
            catalog : $scope.catalog,
            course : $scope.course,
            title : $scope.title,
            firstName : $scope.firstName,
            lastName : $scope.lastName,
            enrollment : $scope.enrollment
        };
        // populates students names in dropdown
        $http.post('/programChair/editSchedule', sendData).then(function successCallback(response) {
            alert("You have successfully updated this course");
        }, function errorCallback(response) {
                //TODO
        });
    }

    // adds an indicator to the class name in dropdowns if a class is online and hours needed
    // for classes missing TA/Grader assigned hours
    function setClassOptions(data, hasHours) {
        var options = [];
        for (var i in data) {
            if (data[i].Location === 'ASUOnline') {
                var className = data[i].Subject + ' ' + data[i].CatalogNumber + '*';
            } else {
                var className = data[i].Subject + ' ' + data[i].CatalogNumber;
            }
            options.push({'class': className,'courseNumber': data[i].CourseNumber});
        }
        return options;
    }

    $scope.name = UserInfoService.getFullName();

    $scope.logout = function() {
        UserInfoService.clearUserSession();
        $location.path('/login');
    }

    $scope.displayLogout = function() {
        return UserAuthService.isAuthenticated();
    }

    $scope.goHome = function() {
        $location.path('/programChairHome');
    }

    $scope.displayHome = function() {
        if (UserAuthService.isAuthenticated()) {
            return true;
        }
    }
});

programChair.controller('programChairEvalController', function($scope, $http, $location, $route, UserInfoService, UserAuthService, SendClassService) {
    angular.element(document).ready(function() {
        SendClassService.setAssignStudentRoute(false);
    });
    // populates the Student Evaluation dropdown
    $scope.ratings = ['1','2','3','4','5'];

    // populates students names in dropdown
    $http.get('/programChair/evaluations/appnames').then(function successCallback(response) {
        if(response.data == 'OK') {
            $scope.studentnames = [];
        } else {
            $scope.studentnames = response.data;
        }
    }, function errorCallback(response) {
            //TODO
    });

    // Saves Student Evaluation into Database
    $scope.saveEval = function(doRoute) {
        var dateObj = new Date().toISOString().slice(0, 19).replace('T', ' ');
        var studentEvalData = {
                ASURITE_ID      : $scope.selectName,
                QOneScore       : $scope.selectOne,
                QOneComments    : $scope.commentsOne,
                QTwoScore       : $scope.selectTwo,
                QTwoComments    : $scope.commentsTwo,
                QThreeScore     : $scope.selectThree,
                QThreeComments  : $scope.commentsThree,
                QFourScore      : $scope.selectFour,
                QFourComments   : $scope.commentsFour,
                DateCreated     : dateObj,
                InstructorName  : UserInfoService.getFullName()
            };
        $http.post('/programChair/evaluationsPC', studentEvalData).then(function successCallback(response) {
            if (doRoute === true) {
                $location.path('/programChairHome');
            }
        }, function errorCallback(response) {
            //TODO
        });
    }
    $scope.name = UserInfoService.getFullName();

    $scope.logout = function() {
        UserInfoService.clearUserSession();
        $location.path('/login');
    }

    $scope.displayLogout = function() {
        return UserAuthService.isAuthenticated();
    }

    $scope.goHome = function() {
        $location.path('/programChairHome');
    }

    $scope.displayHome = function() {
        if (UserAuthService.isAuthenticated()) {
            return true;
        }
    }
});

// View Applications
programChair.controller('programChairSearchAppController', function($scope, $location, $http, SendClassService, SendStudentService, UserInfoService, UserAuthService) {
    angular.element(document).ready(function() {
        $scope.name = UserInfoService.getFullName();

        $scope.logout = function() {
            UserInfoService.clearUserSession();
            $location.path('/login');
        }

        $scope.displayLogout = function() {
            return UserAuthService.isAuthenticated();
        }

        $scope.goHome = function() {
            $location.path('/programChairHome');
        }

        $scope.displayHome = function() {
            if (UserAuthService.isAuthenticated()) {
                return true;
            }
        }

        if (SendClassService.getAssignStudentRoute() === 'true') {
            var classNameString = SendClassService.getClassName();
            if (classNameString != null && classNameString.charAt(classNameString.length - 1) === '*') {
                classNameString = classNameString.replace('*', '');
            }
            $scope.selectStudent = true;
            SendStudentService.clearStudentsToAssign();
            $http.get('/programChair/courses').then(function successCallback(response) {
                $scope.courses = response.data;
                for (var i = 0; i < $scope.courses.length; i++) {
                    if (classNameString === $scope.courses[i].CourseSection) {
                        $scope.pcSelectCourse = $scope.courses[i].CourseSection
                    }
                }
            }, function errorCallback(response) {
                //TODO
            });
            $scope.searchApp(classNameString);
        } else {
            $scope.noSearch = false;
            $scope.search = false;
            $http.get('/programChair/courses').then(function successCallback(response) {
                $scope.courses = response.data;
                $scope.pcSelectCourse = 'Select a Course';
            }, function errorCallback(response) {
                //TODO
            });
            $http.get('/programChair/applicationNames').then(function successCallback(response) {
                $scope.names = response.data;
            }, function errorCallback(response) {
                //TODO
            });
        }
    });

    // Searches applications in database
    $scope.searchApp = function(classString) {
        var courseData;
        if (classString) {
            courseData = {
                course : classString
            };
            $http.post('/programChair/applications', courseData).then(function successCallback(response) {
                if (!response.data[0].Name) {
                    $scope.search = false;
                    $scope.noSearch = true;
                    $scope.noStudents = true;
                } else {
                    $scope.search = true;
                    $scope.noSearch = true;
                    $scope.noStudents = false;
                    $scope.names = response.data;
                    for (var i = 0; i <$scope.names.length; i++) {
                        if ($scope.names[i].isFullTime === 1) {
                            $scope.names[i].isFullTime = 'Yes';
                        } else {
                            $scope.names[i].isFullTime = 'No';
                        }
                    }
                }
            }, function errorCallback(response) {
                //TODO
            });
        } else {
            if ($scope.selectCourse) {
                courseData = {
                    course : $scope.selectCourse.CourseSection
                };
                $http.post('/programChair/applications', courseData).then(function successCallback(response) {
                    if (!response.data[0].Name) {
                        $scope.search = false;
                        $scope.noSearch = true;
                        $scope.noStudents = true;
                    } else {
                        $scope.search = true;
                        $scope.noSearch = true;
                        $scope.noStudents = false;
                        $scope.names = response.data;
                        alert($scope.names[i].isFullTime);
                        for (var i = 0; i <$scope.names.length; i++) {
                            if ($scope.names[i].isFullTime === 1) {
                                $scope.names[i].isFullTime = 'Yes';
                            } else {
                                $scope.names[i].isFullTime = 'No';
                            }
                        }
                    }
                }, function errorCallback(response) {
                    //TODO
                });
            }
        }
    }

    $scope.filter = function(filter) {
        var courseData;
        if (filter === 0) {
            $scope.names.sort(dynamicSort('Name'));
        } else {
            if ($scope.selectCourse) {
                courseData = {
                    course : $scope.selectCourse.CourseSection,
                    filter : filter
                };
            } else {
                courseData = {
                    course : $scope.pcSelectCourse,
                    filter : filter
                };
            }
            $http.post('/programChair/applications', courseData).then(function successCallback(response) {
                $scope.names = response.data;
                for (var i = 0; i <$scope.names.length; i++) {
                    if ($scope.names[i].isFullTime === 1) {
                        $scope.names[i].isFullTime = 'Yes';
                    } else {
                        $scope.names[i].isFullTime = 'No';
                    }
                }
            }, function errorCallback(response) {
                //TODO
            });
        }
    }

    function dynamicSort(property) {
        var sortOrder = 1;
        if(property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a,b) {
            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
        }
    }
});

//View Student Application Info
programChair.controller('programChairStudentInfoController', function($scope, $routeParams, $http, $location, $timeout, UserInfoService, UserAuthService) {
    $scope.studentId = $routeParams.studentName
    var studentData = {
            studentId : $scope.studentId
    };
    // populates contact information
    $http.post('/programChair/contactInfo', studentData).then(function successCallback(response) {
        $scope.contactInfo = response.data;
    }, function errorCallback(response) {
        //TODO
    });
    // populates application table
    $http.post('/programChair/applicationTable', studentData).then(function successCallback(response) {
        $scope.appInfo = response.data;
        // get feedback based on appID
        studentAppID = response.data.AppID;
        $http.post('/programChair/getFeedback', {appID:studentAppID}).then(function successCallback(response) {
            $scope.feedbackText = response.data.feedback;
            $scope.hasComplied = response.data.hasComplied;
        }, function errorCallback(response) {
            //empty
        });
    }, function errorCallback(response) {
        //TODO
    });
    // populates languages table
    $http.post('/programChair/languagesTable', studentData).then(function successCallback(response) {
        if(response.data == 'OK') {
            $scope.courses = [];
        } else {
            $scope.languages = response.data;
        }
    }, function errorCallback(response) {
        //TODO
    });
    // populates IDEs table
    $http.post('/programChair/ideTable', studentData).then(function successCallback(response) {
        if(response.data == 'OK') {
            $scope.ides = [];
        } else {
            $scope.ides = response.data;
        }
    }, function errorCallback(response) {
        //TODO
    });
    // populates collaborative tools table
    $http.post('/programChair/toolsTable', studentData).then(function successCallback(response) {
        if(response.data == 'OK') {
            $scope.tools = [];
        } else {
            $scope.tools = response.data;
        }
    }, function errorCallback(response) {
        //TODO
    });
    // populates course competencies table
    $http.post('/programChair/coursesTable', studentData).then(function successCallback(response) {
        if(response.data == 'OK') {
            $scope.courses = [];
        } else {
            $scope.courses = response.data;
        }
    }, function errorCallback(response) {
        //TODO
    });
    // populates calendar table
    $http.post('/programChair/calendarTable', studentData).then(function successCallback(response) {
        if(response.data == 'OK') {
            $scope.calendars = [];
        } else {
            $scope.calendars = response.data;
        }
    }, function errorCallback(response) {
        //TODO
    });
    // populates attachment table
    $http.post('/programChair/attachmentTable', studentData).then(function successCallback(response) {
        $scope.attachment = response.data;
    }, function errorCallback(response) {
        //TODO
    });
    // opens attachments
    $scope.openAttachments = function(fileType, ID, fileName) {
        // display resume file
        if (fileType == 1) {
            var resumeData = {
            ID       : ID,
            fileName : fileName
            };
            $http.post('/programChair/resume/', resumeData, {responseType: 'arraybuffer'}).then(function successCallback(response) {
                var Resume = new Blob([response.data], {type: 'application/pdf'});
                var ResumeURL = URL.createObjectURL(Resume);
                window.location.assign(ResumeURL);
            }, function errorCallback(response) {
                //TODO
            });
        }
        // display transcript file
        if (fileType == 2) {
            var transcriptData = {
            ID       : ID,
            fileName : fileName
            };
            // display resume file
            $http.post('/programChair/transcript/', transcriptData, {responseType: 'arraybuffer'}).then(function successCallback(response) {
                var Transcript = new Blob([response.data], {type: 'application/pdf'});
                var TranscriptURL = URL.createObjectURL(Transcript);
                window.location.assign(TranscriptURL);
            }, function errorCallback(response) {
                //TODO
            });
        }
        // display iPOS file
        if (fileType == 3) {
            var iposData = {
            ID       : ID,
            fileName : fileName
            };
            // display resume file
            $http.post('/programChair/ipos/', iposData, {responseType: 'arraybuffer'}).then(function successCallback(response) {
                var Ipos = new Blob([response.data], {type: 'application/pdf'});
                var IposURL = URL.createObjectURL(Ipos);
                window.location.assign(IposURL);
            }, function errorCallback(response) {
                //TODO
            });
        }
    }
    // populates evaluation table
    $http.post('/programChair/evaluationTable', studentData).then(function successCallback(response) {
        if(response.data == 'OK') {
            $scope.evaulations = [];
        } else {
            $scope.evaluations = response.data;
        }
    }, function errorCallback(response) {
        //TODO
    });
    // saves PC or removes feedback
    $scope.saveFeedback = function(saveNew) {
        if (saveNew) {
            if ($scope.feedbackText === '' || $scope.feedbackText === null) {
                $scope.feedbackSaveMessage = 'Feedback is empty so nothing was saved!';
                $timeout(function() {
                        $scope.feedbackSaveMessage = '';
                }, 1500)
            } else {
                $http.post('/programChair/saveFeedback', {appID:studentAppID, feedback:$scope.feedbackText, hasComplied:$scope.hasComplied}).then(function successCallback(response) {
                    $scope.feedbackSaveMessage = 'Successfully saved feedback!';
                    $timeout(function() {
                        $scope.feedbackSaveMessage = '';
                    }, 1500);
                }, function errorCallback(response) {
                    $scope.feedbackSaveMessage = 'Uh-oh, something failed! Please try again!';
                });
            }
        } else {
            $http.post('/programChair/removeFeedback', {appID:studentAppID}).then(function successCallback(response) {
                $scope.feedbackText = null;
                $scope.hasComplied = 0;
                $scope.feedbackSaveMessage = 'Successfully removed feedback!';
                $timeout(function() {
                    $scope.feedbackSaveMessage = '';
                }, 1500);
            }, function errorCallback(response) {
                $scope.feedbackSaveMessage = 'Uh-oh, something failed! Please try again!';
            });
        }
    }

    $scope.name = UserInfoService.getFullName();
    $scope.logout = function() {
        UserInfoService.clearUserSession();
        $location.path('/login');
    }

    $scope.displayLogout = function() {
        return UserAuthService.isAuthenticated();
    }

    $scope.goHome = function() {
        $location.path('/programChairHome');
    }

    $scope.displayHome = function() {
        if (UserAuthService.isAuthenticated()) {
            return true;
        }
    }
});

programChair.controller('programChairChangePasswordController', function($scope, $http, $location, $route, UserInfoService, UserAuthService, SendClassService) {
    angular.element(document).ready(function() {
        SendClassService.setAssignStudentRoute(false);
    });

    $scope.changePassword = function(changeOther) {
        if ($scope.newPasswordOne !== $scope.newPasswordTwo) {
            $scope.passwordError = true;
            $scope.passwordErrorMessage = 'Passwords do not match. Please try again.';
            $scope.newPasswordOne = '';
            $scope.newPasswordTwo = '';
            $scope.currentPassword = '';
            $scope.defaultPassword = 0;
        } else if (!checkPassword($scope.newPasswordOne)) {
            $scope.defaultPassword = 0;
            $scope.passwordError = true;
            $scope.passwordErrorMessage = 'Password Requirements:\n  -8-20 Characters\n  -1 Lowercase Letter\n  -1 Uppercase Letter\n  -1 Special Character(#?!@$%^&*-)\n  -1 Number';
            $scope.newPasswordOne = '';
            $scope.newPasswordTwo = '';
            $scope.currentPassword = '';
        } else {
            var userToChange = '';
            var changePsswordData;
            if (changeOther === 1) {
                userToChange = $scope.studentToChange;
                var changePasswordData = {
                    "ASURITE_ID" : userToChange,
                    "NewPassword"  : $scope.newPasswordOne,
                };
            } else {
                userToChange = UserInfoService.getUserId();
                var changePasswordData = {
                    "ASURITE_ID" : userToChange,
                    "CurrentPassword"  : $scope.currentPassword,
                    "NewPassword"  : $scope.newPasswordOne,
                };
            }
            $http.post('/programChair/pcSetUserPassword', changePasswordData).then(function successCallback(response) {
                if (response.data.error === 1) {
                    $scope.newPasswordOne = '';
                    $scope.newPasswordTwo = '';
                    $scope.defaultPassword = 0;
                    $scope.passwordError = true;
                    $scope.defaultPassword = 0;
                    $scope.passwordErrorMessage = 'User does not exist';
                } else if(response.data.error === 2) {
                    $scope.newPasswordOne = '';
                    $scope.newPasswordTwo = '';
                    $scope.currentPassword = '';
                    $scope.passwordError = true;
                    $scope.passwordErrorMessage = 'Incorrect current password';
                } else {
                    $scope.newPasswordOne = '';
                    $scope.newPasswordTwo = '';
                    $scope.currentPassword = '';
                    $scope.studentToChange = '';
                    $scope.defaultPassword = 0;
                    $scope.changeOther = 0;
                    $scope.passwordError = false;
                    $scope.passwordSuccess = true;
                    $scope.passwordSuccessMessage = 'User password updated successfully';
                }
            }, function errorCallback(response) {
                //TODO
            });
        }
    }

    $scope.setDefaultPassword = function() {
        if ($scope.defaultPassword) {
            $scope.newPasswordOne = '1!Aaaaaa';
            $scope.newPasswordTwo = '1!Aaaaaa';
        } else {
            $scope.newPasswordOne = null;
            $scope.newPasswordTwo = null;
        }
    }

    function checkPassword(password) {
        var requirement = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,20}$");
        var res = requirement.test(password);
        return res;
    }

    $scope.name = UserInfoService.getFullName();
    $scope.logout = function() {
        UserInfoService.clearUserSession();
        $location.path('/login');
    }

    $scope.displayLogout = function() {
        return UserAuthService.isAuthenticated();
    }

    $scope.goHome = function() {
        $location.path('/programChairHome');
    }

    $scope.displayHome = function() {
        if (UserAuthService.isAuthenticated()) {
            return true;
        }
    }
});

programChair.controller('programChairCoursesController', function($scope, $routeParams, $http, $location, UserInfoService, UserAuthService, SendClassService) {
    angular.element(document).ready(function() {
        SendClassService.setAssignStudentRoute(false);
    });

    $scope.name = UserInfoService.getFullName();
    // update courses
    $scope.updateCourse = function(newCourseSection, courseName, CourseSection) {
        var courseUpdateData = {
                newCourseSection : newCourseSection,
                courseName       : courseName,
                courseSection    : CourseSection
            };
        $http.post('/programChair/updateCourses', courseUpdateData).then(function successCallBack(response) {
            // populates course table
            $http.get('/programChair/courseEdit').then(function successCallback(response) {
                $scope.courses = response.data;
            }, function errorCallback(response) {
                //TODO
            });
        });
    }
    // delete courses
    $scope.deleteCourse = function(CourseSection) {
        var courseDeleteData = {
                CourseSection : CourseSection
            };
        $http.post('/programChair/deleteCourses', courseDeleteData).then(function successCallBack(response) {
            // populates course table
            $http.get('/programChair/courseEdit').then(function successCallback(response) {
                $scope.courses = response.data;
            }, function errorCallback(response) {
                //TODO
            });
        });
    }
    // add courses
    $scope.addCourse = function(courseAddSection, courseAddName) {
        var courseAddData = {
                courseAddSection : courseAddSection,
                courseAddName    : courseAddName,
            };
        $http.post('/programChair/addCourses', courseAddData).then(function successCallBack(response) {
            // populates course table
            $http.get('/programChair/courseEdit').then(function successCallback(response) {
                $scope.courses = response.data;
            }, function errorCallback(response) {
                //TODO
            });
        });
    }
    // populates course table
    $http.get('/programChair/courseEdit').then(function successCallback(response) {
        $scope.courses = response.data;
    }, function errorCallback(response) {
        //TODO
    });
            $scope.logout = function() {
        UserInfoService.clearUserSession();
        $location.path('/login');
    }

    $scope.displayLogout = function() {
        return UserAuthService.isAuthenticated();
    }

    $scope.goHome = function() {
        $location.path('/programChairHome');
    }

    $scope.displayHome = function() {
        if (UserAuthService.isAuthenticated()) {
            return true;
        }
    }
});

programChair.controller('programChairUpdateAllEnrollmentsController', function($scope, $http, $location, $route, UserInfoService, SendClassService) {
    angular.element(document).ready(function() {
        SendClassService.setAssignStudentRoute(false);
        $http.get('/programChair/getClassNames').then(function successCallback(response) {
            if (response.data[0].ScheduleID) {
                $scope.classes = setClassOptions(response.data);
                $scope.updateAllEnrollments = true;
                $scope.noClasses = false;
            } else {
                $scope.updateAllEnrollments = false;
                $scope.noClasses = true;
            }
        }, function errorCallback(response) {
            //TODO
        });

        function setClassOptions(data) {
            var options = [];
            for (var i in data) {
                if (data[i].Location === 'ASUOnline') {
                    var className = data[i].Subject + ' ' + data[i].CatalogNumber + '*';
                } else {
                    var className = data[i].Subject + ' ' + data[i].CatalogNumber;
                }
                options.push({'class': className,'courseNumber': data[i].CourseNumber, 'enrollment': null});
            }
            return options;
        }
    });

    $scope.saveAllEnrollments = function() {
        for (var i = 0; i < $scope.classes.length; i++) {
            if ($scope.classes[i].enrollment != null && $scope.classes[i].enrollment != 0) {
                var postData = { 'class' : $scope.classes[i].courseNumber, 'enrollment' : $scope.classes[i].enrollment };
                $http.post('/programChair/updateEnrollment', postData).then(function successCallback(response) {
                    $location.path('/programChairHome');
                }, function errorCallback(response) {
                    //TODO
                });
            }
        }
    }
});
