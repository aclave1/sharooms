/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	
	__webpack_require__(2);
	__webpack_require__(3);

	__webpack_require__(1);

	angular
	    .element(document)
	    .ready(function(){
	        angular.bootstrap(document,['app']);
	    });


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(4);

	var hardCodedRoom = {roomName: "mainroom"};


	module.exports = angular
	    .module('app', ['angularFileUpload'])
	    .constant('events', __webpack_require__(6))
	    .factory('io',
	    utils.retFn(
	        __webpack_require__(5)().socket//getting the sails.io function, invoking it, and returning the socket
	    )
	)
	    .controller('MainController', ['$scope', 'io', 'events', function ($scope, io, events) {
	        $scope.displayImage = false;
	        $scope.imageUrl = "";

	        $scope.imgdim = {
	            "height": "100%",
	            "width": "100%"
	        };

	        io.post("/screen/register", hardCodedRoom, function (response, jwr) {
	            setScreenNum(response);
	        });

	        io.on(events.screen.display, function (event) {

	            var fd = event.fd;
	            $scope.imageUrl = fd;
	            $scope.displayImage = true;
	            $scope.$apply();

	        });

	        io.on(events.screen.resize, function (event) {
	            console.dir(event);

	            var height = parseInt($scope.imgdim.height);
	            var width = parseInt($scope.imgdim.width);


	            $scope.imgdim.height = (height + event.direction * 10) + "%";
	            $scope.imgdim.width = (width + event.direction * 10) + "%";
	            $scope.$apply();

	            console.log("w:" + width + "h:" + height);
	        });


	        function setScreenNum(num) {
	            $scope.screenNum = num.screenNum;
	            $scope.$apply();
	        }




	    }])
	    .controller('MobileController', ['$scope', 'io', '$upload', function ($scope, io, $upload) {
	        $scope.test = "chickens";
	        $scope.showScreenPicker = false;
	        $scope.currentFile = null;
	        $scope.screenToEdit = null;
	        $scope.clickMap = [];

	        $scope.screens = [];
	        $scope.roomFiles = [];
	        $scope.files = [];

	        function buildUploadUrl(screen) {
	            return "/upload?" + ["screenId=" + screen.screenId, "roomName=" + hardCodedRoom.roomName].join("&")
	        }

	        $scope.upload = function ($index) {
	            var screen = $scope.screens[$index];

	            var url = buildUploadUrl(screen);

	            var files = $scope.files;
	            if (files.length > 0) {
	                for (var i = 0; i < files.length; i++) {
	                    var file = files[i];
	                    $upload.upload({
	                        url: buildUploadUrl(screen),
	                        fields: {},
	                        fileFormDataName: 'file',
	                        file: file
	                    }).progress(function (evt) {
	                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
	                        console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
	                    }).success(function (data, status, headers, config) {
	                        hideScreenPicker();
	                        console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
	                        getRoomFiles();
	                    });
	                }
	            }
	        };

	        //gets the list of screens and their sockets
	        $scope.getScreens = function () {
	            io.post('/screen/getscreens', hardCodedRoom, function (response, body) {
	                showScreenPicker();
	                $scope.screens = response.screens;
	                $scope.$apply();
	            });
	        };
	        //when a file is selected from the file picker
	        $scope.fileSelected = function ($files, $event) {
	            this.getScreens();
	        };

	        //when an image is clicked in the carousel
	        $scope.imageClick = function ($index) {
	            $scope.clickMap = [];
	            $scope.clickMap[$index] = true;
	            setCurrentImg($scope.roomFiles[$index]);

	        };

	        $scope.chooseScreenToShow = function ($index) {

	        };

	        $scope.chooseScreenToEdit = function ($index) {
	            $scope.screenToEdit = $scope.screens[$index];
	            $scope.editScreenIndex = $index;
	        };

	        $scope.imgWasClicked = function ($index) {
	            return $scope.clickMap[$index] === true;
	        };


	        function showScreenPicker() {
	            $scope.showScreenPicker = true;
	        }

	        function hideScreenPicker() {
	            $scope.showScreenPicker = false;
	        }

	        function getRoomFiles() {
	            io.get('/screen/files?roomName=' + hardCodedRoom.roomName, function (response, jwr) {
	                setRoomFiles(response.files);
	            });
	        }

	        $scope.showOnScreen = function ($index) {
	            var screen = $scope.screens[$index];

	            var request = {
	                fd: $scope.currentFile.fd,
	                screenId: screen.screenId
	            };
	            io.post('/screen/show', request, function (response) {

	            });
	        };

	        $scope.resizeUp = function () {
	            resizeScreen(1);
	        };
	        $scope.resizeDown = function () {
	            resizeScreen(-1);
	        };

	        function resizeScreen(direction) {
	            var req = {
	                roomName: hardCodedRoom.roomName,
	                direction: direction,
	                screenId: $scope.screenToEdit.screenId
	            };
	            io.post('/screen/resize', req);
	        }


	        //the last image that was clicked
	        function setCurrentImg(file) {
	            $scope.currentFile = file;
	        }

	        function setRoomFiles(files) {
	            $scope.roomFiles = files;
	            $scope.$apply();
	        }

	        $scope.getScreens();
	        getRoomFiles();

	    }])
	;



/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 AngularJS v1.3.15
	 (c) 2010-2014 Google, Inc. http://angularjs.org
	 License: MIT
	*/
	(function(Q,W,t){'use strict';function R(b){return function(){var a=arguments[0],c;c="["+(b?b+":":"")+a+"] http://errors.angularjs.org/1.3.15/"+(b?b+"/":"")+a;for(a=1;a<arguments.length;a++){c=c+(1==a?"?":"&")+"p"+(a-1)+"=";var d=encodeURIComponent,e;e=arguments[a];e="function"==typeof e?e.toString().replace(/ \{[\s\S]*$/,""):"undefined"==typeof e?"undefined":"string"!=typeof e?JSON.stringify(e):e;c+=d(e)}return Error(c)}}function Sa(b){if(null==b||Ta(b))return!1;var a=b.length;return b.nodeType===
	qa&&a?!0:C(b)||H(b)||0===a||"number"===typeof a&&0<a&&a-1 in b}function r(b,a,c){var d,e;if(b)if(G(b))for(d in b)"prototype"==d||"length"==d||"name"==d||b.hasOwnProperty&&!b.hasOwnProperty(d)||a.call(c,b[d],d,b);else if(H(b)||Sa(b)){var f="object"!==typeof b;d=0;for(e=b.length;d<e;d++)(f||d in b)&&a.call(c,b[d],d,b)}else if(b.forEach&&b.forEach!==r)b.forEach(a,c,b);else for(d in b)b.hasOwnProperty(d)&&a.call(c,b[d],d,b);return b}function Ed(b,a,c){for(var d=Object.keys(b).sort(),e=0;e<d.length;e++)a.call(c,
	b[d[e]],d[e]);return d}function mc(b){return function(a,c){b(c,a)}}function Fd(){return++ob}function nc(b,a){a?b.$$hashKey=a:delete b.$$hashKey}function w(b){for(var a=b.$$hashKey,c=1,d=arguments.length;c<d;c++){var e=arguments[c];if(e)for(var f=Object.keys(e),g=0,h=f.length;g<h;g++){var l=f[g];b[l]=e[l]}}nc(b,a);return b}function aa(b){return parseInt(b,10)}function Ob(b,a){return w(Object.create(b),a)}function E(){}function ra(b){return b}function ea(b){return function(){return b}}function x(b){return"undefined"===
	typeof b}function y(b){return"undefined"!==typeof b}function J(b){return null!==b&&"object"===typeof b}function C(b){return"string"===typeof b}function Y(b){return"number"===typeof b}function ga(b){return"[object Date]"===Ca.call(b)}function G(b){return"function"===typeof b}function Ua(b){return"[object RegExp]"===Ca.call(b)}function Ta(b){return b&&b.window===b}function Va(b){return b&&b.$evalAsync&&b.$watch}function Wa(b){return"boolean"===typeof b}function oc(b){return!(!b||!(b.nodeName||b.prop&&
	b.attr&&b.find))}function Gd(b){var a={};b=b.split(",");var c;for(c=0;c<b.length;c++)a[b[c]]=!0;return a}function va(b){return z(b.nodeName||b[0]&&b[0].nodeName)}function Xa(b,a){var c=b.indexOf(a);0<=c&&b.splice(c,1);return a}function Da(b,a,c,d){if(Ta(b)||Va(b))throw Ja("cpws");if(a){if(b===a)throw Ja("cpi");c=c||[];d=d||[];if(J(b)){var e=c.indexOf(b);if(-1!==e)return d[e];c.push(b);d.push(a)}if(H(b))for(var f=a.length=0;f<b.length;f++)e=Da(b[f],null,c,d),J(b[f])&&(c.push(b[f]),d.push(e)),a.push(e);
	else{var g=a.$$hashKey;H(a)?a.length=0:r(a,function(b,c){delete a[c]});for(f in b)b.hasOwnProperty(f)&&(e=Da(b[f],null,c,d),J(b[f])&&(c.push(b[f]),d.push(e)),a[f]=e);nc(a,g)}}else if(a=b)H(b)?a=Da(b,[],c,d):ga(b)?a=new Date(b.getTime()):Ua(b)?(a=new RegExp(b.source,b.toString().match(/[^\/]*$/)[0]),a.lastIndex=b.lastIndex):J(b)&&(e=Object.create(Object.getPrototypeOf(b)),a=Da(b,e,c,d));return a}function sa(b,a){if(H(b)){a=a||[];for(var c=0,d=b.length;c<d;c++)a[c]=b[c]}else if(J(b))for(c in a=a||{},
	b)if("$"!==c.charAt(0)||"$"!==c.charAt(1))a[c]=b[c];return a||b}function ha(b,a){if(b===a)return!0;if(null===b||null===a)return!1;if(b!==b&&a!==a)return!0;var c=typeof b,d;if(c==typeof a&&"object"==c)if(H(b)){if(!H(a))return!1;if((c=b.length)==a.length){for(d=0;d<c;d++)if(!ha(b[d],a[d]))return!1;return!0}}else{if(ga(b))return ga(a)?ha(b.getTime(),a.getTime()):!1;if(Ua(b))return Ua(a)?b.toString()==a.toString():!1;if(Va(b)||Va(a)||Ta(b)||Ta(a)||H(a)||ga(a)||Ua(a))return!1;c={};for(d in b)if("$"!==
	d.charAt(0)&&!G(b[d])){if(!ha(b[d],a[d]))return!1;c[d]=!0}for(d in a)if(!c.hasOwnProperty(d)&&"$"!==d.charAt(0)&&a[d]!==t&&!G(a[d]))return!1;return!0}return!1}function Ya(b,a,c){return b.concat(Za.call(a,c))}function pc(b,a){var c=2<arguments.length?Za.call(arguments,2):[];return!G(a)||a instanceof RegExp?a:c.length?function(){return arguments.length?a.apply(b,Ya(c,arguments,0)):a.apply(b,c)}:function(){return arguments.length?a.apply(b,arguments):a.call(b)}}function Hd(b,a){var c=a;"string"===typeof b&&
	"$"===b.charAt(0)&&"$"===b.charAt(1)?c=t:Ta(a)?c="$WINDOW":a&&W===a?c="$DOCUMENT":Va(a)&&(c="$SCOPE");return c}function $a(b,a){if("undefined"===typeof b)return t;Y(a)||(a=a?2:null);return JSON.stringify(b,Hd,a)}function qc(b){return C(b)?JSON.parse(b):b}function wa(b){b=A(b).clone();try{b.empty()}catch(a){}var c=A("<div>").append(b).html();try{return b[0].nodeType===pb?z(c):c.match(/^(<[^>]+>)/)[1].replace(/^<([\w\-]+)/,function(a,b){return"<"+z(b)})}catch(d){return z(c)}}function rc(b){try{return decodeURIComponent(b)}catch(a){}}
	function sc(b){var a={},c,d;r((b||"").split("&"),function(b){b&&(c=b.replace(/\+/g,"%20").split("="),d=rc(c[0]),y(d)&&(b=y(c[1])?rc(c[1]):!0,tc.call(a,d)?H(a[d])?a[d].push(b):a[d]=[a[d],b]:a[d]=b))});return a}function Pb(b){var a=[];r(b,function(b,d){H(b)?r(b,function(b){a.push(Ea(d,!0)+(!0===b?"":"="+Ea(b,!0)))}):a.push(Ea(d,!0)+(!0===b?"":"="+Ea(b,!0)))});return a.length?a.join("&"):""}function qb(b){return Ea(b,!0).replace(/%26/gi,"&").replace(/%3D/gi,"=").replace(/%2B/gi,"+")}function Ea(b,a){return encodeURIComponent(b).replace(/%40/gi,
	"@").replace(/%3A/gi,":").replace(/%24/g,"$").replace(/%2C/gi,",").replace(/%3B/gi,";").replace(/%20/g,a?"%20":"+")}function Id(b,a){var c,d,e=rb.length;b=A(b);for(d=0;d<e;++d)if(c=rb[d]+a,C(c=b.attr(c)))return c;return null}function Jd(b,a){var c,d,e={};r(rb,function(a){a+="app";!c&&b.hasAttribute&&b.hasAttribute(a)&&(c=b,d=b.getAttribute(a))});r(rb,function(a){a+="app";var e;!c&&(e=b.querySelector("["+a.replace(":","\\:")+"]"))&&(c=e,d=e.getAttribute(a))});c&&(e.strictDi=null!==Id(c,"strict-di"),
	a(c,d?[d]:[],e))}function uc(b,a,c){J(c)||(c={});c=w({strictDi:!1},c);var d=function(){b=A(b);if(b.injector()){var d=b[0]===W?"document":wa(b);throw Ja("btstrpd",d.replace(/</,"&lt;").replace(/>/,"&gt;"));}a=a||[];a.unshift(["$provide",function(a){a.value("$rootElement",b)}]);c.debugInfoEnabled&&a.push(["$compileProvider",function(a){a.debugInfoEnabled(!0)}]);a.unshift("ng");d=ab(a,c.strictDi);d.invoke(["$rootScope","$rootElement","$compile","$injector",function(a,b,c,d){a.$apply(function(){b.data("$injector",
	d);c(b)(a)})}]);return d},e=/^NG_ENABLE_DEBUG_INFO!/,f=/^NG_DEFER_BOOTSTRAP!/;Q&&e.test(Q.name)&&(c.debugInfoEnabled=!0,Q.name=Q.name.replace(e,""));if(Q&&!f.test(Q.name))return d();Q.name=Q.name.replace(f,"");ca.resumeBootstrap=function(b){r(b,function(b){a.push(b)});return d()};G(ca.resumeDeferredBootstrap)&&ca.resumeDeferredBootstrap()}function Kd(){Q.name="NG_ENABLE_DEBUG_INFO!"+Q.name;Q.location.reload()}function Ld(b){b=ca.element(b).injector();if(!b)throw Ja("test");return b.get("$$testability")}
	function vc(b,a){a=a||"_";return b.replace(Md,function(b,d){return(d?a:"")+b.toLowerCase()})}function Nd(){var b;wc||((ta=Q.jQuery)&&ta.fn.on?(A=ta,w(ta.fn,{scope:Ka.scope,isolateScope:Ka.isolateScope,controller:Ka.controller,injector:Ka.injector,inheritedData:Ka.inheritedData}),b=ta.cleanData,ta.cleanData=function(a){var c;if(Qb)Qb=!1;else for(var d=0,e;null!=(e=a[d]);d++)(c=ta._data(e,"events"))&&c.$destroy&&ta(e).triggerHandler("$destroy");b(a)}):A=T,ca.element=A,wc=!0)}function Rb(b,a,c){if(!b)throw Ja("areq",
	a||"?",c||"required");return b}function sb(b,a,c){c&&H(b)&&(b=b[b.length-1]);Rb(G(b),a,"not a function, got "+(b&&"object"===typeof b?b.constructor.name||"Object":typeof b));return b}function La(b,a){if("hasOwnProperty"===b)throw Ja("badname",a);}function xc(b,a,c){if(!a)return b;a=a.split(".");for(var d,e=b,f=a.length,g=0;g<f;g++)d=a[g],b&&(b=(e=b)[d]);return!c&&G(b)?pc(e,b):b}function tb(b){var a=b[0];b=b[b.length-1];var c=[a];do{a=a.nextSibling;if(!a)break;c.push(a)}while(a!==b);return A(c)}function ia(){return Object.create(null)}
	function Od(b){function a(a,b,c){return a[b]||(a[b]=c())}var c=R("$injector"),d=R("ng");b=a(b,"angular",Object);b.$$minErr=b.$$minErr||R;return a(b,"module",function(){var b={};return function(f,g,h){if("hasOwnProperty"===f)throw d("badname","module");g&&b.hasOwnProperty(f)&&(b[f]=null);return a(b,f,function(){function a(c,d,e,f){f||(f=b);return function(){f[e||"push"]([c,d,arguments]);return u}}if(!g)throw c("nomod",f);var b=[],d=[],e=[],q=a("$injector","invoke","push",d),u={_invokeQueue:b,_configBlocks:d,
	_runBlocks:e,requires:g,name:f,provider:a("$provide","provider"),factory:a("$provide","factory"),service:a("$provide","service"),value:a("$provide","value"),constant:a("$provide","constant","unshift"),animation:a("$animateProvider","register"),filter:a("$filterProvider","register"),controller:a("$controllerProvider","register"),directive:a("$compileProvider","directive"),config:q,run:function(a){e.push(a);return this}};h&&q(h);return u})}})}function Pd(b){w(b,{bootstrap:uc,copy:Da,extend:w,equals:ha,
	element:A,forEach:r,injector:ab,noop:E,bind:pc,toJson:$a,fromJson:qc,identity:ra,isUndefined:x,isDefined:y,isString:C,isFunction:G,isObject:J,isNumber:Y,isElement:oc,isArray:H,version:Qd,isDate:ga,lowercase:z,uppercase:ub,callbacks:{counter:0},getTestability:Ld,$$minErr:R,$$csp:bb,reloadWithDebugInfo:Kd});cb=Od(Q);try{cb("ngLocale")}catch(a){cb("ngLocale",[]).provider("$locale",Rd)}cb("ng",["ngLocale"],["$provide",function(a){a.provider({$$sanitizeUri:Sd});a.provider("$compile",yc).directive({a:Td,
	input:zc,textarea:zc,form:Ud,script:Vd,select:Wd,style:Xd,option:Yd,ngBind:Zd,ngBindHtml:$d,ngBindTemplate:ae,ngClass:be,ngClassEven:ce,ngClassOdd:de,ngCloak:ee,ngController:fe,ngForm:ge,ngHide:he,ngIf:ie,ngInclude:je,ngInit:ke,ngNonBindable:le,ngPluralize:me,ngRepeat:ne,ngShow:oe,ngStyle:pe,ngSwitch:qe,ngSwitchWhen:re,ngSwitchDefault:se,ngOptions:te,ngTransclude:ue,ngModel:ve,ngList:we,ngChange:xe,pattern:Ac,ngPattern:Ac,required:Bc,ngRequired:Bc,minlength:Cc,ngMinlength:Cc,maxlength:Dc,ngMaxlength:Dc,
	ngValue:ye,ngModelOptions:ze}).directive({ngInclude:Ae}).directive(vb).directive(Ec);a.provider({$anchorScroll:Be,$animate:Ce,$browser:De,$cacheFactory:Ee,$controller:Fe,$document:Ge,$exceptionHandler:He,$filter:Fc,$interpolate:Ie,$interval:Je,$http:Ke,$httpBackend:Le,$location:Me,$log:Ne,$parse:Oe,$rootScope:Pe,$q:Qe,$$q:Re,$sce:Se,$sceDelegate:Te,$sniffer:Ue,$templateCache:Ve,$templateRequest:We,$$testability:Xe,$timeout:Ye,$window:Ze,$$rAF:$e,$$asyncCallback:af,$$jqLite:bf})}])}function db(b){return b.replace(cf,
	function(a,b,d,e){return e?d.toUpperCase():d}).replace(df,"Moz$1")}function Gc(b){b=b.nodeType;return b===qa||!b||9===b}function Hc(b,a){var c,d,e=a.createDocumentFragment(),f=[];if(Sb.test(b)){c=c||e.appendChild(a.createElement("div"));d=(ef.exec(b)||["",""])[1].toLowerCase();d=ja[d]||ja._default;c.innerHTML=d[1]+b.replace(ff,"<$1></$2>")+d[2];for(d=d[0];d--;)c=c.lastChild;f=Ya(f,c.childNodes);c=e.firstChild;c.textContent=""}else f.push(a.createTextNode(b));e.textContent="";e.innerHTML="";r(f,function(a){e.appendChild(a)});
	return e}function T(b){if(b instanceof T)return b;var a;C(b)&&(b=N(b),a=!0);if(!(this instanceof T)){if(a&&"<"!=b.charAt(0))throw Tb("nosel");return new T(b)}if(a){a=W;var c;b=(c=gf.exec(b))?[a.createElement(c[1])]:(c=Hc(b,a))?c.childNodes:[]}Ic(this,b)}function Ub(b){return b.cloneNode(!0)}function wb(b,a){a||xb(b);if(b.querySelectorAll)for(var c=b.querySelectorAll("*"),d=0,e=c.length;d<e;d++)xb(c[d])}function Jc(b,a,c,d){if(y(d))throw Tb("offargs");var e=(d=yb(b))&&d.events,f=d&&d.handle;if(f)if(a)r(a.split(" "),
	function(a){if(y(c)){var d=e[a];Xa(d||[],c);if(d&&0<d.length)return}b.removeEventListener(a,f,!1);delete e[a]});else for(a in e)"$destroy"!==a&&b.removeEventListener(a,f,!1),delete e[a]}function xb(b,a){var c=b.ng339,d=c&&zb[c];d&&(a?delete d.data[a]:(d.handle&&(d.events.$destroy&&d.handle({},"$destroy"),Jc(b)),delete zb[c],b.ng339=t))}function yb(b,a){var c=b.ng339,c=c&&zb[c];a&&!c&&(b.ng339=c=++hf,c=zb[c]={events:{},data:{},handle:t});return c}function Vb(b,a,c){if(Gc(b)){var d=y(c),e=!d&&a&&!J(a),
	f=!a;b=(b=yb(b,!e))&&b.data;if(d)b[a]=c;else{if(f)return b;if(e)return b&&b[a];w(b,a)}}}function Ab(b,a){return b.getAttribute?-1<(" "+(b.getAttribute("class")||"")+" ").replace(/[\n\t]/g," ").indexOf(" "+a+" "):!1}function Bb(b,a){a&&b.setAttribute&&r(a.split(" "),function(a){b.setAttribute("class",N((" "+(b.getAttribute("class")||"")+" ").replace(/[\n\t]/g," ").replace(" "+N(a)+" "," ")))})}function Cb(b,a){if(a&&b.setAttribute){var c=(" "+(b.getAttribute("class")||"")+" ").replace(/[\n\t]/g," ");
	r(a.split(" "),function(a){a=N(a);-1===c.indexOf(" "+a+" ")&&(c+=a+" ")});b.setAttribute("class",N(c))}}function Ic(b,a){if(a)if(a.nodeType)b[b.length++]=a;else{var c=a.length;if("number"===typeof c&&a.window!==a){if(c)for(var d=0;d<c;d++)b[b.length++]=a[d]}else b[b.length++]=a}}function Kc(b,a){return Db(b,"$"+(a||"ngController")+"Controller")}function Db(b,a,c){9==b.nodeType&&(b=b.documentElement);for(a=H(a)?a:[a];b;){for(var d=0,e=a.length;d<e;d++)if((c=A.data(b,a[d]))!==t)return c;b=b.parentNode||
	11===b.nodeType&&b.host}}function Lc(b){for(wb(b,!0);b.firstChild;)b.removeChild(b.firstChild)}function Mc(b,a){a||wb(b);var c=b.parentNode;c&&c.removeChild(b)}function jf(b,a){a=a||Q;if("complete"===a.document.readyState)a.setTimeout(b);else A(a).on("load",b)}function Nc(b,a){var c=Eb[a.toLowerCase()];return c&&Oc[va(b)]&&c}function kf(b,a){var c=b.nodeName;return("INPUT"===c||"TEXTAREA"===c)&&Pc[a]}function lf(b,a){var c=function(c,e){c.isDefaultPrevented=function(){return c.defaultPrevented};var f=
	a[e||c.type],g=f?f.length:0;if(g){if(x(c.immediatePropagationStopped)){var h=c.stopImmediatePropagation;c.stopImmediatePropagation=function(){c.immediatePropagationStopped=!0;c.stopPropagation&&c.stopPropagation();h&&h.call(c)}}c.isImmediatePropagationStopped=function(){return!0===c.immediatePropagationStopped};1<g&&(f=sa(f));for(var l=0;l<g;l++)c.isImmediatePropagationStopped()||f[l].call(b,c)}};c.elem=b;return c}function bf(){this.$get=function(){return w(T,{hasClass:function(b,a){b.attr&&(b=b[0]);
	return Ab(b,a)},addClass:function(b,a){b.attr&&(b=b[0]);return Cb(b,a)},removeClass:function(b,a){b.attr&&(b=b[0]);return Bb(b,a)}})}}function Ma(b,a){var c=b&&b.$$hashKey;if(c)return"function"===typeof c&&(c=b.$$hashKey()),c;c=typeof b;return c="function"==c||"object"==c&&null!==b?b.$$hashKey=c+":"+(a||Fd)():c+":"+b}function eb(b,a){if(a){var c=0;this.nextUid=function(){return++c}}r(b,this.put,this)}function mf(b){return(b=b.toString().replace(Qc,"").match(Rc))?"function("+(b[1]||"").replace(/[\s\r\n]+/,
	" ")+")":"fn"}function ab(b,a){function c(a){return function(b,c){if(J(b))r(b,mc(a));else return a(b,c)}}function d(a,b){La(a,"service");if(G(b)||H(b))b=q.instantiate(b);if(!b.$get)throw Fa("pget",a);return p[a+"Provider"]=b}function e(a,b){return function(){var c=s.invoke(b,this);if(x(c))throw Fa("undef",a);return c}}function f(a,b,c){return d(a,{$get:!1!==c?e(a,b):b})}function g(a){var b=[],c;r(a,function(a){function d(a){var b,c;b=0;for(c=a.length;b<c;b++){var e=a[b],f=q.get(e[0]);f[e[1]].apply(f,
	e[2])}}if(!n.get(a)){n.put(a,!0);try{C(a)?(c=cb(a),b=b.concat(g(c.requires)).concat(c._runBlocks),d(c._invokeQueue),d(c._configBlocks)):G(a)?b.push(q.invoke(a)):H(a)?b.push(q.invoke(a)):sb(a,"module")}catch(e){throw H(a)&&(a=a[a.length-1]),e.message&&e.stack&&-1==e.stack.indexOf(e.message)&&(e=e.message+"\n"+e.stack),Fa("modulerr",a,e.stack||e.message||e);}}});return b}function h(b,c){function d(a,e){if(b.hasOwnProperty(a)){if(b[a]===l)throw Fa("cdep",a+" <- "+k.join(" <- "));return b[a]}try{return k.unshift(a),
	b[a]=l,b[a]=c(a,e)}catch(f){throw b[a]===l&&delete b[a],f;}finally{k.shift()}}function e(b,c,f,g){"string"===typeof f&&(g=f,f=null);var k=[],h=ab.$$annotate(b,a,g),l,q,p;q=0;for(l=h.length;q<l;q++){p=h[q];if("string"!==typeof p)throw Fa("itkn",p);k.push(f&&f.hasOwnProperty(p)?f[p]:d(p,g))}H(b)&&(b=b[l]);return b.apply(c,k)}return{invoke:e,instantiate:function(a,b,c){var d=Object.create((H(a)?a[a.length-1]:a).prototype||null);a=e(a,d,b,c);return J(a)||G(a)?a:d},get:d,annotate:ab.$$annotate,has:function(a){return p.hasOwnProperty(a+
	"Provider")||b.hasOwnProperty(a)}}}a=!0===a;var l={},k=[],n=new eb([],!0),p={$provide:{provider:c(d),factory:c(f),service:c(function(a,b){return f(a,["$injector",function(a){return a.instantiate(b)}])}),value:c(function(a,b){return f(a,ea(b),!1)}),constant:c(function(a,b){La(a,"constant");p[a]=b;u[a]=b}),decorator:function(a,b){var c=q.get(a+"Provider"),d=c.$get;c.$get=function(){var a=s.invoke(d,c);return s.invoke(b,null,{$delegate:a})}}}},q=p.$injector=h(p,function(a,b){ca.isString(b)&&k.push(b);
	throw Fa("unpr",k.join(" <- "));}),u={},s=u.$injector=h(u,function(a,b){var c=q.get(a+"Provider",b);return s.invoke(c.$get,c,t,a)});r(g(b),function(a){s.invoke(a||E)});return s}function Be(){var b=!0;this.disableAutoScrolling=function(){b=!1};this.$get=["$window","$location","$rootScope",function(a,c,d){function e(a){var b=null;Array.prototype.some.call(a,function(a){if("a"===va(a))return b=a,!0});return b}function f(b){if(b){b.scrollIntoView();var c;c=g.yOffset;G(c)?c=c():oc(c)?(c=c[0],c="fixed"!==
	a.getComputedStyle(c).position?0:c.getBoundingClientRect().bottom):Y(c)||(c=0);c&&(b=b.getBoundingClientRect().top,a.scrollBy(0,b-c))}else a.scrollTo(0,0)}function g(){var a=c.hash(),b;a?(b=h.getElementById(a))?f(b):(b=e(h.getElementsByName(a)))?f(b):"top"===a&&f(null):f(null)}var h=a.document;b&&d.$watch(function(){return c.hash()},function(a,b){a===b&&""===a||jf(function(){d.$evalAsync(g)})});return g}]}function af(){this.$get=["$$rAF","$timeout",function(b,a){return b.supported?function(a){return b(a)}:
	function(b){return a(b,0,!1)}}]}function nf(b,a,c,d){function e(a){try{a.apply(null,Za.call(arguments,1))}finally{if(m--,0===m)for(;F.length;)try{F.pop()()}catch(b){c.error(b)}}}function f(a,b){(function da(){r(Z,function(a){a()});L=b(da,a)})()}function g(){h();l()}function h(){a:{try{B=u.state;break a}catch(a){}B=void 0}B=x(B)?null:B;ha(B,O)&&(B=O);O=B}function l(){if(D!==n.url()||I!==B)D=n.url(),I=B,r(X,function(a){a(n.url(),B)})}function k(a){try{return decodeURIComponent(a)}catch(b){return a}}
	var n=this,p=a[0],q=b.location,u=b.history,s=b.setTimeout,M=b.clearTimeout,v={};n.isMock=!1;var m=0,F=[];n.$$completeOutstandingRequest=e;n.$$incOutstandingRequestCount=function(){m++};n.notifyWhenNoOutstandingRequests=function(a){r(Z,function(a){a()});0===m?a():F.push(a)};var Z=[],L;n.addPollFn=function(a){x(L)&&f(100,s);Z.push(a);return a};var B,I,D=q.href,S=a.find("base"),P=null;h();I=B;n.url=function(a,c,e){x(e)&&(e=null);q!==b.location&&(q=b.location);u!==b.history&&(u=b.history);if(a){var f=
	I===e;if(D===a&&(!d.history||f))return n;var g=D&&Ga(D)===Ga(a);D=a;I=e;!d.history||g&&f?(g||(P=a),c?q.replace(a):g?(c=q,e=a.indexOf("#"),a=-1===e?"":a.substr(e+1),c.hash=a):q.href=a):(u[c?"replaceState":"pushState"](e,"",a),h(),I=B);return n}return P||q.href.replace(/%27/g,"'")};n.state=function(){return B};var X=[],ba=!1,O=null;n.onUrlChange=function(a){if(!ba){if(d.history)A(b).on("popstate",g);A(b).on("hashchange",g);ba=!0}X.push(a);return a};n.$$checkUrlChange=l;n.baseHref=function(){var a=S.attr("href");
	return a?a.replace(/^(https?\:)?\/\/[^\/]*/,""):""};var fa={},y="",ka=n.baseHref();n.cookies=function(a,b){var d,e,f,g;if(a)b===t?p.cookie=encodeURIComponent(a)+"=;path="+ka+";expires=Thu, 01 Jan 1970 00:00:00 GMT":C(b)&&(d=(p.cookie=encodeURIComponent(a)+"="+encodeURIComponent(b)+";path="+ka).length+1,4096<d&&c.warn("Cookie '"+a+"' possibly not set or overflowed because it was too large ("+d+" > 4096 bytes)!"));else{if(p.cookie!==y)for(y=p.cookie,d=y.split("; "),fa={},f=0;f<d.length;f++)e=d[f],g=
	e.indexOf("="),0<g&&(a=k(e.substring(0,g)),fa[a]===t&&(fa[a]=k(e.substring(g+1))));return fa}};n.defer=function(a,b){var c;m++;c=s(function(){delete v[c];e(a)},b||0);v[c]=!0;return c};n.defer.cancel=function(a){return v[a]?(delete v[a],M(a),e(E),!0):!1}}function De(){this.$get=["$window","$log","$sniffer","$document",function(b,a,c,d){return new nf(b,d,a,c)}]}function Ee(){this.$get=function(){function b(b,d){function e(a){a!=p&&(q?q==a&&(q=a.n):q=a,f(a.n,a.p),f(a,p),p=a,p.n=null)}function f(a,b){a!=
	b&&(a&&(a.p=b),b&&(b.n=a))}if(b in a)throw R("$cacheFactory")("iid",b);var g=0,h=w({},d,{id:b}),l={},k=d&&d.capacity||Number.MAX_VALUE,n={},p=null,q=null;return a[b]={put:function(a,b){if(k<Number.MAX_VALUE){var c=n[a]||(n[a]={key:a});e(c)}if(!x(b))return a in l||g++,l[a]=b,g>k&&this.remove(q.key),b},get:function(a){if(k<Number.MAX_VALUE){var b=n[a];if(!b)return;e(b)}return l[a]},remove:function(a){if(k<Number.MAX_VALUE){var b=n[a];if(!b)return;b==p&&(p=b.p);b==q&&(q=b.n);f(b.n,b.p);delete n[a]}delete l[a];
	g--},removeAll:function(){l={};g=0;n={};p=q=null},destroy:function(){n=h=l=null;delete a[b]},info:function(){return w({},h,{size:g})}}}var a={};b.info=function(){var b={};r(a,function(a,e){b[e]=a.info()});return b};b.get=function(b){return a[b]};return b}}function Ve(){this.$get=["$cacheFactory",function(b){return b("templates")}]}function yc(b,a){function c(a,b){var c=/^\s*([@&]|=(\*?))(\??)\s*(\w*)\s*$/,d={};r(a,function(a,e){var f=a.match(c);if(!f)throw la("iscp",b,e,a);d[e]={mode:f[1][0],collection:"*"===
	f[2],optional:"?"===f[3],attrName:f[4]||e}});return d}var d={},e=/^\s*directive\:\s*([\w\-]+)\s+(.*)$/,f=/(([\w\-]+)(?:\:([^;]+))?;?)/,g=Gd("ngSrc,ngSrcset,src,srcset"),h=/^(?:(\^\^?)?(\?)?(\^\^?)?)?/,l=/^(on[a-z]+|formaction)$/;this.directive=function p(a,e){La(a,"directive");C(a)?(Rb(e,"directiveFactory"),d.hasOwnProperty(a)||(d[a]=[],b.factory(a+"Directive",["$injector","$exceptionHandler",function(b,e){var f=[];r(d[a],function(d,g){try{var h=b.invoke(d);G(h)?h={compile:ea(h)}:!h.compile&&h.link&&
	(h.compile=ea(h.link));h.priority=h.priority||0;h.index=g;h.name=h.name||a;h.require=h.require||h.controller&&h.name;h.restrict=h.restrict||"EA";J(h.scope)&&(h.$$isolateBindings=c(h.scope,h.name));f.push(h)}catch(k){e(k)}});return f}])),d[a].push(e)):r(a,mc(p));return this};this.aHrefSanitizationWhitelist=function(b){return y(b)?(a.aHrefSanitizationWhitelist(b),this):a.aHrefSanitizationWhitelist()};this.imgSrcSanitizationWhitelist=function(b){return y(b)?(a.imgSrcSanitizationWhitelist(b),this):a.imgSrcSanitizationWhitelist()};
	var k=!0;this.debugInfoEnabled=function(a){return y(a)?(k=a,this):k};this.$get=["$injector","$interpolate","$exceptionHandler","$templateRequest","$parse","$controller","$rootScope","$document","$sce","$animate","$$sanitizeUri",function(a,b,c,s,M,v,m,F,Z,L,B){function I(a,b){try{a.addClass(b)}catch(c){}}function D(a,b,c,d,e){a instanceof A||(a=A(a));r(a,function(b,c){b.nodeType==pb&&b.nodeValue.match(/\S+/)&&(a[c]=A(b).wrap("<span></span>").parent()[0])});var f=S(a,b,a,c,d,e);D.$$addScopeClass(a);
	var g=null;return function(b,c,d){Rb(b,"scope");d=d||{};var e=d.parentBoundTranscludeFn,h=d.transcludeControllers;d=d.futureParentElement;e&&e.$$boundTransclude&&(e=e.$$boundTransclude);g||(g=(d=d&&d[0])?"foreignobject"!==va(d)&&d.toString().match(/SVG/)?"svg":"html":"html");d="html"!==g?A(Xb(g,A("<div>").append(a).html())):c?Ka.clone.call(a):a;if(h)for(var k in h)d.data("$"+k+"Controller",h[k].instance);D.$$addScopeInfo(d,b);c&&c(d,b);f&&f(b,d,d,e);return d}}function S(a,b,c,d,e,f){function g(a,
	c,d,e){var f,k,l,q,p,s,M;if(m)for(M=Array(c.length),q=0;q<h.length;q+=3)f=h[q],M[f]=c[f];else M=c;q=0;for(p=h.length;q<p;)k=M[h[q++]],c=h[q++],f=h[q++],c?(c.scope?(l=a.$new(),D.$$addScopeInfo(A(k),l)):l=a,s=c.transcludeOnThisElement?P(a,c.transclude,e,c.elementTranscludeOnThisElement):!c.templateOnThisElement&&e?e:!e&&b?P(a,b):null,c(f,l,k,d,s)):f&&f(a,k.childNodes,t,e)}for(var h=[],k,l,q,p,m,s=0;s<a.length;s++){k=new Yb;l=X(a[s],[],k,0===s?d:t,e);(f=l.length?fa(l,a[s],k,b,c,null,[],[],f):null)&&
	f.scope&&D.$$addScopeClass(k.$$element);k=f&&f.terminal||!(q=a[s].childNodes)||!q.length?null:S(q,f?(f.transcludeOnThisElement||!f.templateOnThisElement)&&f.transclude:b);if(f||k)h.push(s,f,k),p=!0,m=m||f;f=null}return p?g:null}function P(a,b,c,d){return function(d,e,f,g,h){d||(d=a.$new(!1,h),d.$$transcluded=!0);return b(d,e,{parentBoundTranscludeFn:c,transcludeControllers:f,futureParentElement:g})}}function X(a,b,c,d,g){var h=c.$attr,k;switch(a.nodeType){case qa:ka(b,xa(va(a)),"E",d,g);for(var l,
	q,p,m=a.attributes,s=0,M=m&&m.length;s<M;s++){var u=!1,L=!1;l=m[s];k=l.name;q=N(l.value);l=xa(k);if(p=U.test(l))k=k.replace(Sc,"").substr(8).replace(/_(.)/g,function(a,b){return b.toUpperCase()});var B=l.replace(/(Start|End)$/,"");x(B)&&l===B+"Start"&&(u=k,L=k.substr(0,k.length-5)+"end",k=k.substr(0,k.length-6));l=xa(k.toLowerCase());h[l]=k;if(p||!c.hasOwnProperty(l))c[l]=q,Nc(a,l)&&(c[l]=!0);Oa(a,b,q,l,p);ka(b,l,"A",d,g,u,L)}a=a.className;J(a)&&(a=a.animVal);if(C(a)&&""!==a)for(;k=f.exec(a);)l=xa(k[2]),
	ka(b,l,"C",d,g)&&(c[l]=N(k[3])),a=a.substr(k.index+k[0].length);break;case pb:za(b,a.nodeValue);break;case 8:try{if(k=e.exec(a.nodeValue))l=xa(k[1]),ka(b,l,"M",d,g)&&(c[l]=N(k[2]))}catch(v){}}b.sort(da);return b}function ba(a,b,c){var d=[],e=0;if(b&&a.hasAttribute&&a.hasAttribute(b)){do{if(!a)throw la("uterdir",b,c);a.nodeType==qa&&(a.hasAttribute(b)&&e++,a.hasAttribute(c)&&e--);d.push(a);a=a.nextSibling}while(0<e)}else d.push(a);return A(d)}function O(a,b,c){return function(d,e,f,g,h){e=ba(e[0],
	b,c);return a(d,e,f,g,h)}}function fa(a,d,e,f,g,k,l,p,m){function s(a,b,c,d){if(a){c&&(a=O(a,c,d));a.require=K.require;a.directiveName=da;if(P===K||K.$$isolateScope)a=Y(a,{isolateScope:!0});l.push(a)}if(b){c&&(b=O(b,c,d));b.require=K.require;b.directiveName=da;if(P===K||K.$$isolateScope)b=Y(b,{isolateScope:!0});p.push(b)}}function L(a,b,c,d){var e,f="data",g=!1,k=c,l;if(C(b)){l=b.match(h);b=b.substring(l[0].length);l[3]&&(l[1]?l[3]=null:l[1]=l[3]);"^"===l[1]?f="inheritedData":"^^"===l[1]&&(f="inheritedData",
	k=c.parent());"?"===l[2]&&(g=!0);e=null;d&&"data"===f&&(e=d[b])&&(e=e.instance);e=e||k[f]("$"+b+"Controller");if(!e&&!g)throw la("ctreq",b,a);return e||null}H(b)&&(e=[],r(b,function(b){e.push(L(a,b,c,d))}));return e}function B(a,c,f,g,h){function k(a,b,c){var d;Va(a)||(c=b,b=a,a=t);E&&(d=F);c||(c=E?X.parent():X);return h(a,b,d,c,Wb)}var m,s,u,I,F,gb,X,O;d===f?(O=e,X=e.$$element):(X=A(f),O=new Yb(X,e));P&&(I=c.$new(!0));h&&(gb=k,gb.$$boundTransclude=h);S&&(Z={},F={},r(S,function(a){var b={$scope:a===
	P||a.$$isolateScope?I:c,$element:X,$attrs:O,$transclude:gb};u=a.controller;"@"==u&&(u=O[a.name]);b=v(u,b,!0,a.controllerAs);F[a.name]=b;E||X.data("$"+a.name+"Controller",b.instance);Z[a.name]=b}));if(P){D.$$addScopeInfo(X,I,!0,!(ma&&(ma===P||ma===P.$$originalDirective)));D.$$addScopeClass(X,!0);g=Z&&Z[P.name];var ba=I;g&&g.identifier&&!0===P.bindToController&&(ba=g.instance);r(I.$$isolateBindings=P.$$isolateBindings,function(a,d){var e=a.attrName,f=a.optional,g,h,k,l;switch(a.mode){case "@":O.$observe(e,
	function(a){ba[d]=a});O.$$observers[e].$$scope=c;O[e]&&(ba[d]=b(O[e])(c));break;case "=":if(f&&!O[e])break;h=M(O[e]);l=h.literal?ha:function(a,b){return a===b||a!==a&&b!==b};k=h.assign||function(){g=ba[d]=h(c);throw la("nonassign",O[e],P.name);};g=ba[d]=h(c);f=function(a){l(a,ba[d])||(l(a,g)?k(c,a=ba[d]):ba[d]=a);return g=a};f.$stateful=!0;f=a.collection?c.$watchCollection(O[e],f):c.$watch(M(O[e],f),null,h.literal);I.$on("$destroy",f);break;case "&":h=M(O[e]),ba[d]=function(a){return h(c,a)}}})}Z&&
	(r(Z,function(a){a()}),Z=null);g=0;for(m=l.length;g<m;g++)s=l[g],$(s,s.isolateScope?I:c,X,O,s.require&&L(s.directiveName,s.require,X,F),gb);var Wb=c;P&&(P.template||null===P.templateUrl)&&(Wb=I);a&&a(Wb,f.childNodes,t,h);for(g=p.length-1;0<=g;g--)s=p[g],$(s,s.isolateScope?I:c,X,O,s.require&&L(s.directiveName,s.require,X,F),gb)}m=m||{};for(var I=-Number.MAX_VALUE,F,S=m.controllerDirectives,Z,P=m.newIsolateScopeDirective,ma=m.templateDirective,fa=m.nonTlbTranscludeDirective,ka=!1,x=!1,E=m.hasElementTranscludeDirective,
	w=e.$$element=A(d),K,da,V,fb=f,za,z=0,Q=a.length;z<Q;z++){K=a[z];var Oa=K.$$start,U=K.$$end;Oa&&(w=ba(d,Oa,U));V=t;if(I>K.priority)break;if(V=K.scope)K.templateUrl||(J(V)?(Na("new/isolated scope",P||F,K,w),P=K):Na("new/isolated scope",P,K,w)),F=F||K;da=K.name;!K.templateUrl&&K.controller&&(V=K.controller,S=S||{},Na("'"+da+"' controller",S[da],K,w),S[da]=K);if(V=K.transclude)ka=!0,K.$$tlb||(Na("transclusion",fa,K,w),fa=K),"element"==V?(E=!0,I=K.priority,V=w,w=e.$$element=A(W.createComment(" "+da+": "+
	e[da]+" ")),d=w[0],T(g,Za.call(V,0),d),fb=D(V,f,I,k&&k.name,{nonTlbTranscludeDirective:fa})):(V=A(Ub(d)).contents(),w.empty(),fb=D(V,f));if(K.template)if(x=!0,Na("template",ma,K,w),ma=K,V=G(K.template)?K.template(w,e):K.template,V=Tc(V),K.replace){k=K;V=Sb.test(V)?Uc(Xb(K.templateNamespace,N(V))):[];d=V[0];if(1!=V.length||d.nodeType!==qa)throw la("tplrt",da,"");T(g,w,d);Q={$attr:{}};V=X(d,[],Q);var aa=a.splice(z+1,a.length-(z+1));P&&y(V);a=a.concat(V).concat(aa);R(e,Q);Q=a.length}else w.html(V);if(K.templateUrl)x=
	!0,Na("template",ma,K,w),ma=K,K.replace&&(k=K),B=of(a.splice(z,a.length-z),w,e,g,ka&&fb,l,p,{controllerDirectives:S,newIsolateScopeDirective:P,templateDirective:ma,nonTlbTranscludeDirective:fa}),Q=a.length;else if(K.compile)try{za=K.compile(w,e,fb),G(za)?s(null,za,Oa,U):za&&s(za.pre,za.post,Oa,U)}catch(pf){c(pf,wa(w))}K.terminal&&(B.terminal=!0,I=Math.max(I,K.priority))}B.scope=F&&!0===F.scope;B.transcludeOnThisElement=ka;B.elementTranscludeOnThisElement=E;B.templateOnThisElement=x;B.transclude=fb;
	m.hasElementTranscludeDirective=E;return B}function y(a){for(var b=0,c=a.length;b<c;b++)a[b]=Ob(a[b],{$$isolateScope:!0})}function ka(b,e,f,g,h,k,l){if(e===h)return null;h=null;if(d.hasOwnProperty(e)){var q;e=a.get(e+"Directive");for(var m=0,s=e.length;m<s;m++)try{q=e[m],(g===t||g>q.priority)&&-1!=q.restrict.indexOf(f)&&(k&&(q=Ob(q,{$$start:k,$$end:l})),b.push(q),h=q)}catch(M){c(M)}}return h}function x(b){if(d.hasOwnProperty(b))for(var c=a.get(b+"Directive"),e=0,f=c.length;e<f;e++)if(b=c[e],b.multiElement)return!0;
	return!1}function R(a,b){var c=b.$attr,d=a.$attr,e=a.$$element;r(a,function(d,e){"$"!=e.charAt(0)&&(b[e]&&b[e]!==d&&(d+=("style"===e?";":" ")+b[e]),a.$set(e,d,!0,c[e]))});r(b,function(b,f){"class"==f?(I(e,b),a["class"]=(a["class"]?a["class"]+" ":"")+b):"style"==f?(e.attr("style",e.attr("style")+";"+b),a.style=(a.style?a.style+";":"")+b):"$"==f.charAt(0)||a.hasOwnProperty(f)||(a[f]=b,d[f]=c[f])})}function of(a,b,c,d,e,f,g,h){var k=[],l,q,p=b[0],m=a.shift(),M=Ob(m,{templateUrl:null,transclude:null,
	replace:null,$$originalDirective:m}),u=G(m.templateUrl)?m.templateUrl(b,c):m.templateUrl,L=m.templateNamespace;b.empty();s(Z.getTrustedResourceUrl(u)).then(function(s){var B,v;s=Tc(s);if(m.replace){s=Sb.test(s)?Uc(Xb(L,N(s))):[];B=s[0];if(1!=s.length||B.nodeType!==qa)throw la("tplrt",m.name,u);s={$attr:{}};T(d,b,B);var D=X(B,[],s);J(m.scope)&&y(D);a=D.concat(a);R(c,s)}else B=p,b.html(s);a.unshift(M);l=fa(a,B,c,e,b,m,f,g,h);r(d,function(a,c){a==B&&(d[c]=b[0])});for(q=S(b[0].childNodes,e);k.length;){s=
	k.shift();v=k.shift();var F=k.shift(),O=k.shift(),D=b[0];if(!s.$$destroyed){if(v!==p){var Z=v.className;h.hasElementTranscludeDirective&&m.replace||(D=Ub(B));T(F,A(v),D);I(A(D),Z)}v=l.transcludeOnThisElement?P(s,l.transclude,O):O;l(q,s,D,d,v)}}k=null});return function(a,b,c,d,e){a=e;b.$$destroyed||(k?k.push(b,c,d,a):(l.transcludeOnThisElement&&(a=P(b,l.transclude,e)),l(q,b,c,d,a)))}}function da(a,b){var c=b.priority-a.priority;return 0!==c?c:a.name!==b.name?a.name<b.name?-1:1:a.index-b.index}function Na(a,
	b,c,d){if(b)throw la("multidir",b.name,c.name,a,wa(d));}function za(a,c){var d=b(c,!0);d&&a.push({priority:0,compile:function(a){a=a.parent();var b=!!a.length;b&&D.$$addBindingClass(a);return function(a,c){var e=c.parent();b||D.$$addBindingClass(e);D.$$addBindingInfo(e,d.expressions);a.$watch(d,function(a){c[0].nodeValue=a})}}})}function Xb(a,b){a=z(a||"html");switch(a){case "svg":case "math":var c=W.createElement("div");c.innerHTML="<"+a+">"+b+"</"+a+">";return c.childNodes[0].childNodes;default:return b}}
	function Q(a,b){if("srcdoc"==b)return Z.HTML;var c=va(a);if("xlinkHref"==b||"form"==c&&"action"==b||"img"!=c&&("src"==b||"ngSrc"==b))return Z.RESOURCE_URL}function Oa(a,c,d,e,f){var h=Q(a,e);f=g[e]||f;var k=b(d,!0,h,f);if(k){if("multiple"===e&&"select"===va(a))throw la("selmulti",wa(a));c.push({priority:100,compile:function(){return{pre:function(a,c,g){c=g.$$observers||(g.$$observers={});if(l.test(e))throw la("nodomevents");var m=g[e];m!==d&&(k=m&&b(m,!0,h,f),d=m);k&&(g[e]=k(a),(c[e]||(c[e]=[])).$$inter=
	!0,(g.$$observers&&g.$$observers[e].$$scope||a).$watch(k,function(a,b){"class"===e&&a!=b?g.$updateClass(a,b):g.$set(e,a)}))}}}})}}function T(a,b,c){var d=b[0],e=b.length,f=d.parentNode,g,h;if(a)for(g=0,h=a.length;g<h;g++)if(a[g]==d){a[g++]=c;h=g+e-1;for(var k=a.length;g<k;g++,h++)h<k?a[g]=a[h]:delete a[g];a.length-=e-1;a.context===d&&(a.context=c);break}f&&f.replaceChild(c,d);a=W.createDocumentFragment();a.appendChild(d);A(c).data(A(d).data());ta?(Qb=!0,ta.cleanData([d])):delete A.cache[d[A.expando]];
	d=1;for(e=b.length;d<e;d++)f=b[d],A(f).remove(),a.appendChild(f),delete b[d];b[0]=c;b.length=1}function Y(a,b){return w(function(){return a.apply(null,arguments)},a,b)}function $(a,b,d,e,f,g){try{a(b,d,e,f,g)}catch(h){c(h,wa(d))}}var Yb=function(a,b){if(b){var c=Object.keys(b),d,e,f;d=0;for(e=c.length;d<e;d++)f=c[d],this[f]=b[f]}else this.$attr={};this.$$element=a};Yb.prototype={$normalize:xa,$addClass:function(a){a&&0<a.length&&L.addClass(this.$$element,a)},$removeClass:function(a){a&&0<a.length&&
	L.removeClass(this.$$element,a)},$updateClass:function(a,b){var c=Vc(a,b);c&&c.length&&L.addClass(this.$$element,c);(c=Vc(b,a))&&c.length&&L.removeClass(this.$$element,c)},$set:function(a,b,d,e){var f=this.$$element[0],g=Nc(f,a),h=kf(f,a),f=a;g?(this.$$element.prop(a,b),e=g):h&&(this[h]=b,f=h);this[a]=b;e?this.$attr[a]=e:(e=this.$attr[a])||(this.$attr[a]=e=vc(a,"-"));g=va(this.$$element);if("a"===g&&"href"===a||"img"===g&&"src"===a)this[a]=b=B(b,"src"===a);else if("img"===g&&"srcset"===a){for(var g=
	"",h=N(b),k=/(\s+\d+x\s*,|\s+\d+w\s*,|\s+,|,\s+)/,k=/\s/.test(h)?k:/(,)/,h=h.split(k),k=Math.floor(h.length/2),l=0;l<k;l++)var q=2*l,g=g+B(N(h[q]),!0),g=g+(" "+N(h[q+1]));h=N(h[2*l]).split(/\s/);g+=B(N(h[0]),!0);2===h.length&&(g+=" "+N(h[1]));this[a]=b=g}!1!==d&&(null===b||b===t?this.$$element.removeAttr(e):this.$$element.attr(e,b));(a=this.$$observers)&&r(a[f],function(a){try{a(b)}catch(d){c(d)}})},$observe:function(a,b){var c=this,d=c.$$observers||(c.$$observers=ia()),e=d[a]||(d[a]=[]);e.push(b);
	m.$evalAsync(function(){!e.$$inter&&c.hasOwnProperty(a)&&b(c[a])});return function(){Xa(e,b)}}};var V=b.startSymbol(),ma=b.endSymbol(),Tc="{{"==V||"}}"==ma?ra:function(a){return a.replace(/\{\{/g,V).replace(/}}/g,ma)},U=/^ngAttr[A-Z]/;D.$$addBindingInfo=k?function(a,b){var c=a.data("$binding")||[];H(b)?c=c.concat(b):c.push(b);a.data("$binding",c)}:E;D.$$addBindingClass=k?function(a){I(a,"ng-binding")}:E;D.$$addScopeInfo=k?function(a,b,c,d){a.data(c?d?"$isolateScopeNoTemplate":"$isolateScope":"$scope",
	b)}:E;D.$$addScopeClass=k?function(a,b){I(a,b?"ng-isolate-scope":"ng-scope")}:E;return D}]}function xa(b){return db(b.replace(Sc,""))}function Vc(b,a){var c="",d=b.split(/\s+/),e=a.split(/\s+/),f=0;a:for(;f<d.length;f++){for(var g=d[f],h=0;h<e.length;h++)if(g==e[h])continue a;c+=(0<c.length?" ":"")+g}return c}function Uc(b){b=A(b);var a=b.length;if(1>=a)return b;for(;a--;)8===b[a].nodeType&&qf.call(b,a,1);return b}function Fe(){var b={},a=!1,c=/^(\S+)(\s+as\s+(\w+))?$/;this.register=function(a,c){La(a,
	"controller");J(a)?w(b,a):b[a]=c};this.allowGlobals=function(){a=!0};this.$get=["$injector","$window",function(d,e){function f(a,b,c,d){if(!a||!J(a.$scope))throw R("$controller")("noscp",d,b);a.$scope[b]=c}return function(g,h,l,k){var n,p,q;l=!0===l;k&&C(k)&&(q=k);if(C(g)){k=g.match(c);if(!k)throw rf("ctrlfmt",g);p=k[1];q=q||k[3];g=b.hasOwnProperty(p)?b[p]:xc(h.$scope,p,!0)||(a?xc(e,p,!0):t);sb(g,p,!0)}if(l)return l=(H(g)?g[g.length-1]:g).prototype,n=Object.create(l||null),q&&f(h,q,n,p||g.name),w(function(){d.invoke(g,
	n,h,p);return n},{instance:n,identifier:q});n=d.instantiate(g,h,p);q&&f(h,q,n,p||g.name);return n}}]}function Ge(){this.$get=["$window",function(b){return A(b.document)}]}function He(){this.$get=["$log",function(b){return function(a,c){b.error.apply(b,arguments)}}]}function Zb(b,a){if(C(b)){var c=b.replace(sf,"").trim();if(c){var d=a("Content-Type");(d=d&&0===d.indexOf(Wc))||(d=(d=c.match(tf))&&uf[d[0]].test(c));d&&(b=qc(c))}}return b}function Xc(b){var a=ia(),c,d,e;if(!b)return a;r(b.split("\n"),
	function(b){e=b.indexOf(":");c=z(N(b.substr(0,e)));d=N(b.substr(e+1));c&&(a[c]=a[c]?a[c]+", "+d:d)});return a}function Yc(b){var a=J(b)?b:t;return function(c){a||(a=Xc(b));return c?(c=a[z(c)],void 0===c&&(c=null),c):a}}function Zc(b,a,c,d){if(G(d))return d(b,a,c);r(d,function(d){b=d(b,a,c)});return b}function Ke(){var b=this.defaults={transformResponse:[Zb],transformRequest:[function(a){return J(a)&&"[object File]"!==Ca.call(a)&&"[object Blob]"!==Ca.call(a)&&"[object FormData]"!==Ca.call(a)?$a(a):
	a}],headers:{common:{Accept:"application/json, text/plain, */*"},post:sa($b),put:sa($b),patch:sa($b)},xsrfCookieName:"XSRF-TOKEN",xsrfHeaderName:"X-XSRF-TOKEN"},a=!1;this.useApplyAsync=function(b){return y(b)?(a=!!b,this):a};var c=this.interceptors=[];this.$get=["$httpBackend","$browser","$cacheFactory","$rootScope","$q","$injector",function(d,e,f,g,h,l){function k(a){function c(a){var b=w({},a);b.data=a.data?Zc(a.data,a.headers,a.status,e.transformResponse):a.data;a=a.status;return 200<=a&&300>a?
	b:h.reject(b)}function d(a){var b,c={};r(a,function(a,d){G(a)?(b=a(),null!=b&&(c[d]=b)):c[d]=a});return c}if(!ca.isObject(a))throw R("$http")("badreq",a);var e=w({method:"get",transformRequest:b.transformRequest,transformResponse:b.transformResponse},a);e.headers=function(a){var c=b.headers,e=w({},a.headers),f,g,c=w({},c.common,c[z(a.method)]);a:for(f in c){a=z(f);for(g in e)if(z(g)===a)continue a;e[f]=c[f]}return d(e)}(a);e.method=ub(e.method);var f=[function(a){var d=a.headers,e=Zc(a.data,Yc(d),
	t,a.transformRequest);x(e)&&r(d,function(a,b){"content-type"===z(b)&&delete d[b]});x(a.withCredentials)&&!x(b.withCredentials)&&(a.withCredentials=b.withCredentials);return n(a,e).then(c,c)},t],g=h.when(e);for(r(u,function(a){(a.request||a.requestError)&&f.unshift(a.request,a.requestError);(a.response||a.responseError)&&f.push(a.response,a.responseError)});f.length;){a=f.shift();var k=f.shift(),g=g.then(a,k)}g.success=function(a){g.then(function(b){a(b.data,b.status,b.headers,e)});return g};g.error=
	function(a){g.then(null,function(b){a(b.data,b.status,b.headers,e)});return g};return g}function n(c,f){function l(b,c,d,e){function f(){m(c,b,d,e)}I&&(200<=b&&300>b?I.put(P,[b,c,Xc(d),e]):I.remove(P));a?g.$applyAsync(f):(f(),g.$$phase||g.$apply())}function m(a,b,d,e){b=Math.max(b,0);(200<=b&&300>b?L.resolve:L.reject)({data:a,status:b,headers:Yc(d),config:c,statusText:e})}function n(a){m(a.data,a.status,sa(a.headers()),a.statusText)}function u(){var a=k.pendingRequests.indexOf(c);-1!==a&&k.pendingRequests.splice(a,
	1)}var L=h.defer(),B=L.promise,I,D,S=c.headers,P=p(c.url,c.params);k.pendingRequests.push(c);B.then(u,u);!c.cache&&!b.cache||!1===c.cache||"GET"!==c.method&&"JSONP"!==c.method||(I=J(c.cache)?c.cache:J(b.cache)?b.cache:q);I&&(D=I.get(P),y(D)?D&&G(D.then)?D.then(n,n):H(D)?m(D[1],D[0],sa(D[2]),D[3]):m(D,200,{},"OK"):I.put(P,B));x(D)&&((D=$c(c.url)?e.cookies()[c.xsrfCookieName||b.xsrfCookieName]:t)&&(S[c.xsrfHeaderName||b.xsrfHeaderName]=D),d(c.method,P,f,l,S,c.timeout,c.withCredentials,c.responseType));
	return B}function p(a,b){if(!b)return a;var c=[];Ed(b,function(a,b){null===a||x(a)||(H(a)||(a=[a]),r(a,function(a){J(a)&&(a=ga(a)?a.toISOString():$a(a));c.push(Ea(b)+"="+Ea(a))}))});0<c.length&&(a+=(-1==a.indexOf("?")?"?":"&")+c.join("&"));return a}var q=f("$http"),u=[];r(c,function(a){u.unshift(C(a)?l.get(a):l.invoke(a))});k.pendingRequests=[];(function(a){r(arguments,function(a){k[a]=function(b,c){return k(w(c||{},{method:a,url:b}))}})})("get","delete","head","jsonp");(function(a){r(arguments,function(a){k[a]=
	function(b,c,d){return k(w(d||{},{method:a,url:b,data:c}))}})})("post","put","patch");k.defaults=b;return k}]}function vf(){return new Q.XMLHttpRequest}function Le(){this.$get=["$browser","$window","$document",function(b,a,c){return wf(b,vf,b.defer,a.angular.callbacks,c[0])}]}function wf(b,a,c,d,e){function f(a,b,c){var f=e.createElement("script"),n=null;f.type="text/javascript";f.src=a;f.async=!0;n=function(a){f.removeEventListener("load",n,!1);f.removeEventListener("error",n,!1);e.body.removeChild(f);
	f=null;var g=-1,u="unknown";a&&("load"!==a.type||d[b].called||(a={type:"error"}),u=a.type,g="error"===a.type?404:200);c&&c(g,u)};f.addEventListener("load",n,!1);f.addEventListener("error",n,!1);e.body.appendChild(f);return n}return function(e,h,l,k,n,p,q,u){function s(){m&&m();F&&F.abort()}function M(a,d,e,f,g){L!==t&&c.cancel(L);m=F=null;a(d,e,f,g);b.$$completeOutstandingRequest(E)}b.$$incOutstandingRequestCount();h=h||b.url();if("jsonp"==z(e)){var v="_"+(d.counter++).toString(36);d[v]=function(a){d[v].data=
	a;d[v].called=!0};var m=f(h.replace("JSON_CALLBACK","angular.callbacks."+v),v,function(a,b){M(k,a,d[v].data,"",b);d[v]=E})}else{var F=a();F.open(e,h,!0);r(n,function(a,b){y(a)&&F.setRequestHeader(b,a)});F.onload=function(){var a=F.statusText||"",b="response"in F?F.response:F.responseText,c=1223===F.status?204:F.status;0===c&&(c=b?200:"file"==Aa(h).protocol?404:0);M(k,c,b,F.getAllResponseHeaders(),a)};e=function(){M(k,-1,null,null,"")};F.onerror=e;F.onabort=e;q&&(F.withCredentials=!0);if(u)try{F.responseType=
	u}catch(Z){if("json"!==u)throw Z;}F.send(l||null)}if(0<p)var L=c(s,p);else p&&G(p.then)&&p.then(s)}}function Ie(){var b="{{",a="}}";this.startSymbol=function(a){return a?(b=a,this):b};this.endSymbol=function(b){return b?(a=b,this):a};this.$get=["$parse","$exceptionHandler","$sce",function(c,d,e){function f(a){return"\\\\\\"+a}function g(f,g,u,s){function M(c){return c.replace(k,b).replace(n,a)}function v(a){try{var b=a;a=u?e.getTrusted(u,b):e.valueOf(b);var c;if(s&&!y(a))c=a;else if(null==a)c="";
	else{switch(typeof a){case "string":break;case "number":a=""+a;break;default:a=$a(a)}c=a}return c}catch(g){c=ac("interr",f,g.toString()),d(c)}}s=!!s;for(var m,F,r=0,L=[],B=[],I=f.length,D=[],S=[];r<I;)if(-1!=(m=f.indexOf(b,r))&&-1!=(F=f.indexOf(a,m+h)))r!==m&&D.push(M(f.substring(r,m))),r=f.substring(m+h,F),L.push(r),B.push(c(r,v)),r=F+l,S.push(D.length),D.push("");else{r!==I&&D.push(M(f.substring(r)));break}if(u&&1<D.length)throw ac("noconcat",f);if(!g||L.length){var P=function(a){for(var b=0,c=
	L.length;b<c;b++){if(s&&x(a[b]))return;D[S[b]]=a[b]}return D.join("")};return w(function(a){var b=0,c=L.length,e=Array(c);try{for(;b<c;b++)e[b]=B[b](a);return P(e)}catch(g){a=ac("interr",f,g.toString()),d(a)}},{exp:f,expressions:L,$$watchDelegate:function(a,b,c){var d;return a.$watchGroup(B,function(c,e){var f=P(c);G(b)&&b.call(this,f,c!==e?d:f,a);d=f},c)}})}}var h=b.length,l=a.length,k=new RegExp(b.replace(/./g,f),"g"),n=new RegExp(a.replace(/./g,f),"g");g.startSymbol=function(){return b};g.endSymbol=
	function(){return a};return g}]}function Je(){this.$get=["$rootScope","$window","$q","$$q",function(b,a,c,d){function e(e,h,l,k){var n=a.setInterval,p=a.clearInterval,q=0,u=y(k)&&!k,s=(u?d:c).defer(),M=s.promise;l=y(l)?l:0;M.then(null,null,e);M.$$intervalId=n(function(){s.notify(q++);0<l&&q>=l&&(s.resolve(q),p(M.$$intervalId),delete f[M.$$intervalId]);u||b.$apply()},h);f[M.$$intervalId]=s;return M}var f={};e.cancel=function(b){return b&&b.$$intervalId in f?(f[b.$$intervalId].reject("canceled"),a.clearInterval(b.$$intervalId),
	delete f[b.$$intervalId],!0):!1};return e}]}function Rd(){this.$get=function(){return{id:"en-us",NUMBER_FORMATS:{DECIMAL_SEP:".",GROUP_SEP:",",PATTERNS:[{minInt:1,minFrac:0,maxFrac:3,posPre:"",posSuf:"",negPre:"-",negSuf:"",gSize:3,lgSize:3},{minInt:1,minFrac:2,maxFrac:2,posPre:"\u00a4",posSuf:"",negPre:"(\u00a4",negSuf:")",gSize:3,lgSize:3}],CURRENCY_SYM:"$"},DATETIME_FORMATS:{MONTH:"January February March April May June July August September October November December".split(" "),SHORTMONTH:"Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" "),
	DAY:"Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "),SHORTDAY:"Sun Mon Tue Wed Thu Fri Sat".split(" "),AMPMS:["AM","PM"],medium:"MMM d, y h:mm:ss a","short":"M/d/yy h:mm a",fullDate:"EEEE, MMMM d, y",longDate:"MMMM d, y",mediumDate:"MMM d, y",shortDate:"M/d/yy",mediumTime:"h:mm:ss a",shortTime:"h:mm a",ERANAMES:["Before Christ","Anno Domini"],ERAS:["BC","AD"]},pluralCat:function(b){return 1===b?"one":"other"}}}}function bc(b){b=b.split("/");for(var a=b.length;a--;)b[a]=qb(b[a]);
	return b.join("/")}function ad(b,a){var c=Aa(b);a.$$protocol=c.protocol;a.$$host=c.hostname;a.$$port=aa(c.port)||xf[c.protocol]||null}function bd(b,a){var c="/"!==b.charAt(0);c&&(b="/"+b);var d=Aa(b);a.$$path=decodeURIComponent(c&&"/"===d.pathname.charAt(0)?d.pathname.substring(1):d.pathname);a.$$search=sc(d.search);a.$$hash=decodeURIComponent(d.hash);a.$$path&&"/"!=a.$$path.charAt(0)&&(a.$$path="/"+a.$$path)}function ya(b,a){if(0===a.indexOf(b))return a.substr(b.length)}function Ga(b){var a=b.indexOf("#");
	return-1==a?b:b.substr(0,a)}function Fb(b){return b.replace(/(#.+)|#$/,"$1")}function cc(b){return b.substr(0,Ga(b).lastIndexOf("/")+1)}function dc(b,a){this.$$html5=!0;a=a||"";var c=cc(b);ad(b,this);this.$$parse=function(a){var b=ya(c,a);if(!C(b))throw Gb("ipthprfx",a,c);bd(b,this);this.$$path||(this.$$path="/");this.$$compose()};this.$$compose=function(){var a=Pb(this.$$search),b=this.$$hash?"#"+qb(this.$$hash):"";this.$$url=bc(this.$$path)+(a?"?"+a:"")+b;this.$$absUrl=c+this.$$url.substr(1)};this.$$parseLinkUrl=
	function(d,e){if(e&&"#"===e[0])return this.hash(e.slice(1)),!0;var f,g;(f=ya(b,d))!==t?(g=f,g=(f=ya(a,f))!==t?c+(ya("/",f)||f):b+g):(f=ya(c,d))!==t?g=c+f:c==d+"/"&&(g=c);g&&this.$$parse(g);return!!g}}function ec(b,a){var c=cc(b);ad(b,this);this.$$parse=function(d){d=ya(b,d)||ya(c,d);var e;"#"===d.charAt(0)?(e=ya(a,d),x(e)&&(e=d)):e=this.$$html5?d:"";bd(e,this);d=this.$$path;var f=/^\/[A-Z]:(\/.*)/;0===e.indexOf(b)&&(e=e.replace(b,""));f.exec(e)||(d=(e=f.exec(d))?e[1]:d);this.$$path=d;this.$$compose()};
	this.$$compose=function(){var c=Pb(this.$$search),e=this.$$hash?"#"+qb(this.$$hash):"";this.$$url=bc(this.$$path)+(c?"?"+c:"")+e;this.$$absUrl=b+(this.$$url?a+this.$$url:"")};this.$$parseLinkUrl=function(a,c){return Ga(b)==Ga(a)?(this.$$parse(a),!0):!1}}function cd(b,a){this.$$html5=!0;ec.apply(this,arguments);var c=cc(b);this.$$parseLinkUrl=function(d,e){if(e&&"#"===e[0])return this.hash(e.slice(1)),!0;var f,g;b==Ga(d)?f=d:(g=ya(c,d))?f=b+a+g:c===d+"/"&&(f=c);f&&this.$$parse(f);return!!f};this.$$compose=
	function(){var c=Pb(this.$$search),e=this.$$hash?"#"+qb(this.$$hash):"";this.$$url=bc(this.$$path)+(c?"?"+c:"")+e;this.$$absUrl=b+a+this.$$url}}function Hb(b){return function(){return this[b]}}function dd(b,a){return function(c){if(x(c))return this[b];this[b]=a(c);this.$$compose();return this}}function Me(){var b="",a={enabled:!1,requireBase:!0,rewriteLinks:!0};this.hashPrefix=function(a){return y(a)?(b=a,this):b};this.html5Mode=function(b){return Wa(b)?(a.enabled=b,this):J(b)?(Wa(b.enabled)&&(a.enabled=
	b.enabled),Wa(b.requireBase)&&(a.requireBase=b.requireBase),Wa(b.rewriteLinks)&&(a.rewriteLinks=b.rewriteLinks),this):a};this.$get=["$rootScope","$browser","$sniffer","$rootElement","$window",function(c,d,e,f,g){function h(a,b,c){var e=k.url(),f=k.$$state;try{d.url(a,b,c),k.$$state=d.state()}catch(g){throw k.url(e),k.$$state=f,g;}}function l(a,b){c.$broadcast("$locationChangeSuccess",k.absUrl(),a,k.$$state,b)}var k,n;n=d.baseHref();var p=d.url(),q;if(a.enabled){if(!n&&a.requireBase)throw Gb("nobase");
	q=p.substring(0,p.indexOf("/",p.indexOf("//")+2))+(n||"/");n=e.history?dc:cd}else q=Ga(p),n=ec;k=new n(q,"#"+b);k.$$parseLinkUrl(p,p);k.$$state=d.state();var u=/^\s*(javascript|mailto):/i;f.on("click",function(b){if(a.rewriteLinks&&!b.ctrlKey&&!b.metaKey&&!b.shiftKey&&2!=b.which&&2!=b.button){for(var e=A(b.target);"a"!==va(e[0]);)if(e[0]===f[0]||!(e=e.parent())[0])return;var h=e.prop("href"),l=e.attr("href")||e.attr("xlink:href");J(h)&&"[object SVGAnimatedString]"===h.toString()&&(h=Aa(h.animVal).href);
	u.test(h)||!h||e.attr("target")||b.isDefaultPrevented()||!k.$$parseLinkUrl(h,l)||(b.preventDefault(),k.absUrl()!=d.url()&&(c.$apply(),g.angular["ff-684208-preventDefault"]=!0))}});Fb(k.absUrl())!=Fb(p)&&d.url(k.absUrl(),!0);var s=!0;d.onUrlChange(function(a,b){c.$evalAsync(function(){var d=k.absUrl(),e=k.$$state,f;k.$$parse(a);k.$$state=b;f=c.$broadcast("$locationChangeStart",a,d,b,e).defaultPrevented;k.absUrl()===a&&(f?(k.$$parse(d),k.$$state=e,h(d,!1,e)):(s=!1,l(d,e)))});c.$$phase||c.$digest()});
	c.$watch(function(){var a=Fb(d.url()),b=Fb(k.absUrl()),f=d.state(),g=k.$$replace,q=a!==b||k.$$html5&&e.history&&f!==k.$$state;if(s||q)s=!1,c.$evalAsync(function(){var b=k.absUrl(),d=c.$broadcast("$locationChangeStart",b,a,k.$$state,f).defaultPrevented;k.absUrl()===b&&(d?(k.$$parse(a),k.$$state=f):(q&&h(b,g,f===k.$$state?null:k.$$state),l(a,f)))});k.$$replace=!1});return k}]}function Ne(){var b=!0,a=this;this.debugEnabled=function(a){return y(a)?(b=a,this):b};this.$get=["$window",function(c){function d(a){a instanceof
	Error&&(a.stack?a=a.message&&-1===a.stack.indexOf(a.message)?"Error: "+a.message+"\n"+a.stack:a.stack:a.sourceURL&&(a=a.message+"\n"+a.sourceURL+":"+a.line));return a}function e(a){var b=c.console||{},e=b[a]||b.log||E;a=!1;try{a=!!e.apply}catch(l){}return a?function(){var a=[];r(arguments,function(b){a.push(d(b))});return e.apply(b,a)}:function(a,b){e(a,null==b?"":b)}}return{log:e("log"),info:e("info"),warn:e("warn"),error:e("error"),debug:function(){var c=e("debug");return function(){b&&c.apply(a,
	arguments)}}()}}]}function ua(b,a){if("__defineGetter__"===b||"__defineSetter__"===b||"__lookupGetter__"===b||"__lookupSetter__"===b||"__proto__"===b)throw na("isecfld",a);return b}function oa(b,a){if(b){if(b.constructor===b)throw na("isecfn",a);if(b.window===b)throw na("isecwindow",a);if(b.children&&(b.nodeName||b.prop&&b.attr&&b.find))throw na("isecdom",a);if(b===Object)throw na("isecobj",a);}return b}function fc(b){return b.constant}function hb(b,a,c,d,e){oa(b,e);oa(a,e);c=c.split(".");for(var f,
	g=0;1<c.length;g++){f=ua(c.shift(),e);var h=0===g&&a&&a[f]||b[f];h||(h={},b[f]=h);b=oa(h,e)}f=ua(c.shift(),e);oa(b[f],e);return b[f]=d}function Pa(b){return"constructor"==b}function ed(b,a,c,d,e,f,g){ua(b,f);ua(a,f);ua(c,f);ua(d,f);ua(e,f);var h=function(a){return oa(a,f)},l=g||Pa(b)?h:ra,k=g||Pa(a)?h:ra,n=g||Pa(c)?h:ra,p=g||Pa(d)?h:ra,q=g||Pa(e)?h:ra;return function(f,g){var h=g&&g.hasOwnProperty(b)?g:f;if(null==h)return h;h=l(h[b]);if(!a)return h;if(null==h)return t;h=k(h[a]);if(!c)return h;if(null==
	h)return t;h=n(h[c]);if(!d)return h;if(null==h)return t;h=p(h[d]);return e?null==h?t:h=q(h[e]):h}}function yf(b,a){return function(c,d){return b(c,d,oa,a)}}function zf(b,a,c){var d=a.expensiveChecks,e=d?Af:Bf,f=e[b];if(f)return f;var g=b.split("."),h=g.length;if(a.csp)f=6>h?ed(g[0],g[1],g[2],g[3],g[4],c,d):function(a,b){var e=0,f;do f=ed(g[e++],g[e++],g[e++],g[e++],g[e++],c,d)(a,b),b=t,a=f;while(e<h);return f};else{var l="";d&&(l+="s = eso(s, fe);\nl = eso(l, fe);\n");var k=d;r(g,function(a,b){ua(a,
	c);var e=(b?"s":'((l&&l.hasOwnProperty("'+a+'"))?l:s)')+"."+a;if(d||Pa(a))e="eso("+e+", fe)",k=!0;l+="if(s == null) return undefined;\ns="+e+";\n"});l+="return s;";a=new Function("s","l","eso","fe",l);a.toString=ea(l);k&&(a=yf(a,c));f=a}f.sharedGetter=!0;f.assign=function(a,c,d){return hb(a,d,b,c,b)};return e[b]=f}function gc(b){return G(b.valueOf)?b.valueOf():Cf.call(b)}function Oe(){var b=ia(),a=ia();this.$get=["$filter","$sniffer",function(c,d){function e(a){var b=a;a.sharedGetter&&(b=function(b,
	c){return a(b,c)},b.literal=a.literal,b.constant=a.constant,b.assign=a.assign);return b}function f(a,b){for(var c=0,d=a.length;c<d;c++){var e=a[c];e.constant||(e.inputs?f(e.inputs,b):-1===b.indexOf(e)&&b.push(e))}return b}function g(a,b){return null==a||null==b?a===b:"object"===typeof a&&(a=gc(a),"object"===typeof a)?!1:a===b||a!==a&&b!==b}function h(a,b,c,d){var e=d.$$inputs||(d.$$inputs=f(d.inputs,[])),h;if(1===e.length){var k=g,e=e[0];return a.$watch(function(a){var b=e(a);g(b,k)||(h=d(a),k=b&&
	gc(b));return h},b,c)}for(var l=[],q=0,p=e.length;q<p;q++)l[q]=g;return a.$watch(function(a){for(var b=!1,c=0,f=e.length;c<f;c++){var k=e[c](a);if(b||(b=!g(k,l[c])))l[c]=k&&gc(k)}b&&(h=d(a));return h},b,c)}function l(a,b,c,d){var e,f;return e=a.$watch(function(a){return d(a)},function(a,c,d){f=a;G(b)&&b.apply(this,arguments);y(a)&&d.$$postDigest(function(){y(f)&&e()})},c)}function k(a,b,c,d){function e(a){var b=!0;r(a,function(a){y(a)||(b=!1)});return b}var f,g;return f=a.$watch(function(a){return d(a)},
	function(a,c,d){g=a;G(b)&&b.call(this,a,c,d);e(a)&&d.$$postDigest(function(){e(g)&&f()})},c)}function n(a,b,c,d){var e;return e=a.$watch(function(a){return d(a)},function(a,c,d){G(b)&&b.apply(this,arguments);e()},c)}function p(a,b){if(!b)return a;var c=a.$$watchDelegate,c=c!==k&&c!==l?function(c,d){var e=a(c,d);return b(e,c,d)}:function(c,d){var e=a(c,d),f=b(e,c,d);return y(e)?f:e};a.$$watchDelegate&&a.$$watchDelegate!==h?c.$$watchDelegate=a.$$watchDelegate:b.$stateful||(c.$$watchDelegate=h,c.inputs=
	[a]);return c}var q={csp:d.csp,expensiveChecks:!1},u={csp:d.csp,expensiveChecks:!0};return function(d,f,g){var m,r,t;switch(typeof d){case "string":t=d=d.trim();var L=g?a:b;m=L[t];m||(":"===d.charAt(0)&&":"===d.charAt(1)&&(r=!0,d=d.substring(2)),g=g?u:q,m=new hc(g),m=(new ib(m,c,g)).parse(d),m.constant?m.$$watchDelegate=n:r?(m=e(m),m.$$watchDelegate=m.literal?k:l):m.inputs&&(m.$$watchDelegate=h),L[t]=m);return p(m,f);case "function":return p(d,f);default:return p(E,f)}}}]}function Qe(){this.$get=
	["$rootScope","$exceptionHandler",function(b,a){return fd(function(a){b.$evalAsync(a)},a)}]}function Re(){this.$get=["$browser","$exceptionHandler",function(b,a){return fd(function(a){b.defer(a)},a)}]}function fd(b,a){function c(a,b,c){function d(b){return function(c){e||(e=!0,b.call(a,c))}}var e=!1;return[d(b),d(c)]}function d(){this.$$state={status:0}}function e(a,b){return function(c){b.call(a,c)}}function f(c){!c.processScheduled&&c.pending&&(c.processScheduled=!0,b(function(){var b,d,e;e=c.pending;
	c.processScheduled=!1;c.pending=t;for(var f=0,g=e.length;f<g;++f){d=e[f][0];b=e[f][c.status];try{G(b)?d.resolve(b(c.value)):1===c.status?d.resolve(c.value):d.reject(c.value)}catch(h){d.reject(h),a(h)}}}))}function g(){this.promise=new d;this.resolve=e(this,this.resolve);this.reject=e(this,this.reject);this.notify=e(this,this.notify)}var h=R("$q",TypeError);d.prototype={then:function(a,b,c){var d=new g;this.$$state.pending=this.$$state.pending||[];this.$$state.pending.push([d,a,b,c]);0<this.$$state.status&&
	f(this.$$state);return d.promise},"catch":function(a){return this.then(null,a)},"finally":function(a,b){return this.then(function(b){return k(b,!0,a)},function(b){return k(b,!1,a)},b)}};g.prototype={resolve:function(a){this.promise.$$state.status||(a===this.promise?this.$$reject(h("qcycle",a)):this.$$resolve(a))},$$resolve:function(b){var d,e;e=c(this,this.$$resolve,this.$$reject);try{if(J(b)||G(b))d=b&&b.then;G(d)?(this.promise.$$state.status=-1,d.call(b,e[0],e[1],this.notify)):(this.promise.$$state.value=
	b,this.promise.$$state.status=1,f(this.promise.$$state))}catch(g){e[1](g),a(g)}},reject:function(a){this.promise.$$state.status||this.$$reject(a)},$$reject:function(a){this.promise.$$state.value=a;this.promise.$$state.status=2;f(this.promise.$$state)},notify:function(c){var d=this.promise.$$state.pending;0>=this.promise.$$state.status&&d&&d.length&&b(function(){for(var b,e,f=0,g=d.length;f<g;f++){e=d[f][0];b=d[f][3];try{e.notify(G(b)?b(c):c)}catch(h){a(h)}}})}};var l=function(a,b){var c=new g;b?c.resolve(a):
	c.reject(a);return c.promise},k=function(a,b,c){var d=null;try{G(c)&&(d=c())}catch(e){return l(e,!1)}return d&&G(d.then)?d.then(function(){return l(a,b)},function(a){return l(a,!1)}):l(a,b)},n=function(a,b,c,d){var e=new g;e.resolve(a);return e.promise.then(b,c,d)},p=function u(a){if(!G(a))throw h("norslvr",a);if(!(this instanceof u))return new u(a);var b=new g;a(function(a){b.resolve(a)},function(a){b.reject(a)});return b.promise};p.defer=function(){return new g};p.reject=function(a){var b=new g;
	b.reject(a);return b.promise};p.when=n;p.all=function(a){var b=new g,c=0,d=H(a)?[]:{};r(a,function(a,e){c++;n(a).then(function(a){d.hasOwnProperty(e)||(d[e]=a,--c||b.resolve(d))},function(a){d.hasOwnProperty(e)||b.reject(a)})});0===c&&b.resolve(d);return b.promise};return p}function $e(){this.$get=["$window","$timeout",function(b,a){var c=b.requestAnimationFrame||b.webkitRequestAnimationFrame,d=b.cancelAnimationFrame||b.webkitCancelAnimationFrame||b.webkitCancelRequestAnimationFrame,e=!!c,f=e?function(a){var b=
	c(a);return function(){d(b)}}:function(b){var c=a(b,16.66,!1);return function(){a.cancel(c)}};f.supported=e;return f}]}function Pe(){function b(a){function b(){this.$$watchers=this.$$nextSibling=this.$$childHead=this.$$childTail=null;this.$$listeners={};this.$$listenerCount={};this.$$watchersCount=0;this.$id=++ob;this.$$ChildScope=null}b.prototype=a;return b}var a=10,c=R("$rootScope"),d=null,e=null;this.digestTtl=function(b){arguments.length&&(a=b);return a};this.$get=["$injector","$exceptionHandler",
	"$parse","$browser",function(f,g,h,l){function k(a){a.currentScope.$$destroyed=!0}function n(){this.$id=++ob;this.$$phase=this.$parent=this.$$watchers=this.$$nextSibling=this.$$prevSibling=this.$$childHead=this.$$childTail=null;this.$root=this;this.$$destroyed=!1;this.$$listeners={};this.$$listenerCount={};this.$$isolateBindings=null}function p(a){if(v.$$phase)throw c("inprog",v.$$phase);v.$$phase=a}function q(a,b,c){do a.$$listenerCount[c]-=b,0===a.$$listenerCount[c]&&delete a.$$listenerCount[c];
	while(a=a.$parent)}function u(){}function s(){for(;t.length;)try{t.shift()()}catch(a){g(a)}e=null}function M(){null===e&&(e=l.defer(function(){v.$apply(s)}))}n.prototype={constructor:n,$new:function(a,c){var d;c=c||this;a?(d=new n,d.$root=this.$root):(this.$$ChildScope||(this.$$ChildScope=b(this)),d=new this.$$ChildScope);d.$parent=c;d.$$prevSibling=c.$$childTail;c.$$childHead?(c.$$childTail.$$nextSibling=d,c.$$childTail=d):c.$$childHead=c.$$childTail=d;(a||c!=this)&&d.$on("$destroy",k);return d},
	$watch:function(a,b,c){var e=h(a);if(e.$$watchDelegate)return e.$$watchDelegate(this,b,c,e);var f=this.$$watchers,g={fn:b,last:u,get:e,exp:a,eq:!!c};d=null;G(b)||(g.fn=E);f||(f=this.$$watchers=[]);f.unshift(g);return function(){Xa(f,g);d=null}},$watchGroup:function(a,b){function c(){h=!1;k?(k=!1,b(e,e,g)):b(e,d,g)}var d=Array(a.length),e=Array(a.length),f=[],g=this,h=!1,k=!0;if(!a.length){var l=!0;g.$evalAsync(function(){l&&b(e,e,g)});return function(){l=!1}}if(1===a.length)return this.$watch(a[0],
	function(a,c,f){e[0]=a;d[0]=c;b(e,a===c?e:d,f)});r(a,function(a,b){var k=g.$watch(a,function(a,f){e[b]=a;d[b]=f;h||(h=!0,g.$evalAsync(c))});f.push(k)});return function(){for(;f.length;)f.shift()()}},$watchCollection:function(a,b){function c(a){e=a;var b,d,g,h;if(!x(e)){if(J(e))if(Sa(e))for(f!==p&&(f=p,u=f.length=0,l++),a=e.length,u!==a&&(l++,f.length=u=a),b=0;b<a;b++)h=f[b],g=e[b],d=h!==h&&g!==g,d||h===g||(l++,f[b]=g);else{f!==n&&(f=n={},u=0,l++);a=0;for(b in e)e.hasOwnProperty(b)&&(a++,g=e[b],h=
	f[b],b in f?(d=h!==h&&g!==g,d||h===g||(l++,f[b]=g)):(u++,f[b]=g,l++));if(u>a)for(b in l++,f)e.hasOwnProperty(b)||(u--,delete f[b])}else f!==e&&(f=e,l++);return l}}c.$stateful=!0;var d=this,e,f,g,k=1<b.length,l=0,q=h(a,c),p=[],n={},m=!0,u=0;return this.$watch(q,function(){m?(m=!1,b(e,e,d)):b(e,g,d);if(k)if(J(e))if(Sa(e)){g=Array(e.length);for(var a=0;a<e.length;a++)g[a]=e[a]}else for(a in g={},e)tc.call(e,a)&&(g[a]=e[a]);else g=e})},$digest:function(){var b,f,h,k,q,n,r=a,t,O=[],M,y;p("$digest");l.$$checkUrlChange();
	this===v&&null!==e&&(l.defer.cancel(e),s());d=null;do{n=!1;for(t=this;m.length;){try{y=m.shift(),y.scope.$eval(y.expression,y.locals)}catch(w){g(w)}d=null}a:do{if(k=t.$$watchers)for(q=k.length;q--;)try{if(b=k[q])if((f=b.get(t))!==(h=b.last)&&!(b.eq?ha(f,h):"number"===typeof f&&"number"===typeof h&&isNaN(f)&&isNaN(h)))n=!0,d=b,b.last=b.eq?Da(f,null):f,b.fn(f,h===u?f:h,t),5>r&&(M=4-r,O[M]||(O[M]=[]),O[M].push({msg:G(b.exp)?"fn: "+(b.exp.name||b.exp.toString()):b.exp,newVal:f,oldVal:h}));else if(b===
	d){n=!1;break a}}catch(A){g(A)}if(!(k=t.$$childHead||t!==this&&t.$$nextSibling))for(;t!==this&&!(k=t.$$nextSibling);)t=t.$parent}while(t=k);if((n||m.length)&&!r--)throw v.$$phase=null,c("infdig",a,O);}while(n||m.length);for(v.$$phase=null;F.length;)try{F.shift()()}catch(x){g(x)}},$destroy:function(){if(!this.$$destroyed){var a=this.$parent;this.$broadcast("$destroy");this.$$destroyed=!0;if(this!==v){for(var b in this.$$listenerCount)q(this,this.$$listenerCount[b],b);a.$$childHead==this&&(a.$$childHead=
	this.$$nextSibling);a.$$childTail==this&&(a.$$childTail=this.$$prevSibling);this.$$prevSibling&&(this.$$prevSibling.$$nextSibling=this.$$nextSibling);this.$$nextSibling&&(this.$$nextSibling.$$prevSibling=this.$$prevSibling);this.$destroy=this.$digest=this.$apply=this.$evalAsync=this.$applyAsync=E;this.$on=this.$watch=this.$watchGroup=function(){return E};this.$$listeners={};this.$parent=this.$$nextSibling=this.$$prevSibling=this.$$childHead=this.$$childTail=this.$root=this.$$watchers=null}}},$eval:function(a,
	b){return h(a)(this,b)},$evalAsync:function(a,b){v.$$phase||m.length||l.defer(function(){m.length&&v.$digest()});m.push({scope:this,expression:a,locals:b})},$$postDigest:function(a){F.push(a)},$apply:function(a){try{return p("$apply"),this.$eval(a)}catch(b){g(b)}finally{v.$$phase=null;try{v.$digest()}catch(c){throw g(c),c;}}},$applyAsync:function(a){function b(){c.$eval(a)}var c=this;a&&t.push(b);M()},$on:function(a,b){var c=this.$$listeners[a];c||(this.$$listeners[a]=c=[]);c.push(b);var d=this;do d.$$listenerCount[a]||
	(d.$$listenerCount[a]=0),d.$$listenerCount[a]++;while(d=d.$parent);var e=this;return function(){var d=c.indexOf(b);-1!==d&&(c[d]=null,q(e,1,a))}},$emit:function(a,b){var c=[],d,e=this,f=!1,h={name:a,targetScope:e,stopPropagation:function(){f=!0},preventDefault:function(){h.defaultPrevented=!0},defaultPrevented:!1},k=Ya([h],arguments,1),l,q;do{d=e.$$listeners[a]||c;h.currentScope=e;l=0;for(q=d.length;l<q;l++)if(d[l])try{d[l].apply(null,k)}catch(p){g(p)}else d.splice(l,1),l--,q--;if(f)return h.currentScope=
	null,h;e=e.$parent}while(e);h.currentScope=null;return h},$broadcast:function(a,b){var c=this,d=this,e={name:a,targetScope:this,preventDefault:function(){e.defaultPrevented=!0},defaultPrevented:!1};if(!this.$$listenerCount[a])return e;for(var f=Ya([e],arguments,1),h,l;c=d;){e.currentScope=c;d=c.$$listeners[a]||[];h=0;for(l=d.length;h<l;h++)if(d[h])try{d[h].apply(null,f)}catch(k){g(k)}else d.splice(h,1),h--,l--;if(!(d=c.$$listenerCount[a]&&c.$$childHead||c!==this&&c.$$nextSibling))for(;c!==this&&!(d=
	c.$$nextSibling);)c=c.$parent}e.currentScope=null;return e}};var v=new n,m=v.$$asyncQueue=[],F=v.$$postDigestQueue=[],t=v.$$applyAsyncQueue=[];return v}]}function Sd(){var b=/^\s*(https?|ftp|mailto|tel|file):/,a=/^\s*((https?|ftp|file|blob):|data:image\/)/;this.aHrefSanitizationWhitelist=function(a){return y(a)?(b=a,this):b};this.imgSrcSanitizationWhitelist=function(b){return y(b)?(a=b,this):a};this.$get=function(){return function(c,d){var e=d?a:b,f;f=Aa(c).href;return""===f||f.match(e)?c:"unsafe:"+
	f}}}function Df(b){if("self"===b)return b;if(C(b)){if(-1<b.indexOf("***"))throw Ba("iwcard",b);b=gd(b).replace("\\*\\*",".*").replace("\\*","[^:/.?&;]*");return new RegExp("^"+b+"$")}if(Ua(b))return new RegExp("^"+b.source+"$");throw Ba("imatcher");}function hd(b){var a=[];y(b)&&r(b,function(b){a.push(Df(b))});return a}function Te(){this.SCE_CONTEXTS=pa;var b=["self"],a=[];this.resourceUrlWhitelist=function(a){arguments.length&&(b=hd(a));return b};this.resourceUrlBlacklist=function(b){arguments.length&&
	(a=hd(b));return a};this.$get=["$injector",function(c){function d(a,b){return"self"===a?$c(b):!!a.exec(b.href)}function e(a){var b=function(a){this.$$unwrapTrustedValue=function(){return a}};a&&(b.prototype=new a);b.prototype.valueOf=function(){return this.$$unwrapTrustedValue()};b.prototype.toString=function(){return this.$$unwrapTrustedValue().toString()};return b}var f=function(a){throw Ba("unsafe");};c.has("$sanitize")&&(f=c.get("$sanitize"));var g=e(),h={};h[pa.HTML]=e(g);h[pa.CSS]=e(g);h[pa.URL]=
	e(g);h[pa.JS]=e(g);h[pa.RESOURCE_URL]=e(h[pa.URL]);return{trustAs:function(a,b){var c=h.hasOwnProperty(a)?h[a]:null;if(!c)throw Ba("icontext",a,b);if(null===b||b===t||""===b)return b;if("string"!==typeof b)throw Ba("itype",a);return new c(b)},getTrusted:function(c,e){if(null===e||e===t||""===e)return e;var g=h.hasOwnProperty(c)?h[c]:null;if(g&&e instanceof g)return e.$$unwrapTrustedValue();if(c===pa.RESOURCE_URL){var g=Aa(e.toString()),p,q,u=!1;p=0;for(q=b.length;p<q;p++)if(d(b[p],g)){u=!0;break}if(u)for(p=
	0,q=a.length;p<q;p++)if(d(a[p],g)){u=!1;break}if(u)return e;throw Ba("insecurl",e.toString());}if(c===pa.HTML)return f(e);throw Ba("unsafe");},valueOf:function(a){return a instanceof g?a.$$unwrapTrustedValue():a}}}]}function Se(){var b=!0;this.enabled=function(a){arguments.length&&(b=!!a);return b};this.$get=["$parse","$sceDelegate",function(a,c){if(b&&8>Qa)throw Ba("iequirks");var d=sa(pa);d.isEnabled=function(){return b};d.trustAs=c.trustAs;d.getTrusted=c.getTrusted;d.valueOf=c.valueOf;b||(d.trustAs=
	d.getTrusted=function(a,b){return b},d.valueOf=ra);d.parseAs=function(b,c){var e=a(c);return e.literal&&e.constant?e:a(c,function(a){return d.getTrusted(b,a)})};var e=d.parseAs,f=d.getTrusted,g=d.trustAs;r(pa,function(a,b){var c=z(b);d[db("parse_as_"+c)]=function(b){return e(a,b)};d[db("get_trusted_"+c)]=function(b){return f(a,b)};d[db("trust_as_"+c)]=function(b){return g(a,b)}});return d}]}function Ue(){this.$get=["$window","$document",function(b,a){var c={},d=aa((/android (\d+)/.exec(z((b.navigator||
	{}).userAgent))||[])[1]),e=/Boxee/i.test((b.navigator||{}).userAgent),f=a[0]||{},g,h=/^(Moz|webkit|ms)(?=[A-Z])/,l=f.body&&f.body.style,k=!1,n=!1;if(l){for(var p in l)if(k=h.exec(p)){g=k[0];g=g.substr(0,1).toUpperCase()+g.substr(1);break}g||(g="WebkitOpacity"in l&&"webkit");k=!!("transition"in l||g+"Transition"in l);n=!!("animation"in l||g+"Animation"in l);!d||k&&n||(k=C(f.body.style.webkitTransition),n=C(f.body.style.webkitAnimation))}return{history:!(!b.history||!b.history.pushState||4>d||e),hasEvent:function(a){if("input"===
	a&&11>=Qa)return!1;if(x(c[a])){var b=f.createElement("div");c[a]="on"+a in b}return c[a]},csp:bb(),vendorPrefix:g,transitions:k,animations:n,android:d}}]}function We(){this.$get=["$templateCache","$http","$q",function(b,a,c){function d(e,f){d.totalPendingRequests++;var g=a.defaults&&a.defaults.transformResponse;H(g)?g=g.filter(function(a){return a!==Zb}):g===Zb&&(g=null);return a.get(e,{cache:b,transformResponse:g})["finally"](function(){d.totalPendingRequests--}).then(function(a){return a.data},
	function(a){if(!f)throw la("tpload",e);return c.reject(a)})}d.totalPendingRequests=0;return d}]}function Xe(){this.$get=["$rootScope","$browser","$location",function(b,a,c){return{findBindings:function(a,b,c){a=a.getElementsByClassName("ng-binding");var g=[];r(a,function(a){var d=ca.element(a).data("$binding");d&&r(d,function(d){c?(new RegExp("(^|\\s)"+gd(b)+"(\\s|\\||$)")).test(d)&&g.push(a):-1!=d.indexOf(b)&&g.push(a)})});return g},findModels:function(a,b,c){for(var g=["ng-","data-ng-","ng\\:"],
	h=0;h<g.length;++h){var l=a.querySelectorAll("["+g[h]+"model"+(c?"=":"*=")+'"'+b+'"]');if(l.length)return l}},getLocation:function(){return c.url()},setLocation:function(a){a!==c.url()&&(c.url(a),b.$digest())},whenStable:function(b){a.notifyWhenNoOutstandingRequests(b)}}}]}function Ye(){this.$get=["$rootScope","$browser","$q","$$q","$exceptionHandler",function(b,a,c,d,e){function f(f,l,k){var n=y(k)&&!k,p=(n?d:c).defer(),q=p.promise;l=a.defer(function(){try{p.resolve(f())}catch(a){p.reject(a),e(a)}finally{delete g[q.$$timeoutId]}n||
	b.$apply()},l);q.$$timeoutId=l;g[l]=p;return q}var g={};f.cancel=function(b){return b&&b.$$timeoutId in g?(g[b.$$timeoutId].reject("canceled"),delete g[b.$$timeoutId],a.defer.cancel(b.$$timeoutId)):!1};return f}]}function Aa(b){Qa&&($.setAttribute("href",b),b=$.href);$.setAttribute("href",b);return{href:$.href,protocol:$.protocol?$.protocol.replace(/:$/,""):"",host:$.host,search:$.search?$.search.replace(/^\?/,""):"",hash:$.hash?$.hash.replace(/^#/,""):"",hostname:$.hostname,port:$.port,pathname:"/"===
	$.pathname.charAt(0)?$.pathname:"/"+$.pathname}}function $c(b){b=C(b)?Aa(b):b;return b.protocol===id.protocol&&b.host===id.host}function Ze(){this.$get=ea(Q)}function Fc(b){function a(c,d){if(J(c)){var e={};r(c,function(b,c){e[c]=a(c,b)});return e}return b.factory(c+"Filter",d)}this.register=a;this.$get=["$injector",function(a){return function(b){return a.get(b+"Filter")}}];a("currency",jd);a("date",kd);a("filter",Ef);a("json",Ff);a("limitTo",Gf);a("lowercase",Hf);a("number",ld);a("orderBy",md);a("uppercase",
	If)}function Ef(){return function(b,a,c){if(!H(b))return b;var d;switch(typeof a){case "function":break;case "boolean":case "number":case "string":d=!0;case "object":a=Jf(a,c,d);break;default:return b}return b.filter(a)}}function Jf(b,a,c){var d=J(b)&&"$"in b;!0===a?a=ha:G(a)||(a=function(a,b){if(J(a)||J(b))return!1;a=z(""+a);b=z(""+b);return-1!==a.indexOf(b)});return function(e){return d&&!J(e)?Ha(e,b.$,a,!1):Ha(e,b,a,c)}}function Ha(b,a,c,d,e){var f=null!==b?typeof b:"null",g=null!==a?typeof a:
	"null";if("string"===g&&"!"===a.charAt(0))return!Ha(b,a.substring(1),c,d);if(H(b))return b.some(function(b){return Ha(b,a,c,d)});switch(f){case "object":var h;if(d){for(h in b)if("$"!==h.charAt(0)&&Ha(b[h],a,c,!0))return!0;return e?!1:Ha(b,a,c,!1)}if("object"===g){for(h in a)if(e=a[h],!G(e)&&!x(e)&&(f="$"===h,!Ha(f?b:b[h],e,c,f,f)))return!1;return!0}return c(b,a);case "function":return!1;default:return c(b,a)}}function jd(b){var a=b.NUMBER_FORMATS;return function(b,d,e){x(d)&&(d=a.CURRENCY_SYM);x(e)&&
	(e=a.PATTERNS[1].maxFrac);return null==b?b:nd(b,a.PATTERNS[1],a.GROUP_SEP,a.DECIMAL_SEP,e).replace(/\u00A4/g,d)}}function ld(b){var a=b.NUMBER_FORMATS;return function(b,d){return null==b?b:nd(b,a.PATTERNS[0],a.GROUP_SEP,a.DECIMAL_SEP,d)}}function nd(b,a,c,d,e){if(!isFinite(b)||J(b))return"";var f=0>b;b=Math.abs(b);var g=b+"",h="",l=[],k=!1;if(-1!==g.indexOf("e")){var n=g.match(/([\d\.]+)e(-?)(\d+)/);n&&"-"==n[2]&&n[3]>e+1?b=0:(h=g,k=!0)}if(k)0<e&&1>b&&(h=b.toFixed(e),b=parseFloat(h));else{g=(g.split(od)[1]||
	"").length;x(e)&&(e=Math.min(Math.max(a.minFrac,g),a.maxFrac));b=+(Math.round(+(b.toString()+"e"+e)).toString()+"e"+-e);var g=(""+b).split(od),k=g[0],g=g[1]||"",p=0,q=a.lgSize,u=a.gSize;if(k.length>=q+u)for(p=k.length-q,n=0;n<p;n++)0===(p-n)%u&&0!==n&&(h+=c),h+=k.charAt(n);for(n=p;n<k.length;n++)0===(k.length-n)%q&&0!==n&&(h+=c),h+=k.charAt(n);for(;g.length<e;)g+="0";e&&"0"!==e&&(h+=d+g.substr(0,e))}0===b&&(f=!1);l.push(f?a.negPre:a.posPre,h,f?a.negSuf:a.posSuf);return l.join("")}function Ib(b,a,
	c){var d="";0>b&&(d="-",b=-b);for(b=""+b;b.length<a;)b="0"+b;c&&(b=b.substr(b.length-a));return d+b}function U(b,a,c,d){c=c||0;return function(e){e=e["get"+b]();if(0<c||e>-c)e+=c;0===e&&-12==c&&(e=12);return Ib(e,a,d)}}function Jb(b,a){return function(c,d){var e=c["get"+b](),f=ub(a?"SHORT"+b:b);return d[f][e]}}function pd(b){var a=(new Date(b,0,1)).getDay();return new Date(b,0,(4>=a?5:12)-a)}function qd(b){return function(a){var c=pd(a.getFullYear());a=+new Date(a.getFullYear(),a.getMonth(),a.getDate()+
	(4-a.getDay()))-+c;a=1+Math.round(a/6048E5);return Ib(a,b)}}function ic(b,a){return 0>=b.getFullYear()?a.ERAS[0]:a.ERAS[1]}function kd(b){function a(a){var b;if(b=a.match(c)){a=new Date(0);var f=0,g=0,h=b[8]?a.setUTCFullYear:a.setFullYear,l=b[8]?a.setUTCHours:a.setHours;b[9]&&(f=aa(b[9]+b[10]),g=aa(b[9]+b[11]));h.call(a,aa(b[1]),aa(b[2])-1,aa(b[3]));f=aa(b[4]||0)-f;g=aa(b[5]||0)-g;h=aa(b[6]||0);b=Math.round(1E3*parseFloat("0."+(b[7]||0)));l.call(a,f,g,h,b)}return a}var c=/^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
	return function(c,e,f){var g="",h=[],l,k;e=e||"mediumDate";e=b.DATETIME_FORMATS[e]||e;C(c)&&(c=Kf.test(c)?aa(c):a(c));Y(c)&&(c=new Date(c));if(!ga(c))return c;for(;e;)(k=Lf.exec(e))?(h=Ya(h,k,1),e=h.pop()):(h.push(e),e=null);f&&"UTC"===f&&(c=new Date(c.getTime()),c.setMinutes(c.getMinutes()+c.getTimezoneOffset()));r(h,function(a){l=Mf[a];g+=l?l(c,b.DATETIME_FORMATS):a.replace(/(^'|'$)/g,"").replace(/''/g,"'")});return g}}function Ff(){return function(b,a){x(a)&&(a=2);return $a(b,a)}}function Gf(){return function(b,
	a){Y(b)&&(b=b.toString());return H(b)||C(b)?(a=Infinity===Math.abs(Number(a))?Number(a):aa(a))?0<a?b.slice(0,a):b.slice(a):C(b)?"":[]:b}}function md(b){return function(a,c,d){function e(a,b){return b?function(b,c){return a(c,b)}:a}function f(a){switch(typeof a){case "number":case "boolean":case "string":return!0;default:return!1}}function g(a){return null===a?"null":"function"===typeof a.valueOf&&(a=a.valueOf(),f(a))||"function"===typeof a.toString&&(a=a.toString(),f(a))?a:""}function h(a,b){var c=
	typeof a,d=typeof b;c===d&&"object"===c&&(a=g(a),b=g(b));return c===d?("string"===c&&(a=a.toLowerCase(),b=b.toLowerCase()),a===b?0:a<b?-1:1):c<d?-1:1}if(!Sa(a))return a;c=H(c)?c:[c];0===c.length&&(c=["+"]);c=c.map(function(a){var c=!1,d=a||ra;if(C(a)){if("+"==a.charAt(0)||"-"==a.charAt(0))c="-"==a.charAt(0),a=a.substring(1);if(""===a)return e(h,c);d=b(a);if(d.constant){var f=d();return e(function(a,b){return h(a[f],b[f])},c)}}return e(function(a,b){return h(d(a),d(b))},c)});return Za.call(a).sort(e(function(a,
	b){for(var d=0;d<c.length;d++){var e=c[d](a,b);if(0!==e)return e}return 0},d))}}function Ia(b){G(b)&&(b={link:b});b.restrict=b.restrict||"AC";return ea(b)}function rd(b,a,c,d,e){var f=this,g=[],h=f.$$parentForm=b.parent().controller("form")||Kb;f.$error={};f.$$success={};f.$pending=t;f.$name=e(a.name||a.ngForm||"")(c);f.$dirty=!1;f.$pristine=!0;f.$valid=!0;f.$invalid=!1;f.$submitted=!1;h.$addControl(f);f.$rollbackViewValue=function(){r(g,function(a){a.$rollbackViewValue()})};f.$commitViewValue=function(){r(g,
	function(a){a.$commitViewValue()})};f.$addControl=function(a){La(a.$name,"input");g.push(a);a.$name&&(f[a.$name]=a)};f.$$renameControl=function(a,b){var c=a.$name;f[c]===a&&delete f[c];f[b]=a;a.$name=b};f.$removeControl=function(a){a.$name&&f[a.$name]===a&&delete f[a.$name];r(f.$pending,function(b,c){f.$setValidity(c,null,a)});r(f.$error,function(b,c){f.$setValidity(c,null,a)});r(f.$$success,function(b,c){f.$setValidity(c,null,a)});Xa(g,a)};sd({ctrl:this,$element:b,set:function(a,b,c){var d=a[b];
	d?-1===d.indexOf(c)&&d.push(c):a[b]=[c]},unset:function(a,b,c){var d=a[b];d&&(Xa(d,c),0===d.length&&delete a[b])},parentForm:h,$animate:d});f.$setDirty=function(){d.removeClass(b,Ra);d.addClass(b,Lb);f.$dirty=!0;f.$pristine=!1;h.$setDirty()};f.$setPristine=function(){d.setClass(b,Ra,Lb+" ng-submitted");f.$dirty=!1;f.$pristine=!0;f.$submitted=!1;r(g,function(a){a.$setPristine()})};f.$setUntouched=function(){r(g,function(a){a.$setUntouched()})};f.$setSubmitted=function(){d.addClass(b,"ng-submitted");
	f.$submitted=!0;h.$setSubmitted()}}function jc(b){b.$formatters.push(function(a){return b.$isEmpty(a)?a:a.toString()})}function jb(b,a,c,d,e,f){var g=z(a[0].type);if(!e.android){var h=!1;a.on("compositionstart",function(a){h=!0});a.on("compositionend",function(){h=!1;l()})}var l=function(b){k&&(f.defer.cancel(k),k=null);if(!h){var e=a.val();b=b&&b.type;"password"===g||c.ngTrim&&"false"===c.ngTrim||(e=N(e));(d.$viewValue!==e||""===e&&d.$$hasNativeValidators)&&d.$setViewValue(e,b)}};if(e.hasEvent("input"))a.on("input",
	l);else{var k,n=function(a,b,c){k||(k=f.defer(function(){k=null;b&&b.value===c||l(a)}))};a.on("keydown",function(a){var b=a.keyCode;91===b||15<b&&19>b||37<=b&&40>=b||n(a,this,this.value)});if(e.hasEvent("paste"))a.on("paste cut",n)}a.on("change",l);d.$render=function(){a.val(d.$isEmpty(d.$viewValue)?"":d.$viewValue)}}function Mb(b,a){return function(c,d){var e,f;if(ga(c))return c;if(C(c)){'"'==c.charAt(0)&&'"'==c.charAt(c.length-1)&&(c=c.substring(1,c.length-1));if(Nf.test(c))return new Date(c);b.lastIndex=
	0;if(e=b.exec(c))return e.shift(),f=d?{yyyy:d.getFullYear(),MM:d.getMonth()+1,dd:d.getDate(),HH:d.getHours(),mm:d.getMinutes(),ss:d.getSeconds(),sss:d.getMilliseconds()/1E3}:{yyyy:1970,MM:1,dd:1,HH:0,mm:0,ss:0,sss:0},r(e,function(b,c){c<a.length&&(f[a[c]]=+b)}),new Date(f.yyyy,f.MM-1,f.dd,f.HH,f.mm,f.ss||0,1E3*f.sss||0)}return NaN}}function kb(b,a,c,d){return function(e,f,g,h,l,k,n){function p(a){return a&&!(a.getTime&&a.getTime()!==a.getTime())}function q(a){return y(a)?ga(a)?a:c(a):t}td(e,f,g,h);
	jb(e,f,g,h,l,k);var u=h&&h.$options&&h.$options.timezone,s;h.$$parserName=b;h.$parsers.push(function(b){return h.$isEmpty(b)?null:a.test(b)?(b=c(b,s),"UTC"===u&&b.setMinutes(b.getMinutes()-b.getTimezoneOffset()),b):t});h.$formatters.push(function(a){if(a&&!ga(a))throw Nb("datefmt",a);if(p(a)){if((s=a)&&"UTC"===u){var b=6E4*s.getTimezoneOffset();s=new Date(s.getTime()+b)}return n("date")(a,d,u)}s=null;return""});if(y(g.min)||g.ngMin){var r;h.$validators.min=function(a){return!p(a)||x(r)||c(a)>=r};
	g.$observe("min",function(a){r=q(a);h.$validate()})}if(y(g.max)||g.ngMax){var v;h.$validators.max=function(a){return!p(a)||x(v)||c(a)<=v};g.$observe("max",function(a){v=q(a);h.$validate()})}}}function td(b,a,c,d){(d.$$hasNativeValidators=J(a[0].validity))&&d.$parsers.push(function(b){var c=a.prop("validity")||{};return c.badInput&&!c.typeMismatch?t:b})}function ud(b,a,c,d,e){if(y(d)){b=b(d);if(!b.constant)throw R("ngModel")("constexpr",c,d);return b(a)}return e}function kc(b,a){b="ngClass"+b;return["$animate",
	function(c){function d(a,b){var c=[],d=0;a:for(;d<a.length;d++){for(var e=a[d],n=0;n<b.length;n++)if(e==b[n])continue a;c.push(e)}return c}function e(a){if(!H(a)){if(C(a))return a.split(" ");if(J(a)){var b=[];r(a,function(a,c){a&&(b=b.concat(c.split(" ")))});return b}}return a}return{restrict:"AC",link:function(f,g,h){function l(a,b){var c=g.data("$classCounts")||{},d=[];r(a,function(a){if(0<b||c[a])c[a]=(c[a]||0)+b,c[a]===+(0<b)&&d.push(a)});g.data("$classCounts",c);return d.join(" ")}function k(b){if(!0===
	a||f.$index%2===a){var k=e(b||[]);if(!n){var u=l(k,1);h.$addClass(u)}else if(!ha(b,n)){var s=e(n),u=d(k,s),k=d(s,k),u=l(u,1),k=l(k,-1);u&&u.length&&c.addClass(g,u);k&&k.length&&c.removeClass(g,k)}}n=sa(b)}var n;f.$watch(h[b],k,!0);h.$observe("class",function(a){k(f.$eval(h[b]))});"ngClass"!==b&&f.$watch("$index",function(c,d){var g=c&1;if(g!==(d&1)){var k=e(f.$eval(h[b]));g===a?(g=l(k,1),h.$addClass(g)):(g=l(k,-1),h.$removeClass(g))}})}}}]}function sd(b){function a(a,b){b&&!f[a]?(k.addClass(e,a),
	f[a]=!0):!b&&f[a]&&(k.removeClass(e,a),f[a]=!1)}function c(b,c){b=b?"-"+vc(b,"-"):"";a(lb+b,!0===c);a(vd+b,!1===c)}var d=b.ctrl,e=b.$element,f={},g=b.set,h=b.unset,l=b.parentForm,k=b.$animate;f[vd]=!(f[lb]=e.hasClass(lb));d.$setValidity=function(b,e,f){e===t?(d.$pending||(d.$pending={}),g(d.$pending,b,f)):(d.$pending&&h(d.$pending,b,f),wd(d.$pending)&&(d.$pending=t));Wa(e)?e?(h(d.$error,b,f),g(d.$$success,b,f)):(g(d.$error,b,f),h(d.$$success,b,f)):(h(d.$error,b,f),h(d.$$success,b,f));d.$pending?(a(xd,
	!0),d.$valid=d.$invalid=t,c("",null)):(a(xd,!1),d.$valid=wd(d.$error),d.$invalid=!d.$valid,c("",d.$valid));e=d.$pending&&d.$pending[b]?t:d.$error[b]?!1:d.$$success[b]?!0:null;c(b,e);l.$setValidity(b,e,d)}}function wd(b){if(b)for(var a in b)return!1;return!0}var Of=/^\/(.+)\/([a-z]*)$/,z=function(b){return C(b)?b.toLowerCase():b},tc=Object.prototype.hasOwnProperty,ub=function(b){return C(b)?b.toUpperCase():b},Qa,A,ta,Za=[].slice,qf=[].splice,Pf=[].push,Ca=Object.prototype.toString,Ja=R("ng"),ca=Q.angular||
	(Q.angular={}),cb,ob=0;Qa=W.documentMode;E.$inject=[];ra.$inject=[];var H=Array.isArray,N=function(b){return C(b)?b.trim():b},gd=function(b){return b.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g,"\\$1").replace(/\x08/g,"\\x08")},bb=function(){if(y(bb.isActive_))return bb.isActive_;var b=!(!W.querySelector("[ng-csp]")&&!W.querySelector("[data-ng-csp]"));if(!b)try{new Function("")}catch(a){b=!0}return bb.isActive_=b},rb=["ng-","data-ng-","ng:","x-ng-"],Md=/[A-Z]/g,wc=!1,Qb,qa=1,pb=3,Qd={full:"1.3.15",major:1,
	minor:3,dot:15,codeName:"locality-filtration"};T.expando="ng339";var zb=T.cache={},hf=1;T._data=function(b){return this.cache[b[this.expando]]||{}};var cf=/([\:\-\_]+(.))/g,df=/^moz([A-Z])/,Qf={mouseleave:"mouseout",mouseenter:"mouseover"},Tb=R("jqLite"),gf=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,Sb=/<|&#?\w+;/,ef=/<([\w:]+)/,ff=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,ja={option:[1,'<select multiple="multiple">',"</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>",
	"</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};ja.optgroup=ja.option;ja.tbody=ja.tfoot=ja.colgroup=ja.caption=ja.thead;ja.th=ja.td;var Ka=T.prototype={ready:function(b){function a(){c||(c=!0,b())}var c=!1;"complete"===W.readyState?setTimeout(a):(this.on("DOMContentLoaded",a),T(Q).on("load",a))},toString:function(){var b=[];r(this,function(a){b.push(""+a)});return"["+b.join(", ")+"]"},eq:function(b){return 0<=
	b?A(this[b]):A(this[this.length+b])},length:0,push:Pf,sort:[].sort,splice:[].splice},Eb={};r("multiple selected checked disabled readOnly required open".split(" "),function(b){Eb[z(b)]=b});var Oc={};r("input select option textarea button form details".split(" "),function(b){Oc[b]=!0});var Pc={ngMinlength:"minlength",ngMaxlength:"maxlength",ngMin:"min",ngMax:"max",ngPattern:"pattern"};r({data:Vb,removeData:xb},function(b,a){T[a]=b});r({data:Vb,inheritedData:Db,scope:function(b){return A.data(b,"$scope")||
	Db(b.parentNode||b,["$isolateScope","$scope"])},isolateScope:function(b){return A.data(b,"$isolateScope")||A.data(b,"$isolateScopeNoTemplate")},controller:Kc,injector:function(b){return Db(b,"$injector")},removeAttr:function(b,a){b.removeAttribute(a)},hasClass:Ab,css:function(b,a,c){a=db(a);if(y(c))b.style[a]=c;else return b.style[a]},attr:function(b,a,c){var d=z(a);if(Eb[d])if(y(c))c?(b[a]=!0,b.setAttribute(a,d)):(b[a]=!1,b.removeAttribute(d));else return b[a]||(b.attributes.getNamedItem(a)||E).specified?
	d:t;else if(y(c))b.setAttribute(a,c);else if(b.getAttribute)return b=b.getAttribute(a,2),null===b?t:b},prop:function(b,a,c){if(y(c))b[a]=c;else return b[a]},text:function(){function b(a,b){if(x(b)){var d=a.nodeType;return d===qa||d===pb?a.textContent:""}a.textContent=b}b.$dv="";return b}(),val:function(b,a){if(x(a)){if(b.multiple&&"select"===va(b)){var c=[];r(b.options,function(a){a.selected&&c.push(a.value||a.text)});return 0===c.length?null:c}return b.value}b.value=a},html:function(b,a){if(x(a))return b.innerHTML;
	wb(b,!0);b.innerHTML=a},empty:Lc},function(b,a){T.prototype[a]=function(a,d){var e,f,g=this.length;if(b!==Lc&&(2==b.length&&b!==Ab&&b!==Kc?a:d)===t){if(J(a)){for(e=0;e<g;e++)if(b===Vb)b(this[e],a);else for(f in a)b(this[e],f,a[f]);return this}e=b.$dv;g=e===t?Math.min(g,1):g;for(f=0;f<g;f++){var h=b(this[f],a,d);e=e?e+h:h}return e}for(e=0;e<g;e++)b(this[e],a,d);return this}});r({removeData:xb,on:function a(c,d,e,f){if(y(f))throw Tb("onargs");if(Gc(c)){var g=yb(c,!0);f=g.events;var h=g.handle;h||(h=
	g.handle=lf(c,f));for(var g=0<=d.indexOf(" ")?d.split(" "):[d],l=g.length;l--;){d=g[l];var k=f[d];k||(f[d]=[],"mouseenter"===d||"mouseleave"===d?a(c,Qf[d],function(a){var c=a.relatedTarget;c&&(c===this||this.contains(c))||h(a,d)}):"$destroy"!==d&&c.addEventListener(d,h,!1),k=f[d]);k.push(e)}}},off:Jc,one:function(a,c,d){a=A(a);a.on(c,function f(){a.off(c,d);a.off(c,f)});a.on(c,d)},replaceWith:function(a,c){var d,e=a.parentNode;wb(a);r(new T(c),function(c){d?e.insertBefore(c,d.nextSibling):e.replaceChild(c,
	a);d=c})},children:function(a){var c=[];r(a.childNodes,function(a){a.nodeType===qa&&c.push(a)});return c},contents:function(a){return a.contentDocument||a.childNodes||[]},append:function(a,c){var d=a.nodeType;if(d===qa||11===d){c=new T(c);for(var d=0,e=c.length;d<e;d++)a.appendChild(c[d])}},prepend:function(a,c){if(a.nodeType===qa){var d=a.firstChild;r(new T(c),function(c){a.insertBefore(c,d)})}},wrap:function(a,c){c=A(c).eq(0).clone()[0];var d=a.parentNode;d&&d.replaceChild(c,a);c.appendChild(a)},
	remove:Mc,detach:function(a){Mc(a,!0)},after:function(a,c){var d=a,e=a.parentNode;c=new T(c);for(var f=0,g=c.length;f<g;f++){var h=c[f];e.insertBefore(h,d.nextSibling);d=h}},addClass:Cb,removeClass:Bb,toggleClass:function(a,c,d){c&&r(c.split(" "),function(c){var f=d;x(f)&&(f=!Ab(a,c));(f?Cb:Bb)(a,c)})},parent:function(a){return(a=a.parentNode)&&11!==a.nodeType?a:null},next:function(a){return a.nextElementSibling},find:function(a,c){return a.getElementsByTagName?a.getElementsByTagName(c):[]},clone:Ub,
	triggerHandler:function(a,c,d){var e,f,g=c.type||c,h=yb(a);if(h=(h=h&&h.events)&&h[g])e={preventDefault:function(){this.defaultPrevented=!0},isDefaultPrevented:function(){return!0===this.defaultPrevented},stopImmediatePropagation:function(){this.immediatePropagationStopped=!0},isImmediatePropagationStopped:function(){return!0===this.immediatePropagationStopped},stopPropagation:E,type:g,target:a},c.type&&(e=w(e,c)),c=sa(h),f=d?[e].concat(d):[e],r(c,function(c){e.isImmediatePropagationStopped()||c.apply(a,
	f)})}},function(a,c){T.prototype[c]=function(c,e,f){for(var g,h=0,l=this.length;h<l;h++)x(g)?(g=a(this[h],c,e,f),y(g)&&(g=A(g))):Ic(g,a(this[h],c,e,f));return y(g)?g:this};T.prototype.bind=T.prototype.on;T.prototype.unbind=T.prototype.off});eb.prototype={put:function(a,c){this[Ma(a,this.nextUid)]=c},get:function(a){return this[Ma(a,this.nextUid)]},remove:function(a){var c=this[a=Ma(a,this.nextUid)];delete this[a];return c}};var Rc=/^function\s*[^\(]*\(\s*([^\)]*)\)/m,Rf=/,/,Sf=/^\s*(_?)(\S+?)\1\s*$/,
	Qc=/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,Fa=R("$injector");ab.$$annotate=function(a,c,d){var e;if("function"===typeof a){if(!(e=a.$inject)){e=[];if(a.length){if(c)throw C(d)&&d||(d=a.name||mf(a)),Fa("strictdi",d);c=a.toString().replace(Qc,"");c=c.match(Rc);r(c[1].split(Rf),function(a){a.replace(Sf,function(a,c,d){e.push(d)})})}a.$inject=e}}else H(a)?(c=a.length-1,sb(a[c],"fn"),e=a.slice(0,c)):sb(a,"fn",!0);return e};var Tf=R("$animate"),Ce=["$provide",function(a){this.$$selectors={};this.register=function(c,
	d){var e=c+"-animation";if(c&&"."!=c.charAt(0))throw Tf("notcsel",c);this.$$selectors[c.substr(1)]=e;a.factory(e,d)};this.classNameFilter=function(a){1===arguments.length&&(this.$$classNameFilter=a instanceof RegExp?a:null);return this.$$classNameFilter};this.$get=["$$q","$$asyncCallback","$rootScope",function(a,d,e){function f(d){var f,g=a.defer();g.promise.$$cancelFn=function(){f&&f()};e.$$postDigest(function(){f=d(function(){g.resolve()})});return g.promise}function g(a,c){var d=[],e=[],f=ia();
	r((a.attr("class")||"").split(/\s+/),function(a){f[a]=!0});r(c,function(a,c){var g=f[c];!1===a&&g?e.push(c):!0!==a||g||d.push(c)});return 0<d.length+e.length&&[d.length?d:null,e.length?e:null]}function h(a,c,d){for(var e=0,f=c.length;e<f;++e)a[c[e]]=d}function l(){n||(n=a.defer(),d(function(){n.resolve();n=null}));return n.promise}function k(a,c){if(ca.isObject(c)){var d=w(c.from||{},c.to||{});a.css(d)}}var n;return{animate:function(a,c,d){k(a,{from:c,to:d});return l()},enter:function(a,c,d,e){k(a,
	e);d?d.after(a):c.prepend(a);return l()},leave:function(a,c){k(a,c);a.remove();return l()},move:function(a,c,d,e){return this.enter(a,c,d,e)},addClass:function(a,c,d){return this.setClass(a,c,[],d)},$$addClassImmediately:function(a,c,d){a=A(a);c=C(c)?c:H(c)?c.join(" "):"";r(a,function(a){Cb(a,c)});k(a,d);return l()},removeClass:function(a,c,d){return this.setClass(a,[],c,d)},$$removeClassImmediately:function(a,c,d){a=A(a);c=C(c)?c:H(c)?c.join(" "):"";r(a,function(a){Bb(a,c)});k(a,d);return l()},setClass:function(a,
	c,d,e){var k=this,l=!1;a=A(a);var m=a.data("$$animateClasses");m?e&&m.options&&(m.options=ca.extend(m.options||{},e)):(m={classes:{},options:e},l=!0);e=m.classes;c=H(c)?c:c.split(" ");d=H(d)?d:d.split(" ");h(e,c,!0);h(e,d,!1);l&&(m.promise=f(function(c){var d=a.data("$$animateClasses");a.removeData("$$animateClasses");if(d){var e=g(a,d.classes);e&&k.$$setClassImmediately(a,e[0],e[1],d.options)}c()}),a.data("$$animateClasses",m));return m.promise},$$setClassImmediately:function(a,c,d,e){c&&this.$$addClassImmediately(a,
	c);d&&this.$$removeClassImmediately(a,d);k(a,e);return l()},enabled:E,cancel:E}}]}],la=R("$compile");yc.$inject=["$provide","$$sanitizeUriProvider"];var Sc=/^((?:x|data)[\:\-_])/i,rf=R("$controller"),Wc="application/json",$b={"Content-Type":Wc+";charset=utf-8"},tf=/^\[|^\{(?!\{)/,uf={"[":/]$/,"{":/}$/},sf=/^\)\]\}',?\n/,ac=R("$interpolate"),Uf=/^([^\?#]*)(\?([^#]*))?(#(.*))?$/,xf={http:80,https:443,ftp:21},Gb=R("$location"),Vf={$$html5:!1,$$replace:!1,absUrl:Hb("$$absUrl"),url:function(a){if(x(a))return this.$$url;
	var c=Uf.exec(a);(c[1]||""===a)&&this.path(decodeURIComponent(c[1]));(c[2]||c[1]||""===a)&&this.search(c[3]||"");this.hash(c[5]||"");return this},protocol:Hb("$$protocol"),host:Hb("$$host"),port:Hb("$$port"),path:dd("$$path",function(a){a=null!==a?a.toString():"";return"/"==a.charAt(0)?a:"/"+a}),search:function(a,c){switch(arguments.length){case 0:return this.$$search;case 1:if(C(a)||Y(a))a=a.toString(),this.$$search=sc(a);else if(J(a))a=Da(a,{}),r(a,function(c,e){null==c&&delete a[e]}),this.$$search=
	a;else throw Gb("isrcharg");break;default:x(c)||null===c?delete this.$$search[a]:this.$$search[a]=c}this.$$compose();return this},hash:dd("$$hash",function(a){return null!==a?a.toString():""}),replace:function(){this.$$replace=!0;return this}};r([cd,ec,dc],function(a){a.prototype=Object.create(Vf);a.prototype.state=function(c){if(!arguments.length)return this.$$state;if(a!==dc||!this.$$html5)throw Gb("nostate");this.$$state=x(c)?null:c;return this}});var na=R("$parse"),Wf=Function.prototype.call,
	Xf=Function.prototype.apply,Yf=Function.prototype.bind,mb=ia();r({"null":function(){return null},"true":function(){return!0},"false":function(){return!1},undefined:function(){}},function(a,c){a.constant=a.literal=a.sharedGetter=!0;mb[c]=a});mb["this"]=function(a){return a};mb["this"].sharedGetter=!0;var nb=w(ia(),{"+":function(a,c,d,e){d=d(a,c);e=e(a,c);return y(d)?y(e)?d+e:d:y(e)?e:t},"-":function(a,c,d,e){d=d(a,c);e=e(a,c);return(y(d)?d:0)-(y(e)?e:0)},"*":function(a,c,d,e){return d(a,c)*e(a,c)},
	"/":function(a,c,d,e){return d(a,c)/e(a,c)},"%":function(a,c,d,e){return d(a,c)%e(a,c)},"===":function(a,c,d,e){return d(a,c)===e(a,c)},"!==":function(a,c,d,e){return d(a,c)!==e(a,c)},"==":function(a,c,d,e){return d(a,c)==e(a,c)},"!=":function(a,c,d,e){return d(a,c)!=e(a,c)},"<":function(a,c,d,e){return d(a,c)<e(a,c)},">":function(a,c,d,e){return d(a,c)>e(a,c)},"<=":function(a,c,d,e){return d(a,c)<=e(a,c)},">=":function(a,c,d,e){return d(a,c)>=e(a,c)},"&&":function(a,c,d,e){return d(a,c)&&e(a,c)},
	"||":function(a,c,d,e){return d(a,c)||e(a,c)},"!":function(a,c,d){return!d(a,c)},"=":!0,"|":!0}),Zf={n:"\n",f:"\f",r:"\r",t:"\t",v:"\v","'":"'",'"':'"'},hc=function(a){this.options=a};hc.prototype={constructor:hc,lex:function(a){this.text=a;this.index=0;for(this.tokens=[];this.index<this.text.length;)if(a=this.text.charAt(this.index),'"'===a||"'"===a)this.readString(a);else if(this.isNumber(a)||"."===a&&this.isNumber(this.peek()))this.readNumber();else if(this.isIdent(a))this.readIdent();else if(this.is(a,
	"(){}[].,;:?"))this.tokens.push({index:this.index,text:a}),this.index++;else if(this.isWhitespace(a))this.index++;else{var c=a+this.peek(),d=c+this.peek(2),e=nb[c],f=nb[d];nb[a]||e||f?(a=f?d:e?c:a,this.tokens.push({index:this.index,text:a,operator:!0}),this.index+=a.length):this.throwError("Unexpected next character ",this.index,this.index+1)}return this.tokens},is:function(a,c){return-1!==c.indexOf(a)},peek:function(a){a=a||1;return this.index+a<this.text.length?this.text.charAt(this.index+a):!1},
	isNumber:function(a){return"0"<=a&&"9">=a&&"string"===typeof a},isWhitespace:function(a){return" "===a||"\r"===a||"\t"===a||"\n"===a||"\v"===a||"\u00a0"===a},isIdent:function(a){return"a"<=a&&"z">=a||"A"<=a&&"Z">=a||"_"===a||"$"===a},isExpOperator:function(a){return"-"===a||"+"===a||this.isNumber(a)},throwError:function(a,c,d){d=d||this.index;c=y(c)?"s "+c+"-"+this.index+" ["+this.text.substring(c,d)+"]":" "+d;throw na("lexerr",a,c,this.text);},readNumber:function(){for(var a="",c=this.index;this.index<
	this.text.length;){var d=z(this.text.charAt(this.index));if("."==d||this.isNumber(d))a+=d;else{var e=this.peek();if("e"==d&&this.isExpOperator(e))a+=d;else if(this.isExpOperator(d)&&e&&this.isNumber(e)&&"e"==a.charAt(a.length-1))a+=d;else if(!this.isExpOperator(d)||e&&this.isNumber(e)||"e"!=a.charAt(a.length-1))break;else this.throwError("Invalid exponent")}this.index++}this.tokens.push({index:c,text:a,constant:!0,value:Number(a)})},readIdent:function(){for(var a=this.index;this.index<this.text.length;){var c=
	this.text.charAt(this.index);if(!this.isIdent(c)&&!this.isNumber(c))break;this.index++}this.tokens.push({index:a,text:this.text.slice(a,this.index),identifier:!0})},readString:function(a){var c=this.index;this.index++;for(var d="",e=a,f=!1;this.index<this.text.length;){var g=this.text.charAt(this.index),e=e+g;if(f)"u"===g?(f=this.text.substring(this.index+1,this.index+5),f.match(/[\da-f]{4}/i)||this.throwError("Invalid unicode escape [\\u"+f+"]"),this.index+=4,d+=String.fromCharCode(parseInt(f,16))):
	d+=Zf[g]||g,f=!1;else if("\\"===g)f=!0;else{if(g===a){this.index++;this.tokens.push({index:c,text:e,constant:!0,value:d});return}d+=g}this.index++}this.throwError("Unterminated quote",c)}};var ib=function(a,c,d){this.lexer=a;this.$filter=c;this.options=d};ib.ZERO=w(function(){return 0},{sharedGetter:!0,constant:!0});ib.prototype={constructor:ib,parse:function(a){this.text=a;this.tokens=this.lexer.lex(a);a=this.statements();0!==this.tokens.length&&this.throwError("is an unexpected token",this.tokens[0]);
	a.literal=!!a.literal;a.constant=!!a.constant;return a},primary:function(){var a;this.expect("(")?(a=this.filterChain(),this.consume(")")):this.expect("[")?a=this.arrayDeclaration():this.expect("{")?a=this.object():this.peek().identifier&&this.peek().text in mb?a=mb[this.consume().text]:this.peek().identifier?a=this.identifier():this.peek().constant?a=this.constant():this.throwError("not a primary expression",this.peek());for(var c,d;c=this.expect("(","[",".");)"("===c.text?(a=this.functionCall(a,
	d),d=null):"["===c.text?(d=a,a=this.objectIndex(a)):"."===c.text?(d=a,a=this.fieldAccess(a)):this.throwError("IMPOSSIBLE");return a},throwError:function(a,c){throw na("syntax",c.text,a,c.index+1,this.text,this.text.substring(c.index));},peekToken:function(){if(0===this.tokens.length)throw na("ueoe",this.text);return this.tokens[0]},peek:function(a,c,d,e){return this.peekAhead(0,a,c,d,e)},peekAhead:function(a,c,d,e,f){if(this.tokens.length>a){a=this.tokens[a];var g=a.text;if(g===c||g===d||g===e||g===
	f||!(c||d||e||f))return a}return!1},expect:function(a,c,d,e){return(a=this.peek(a,c,d,e))?(this.tokens.shift(),a):!1},consume:function(a){if(0===this.tokens.length)throw na("ueoe",this.text);var c=this.expect(a);c||this.throwError("is unexpected, expecting ["+a+"]",this.peek());return c},unaryFn:function(a,c){var d=nb[a];return w(function(a,f){return d(a,f,c)},{constant:c.constant,inputs:[c]})},binaryFn:function(a,c,d,e){var f=nb[c];return w(function(c,e){return f(c,e,a,d)},{constant:a.constant&&
	d.constant,inputs:!e&&[a,d]})},identifier:function(){for(var a=this.consume().text;this.peek(".")&&this.peekAhead(1).identifier&&!this.peekAhead(2,"(");)a+=this.consume().text+this.consume().text;return zf(a,this.options,this.text)},constant:function(){var a=this.consume().value;return w(function(){return a},{constant:!0,literal:!0})},statements:function(){for(var a=[];;)if(0<this.tokens.length&&!this.peek("}",")",";","]")&&a.push(this.filterChain()),!this.expect(";"))return 1===a.length?a[0]:function(c,
	d){for(var e,f=0,g=a.length;f<g;f++)e=a[f](c,d);return e}},filterChain:function(){for(var a=this.expression();this.expect("|");)a=this.filter(a);return a},filter:function(a){var c=this.$filter(this.consume().text),d,e;if(this.peek(":"))for(d=[],e=[];this.expect(":");)d.push(this.expression());var f=[a].concat(d||[]);return w(function(f,h){var l=a(f,h);if(e){e[0]=l;for(l=d.length;l--;)e[l+1]=d[l](f,h);return c.apply(t,e)}return c(l)},{constant:!c.$stateful&&f.every(fc),inputs:!c.$stateful&&f})},expression:function(){return this.assignment()},
	assignment:function(){var a=this.ternary(),c,d;return(d=this.expect("="))?(a.assign||this.throwError("implies assignment but ["+this.text.substring(0,d.index)+"] can not be assigned to",d),c=this.ternary(),w(function(d,f){return a.assign(d,c(d,f),f)},{inputs:[a,c]})):a},ternary:function(){var a=this.logicalOR(),c;if(this.expect("?")&&(c=this.assignment(),this.consume(":"))){var d=this.assignment();return w(function(e,f){return a(e,f)?c(e,f):d(e,f)},{constant:a.constant&&c.constant&&d.constant})}return a},
	logicalOR:function(){for(var a=this.logicalAND(),c;c=this.expect("||");)a=this.binaryFn(a,c.text,this.logicalAND(),!0);return a},logicalAND:function(){for(var a=this.equality(),c;c=this.expect("&&");)a=this.binaryFn(a,c.text,this.equality(),!0);return a},equality:function(){for(var a=this.relational(),c;c=this.expect("==","!=","===","!==");)a=this.binaryFn(a,c.text,this.relational());return a},relational:function(){for(var a=this.additive(),c;c=this.expect("<",">","<=",">=");)a=this.binaryFn(a,c.text,
	this.additive());return a},additive:function(){for(var a=this.multiplicative(),c;c=this.expect("+","-");)a=this.binaryFn(a,c.text,this.multiplicative());return a},multiplicative:function(){for(var a=this.unary(),c;c=this.expect("*","/","%");)a=this.binaryFn(a,c.text,this.unary());return a},unary:function(){var a;return this.expect("+")?this.primary():(a=this.expect("-"))?this.binaryFn(ib.ZERO,a.text,this.unary()):(a=this.expect("!"))?this.unaryFn(a.text,this.unary()):this.primary()},fieldAccess:function(a){var c=
	this.identifier();return w(function(d,e,f){d=f||a(d,e);return null==d?t:c(d)},{assign:function(d,e,f){var g=a(d,f);g||a.assign(d,g={},f);return c.assign(g,e)}})},objectIndex:function(a){var c=this.text,d=this.expression();this.consume("]");return w(function(e,f){var g=a(e,f),h=d(e,f);ua(h,c);return g?oa(g[h],c):t},{assign:function(e,f,g){var h=ua(d(e,g),c),l=oa(a(e,g),c);l||a.assign(e,l={},g);return l[h]=f}})},functionCall:function(a,c){var d=[];if(")"!==this.peekToken().text){do d.push(this.expression());
	while(this.expect(","))}this.consume(")");var e=this.text,f=d.length?[]:null;return function(g,h){var l=c?c(g,h):y(c)?t:g,k=a(g,h,l)||E;if(f)for(var n=d.length;n--;)f[n]=oa(d[n](g,h),e);oa(l,e);if(k){if(k.constructor===k)throw na("isecfn",e);if(k===Wf||k===Xf||k===Yf)throw na("isecff",e);}l=k.apply?k.apply(l,f):k(f[0],f[1],f[2],f[3],f[4]);f&&(f.length=0);return oa(l,e)}},arrayDeclaration:function(){var a=[];if("]"!==this.peekToken().text){do{if(this.peek("]"))break;a.push(this.expression())}while(this.expect(","))
	}this.consume("]");return w(function(c,d){for(var e=[],f=0,g=a.length;f<g;f++)e.push(a[f](c,d));return e},{literal:!0,constant:a.every(fc),inputs:a})},object:function(){var a=[],c=[];if("}"!==this.peekToken().text){do{if(this.peek("}"))break;var d=this.consume();d.constant?a.push(d.value):d.identifier?a.push(d.text):this.throwError("invalid key",d);this.consume(":");c.push(this.expression())}while(this.expect(","))}this.consume("}");return w(function(d,f){for(var g={},h=0,l=c.length;h<l;h++)g[a[h]]=
	c[h](d,f);return g},{literal:!0,constant:c.every(fc),inputs:c})}};var Bf=ia(),Af=ia(),Cf=Object.prototype.valueOf,Ba=R("$sce"),pa={HTML:"html",CSS:"css",URL:"url",RESOURCE_URL:"resourceUrl",JS:"js"},la=R("$compile"),$=W.createElement("a"),id=Aa(Q.location.href);Fc.$inject=["$provide"];jd.$inject=["$locale"];ld.$inject=["$locale"];var od=".",Mf={yyyy:U("FullYear",4),yy:U("FullYear",2,0,!0),y:U("FullYear",1),MMMM:Jb("Month"),MMM:Jb("Month",!0),MM:U("Month",2,1),M:U("Month",1,1),dd:U("Date",2),d:U("Date",
	1),HH:U("Hours",2),H:U("Hours",1),hh:U("Hours",2,-12),h:U("Hours",1,-12),mm:U("Minutes",2),m:U("Minutes",1),ss:U("Seconds",2),s:U("Seconds",1),sss:U("Milliseconds",3),EEEE:Jb("Day"),EEE:Jb("Day",!0),a:function(a,c){return 12>a.getHours()?c.AMPMS[0]:c.AMPMS[1]},Z:function(a){a=-1*a.getTimezoneOffset();return a=(0<=a?"+":"")+(Ib(Math[0<a?"floor":"ceil"](a/60),2)+Ib(Math.abs(a%60),2))},ww:qd(2),w:qd(1),G:ic,GG:ic,GGG:ic,GGGG:function(a,c){return 0>=a.getFullYear()?c.ERANAMES[0]:c.ERANAMES[1]}},Lf=/((?:[^yMdHhmsaZEwG']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|d+|H+|h+|m+|s+|a|Z|G+|w+))(.*)/,
	Kf=/^\-?\d+$/;kd.$inject=["$locale"];var Hf=ea(z),If=ea(ub);md.$inject=["$parse"];var Td=ea({restrict:"E",compile:function(a,c){if(!c.href&&!c.xlinkHref&&!c.name)return function(a,c){if("a"===c[0].nodeName.toLowerCase()){var f="[object SVGAnimatedString]"===Ca.call(c.prop("href"))?"xlink:href":"href";c.on("click",function(a){c.attr(f)||a.preventDefault()})}}}}),vb={};r(Eb,function(a,c){if("multiple"!=a){var d=xa("ng-"+c);vb[d]=function(){return{restrict:"A",priority:100,link:function(a,f,g){a.$watch(g[d],
	function(a){g.$set(c,!!a)})}}}}});r(Pc,function(a,c){vb[c]=function(){return{priority:100,link:function(a,e,f){if("ngPattern"===c&&"/"==f.ngPattern.charAt(0)&&(e=f.ngPattern.match(Of))){f.$set("ngPattern",new RegExp(e[1],e[2]));return}a.$watch(f[c],function(a){f.$set(c,a)})}}}});r(["src","srcset","href"],function(a){var c=xa("ng-"+a);vb[c]=function(){return{priority:99,link:function(d,e,f){var g=a,h=a;"href"===a&&"[object SVGAnimatedString]"===Ca.call(e.prop("href"))&&(h="xlinkHref",f.$attr[h]="xlink:href",
	g=null);f.$observe(c,function(c){c?(f.$set(h,c),Qa&&g&&e.prop(g,f[h])):"href"===a&&f.$set(h,null)})}}}});var Kb={$addControl:E,$$renameControl:function(a,c){a.$name=c},$removeControl:E,$setValidity:E,$setDirty:E,$setPristine:E,$setSubmitted:E};rd.$inject=["$element","$attrs","$scope","$animate","$interpolate"];var yd=function(a){return["$timeout",function(c){return{name:"form",restrict:a?"EAC":"E",controller:rd,compile:function(d,e){d.addClass(Ra).addClass(lb);var f=e.name?"name":a&&e.ngForm?"ngForm":
	!1;return{pre:function(a,d,e,k){if(!("action"in e)){var n=function(c){a.$apply(function(){k.$commitViewValue();k.$setSubmitted()});c.preventDefault()};d[0].addEventListener("submit",n,!1);d.on("$destroy",function(){c(function(){d[0].removeEventListener("submit",n,!1)},0,!1)})}var p=k.$$parentForm;f&&(hb(a,null,k.$name,k,k.$name),e.$observe(f,function(c){k.$name!==c&&(hb(a,null,k.$name,t,k.$name),p.$$renameControl(k,c),hb(a,null,k.$name,k,k.$name))}));d.on("$destroy",function(){p.$removeControl(k);
	f&&hb(a,null,e[f],t,k.$name);w(k,Kb)})}}}}}]},Ud=yd(),ge=yd(!0),Nf=/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/,$f=/^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,ag=/^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i,bg=/^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/,zd=/^(\d{4})-(\d{2})-(\d{2})$/,Ad=/^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)(?::(\d\d)(\.\d{1,3})?)?$/,lc=/^(\d{4})-W(\d\d)$/,Bd=/^(\d{4})-(\d\d)$/,
	Cd=/^(\d\d):(\d\d)(?::(\d\d)(\.\d{1,3})?)?$/,Dd={text:function(a,c,d,e,f,g){jb(a,c,d,e,f,g);jc(e)},date:kb("date",zd,Mb(zd,["yyyy","MM","dd"]),"yyyy-MM-dd"),"datetime-local":kb("datetimelocal",Ad,Mb(Ad,"yyyy MM dd HH mm ss sss".split(" ")),"yyyy-MM-ddTHH:mm:ss.sss"),time:kb("time",Cd,Mb(Cd,["HH","mm","ss","sss"]),"HH:mm:ss.sss"),week:kb("week",lc,function(a,c){if(ga(a))return a;if(C(a)){lc.lastIndex=0;var d=lc.exec(a);if(d){var e=+d[1],f=+d[2],g=d=0,h=0,l=0,k=pd(e),f=7*(f-1);c&&(d=c.getHours(),g=
	c.getMinutes(),h=c.getSeconds(),l=c.getMilliseconds());return new Date(e,0,k.getDate()+f,d,g,h,l)}}return NaN},"yyyy-Www"),month:kb("month",Bd,Mb(Bd,["yyyy","MM"]),"yyyy-MM"),number:function(a,c,d,e,f,g){td(a,c,d,e);jb(a,c,d,e,f,g);e.$$parserName="number";e.$parsers.push(function(a){return e.$isEmpty(a)?null:bg.test(a)?parseFloat(a):t});e.$formatters.push(function(a){if(!e.$isEmpty(a)){if(!Y(a))throw Nb("numfmt",a);a=a.toString()}return a});if(y(d.min)||d.ngMin){var h;e.$validators.min=function(a){return e.$isEmpty(a)||
	x(h)||a>=h};d.$observe("min",function(a){y(a)&&!Y(a)&&(a=parseFloat(a,10));h=Y(a)&&!isNaN(a)?a:t;e.$validate()})}if(y(d.max)||d.ngMax){var l;e.$validators.max=function(a){return e.$isEmpty(a)||x(l)||a<=l};d.$observe("max",function(a){y(a)&&!Y(a)&&(a=parseFloat(a,10));l=Y(a)&&!isNaN(a)?a:t;e.$validate()})}},url:function(a,c,d,e,f,g){jb(a,c,d,e,f,g);jc(e);e.$$parserName="url";e.$validators.url=function(a,c){var d=a||c;return e.$isEmpty(d)||$f.test(d)}},email:function(a,c,d,e,f,g){jb(a,c,d,e,f,g);jc(e);
	e.$$parserName="email";e.$validators.email=function(a,c){var d=a||c;return e.$isEmpty(d)||ag.test(d)}},radio:function(a,c,d,e){x(d.name)&&c.attr("name",++ob);c.on("click",function(a){c[0].checked&&e.$setViewValue(d.value,a&&a.type)});e.$render=function(){c[0].checked=d.value==e.$viewValue};d.$observe("value",e.$render)},checkbox:function(a,c,d,e,f,g,h,l){var k=ud(l,a,"ngTrueValue",d.ngTrueValue,!0),n=ud(l,a,"ngFalseValue",d.ngFalseValue,!1);c.on("click",function(a){e.$setViewValue(c[0].checked,a&&
	a.type)});e.$render=function(){c[0].checked=e.$viewValue};e.$isEmpty=function(a){return!1===a};e.$formatters.push(function(a){return ha(a,k)});e.$parsers.push(function(a){return a?k:n})},hidden:E,button:E,submit:E,reset:E,file:E},zc=["$browser","$sniffer","$filter","$parse",function(a,c,d,e){return{restrict:"E",require:["?ngModel"],link:{pre:function(f,g,h,l){l[0]&&(Dd[z(h.type)]||Dd.text)(f,g,h,l[0],c,a,d,e)}}}}],cg=/^(true|false|\d+)$/,ye=function(){return{restrict:"A",priority:100,compile:function(a,
	c){return cg.test(c.ngValue)?function(a,c,f){f.$set("value",a.$eval(f.ngValue))}:function(a,c,f){a.$watch(f.ngValue,function(a){f.$set("value",a)})}}}},Zd=["$compile",function(a){return{restrict:"AC",compile:function(c){a.$$addBindingClass(c);return function(c,e,f){a.$$addBindingInfo(e,f.ngBind);e=e[0];c.$watch(f.ngBind,function(a){e.textContent=a===t?"":a})}}}}],ae=["$interpolate","$compile",function(a,c){return{compile:function(d){c.$$addBindingClass(d);return function(d,f,g){d=a(f.attr(g.$attr.ngBindTemplate));
	c.$$addBindingInfo(f,d.expressions);f=f[0];g.$observe("ngBindTemplate",function(a){f.textContent=a===t?"":a})}}}}],$d=["$sce","$parse","$compile",function(a,c,d){return{restrict:"A",compile:function(e,f){var g=c(f.ngBindHtml),h=c(f.ngBindHtml,function(a){return(a||"").toString()});d.$$addBindingClass(e);return function(c,e,f){d.$$addBindingInfo(e,f.ngBindHtml);c.$watch(h,function(){e.html(a.getTrustedHtml(g(c))||"")})}}}}],xe=ea({restrict:"A",require:"ngModel",link:function(a,c,d,e){e.$viewChangeListeners.push(function(){a.$eval(d.ngChange)})}}),
	be=kc("",!0),de=kc("Odd",0),ce=kc("Even",1),ee=Ia({compile:function(a,c){c.$set("ngCloak",t);a.removeClass("ng-cloak")}}),fe=[function(){return{restrict:"A",scope:!0,controller:"@",priority:500}}],Ec={},dg={blur:!0,focus:!0};r("click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave keydown keyup keypress submit focus blur copy cut paste".split(" "),function(a){var c=xa("ng-"+a);Ec[c]=["$parse","$rootScope",function(d,e){return{restrict:"A",compile:function(f,g){var h=
	d(g[c],null,!0);return function(c,d){d.on(a,function(d){var f=function(){h(c,{$event:d})};dg[a]&&e.$$phase?c.$evalAsync(f):c.$apply(f)})}}}}]});var ie=["$animate",function(a){return{multiElement:!0,transclude:"element",priority:600,terminal:!0,restrict:"A",$$tlb:!0,link:function(c,d,e,f,g){var h,l,k;c.$watch(e.ngIf,function(c){c?l||g(function(c,f){l=f;c[c.length++]=W.createComment(" end ngIf: "+e.ngIf+" ");h={clone:c};a.enter(c,d.parent(),d)}):(k&&(k.remove(),k=null),l&&(l.$destroy(),l=null),h&&(k=
	tb(h.clone),a.leave(k).then(function(){k=null}),h=null))})}}}],je=["$templateRequest","$anchorScroll","$animate","$sce",function(a,c,d,e){return{restrict:"ECA",priority:400,terminal:!0,transclude:"element",controller:ca.noop,compile:function(f,g){var h=g.ngInclude||g.src,l=g.onload||"",k=g.autoscroll;return function(f,g,q,r,s){var t=0,v,m,F,w=function(){m&&(m.remove(),m=null);v&&(v.$destroy(),v=null);F&&(d.leave(F).then(function(){m=null}),m=F,F=null)};f.$watch(e.parseAsResourceUrl(h),function(e){var h=
	function(){!y(k)||k&&!f.$eval(k)||c()},m=++t;e?(a(e,!0).then(function(a){if(m===t){var c=f.$new();r.template=a;a=s(c,function(a){w();d.enter(a,null,g).then(h)});v=c;F=a;v.$emit("$includeContentLoaded",e);f.$eval(l)}},function(){m===t&&(w(),f.$emit("$includeContentError",e))}),f.$emit("$includeContentRequested",e)):(w(),r.template=null)})}}}}],Ae=["$compile",function(a){return{restrict:"ECA",priority:-400,require:"ngInclude",link:function(c,d,e,f){/SVG/.test(d[0].toString())?(d.empty(),a(Hc(f.template,
	W).childNodes)(c,function(a){d.append(a)},{futureParentElement:d})):(d.html(f.template),a(d.contents())(c))}}}],ke=Ia({priority:450,compile:function(){return{pre:function(a,c,d){a.$eval(d.ngInit)}}}}),we=function(){return{restrict:"A",priority:100,require:"ngModel",link:function(a,c,d,e){var f=c.attr(d.$attr.ngList)||", ",g="false"!==d.ngTrim,h=g?N(f):f;e.$parsers.push(function(a){if(!x(a)){var c=[];a&&r(a.split(h),function(a){a&&c.push(g?N(a):a)});return c}});e.$formatters.push(function(a){return H(a)?
	a.join(f):t});e.$isEmpty=function(a){return!a||!a.length}}}},lb="ng-valid",vd="ng-invalid",Ra="ng-pristine",Lb="ng-dirty",xd="ng-pending",Nb=new R("ngModel"),eg=["$scope","$exceptionHandler","$attrs","$element","$parse","$animate","$timeout","$rootScope","$q","$interpolate",function(a,c,d,e,f,g,h,l,k,n){this.$modelValue=this.$viewValue=Number.NaN;this.$$rawModelValue=t;this.$validators={};this.$asyncValidators={};this.$parsers=[];this.$formatters=[];this.$viewChangeListeners=[];this.$untouched=!0;
	this.$touched=!1;this.$pristine=!0;this.$dirty=!1;this.$valid=!0;this.$invalid=!1;this.$error={};this.$$success={};this.$pending=t;this.$name=n(d.name||"",!1)(a);var p=f(d.ngModel),q=p.assign,u=p,s=q,M=null,v,m=this;this.$$setOptions=function(a){if((m.$options=a)&&a.getterSetter){var c=f(d.ngModel+"()"),g=f(d.ngModel+"($$$p)");u=function(a){var d=p(a);G(d)&&(d=c(a));return d};s=function(a,c){G(p(a))?g(a,{$$$p:m.$modelValue}):q(a,m.$modelValue)}}else if(!p.assign)throw Nb("nonassign",d.ngModel,wa(e));
	};this.$render=E;this.$isEmpty=function(a){return x(a)||""===a||null===a||a!==a};var F=e.inheritedData("$formController")||Kb,w=0;sd({ctrl:this,$element:e,set:function(a,c){a[c]=!0},unset:function(a,c){delete a[c]},parentForm:F,$animate:g});this.$setPristine=function(){m.$dirty=!1;m.$pristine=!0;g.removeClass(e,Lb);g.addClass(e,Ra)};this.$setDirty=function(){m.$dirty=!0;m.$pristine=!1;g.removeClass(e,Ra);g.addClass(e,Lb);F.$setDirty()};this.$setUntouched=function(){m.$touched=!1;m.$untouched=!0;g.setClass(e,
	"ng-untouched","ng-touched")};this.$setTouched=function(){m.$touched=!0;m.$untouched=!1;g.setClass(e,"ng-touched","ng-untouched")};this.$rollbackViewValue=function(){h.cancel(M);m.$viewValue=m.$$lastCommittedViewValue;m.$render()};this.$validate=function(){if(!Y(m.$modelValue)||!isNaN(m.$modelValue)){var a=m.$$rawModelValue,c=m.$valid,d=m.$modelValue,e=m.$options&&m.$options.allowInvalid;m.$$runValidators(a,m.$$lastCommittedViewValue,function(f){e||c===f||(m.$modelValue=f?a:t,m.$modelValue!==d&&m.$$writeModelToScope())})}};
	this.$$runValidators=function(a,c,d){function e(){var d=!0;r(m.$validators,function(e,f){var h=e(a,c);d=d&&h;g(f,h)});return d?!0:(r(m.$asyncValidators,function(a,c){g(c,null)}),!1)}function f(){var d=[],e=!0;r(m.$asyncValidators,function(f,h){var k=f(a,c);if(!k||!G(k.then))throw Nb("$asyncValidators",k);g(h,t);d.push(k.then(function(){g(h,!0)},function(a){e=!1;g(h,!1)}))});d.length?k.all(d).then(function(){h(e)},E):h(!0)}function g(a,c){l===w&&m.$setValidity(a,c)}function h(a){l===w&&d(a)}w++;var l=
	w;(function(){var a=m.$$parserName||"parse";if(v===t)g(a,null);else return v||(r(m.$validators,function(a,c){g(c,null)}),r(m.$asyncValidators,function(a,c){g(c,null)})),g(a,v),v;return!0})()?e()?f():h(!1):h(!1)};this.$commitViewValue=function(){var a=m.$viewValue;h.cancel(M);if(m.$$lastCommittedViewValue!==a||""===a&&m.$$hasNativeValidators)m.$$lastCommittedViewValue=a,m.$pristine&&this.$setDirty(),this.$$parseAndValidate()};this.$$parseAndValidate=function(){var c=m.$$lastCommittedViewValue;if(v=
	x(c)?t:!0)for(var d=0;d<m.$parsers.length;d++)if(c=m.$parsers[d](c),x(c)){v=!1;break}Y(m.$modelValue)&&isNaN(m.$modelValue)&&(m.$modelValue=u(a));var e=m.$modelValue,f=m.$options&&m.$options.allowInvalid;m.$$rawModelValue=c;f&&(m.$modelValue=c,m.$modelValue!==e&&m.$$writeModelToScope());m.$$runValidators(c,m.$$lastCommittedViewValue,function(a){f||(m.$modelValue=a?c:t,m.$modelValue!==e&&m.$$writeModelToScope())})};this.$$writeModelToScope=function(){s(a,m.$modelValue);r(m.$viewChangeListeners,function(a){try{a()}catch(d){c(d)}})};
	this.$setViewValue=function(a,c){m.$viewValue=a;m.$options&&!m.$options.updateOnDefault||m.$$debounceViewValueCommit(c)};this.$$debounceViewValueCommit=function(c){var d=0,e=m.$options;e&&y(e.debounce)&&(e=e.debounce,Y(e)?d=e:Y(e[c])?d=e[c]:Y(e["default"])&&(d=e["default"]));h.cancel(M);d?M=h(function(){m.$commitViewValue()},d):l.$$phase?m.$commitViewValue():a.$apply(function(){m.$commitViewValue()})};a.$watch(function(){var c=u(a);if(c!==m.$modelValue){m.$modelValue=m.$$rawModelValue=c;v=t;for(var d=
	m.$formatters,e=d.length,f=c;e--;)f=d[e](f);m.$viewValue!==f&&(m.$viewValue=m.$$lastCommittedViewValue=f,m.$render(),m.$$runValidators(c,f,E))}return c})}],ve=["$rootScope",function(a){return{restrict:"A",require:["ngModel","^?form","^?ngModelOptions"],controller:eg,priority:1,compile:function(c){c.addClass(Ra).addClass("ng-untouched").addClass(lb);return{pre:function(a,c,f,g){var h=g[0],l=g[1]||Kb;h.$$setOptions(g[2]&&g[2].$options);l.$addControl(h);f.$observe("name",function(a){h.$name!==a&&l.$$renameControl(h,
	a)});a.$on("$destroy",function(){l.$removeControl(h)})},post:function(c,e,f,g){var h=g[0];if(h.$options&&h.$options.updateOn)e.on(h.$options.updateOn,function(a){h.$$debounceViewValueCommit(a&&a.type)});e.on("blur",function(e){h.$touched||(a.$$phase?c.$evalAsync(h.$setTouched):c.$apply(h.$setTouched))})}}}}}],fg=/(\s+|^)default(\s+|$)/,ze=function(){return{restrict:"A",controller:["$scope","$attrs",function(a,c){var d=this;this.$options=a.$eval(c.ngModelOptions);this.$options.updateOn!==t?(this.$options.updateOnDefault=
	!1,this.$options.updateOn=N(this.$options.updateOn.replace(fg,function(){d.$options.updateOnDefault=!0;return" "}))):this.$options.updateOnDefault=!0}]}},le=Ia({terminal:!0,priority:1E3}),me=["$locale","$interpolate",function(a,c){var d=/{}/g,e=/^when(Minus)?(.+)$/;return{restrict:"EA",link:function(f,g,h){function l(a){g.text(a||"")}var k=h.count,n=h.$attr.when&&g.attr(h.$attr.when),p=h.offset||0,q=f.$eval(n)||{},u={},n=c.startSymbol(),s=c.endSymbol(),t=n+k+"-"+p+s,v=ca.noop,m;r(h,function(a,c){var d=
	e.exec(c);d&&(d=(d[1]?"-":"")+z(d[2]),q[d]=g.attr(h.$attr[c]))});r(q,function(a,e){u[e]=c(a.replace(d,t))});f.$watch(k,function(c){c=parseFloat(c);var d=isNaN(c);d||c in q||(c=a.pluralCat(c-p));c===m||d&&isNaN(m)||(v(),v=f.$watch(u[c],l),m=c)})}}}],ne=["$parse","$animate",function(a,c){var d=R("ngRepeat"),e=function(a,c,d,e,k,n,p){a[d]=e;k&&(a[k]=n);a.$index=c;a.$first=0===c;a.$last=c===p-1;a.$middle=!(a.$first||a.$last);a.$odd=!(a.$even=0===(c&1))};return{restrict:"A",multiElement:!0,transclude:"element",
	priority:1E3,terminal:!0,$$tlb:!0,compile:function(f,g){var h=g.ngRepeat,l=W.createComment(" end ngRepeat: "+h+" "),k=h.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/);if(!k)throw d("iexp",h);var n=k[1],p=k[2],q=k[3],u=k[4],k=n.match(/^(?:(\s*[\$\w]+)|\(\s*([\$\w]+)\s*,\s*([\$\w]+)\s*\))$/);if(!k)throw d("iidexp",n);var s=k[3]||k[1],y=k[2];if(q&&(!/^[$a-zA-Z_][$a-zA-Z0-9_]*$/.test(q)||/^(null|undefined|this|\$index|\$first|\$middle|\$last|\$even|\$odd|\$parent|\$root|\$id)$/.test(q)))throw d("badident",
	q);var v,m,w,x,E={$id:Ma};u?v=a(u):(w=function(a,c){return Ma(c)},x=function(a){return a});return function(a,f,g,k,n){v&&(m=function(c,d,e){y&&(E[y]=c);E[s]=d;E.$index=e;return v(a,E)});var u=ia();a.$watchCollection(p,function(g){var k,p,v=f[0],D,E=ia(),G,H,L,S,J,C,z;q&&(a[q]=g);if(Sa(g))J=g,p=m||w;else{p=m||x;J=[];for(z in g)g.hasOwnProperty(z)&&"$"!=z.charAt(0)&&J.push(z);J.sort()}G=J.length;z=Array(G);for(k=0;k<G;k++)if(H=g===J?k:J[k],L=g[H],S=p(H,L,k),u[S])C=u[S],delete u[S],E[S]=C,z[k]=C;else{if(E[S])throw r(z,
	function(a){a&&a.scope&&(u[a.id]=a)}),d("dupes",h,S,L);z[k]={id:S,scope:t,clone:t};E[S]=!0}for(D in u){C=u[D];S=tb(C.clone);c.leave(S);if(S[0].parentNode)for(k=0,p=S.length;k<p;k++)S[k].$$NG_REMOVED=!0;C.scope.$destroy()}for(k=0;k<G;k++)if(H=g===J?k:J[k],L=g[H],C=z[k],C.scope){D=v;do D=D.nextSibling;while(D&&D.$$NG_REMOVED);C.clone[0]!=D&&c.move(tb(C.clone),null,A(v));v=C.clone[C.clone.length-1];e(C.scope,k,s,L,y,H,G)}else n(function(a,d){C.scope=d;var f=l.cloneNode(!1);a[a.length++]=f;c.enter(a,
	null,A(v));v=f;C.clone=a;E[C.id]=C;e(C.scope,k,s,L,y,H,G)});u=E})}}}}],oe=["$animate",function(a){return{restrict:"A",multiElement:!0,link:function(c,d,e){c.$watch(e.ngShow,function(c){a[c?"removeClass":"addClass"](d,"ng-hide",{tempClasses:"ng-hide-animate"})})}}}],he=["$animate",function(a){return{restrict:"A",multiElement:!0,link:function(c,d,e){c.$watch(e.ngHide,function(c){a[c?"addClass":"removeClass"](d,"ng-hide",{tempClasses:"ng-hide-animate"})})}}}],pe=Ia(function(a,c,d){a.$watchCollection(d.ngStyle,
	function(a,d){d&&a!==d&&r(d,function(a,d){c.css(d,"")});a&&c.css(a)})}),qe=["$animate",function(a){return{restrict:"EA",require:"ngSwitch",controller:["$scope",function(){this.cases={}}],link:function(c,d,e,f){var g=[],h=[],l=[],k=[],n=function(a,c){return function(){a.splice(c,1)}};c.$watch(e.ngSwitch||e.on,function(c){var d,e;d=0;for(e=l.length;d<e;++d)a.cancel(l[d]);d=l.length=0;for(e=k.length;d<e;++d){var s=tb(h[d].clone);k[d].$destroy();(l[d]=a.leave(s)).then(n(l,d))}h.length=0;k.length=0;(g=
	f.cases["!"+c]||f.cases["?"])&&r(g,function(c){c.transclude(function(d,e){k.push(e);var f=c.element;d[d.length++]=W.createComment(" end ngSwitchWhen: ");h.push({clone:d});a.enter(d,f.parent(),f)})})})}}}],re=Ia({transclude:"element",priority:1200,require:"^ngSwitch",multiElement:!0,link:function(a,c,d,e,f){e.cases["!"+d.ngSwitchWhen]=e.cases["!"+d.ngSwitchWhen]||[];e.cases["!"+d.ngSwitchWhen].push({transclude:f,element:c})}}),se=Ia({transclude:"element",priority:1200,require:"^ngSwitch",multiElement:!0,
	link:function(a,c,d,e,f){e.cases["?"]=e.cases["?"]||[];e.cases["?"].push({transclude:f,element:c})}}),ue=Ia({restrict:"EAC",link:function(a,c,d,e,f){if(!f)throw R("ngTransclude")("orphan",wa(c));f(function(a){c.empty();c.append(a)})}}),Vd=["$templateCache",function(a){return{restrict:"E",terminal:!0,compile:function(c,d){"text/ng-template"==d.type&&a.put(d.id,c[0].text)}}}],gg=R("ngOptions"),te=ea({restrict:"A",terminal:!0}),Wd=["$compile","$parse",function(a,c){var d=/^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+group\s+by\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?$/,
	e={$setViewValue:E};return{restrict:"E",require:["select","?ngModel"],controller:["$element","$scope","$attrs",function(a,c,d){var l=this,k={},n=e,p;l.databound=d.ngModel;l.init=function(a,c,d){n=a;p=d};l.addOption=function(c,d){La(c,'"option value"');k[c]=!0;n.$viewValue==c&&(a.val(c),p.parent()&&p.remove());d&&d[0].hasAttribute("selected")&&(d[0].selected=!0)};l.removeOption=function(a){this.hasOption(a)&&(delete k[a],n.$viewValue===a&&this.renderUnknownOption(a))};l.renderUnknownOption=function(c){c=
	"? "+Ma(c)+" ?";p.val(c);a.prepend(p);a.val(c);p.prop("selected",!0)};l.hasOption=function(a){return k.hasOwnProperty(a)};c.$on("$destroy",function(){l.renderUnknownOption=E})}],link:function(e,g,h,l){function k(a,c,d,e){d.$render=function(){var a=d.$viewValue;e.hasOption(a)?(C.parent()&&C.remove(),c.val(a),""===a&&v.prop("selected",!0)):x(a)&&v?c.val(""):e.renderUnknownOption(a)};c.on("change",function(){a.$apply(function(){C.parent()&&C.remove();d.$setViewValue(c.val())})})}function n(a,c,d){var e;
	d.$render=function(){var a=new eb(d.$viewValue);r(c.find("option"),function(c){c.selected=y(a.get(c.value))})};a.$watch(function(){ha(e,d.$viewValue)||(e=sa(d.$viewValue),d.$render())});c.on("change",function(){a.$apply(function(){var a=[];r(c.find("option"),function(c){c.selected&&a.push(c.value)});d.$setViewValue(a)})})}function p(e,f,g){function h(a,c,d){T[x]=d;G&&(T[G]=c);return a(e,T)}function k(a){var c;if(u)if(I&&H(a)){c=new eb([]);for(var d=0;d<a.length;d++)c.put(h(I,null,a[d]),!0)}else c=
	new eb(a);else I&&(a=h(I,null,a));return function(d,e){var f;f=I?I:B?B:z;return u?y(c.remove(h(f,d,e))):a===h(f,d,e)}}function l(){m||(e.$$postDigest(p),m=!0)}function n(a,c,d){a[c]=a[c]||0;a[c]+=d?1:-1}function p(){m=!1;var a={"":[]},c=[""],d,l,s,t,v;s=g.$viewValue;t=L(e)||[];var B=G?Object.keys(t).sort():t,x,A,H,z,O={};v=k(s);var N=!1,U,W;Q={};for(z=0;H=B.length,z<H;z++){x=z;if(G&&(x=B[z],"$"===x.charAt(0)))continue;A=t[x];d=h(J,x,A)||"";(l=a[d])||(l=a[d]=[],c.push(d));d=v(x,A);N=N||d;A=h(C,x,A);
	A=y(A)?A:"";W=I?I(e,T):G?B[z]:z;I&&(Q[W]=x);l.push({id:W,label:A,selected:d})}u||(w||null===s?a[""].unshift({id:"",label:"",selected:!N}):N||a[""].unshift({id:"?",label:"",selected:!0}));x=0;for(B=c.length;x<B;x++){d=c[x];l=a[d];R.length<=x?(s={element:E.clone().attr("label",d),label:l.label},t=[s],R.push(t),f.append(s.element)):(t=R[x],s=t[0],s.label!=d&&s.element.attr("label",s.label=d));N=null;z=0;for(H=l.length;z<H;z++)d=l[z],(v=t[z+1])?(N=v.element,v.label!==d.label&&(n(O,v.label,!1),n(O,d.label,
	!0),N.text(v.label=d.label),N.prop("label",v.label)),v.id!==d.id&&N.val(v.id=d.id),N[0].selected!==d.selected&&(N.prop("selected",v.selected=d.selected),Qa&&N.prop("selected",v.selected))):(""===d.id&&w?U=w:(U=F.clone()).val(d.id).prop("selected",d.selected).attr("selected",d.selected).prop("label",d.label).text(d.label),t.push(v={element:U,label:d.label,id:d.id,selected:d.selected}),n(O,d.label,!0),N?N.after(U):s.element.append(U),N=U);for(z++;t.length>z;)d=t.pop(),n(O,d.label,!1),d.element.remove()}for(;R.length>
	x;){l=R.pop();for(z=1;z<l.length;++z)n(O,l[z].label,!1);l[0].element.remove()}r(O,function(a,c){0<a?q.addOption(c):0>a&&q.removeOption(c)})}var v;if(!(v=s.match(d)))throw gg("iexp",s,wa(f));var C=c(v[2]||v[1]),x=v[4]||v[6],A=/ as /.test(v[0])&&v[1],B=A?c(A):null,G=v[5],J=c(v[3]||""),z=c(v[2]?v[1]:x),L=c(v[7]),I=v[8]?c(v[8]):null,Q={},R=[[{element:f,label:""}]],T={};w&&(a(w)(e),w.removeClass("ng-scope"),w.remove());f.empty();f.on("change",function(){e.$apply(function(){var a=L(e)||[],c;if(u)c=[],r(f.val(),
	function(d){d=I?Q[d]:d;c.push("?"===d?t:""===d?null:h(B?B:z,d,a[d]))});else{var d=I?Q[f.val()]:f.val();c="?"===d?t:""===d?null:h(B?B:z,d,a[d])}g.$setViewValue(c);p()})});g.$render=p;e.$watchCollection(L,l);e.$watchCollection(function(){var a=L(e),c;if(a&&H(a)){c=Array(a.length);for(var d=0,f=a.length;d<f;d++)c[d]=h(C,d,a[d])}else if(a)for(d in c={},a)a.hasOwnProperty(d)&&(c[d]=h(C,d,a[d]));return c},l);u&&e.$watchCollection(function(){return g.$modelValue},l)}if(l[1]){var q=l[0];l=l[1];var u=h.multiple,
	s=h.ngOptions,w=!1,v,m=!1,F=A(W.createElement("option")),E=A(W.createElement("optgroup")),C=F.clone();h=0;for(var B=g.children(),G=B.length;h<G;h++)if(""===B[h].value){v=w=B.eq(h);break}q.init(l,w,C);u&&(l.$isEmpty=function(a){return!a||0===a.length});s?p(e,g,l):u?n(e,g,l):k(e,g,l,q)}}}}],Yd=["$interpolate",function(a){var c={addOption:E,removeOption:E};return{restrict:"E",priority:100,compile:function(d,e){if(x(e.value)){var f=a(d.text(),!0);f||e.$set("value",d.text())}return function(a,d,e){var k=
	d.parent(),n=k.data("$selectController")||k.parent().data("$selectController");n&&n.databound||(n=c);f?a.$watch(f,function(a,c){e.$set("value",a);c!==a&&n.removeOption(c);n.addOption(a,d)}):n.addOption(e.value,d);d.on("$destroy",function(){n.removeOption(e.value)})}}}}],Xd=ea({restrict:"E",terminal:!1}),Bc=function(){return{restrict:"A",require:"?ngModel",link:function(a,c,d,e){e&&(d.required=!0,e.$validators.required=function(a,c){return!d.required||!e.$isEmpty(c)},d.$observe("required",function(){e.$validate()}))}}},
	Ac=function(){return{restrict:"A",require:"?ngModel",link:function(a,c,d,e){if(e){var f,g=d.ngPattern||d.pattern;d.$observe("pattern",function(a){C(a)&&0<a.length&&(a=new RegExp("^"+a+"$"));if(a&&!a.test)throw R("ngPattern")("noregexp",g,a,wa(c));f=a||t;e.$validate()});e.$validators.pattern=function(a){return e.$isEmpty(a)||x(f)||f.test(a)}}}}},Dc=function(){return{restrict:"A",require:"?ngModel",link:function(a,c,d,e){if(e){var f=-1;d.$observe("maxlength",function(a){a=aa(a);f=isNaN(a)?-1:a;e.$validate()});
	e.$validators.maxlength=function(a,c){return 0>f||e.$isEmpty(c)||c.length<=f}}}}},Cc=function(){return{restrict:"A",require:"?ngModel",link:function(a,c,d,e){if(e){var f=0;d.$observe("minlength",function(a){f=aa(a)||0;e.$validate()});e.$validators.minlength=function(a,c){return e.$isEmpty(c)||c.length>=f}}}}};Q.angular.bootstrap?console.log("WARNING: Tried to load angular more than once."):(Nd(),Pd(ca),A(W).ready(function(){Jd(W,uc)}))})(window,document);!window.angular.$$csp()&&window.angular.element(document).find("head").prepend('<style type="text/css">@charset "UTF-8";[ng\\:cloak],[ng-cloak],[data-ng-cloak],[x-ng-cloak],.ng-cloak,.x-ng-cloak,.ng-hide:not(.ng-hide-animate){display:none !important;}ng\\:form{display:block;}</style>');
	//# sourceMappingURL=angular.min.js.map


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/*! 3.2.4 */
	!function(){function a(a,b){window.XMLHttpRequest.prototype[a]=b(window.XMLHttpRequest.prototype[a])}function b(a,b,c,d,g,h){function j(){return"input"===b[0].tagName.toLowerCase()&&b.attr("type")&&"file"===b.attr("type").toLowerCase()}function k(b){if(!p){p=!0;try{var j=b.__files_||b.target&&b.target.files,k=[],l=[],m=g(c.ngAccept);for(i=0;i<j.length;i++){var n=j.item(i);f(a,m,n,b)?k.push(n):l.push(n)}e(g,h,a,d,c,c.ngFileChange||c.ngFileSelect,k,l,b),0==k.length&&(b.target.value=k),b.target&&b.target.getAttribute("__ngf_gen__")&&angular.element(b.target).remove()}finally{p=!1}}}function l(b){c.ngMultiple&&b.attr("multiple",g(c.ngMultiple)(a)),c.accept&&b.attr("accept",c.accept),c.ngCapture&&b.attr("capture",g(c.ngCapture)(a)),c.ngDisabled&&b.attr("disabled",g(c.ngDisabled)(a)),b.bind("change",k)}function m(){if(!b.attr("disabled")){for(var a=angular.element('<input type="file">'),c=0;c<b[0].attributes.length;c++){var d=b[0].attributes[c];a.attr(d.name,d.value)}return j()?(b.replaceWith(a),b=a):(a.css("width","0px").css("height","0px").css("position","absolute").css("padding",0).css("margin",0).css("overflow","hidden").attr("tabindex","-1").css("opacity",0).attr("__ngf_gen__",!0),b.__ngf_ref_elem__&&b.__ngf_ref_elem__.remove(),b.__ngf_ref_elem__=a,b.parent()[0].insertBefore(a[0],b[0]),b.css("overflow","hidden")),l(a),a}}function n(b){e(g,h,a,d,c,c.ngFileChange||c.ngFileSelect,[],[],b,!0)}function o(a){var c=m(a);c&&(n(a),c[0].click()),j()&&(b.bind("click",o),a.preventDefault())}var p=!1;window.FileAPI&&window.FileAPI.ngfFixIE?window.FileAPI.ngfFixIE(b,m,k,n):b.bind("click",o)}function c(a,b,c,g,h,j,k){function l(a,b,c){var d=!0,e=c.dataTransfer.items;if(null!=e)for(i=0;i<e.length&&d;i++)d=d&&("file"==e[i].kind||""==e[i].kind)&&f(a,s,e[i],c);var g=h(b.dragOverClass)(a,{$event:c});return g&&(g.delay&&(r=g.delay),g.accept&&(g=d?g.accept:g.reject)),g||b.dragOverClass||"dragover"}function m(b,c,d,e){function g(c){f(a,s,c,b)?l.push(c):m.push(c)}function h(a,b,c){if(null!=b)if(b.isDirectory){var d=(c||"")+b.name;g({name:b.name,type:"directory",path:d});var e=b.createReader(),f=[];o++;var j=function(){e.readEntries(function(d){try{if(d.length)f=f.concat(Array.prototype.slice.call(d||[],0)),j();else{for(i=0;i<f.length;i++)h(a,f[i],(c?c:"")+b.name+"/");o--}}catch(e){o--,console.error(e)}},function(){o--})};j()}else o++,b.file(function(a){try{o--,a.path=(c?c:"")+a.name,g(a)}catch(b){o--,console.error(b)}},function(){o--})}var l=[],m=[],n=b.dataTransfer.items,o=0;if(n&&n.length>0&&"file"!=k.protocol())for(i=0;i<n.length;i++){if(n[i].webkitGetAsEntry&&n[i].webkitGetAsEntry()&&n[i].webkitGetAsEntry().isDirectory){var p=n[i].webkitGetAsEntry();if(p.isDirectory&&!d)continue;null!=p&&h(l,p)}else{var q=n[i].getAsFile();null!=q&&g(q)}if(!e&&l.length>0)break}else{var r=b.dataTransfer.files;if(null!=r)for(i=0;i<r.length&&(g(r.item(i)),e||!(l.length>0));i++);}var t=0;!function u(a){j(function(){if(o)10*t++<2e4&&u(10);else{if(!e&&l.length>1){for(i=0;"directory"==l[i].type;)i++;l=[l[i]]}c(l,m)}},a||0)}()}var n=d();if(c.dropAvailable&&j(function(){a.dropAvailable?a.dropAvailable.value=n:a.dropAvailable=n}),!n)return 1==h(c.hideOnDropNotAvailable)(a)&&b.css("display","none"),void 0;var o,p=null,q=h(c.stopPropagation),r=1,s=h(c.ngAccept),t=h(c.ngDisabled);b[0].addEventListener("dragover",function(d){if(!t(a)){if(d.preventDefault(),q(a)&&d.stopPropagation(),navigator.userAgent.indexOf("Chrome")>-1){var e=d.dataTransfer.effectAllowed;d.dataTransfer.dropEffect="move"===e||"linkMove"===e?"move":"copy"}j.cancel(p),a.actualDragOverClass||(o=l(a,c,d)),b.addClass(o)}},!1),b[0].addEventListener("dragenter",function(b){t(a)||(b.preventDefault(),q(a)&&b.stopPropagation())},!1),b[0].addEventListener("dragleave",function(){t(a)||(p=j(function(){b.removeClass(o),o=null},r||1))},!1),b[0].addEventListener("drop",function(d){t(a)||(d.preventDefault(),q(a)&&d.stopPropagation(),b.removeClass(o),o=null,m(d,function(b,f){e(h,j,a,g,c,c.ngFileChange||c.ngFileDrop,b,f,d)},0!=h(c.allowDir)(a),c.multiple||h(c.ngMultiple)(a)))},!1)}function d(){var a=document.createElement("div");return"draggable"in a&&"ondrop"in a}function e(a,b,c,d,e,f,g,h,i,j){function k(){d&&(a(e.ngModel).assign(c,g),b(function(){d&&d.$setViewValue(null!=g&&0==g.length?null:g)})),e.ngModelRejected&&a(e.ngModelRejected).assign(c,h),f&&a(f)(c,{$files:g,$rejectedFiles:h,$event:i})}j?k():b(function(){k()})}function f(a,b,c,d){var e=b(a,{$file:c,$event:d});if(null==e)return!0;if(angular.isString(e)){var f=new RegExp(g(e),"gi");e=null!=c.type&&c.type.match(f)||null!=c.name&&c.name.match(f)}return e}function g(a){if(a.length>2&&"/"===a[0]&&"/"===a[a.length-1])return a.substring(1,a.length-1);var b=a.split(","),c="";if(b.length>1)for(i=0;i<b.length;i++)c+="("+g(b[i])+")",i<b.length-1&&(c+="|");else 0==a.indexOf(".")&&(a="*"+a),c="^"+a.replace(new RegExp("[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\-]","g"),"\\$&")+"$",c=c.replace(/\\\*/g,".*").replace(/\\\?/g,".");return c}var h,i;window.XMLHttpRequest&&!window.XMLHttpRequest.__isFileAPIShim&&a("setRequestHeader",function(a){return function(b,c){if("__setXHR_"===b){var d=c(this);d instanceof Function&&d(this)}else a.apply(this,arguments)}});var j=angular.module("angularFileUpload",[]);j.version="3.2.4",j.service("$upload",["$http","$q","$timeout",function(a,b,c){function d(d){d.method=d.method||"POST",d.headers=d.headers||{},d.transformRequest=d.transformRequest||function(b,c){return window.ArrayBuffer&&b instanceof window.ArrayBuffer?b:a.defaults.transformRequest[0](b,c)};var e=b.defer(),f=e.promise;return d.headers.__setXHR_=function(){return function(a){a&&(d.__XHR=a,d.xhrFn&&d.xhrFn(a),a.upload.addEventListener("progress",function(a){a.config=d,e.notify?e.notify(a):f.progress_fn&&c(function(){f.progress_fn(a)})},!1),a.upload.addEventListener("load",function(a){a.lengthComputable&&(a.config=d,e.notify?e.notify(a):f.progress_fn&&c(function(){f.progress_fn(a)}))},!1))}},a(d).then(function(a){e.resolve(a)},function(a){e.reject(a)},function(a){e.notify(a)}),f.success=function(a){return f.then(function(b){a(b.data,b.status,b.headers,d)}),f},f.error=function(a){return f.then(null,function(b){a(b.data,b.status,b.headers,d)}),f},f.progress=function(a){return f.progress_fn=a,f.then(null,null,function(b){a(b)}),f},f.abort=function(){return d.__XHR&&c(function(){d.__XHR.abort()}),f},f.xhr=function(a){return d.xhrFn=function(b){return function(){b&&b.apply(f,arguments),a.apply(f,arguments)}}(d.xhrFn),f},f}this.upload=function(a){return a.headers=a.headers||{},a.headers["Content-Type"]=void 0,a.transformRequest=a.transformRequest?"[object Array]"===Object.prototype.toString.call(a.transformRequest)?a.transformRequest:[a.transformRequest]:[],a.transformRequest.push(function(b){var c=new FormData,d={};for(h in a.fields)a.fields.hasOwnProperty(h)&&(d[h]=a.fields[h]);if(b&&(d.data=b),a.formDataAppender)for(h in d)d.hasOwnProperty(h)&&a.formDataAppender(c,h,d[h]);else for(h in d)if(d.hasOwnProperty(h)){var e=d[h];void 0!==e&&("[object String]"===Object.prototype.toString.call(e)?c.append(h,e):a.sendObjectsAsJsonBlob&&"object"==typeof e?c.append(h,new Blob([e],{type:"application/json"})):c.append(h,JSON.stringify(e)))}if(null!=a.file){var f=a.fileFormDataName||"file";if("[object Array]"===Object.prototype.toString.call(a.file)){var g="[object String]"===Object.prototype.toString.call(f);for(i=0;i<a.file.length;i++)c.append(g?f:f[i],a.file[i],a.fileName&&a.fileName[i]||a.file[i].name)}else c.append(f,a.file,a.fileName||a.file.name)}return c}),d(a)},this.http=function(a){return d(a)}}]),j.directive("ngFileSelect",["$parse","$timeout","$compile",function(a,c,d){return{restrict:"AEC",require:"?ngModel",link:function(e,f,g,h){b(e,f,g,h,a,c,d)}}}]),j.directive("ngFileDrop",["$parse","$timeout","$location",function(a,b,d){return{restrict:"AEC",require:"?ngModel",link:function(e,f,g,h){c(e,f,g,h,a,b,d)}}}]),j.directive("ngNoFileDrop",function(){return function(a,b){d()&&b.css("display","none")}}),j.directive("ngFileDropAvailable",["$parse","$timeout",function(a,b){return function(c,e,f){if(d()){var g=a(f.ngFileDropAvailable);b(function(){g(c)})}}}]);var k=angular.module("ngFileUpload",[]);for(h in j)j.hasOwnProperty(h)&&(k[h]=j[h])}(),function(){function a(a,b){window.XMLHttpRequest.prototype[a]=b(window.XMLHttpRequest.prototype[a])}function b(a,b,c){try{Object.defineProperty(a,b,{get:c})}catch(d){}}function c(a){return"input"===a[0].tagName.toLowerCase()&&a.attr("type")&&"file"===a.attr("type").toLowerCase()}var d=function(){try{var a=new ActiveXObject("ShockwaveFlash.ShockwaveFlash");if(a)return!0}catch(b){if(void 0!=navigator.mimeTypes["application/x-shockwave-flash"])return!0}return!1};if(window.XMLHttpRequest&&!window.FormData||window.FileAPI&&FileAPI.forceLoad){var e=function(a){if(!a.__listeners){a.upload||(a.upload={}),a.__listeners=[];var b=a.upload.addEventListener;a.upload.addEventListener=function(c,d){a.__listeners[c]=d,b&&b.apply(this,arguments)}}};a("open",function(a){return function(b,c,d){e(this),this.__url=c;try{a.apply(this,[b,c,d])}catch(f){f.message.indexOf("Access is denied")>-1&&(this.__origError=f,a.apply(this,[b,"_fix_for_ie_crossdomain__",d]))}}}),a("getResponseHeader",function(a){return function(b){return this.__fileApiXHR&&this.__fileApiXHR.getResponseHeader?this.__fileApiXHR.getResponseHeader(b):null==a?null:a.apply(this,[b])}}),a("getAllResponseHeaders",function(a){return function(){return this.__fileApiXHR&&this.__fileApiXHR.getAllResponseHeaders?this.__fileApiXHR.getAllResponseHeaders():null==a?null:a.apply(this)}}),a("abort",function(a){return function(){return this.__fileApiXHR&&this.__fileApiXHR.abort?this.__fileApiXHR.abort():null==a?null:a.apply(this)}}),a("setRequestHeader",function(a){return function(b,c){if("__setXHR_"===b){e(this);var d=c(this);d instanceof Function&&d(this)}else this.__requestHeaders=this.__requestHeaders||{},this.__requestHeaders[b]=c,a.apply(this,arguments)}}),a("send",function(a){return function(){var c=this;if(arguments[0]&&arguments[0].__isFileAPIShim){var e=arguments[0],f={url:c.__url,jsonp:!1,cache:!0,complete:function(a,d){c.__completed=!0,!a&&c.__listeners.load&&c.__listeners.load({type:"load",loaded:c.__loaded,total:c.__total,target:c,lengthComputable:!0}),!a&&c.__listeners.loadend&&c.__listeners.loadend({type:"loadend",loaded:c.__loaded,total:c.__total,target:c,lengthComputable:!0}),"abort"===a&&c.__listeners.abort&&c.__listeners.abort({type:"abort",loaded:c.__loaded,total:c.__total,target:c,lengthComputable:!0}),void 0!==d.status&&b(c,"status",function(){return 0==d.status&&a&&"abort"!==a?500:d.status}),void 0!==d.statusText&&b(c,"statusText",function(){return d.statusText}),b(c,"readyState",function(){return 4}),void 0!==d.response&&b(c,"response",function(){return d.response});var e=d.responseText||(a&&0==d.status&&"abort"!==a?a:void 0);b(c,"responseText",function(){return e}),b(c,"response",function(){return e}),a&&b(c,"err",function(){return a}),c.__fileApiXHR=d,c.onreadystatechange&&c.onreadystatechange(),c.onload&&c.onload()},fileprogress:function(a){if(a.target=c,c.__listeners.progress&&c.__listeners.progress(a),c.__total=a.total,c.__loaded=a.loaded,a.total===a.loaded){var b=this;setTimeout(function(){c.__completed||(c.getAllResponseHeaders=function(){},b.complete(null,{status:204,statusText:"No Content"}))},FileAPI.noContentTimeout||1e4)}},headers:c.__requestHeaders};f.data={},f.files={};for(var g=0;g<e.data.length;g++){var h=e.data[g];null!=h.val&&null!=h.val.name&&null!=h.val.size&&null!=h.val.type?f.files[h.key]=h.val:f.data[h.key]=h.val}setTimeout(function(){if(!d())throw'Adode Flash Player need to be installed. To check ahead use "FileAPI.hasFlash"';c.__fileApiXHR=FileAPI.upload(f)},1)}else{if(this.__origError)throw this.__origError;a.apply(c,arguments)}}}),window.XMLHttpRequest.__isFileAPIShim=!0,FileAPI.ngfFixIE=function(a,b,e){if(!d())throw'Adode Flash Player need to be installed. To check ahead use "FileAPI.hasFlash"';var f=function(){if(a.attr("disabled"))a.__ngf_elem__.removeClass("js-fileapi-wrapper");else{var d=a.__ngf_elem__=b();d.addClass("js-fileapi-wrapper"),c(a)||((""===d.parent().css("position")||"static"===d.parent().css("position"))&&d.parent().css("position","relative"),d.css("position","absolute").css("top",a[0].offsetTop+"px").css("left",a[0].offsetLeft+"px").css("width",a[0].offsetWidth+"px").css("height",a[0].offsetHeight+"px").css("padding",a.css("padding")).css("margin",a.css("margin")).css("filter","alpha(opacity=0)"),d.css("z-index","1000")),setTimeout(function(){d.bind("mouseenter",f)},10),d.unbind("change"),d.bind("change",function(a){g.apply(this,[a]),e.apply(this,[a])})}};a.bind("mouseenter",f);var g=function(a){for(var b=FileAPI.getFiles(a),c=0;c<b.length;c++)void 0===b[c].size&&(b[c].size=0),void 0===b[c].name&&(b[c].name="file"),void 0===b[c].type&&(b[c].type="undefined");a.target||(a.target={}),a.target.files=b,a.target.files!=b&&(a.__files_=b),(a.__files_||a.target.files).item=function(b){return(a.__files_||a.target.files)[b]||null}}},window.FormData=FormData=function(){return{append:function(a,b,c){b.__isFileAPIBlobShim&&(b=b.data[0]),this.data.push({key:a,val:b,name:c})},data:[],__isFileAPIShim:!0}},window.Blob=Blob=function(a){return{data:a,__isFileAPIBlobShim:!0}},function(){if(window.FileAPI||(window.FileAPI={}),FileAPI.forceLoad&&(FileAPI.html5=!1),!FileAPI.upload){var a,b,c,e,f,g=document.createElement("script"),h=document.getElementsByTagName("script");if(window.FileAPI.jsUrl)a=window.FileAPI.jsUrl;else if(window.FileAPI.jsPath)b=window.FileAPI.jsPath;else for(c=0;c<h.length;c++)if(f=h[c].src,e=f.search(/\/angular\-file\-upload[\-a-zA-z0-9\.]*\.js/),e>-1){b=f.substring(0,e+1);break}null==FileAPI.staticPath&&(FileAPI.staticPath=b),g.setAttribute("src",a||b+"FileAPI.min.js"),document.getElementsByTagName("head")[0].appendChild(g),FileAPI.hasFlash=d()}}(),FileAPI.disableFileInput=function(a,b){b?a.removeClass("js-fileapi-wrapper"):a.addClass("js-fileapi-wrapper")}}window.FileReader||(window.FileReader=function(){var a=this,b=!1;this.listeners={},this.addEventListener=function(b,c){a.listeners[b]=a.listeners[b]||[],a.listeners[b].push(c)},this.removeEventListener=function(b,c){a.listeners[b]&&a.listeners[b].splice(a.listeners[b].indexOf(c),1)},this.dispatchEvent=function(b){var c=a.listeners[b.type];if(c)for(var d=0;d<c.length;d++)c[d].call(a,b)},this.onabort=this.onerror=this.onload=this.onloadstart=this.onloadend=this.onprogress=null;var c=function(b,c){var d={type:b,target:a,loaded:c.loaded,total:c.total,error:c.error};return null!=c.result&&(d.target.result=c.result),d},d=function(d){if(b||(b=!0,a.onloadstart&&a.onloadstart(c("loadstart",d))),"load"===d.type){a.onloadend&&a.onloadend(c("loadend",d));var e=c("load",d);a.onload&&a.onload(e),a.dispatchEvent(e)}else if("progress"===d.type){var e=c("progress",d);a.onprogress&&a.onprogress(e),a.dispatchEvent(e)}else{var e=c("error",d);a.onerror&&a.onerror(e),a.dispatchEvent(e)}};this.readAsArrayBuffer=function(a){FileAPI.readAsBinaryString(a,d)},this.readAsBinaryString=function(a){FileAPI.readAsBinaryString(a,d)},this.readAsDataURL=function(a){FileAPI.readAsDataURL(a,d)},this.readAsText=function(a){FileAPI.readAsText(a,d)}})}();

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
	  //builds a function which, when called, returns val. Useful for angular's $scope.$watch() and building angular's factories.
	  retFn:function(val){
	    return function (){return val;};
	  }
	};


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/***
	 *
	 * Caution!!! There be dragons ahead!!!!!
	 *
	 socket.io has been modified to play nice with webpack etc.
	 *
	 *
	 * */
	var io;
	!function (e) {
	  io = e();
	}(function () {
	  var define, module, exports;
	  return function e(t, n, r) {
	    function s(o, u) {
	      if (!n[o]) {
	        if (!t[o]) {
	          var a = typeof require == "function" && require;
	          if (!u && a)return a(o, !0);
	          if (i)return i(o, !0);
	          throw new Error("Cannot find module '" + o + "'")
	        }
	        var f = n[o] = {exports: {}};
	        t[o][0].call(f.exports, function (e) {
	          var n = t[o][1][e];
	          return s(n ? n : e)
	        }, f, f.exports, e, t, n, r)
	      }
	      return n[o].exports
	    }

	    var i = typeof require == "function" && require;
	    for (var o = 0; o < r.length; o++)s(r[o]);
	    return s
	  }({
	    1: [function (_dereq_, module, exports) {
	      module.exports = _dereq_("./lib/")
	    }, {"./lib/": 2}],
	    2: [function (_dereq_, module, exports) {
	      var url = _dereq_("./url");
	      var parser = _dereq_("socket.io-parser");
	      var Manager = _dereq_("./manager");
	      var debug = _dereq_("debug")("socket.io-client");
	      module.exports = exports = lookup;
	      var cache = exports.managers = {};

	      function lookup(uri, opts) {
	        if (typeof uri == "object") {
	          opts = uri;
	          uri = undefined
	        }
	        opts = opts || {};
	        var parsed = url(uri);
	        var source = parsed.source;
	        var id = parsed.id;
	        var io;
	        if (opts.forceNew || opts["force new connection"] || false === opts.multiplex) {
	          debug("ignoring socket cache for %s", source);
	          io = Manager(source, opts)
	        } else {
	          if (!cache[id]) {
	            debug("new io instance for %s", source);
	            cache[id] = Manager(source, opts)
	          }
	          io = cache[id]
	        }
	        return io.socket(parsed.path)
	      }

	      exports.protocol = parser.protocol;
	      exports.connect = lookup;
	      exports.Manager = _dereq_("./manager");
	      exports.Socket = _dereq_("./socket")
	    }, {"./manager": 3, "./socket": 5, "./url": 6, debug: 9, "socket.io-parser": 43}],
	    3: [function (_dereq_, module, exports) {
	      var url = _dereq_("./url");
	      var eio = _dereq_("engine.io-client");
	      var Socket = _dereq_("./socket");
	      var Emitter = _dereq_("component-emitter");
	      var parser = _dereq_("socket.io-parser");
	      var on = _dereq_("./on");
	      var bind = _dereq_("component-bind");
	      var object = _dereq_("object-component");
	      var debug = _dereq_("debug")("socket.io-client:manager");
	      var indexOf = _dereq_("indexof");
	      module.exports = Manager;
	      function Manager(uri, opts) {
	        if (!(this instanceof Manager))return new Manager(uri, opts);
	        if (uri && "object" == typeof uri) {
	          opts = uri;
	          uri = undefined
	        }
	        opts = opts || {};
	        opts.path = opts.path || "/socket.io";
	        this.nsps = {};
	        this.subs = [];
	        this.opts = opts;
	        this.reconnection(opts.reconnection !== false);
	        this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
	        this.reconnectionDelay(opts.reconnectionDelay || 1e3);
	        this.reconnectionDelayMax(opts.reconnectionDelayMax || 5e3);
	        this.timeout(null == opts.timeout ? 2e4 : opts.timeout);
	        this.readyState = "closed";
	        this.uri = uri;
	        this.connected = [];
	        this.attempts = 0;
	        this.encoding = false;
	        this.packetBuffer = [];
	        this.encoder = new parser.Encoder;
	        this.decoder = new parser.Decoder;
	        this.autoConnect = opts.autoConnect !== false;
	        if (this.autoConnect)this.open()
	      }

	      Manager.prototype.emitAll = function () {
	        this.emit.apply(this, arguments);
	        for (var nsp in this.nsps) {
	          this.nsps[nsp].emit.apply(this.nsps[nsp], arguments)
	        }
	      };
	      Emitter(Manager.prototype);
	      Manager.prototype.reconnection = function (v) {
	        if (!arguments.length)return this._reconnection;
	        this._reconnection = !!v;
	        return this
	      };
	      Manager.prototype.reconnectionAttempts = function (v) {
	        if (!arguments.length)return this._reconnectionAttempts;
	        this._reconnectionAttempts = v;
	        return this
	      };
	      Manager.prototype.reconnectionDelay = function (v) {
	        if (!arguments.length)return this._reconnectionDelay;
	        this._reconnectionDelay = v;
	        return this
	      };
	      Manager.prototype.reconnectionDelayMax = function (v) {
	        if (!arguments.length)return this._reconnectionDelayMax;
	        this._reconnectionDelayMax = v;
	        return this
	      };
	      Manager.prototype.timeout = function (v) {
	        if (!arguments.length)return this._timeout;
	        this._timeout = v;
	        return this
	      };
	      Manager.prototype.maybeReconnectOnOpen = function () {
	        if (!this.openReconnect && !this.reconnecting && this._reconnection && this.attempts === 0) {
	          this.openReconnect = true;
	          this.reconnect()
	        }
	      };
	      Manager.prototype.open = Manager.prototype.connect = function (fn) {
	        debug("readyState %s", this.readyState);
	        if (~this.readyState.indexOf("open"))return this;
	        debug("opening %s", this.uri);
	        this.engine = eio(this.uri, this.opts);
	        var socket = this.engine;
	        var self = this;
	        this.readyState = "opening";
	        this.skipReconnect = false;
	        var openSub = on(socket, "open", function () {
	          self.onopen();
	          fn && fn()
	        });
	        var errorSub = on(socket, "error", function (data) {
	          debug("connect_error");
	          self.cleanup();
	          self.readyState = "closed";
	          self.emitAll("connect_error", data);
	          if (fn) {
	            var err = new Error("Connection error");
	            err.data = data;
	            fn(err)
	          }
	          self.maybeReconnectOnOpen()
	        });
	        if (false !== this._timeout) {
	          var timeout = this._timeout;
	          debug("connect attempt will timeout after %d", timeout);
	          var timer = setTimeout(function () {
	            debug("connect attempt timed out after %d", timeout);
	            openSub.destroy();
	            socket.close();
	            socket.emit("error", "timeout");
	            self.emitAll("connect_timeout", timeout)
	          }, timeout);
	          this.subs.push({
	            destroy: function () {
	              clearTimeout(timer)
	            }
	          })
	        }
	        this.subs.push(openSub);
	        this.subs.push(errorSub);
	        return this
	      };
	      Manager.prototype.onopen = function () {
	        debug("open");
	        this.cleanup();
	        this.readyState = "open";
	        this.emit("open");
	        var socket = this.engine;
	        this.subs.push(on(socket, "data", bind(this, "ondata")));
	        this.subs.push(on(this.decoder, "decoded", bind(this, "ondecoded")));
	        this.subs.push(on(socket, "error", bind(this, "onerror")));
	        this.subs.push(on(socket, "close", bind(this, "onclose")))
	      };
	      Manager.prototype.ondata = function (data) {
	        this.decoder.add(data)
	      };
	      Manager.prototype.ondecoded = function (packet) {
	        this.emit("packet", packet)
	      };
	      Manager.prototype.onerror = function (err) {
	        debug("error", err);
	        this.emitAll("error", err)
	      };
	      Manager.prototype.socket = function (nsp) {
	        var socket = this.nsps[nsp];
	        if (!socket) {
	          socket = new Socket(this, nsp);
	          this.nsps[nsp] = socket;
	          var self = this;
	          socket.on("connect", function () {
	            if (!~indexOf(self.connected, socket)) {
	              self.connected.push(socket)
	            }
	          })
	        }
	        return socket
	      };
	      Manager.prototype.destroy = function (socket) {
	        var index = indexOf(this.connected, socket);
	        if (~index)this.connected.splice(index, 1);
	        if (this.connected.length)return;
	        this.close()
	      };
	      Manager.prototype.packet = function (packet) {
	        debug("writing packet %j", packet);
	        var self = this;
	        if (!self.encoding) {
	          self.encoding = true;
	          this.encoder.encode(packet, function (encodedPackets) {
	            for (var i = 0; i < encodedPackets.length; i++) {
	              self.engine.write(encodedPackets[i])
	            }
	            self.encoding = false;
	            self.processPacketQueue()
	          })
	        } else {
	          self.packetBuffer.push(packet)
	        }
	      };
	      Manager.prototype.processPacketQueue = function () {
	        if (this.packetBuffer.length > 0 && !this.encoding) {
	          var pack = this.packetBuffer.shift();
	          this.packet(pack)
	        }
	      };
	      Manager.prototype.cleanup = function () {
	        var sub;
	        while (sub = this.subs.shift())sub.destroy();
	        this.packetBuffer = [];
	        this.encoding = false;
	        this.decoder.destroy()
	      };
	      Manager.prototype.close = Manager.prototype.disconnect = function () {
	        this.skipReconnect = true;
	        this.readyState = "closed";
	        this.engine && this.engine.close()
	      };
	      Manager.prototype.onclose = function (reason) {
	        debug("close");
	        this.cleanup();
	        this.readyState = "closed";
	        this.emit("close", reason);
	        if (this._reconnection && !this.skipReconnect) {
	          this.reconnect()
	        }
	      };
	      Manager.prototype.reconnect = function () {
	        if (this.reconnecting || this.skipReconnect)return this;
	        var self = this;
	        this.attempts++;
	        if (this.attempts > this._reconnectionAttempts) {
	          debug("reconnect failed");
	          this.emitAll("reconnect_failed");
	          this.reconnecting = false
	        } else {
	          var delay = this.attempts * this.reconnectionDelay();
	          delay = Math.min(delay, this.reconnectionDelayMax());
	          debug("will wait %dms before reconnect attempt", delay);
	          this.reconnecting = true;
	          var timer = setTimeout(function () {
	            if (self.skipReconnect)return;
	            debug("attempting reconnect");
	            self.emitAll("reconnect_attempt", self.attempts);
	            self.emitAll("reconnecting", self.attempts);
	            if (self.skipReconnect)return;
	            self.open(function (err) {
	              if (err) {
	                debug("reconnect attempt error");
	                self.reconnecting = false;
	                self.reconnect();
	                self.emitAll("reconnect_error", err.data)
	              } else {
	                debug("reconnect success");
	                self.onreconnect()
	              }
	            })
	          }, delay);
	          this.subs.push({
	            destroy: function () {
	              clearTimeout(timer)
	            }
	          })
	        }
	      };
	      Manager.prototype.onreconnect = function () {
	        var attempt = this.attempts;
	        this.attempts = 0;
	        this.reconnecting = false;
	        this.emitAll("reconnect", attempt)
	      }
	    }, {
	      "./on": 4,
	      "./socket": 5,
	      "./url": 6,
	      "component-bind": 7,
	      "component-emitter": 8,
	      debug: 9,
	      "engine.io-client": 10,
	      indexof: 39,
	      "object-component": 40,
	      "socket.io-parser": 43
	    }],
	    4: [function (_dereq_, module, exports) {
	      module.exports = on;
	      function on(obj, ev, fn) {
	        obj.on(ev, fn);
	        return {
	          destroy: function () {
	            obj.removeListener(ev, fn)
	          }
	        }
	      }
	    }, {}],
	    5: [function (_dereq_, module, exports) {
	      var parser = _dereq_("socket.io-parser");
	      var Emitter = _dereq_("component-emitter");
	      var toArray = _dereq_("to-array");
	      var on = _dereq_("./on");
	      var bind = _dereq_("component-bind");
	      var debug = _dereq_("debug")("socket.io-client:socket");
	      var hasBin = _dereq_("has-binary");
	      module.exports = exports = Socket;
	      var events = {
	        connect: 1,
	        connect_error: 1,
	        connect_timeout: 1,
	        disconnect: 1,
	        error: 1,
	        reconnect: 1,
	        reconnect_attempt: 1,
	        reconnect_failed: 1,
	        reconnect_error: 1,
	        reconnecting: 1
	      };
	      var emit = Emitter.prototype.emit;

	      function Socket(io, nsp) {
	        this.io = io;
	        this.nsp = nsp;
	        this.json = this;
	        this.ids = 0;
	        this.acks = {};
	        if (this.io.autoConnect)this.open();
	        this.receiveBuffer = [];
	        this.sendBuffer = [];
	        this.connected = false;
	        this.disconnected = true
	      }

	      Emitter(Socket.prototype);
	      Socket.prototype.subEvents = function () {
	        if (this.subs)return;
	        var io = this.io;
	        this.subs = [on(io, "open", bind(this, "onopen")), on(io, "packet", bind(this, "onpacket")), on(io, "close", bind(this, "onclose"))]
	      };
	      Socket.prototype.open = Socket.prototype.connect = function () {
	        if (this.connected)return this;
	        this.subEvents();
	        this.io.open();
	        if ("open" == this.io.readyState)this.onopen();
	        return this
	      };
	      Socket.prototype.send = function () {
	        var args = toArray(arguments);
	        args.unshift("message");
	        this.emit.apply(this, args);
	        return this
	      };
	      Socket.prototype.emit = function (ev) {
	        if (events.hasOwnProperty(ev)) {
	          emit.apply(this, arguments);
	          return this
	        }
	        var args = toArray(arguments);
	        var parserType = parser.EVENT;
	        if (hasBin(args)) {
	          parserType = parser.BINARY_EVENT
	        }
	        var packet = {type: parserType, data: args};
	        if ("function" == typeof args[args.length - 1]) {
	          debug("emitting packet with ack id %d", this.ids);
	          this.acks[this.ids] = args.pop();
	          packet.id = this.ids++
	        }
	        if (this.connected) {
	          this.packet(packet)
	        } else {
	          this.sendBuffer.push(packet)
	        }
	        return this
	      };
	      Socket.prototype.packet = function (packet) {
	        packet.nsp = this.nsp;
	        this.io.packet(packet)
	      };
	      Socket.prototype.onopen = function () {
	        debug("transport is open - connecting");
	        if ("/" != this.nsp) {
	          this.packet({type: parser.CONNECT})
	        }
	      };
	      Socket.prototype.onclose = function (reason) {
	        debug("close (%s)", reason);
	        this.connected = false;
	        this.disconnected = true;
	        this.emit("disconnect", reason)
	      };
	      Socket.prototype.onpacket = function (packet) {
	        if (packet.nsp != this.nsp)return;
	        switch (packet.type) {
	          case parser.CONNECT:
	            this.onconnect();
	            break;
	          case parser.EVENT:
	            this.onevent(packet);
	            break;
	          case parser.BINARY_EVENT:
	            this.onevent(packet);
	            break;
	          case parser.ACK:
	            this.onack(packet);
	            break;
	          case parser.BINARY_ACK:
	            this.onack(packet);
	            break;
	          case parser.DISCONNECT:
	            this.ondisconnect();
	            break;
	          case parser.ERROR:
	            this.emit("error", packet.data);
	            break
	        }
	      };
	      Socket.prototype.onevent = function (packet) {
	        var args = packet.data || [];
	        debug("emitting event %j", args);
	        if (null != packet.id) {
	          debug("attaching ack callback to event");
	          args.push(this.ack(packet.id))
	        }
	        if (this.connected) {
	          emit.apply(this, args)
	        } else {
	          this.receiveBuffer.push(args)
	        }
	      };
	      Socket.prototype.ack = function (id) {
	        var self = this;
	        var sent = false;
	        return function () {
	          if (sent)return;
	          sent = true;
	          var args = toArray(arguments);
	          debug("sending ack %j", args);
	          var type = hasBin(args) ? parser.BINARY_ACK : parser.ACK;
	          self.packet({type: type, id: id, data: args})
	        }
	      };
	      Socket.prototype.onack = function (packet) {
	        debug("calling ack %s with %j", packet.id, packet.data);
	        var fn = this.acks[packet.id];
	        fn.apply(this, packet.data);
	        delete this.acks[packet.id]
	      };
	      Socket.prototype.onconnect = function () {
	        this.connected = true;
	        this.disconnected = false;
	        this.emit("connect");
	        this.emitBuffered()
	      };
	      Socket.prototype.emitBuffered = function () {
	        var i;
	        for (i = 0; i < this.receiveBuffer.length; i++) {
	          emit.apply(this, this.receiveBuffer[i])
	        }
	        this.receiveBuffer = [];
	        for (i = 0; i < this.sendBuffer.length; i++) {
	          this.packet(this.sendBuffer[i])
	        }
	        this.sendBuffer = []
	      };
	      Socket.prototype.ondisconnect = function () {
	        debug("server disconnect (%s)", this.nsp);
	        this.destroy();
	        this.onclose("io server disconnect")
	      };
	      Socket.prototype.destroy = function () {
	        if (this.subs) {
	          for (var i = 0; i < this.subs.length; i++) {
	            this.subs[i].destroy()
	          }
	          this.subs = null
	        }
	        this.io.destroy(this)
	      };
	      Socket.prototype.close = Socket.prototype.disconnect = function () {
	        if (this.connected) {
	          debug("performing disconnect (%s)", this.nsp);
	          this.packet({type: parser.DISCONNECT})
	        }
	        this.destroy();
	        if (this.connected) {
	          this.onclose("io client disconnect")
	        }
	        return this
	      }
	    }, {
	      "./on": 4,
	      "component-bind": 7,
	      "component-emitter": 8,
	      debug: 9,
	      "has-binary": 35,
	      "socket.io-parser": 43,
	      "to-array": 47
	    }],
	    6: [function (_dereq_, module, exports) {
	      (function (global) {
	        var parseuri = _dereq_("parseuri");
	        var debug = _dereq_("debug")("socket.io-client:url");
	        module.exports = url;
	        function url(uri, loc) {
	          var obj = uri;
	          var loc = loc || global.location;
	          if (null == uri)uri = loc.protocol + "//" + loc.hostname;
	          if ("string" == typeof uri) {
	            if ("/" == uri.charAt(0)) {
	              if ("/" == uri.charAt(1)) {
	                uri = loc.protocol + uri
	              } else {
	                uri = loc.hostname + uri
	              }
	            }
	            if (!/^(https?|wss?):\/\//.test(uri)) {
	              debug("protocol-less url %s", uri);
	              if ("undefined" != typeof loc) {
	                uri = loc.protocol + "//" + uri
	              } else {
	                uri = "https://" + uri
	              }
	            }
	            debug("parse %s", uri);
	            obj = parseuri(uri)
	          }
	          if (!obj.port) {
	            if (/^(http|ws)$/.test(obj.protocol)) {
	              obj.port = "80"
	            } else if (/^(http|ws)s$/.test(obj.protocol)) {
	              obj.port = "443"
	            }
	          }
	          obj.path = obj.path || "/";
	          obj.id = obj.protocol + "://" + obj.host + ":" + obj.port;
	          obj.href = obj.protocol + "://" + obj.host + (loc && loc.port == obj.port ? "" : ":" + obj.port);
	          return obj
	        }
	      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
	    }, {debug: 9, parseuri: 41}],
	    7: [function (_dereq_, module, exports) {
	      var slice = [].slice;
	      module.exports = function (obj, fn) {
	        if ("string" == typeof fn)fn = obj[fn];
	        if ("function" != typeof fn)throw new Error("bind() requires a function");
	        var args = slice.call(arguments, 2);
	        return function () {
	          return fn.apply(obj, args.concat(slice.call(arguments)))
	        }
	      }
	    }, {}],
	    8: [function (_dereq_, module, exports) {
	      module.exports = Emitter;
	      function Emitter(obj) {
	        if (obj)return mixin(obj)
	      }

	      function mixin(obj) {
	        for (var key in Emitter.prototype) {
	          obj[key] = Emitter.prototype[key]
	        }
	        return obj
	      }

	      Emitter.prototype.on = Emitter.prototype.addEventListener = function (event, fn) {
	        this._callbacks = this._callbacks || {};
	        (this._callbacks[event] = this._callbacks[event] || []).push(fn);
	        return this
	      };
	      Emitter.prototype.once = function (event, fn) {
	        var self = this;
	        this._callbacks = this._callbacks || {};
	        function on() {
	          self.off(event, on);
	          fn.apply(this, arguments)
	        }

	        on.fn = fn;
	        this.on(event, on);
	        return this
	      };
	      Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function (event, fn) {
	        this._callbacks = this._callbacks || {};
	        if (0 == arguments.length) {
	          this._callbacks = {};
	          return this
	        }
	        var callbacks = this._callbacks[event];
	        if (!callbacks)return this;
	        if (1 == arguments.length) {
	          delete this._callbacks[event];
	          return this
	        }
	        var cb;
	        for (var i = 0; i < callbacks.length; i++) {
	          cb = callbacks[i];
	          if (cb === fn || cb.fn === fn) {
	            callbacks.splice(i, 1);
	            break
	          }
	        }
	        return this
	      };
	      Emitter.prototype.emit = function (event) {
	        this._callbacks = this._callbacks || {};
	        var args = [].slice.call(arguments, 1), callbacks = this._callbacks[event];
	        if (callbacks) {
	          callbacks = callbacks.slice(0);
	          for (var i = 0, len = callbacks.length; i < len; ++i) {
	            callbacks[i].apply(this, args)
	          }
	        }
	        return this
	      };
	      Emitter.prototype.listeners = function (event) {
	        this._callbacks = this._callbacks || {};
	        return this._callbacks[event] || []
	      };
	      Emitter.prototype.hasListeners = function (event) {
	        return !!this.listeners(event).length
	      }
	    }, {}],
	    9: [function (_dereq_, module, exports) {
	      module.exports = debug;
	      function debug(name) {
	        if (!debug.enabled(name))return function () {
	        };
	        return function (fmt) {
	          fmt = coerce(fmt);
	          var curr = new Date;
	          var ms = curr - (debug[name] || curr);
	          debug[name] = curr;
	          fmt = name + " " + fmt + " +" + debug.humanize(ms);
	          window.console && console.log && Function.prototype.apply.call(console.log, console, arguments)
	        }
	      }

	      debug.names = [];
	      debug.skips = [];
	      debug.enable = function (name) {
	        try {
	          localStorage.debug = name
	        } catch (e) {
	        }
	        var split = (name || "").split(/[\s,]+/), len = split.length;
	        for (var i = 0; i < len; i++) {
	          name = split[i].replace("*", ".*?");
	          if (name[0] === "-") {
	            debug.skips.push(new RegExp("^" + name.substr(1) + "$"))
	          } else {
	            debug.names.push(new RegExp("^" + name + "$"))
	          }
	        }
	      };
	      debug.disable = function () {
	        debug.enable("")
	      };
	      debug.humanize = function (ms) {
	        var sec = 1e3, min = 60 * 1e3, hour = 60 * min;
	        if (ms >= hour)return (ms / hour).toFixed(1) + "h";
	        if (ms >= min)return (ms / min).toFixed(1) + "m";
	        if (ms >= sec)return (ms / sec | 0) + "s";
	        return ms + "ms"
	      };
	      debug.enabled = function (name) {
	        for (var i = 0, len = debug.skips.length; i < len; i++) {
	          if (debug.skips[i].test(name)) {
	            return false
	          }
	        }
	        for (var i = 0, len = debug.names.length; i < len; i++) {
	          if (debug.names[i].test(name)) {
	            return true
	          }
	        }
	        return false
	      };
	      function coerce(val) {
	        if (val instanceof Error)return val.stack || val.message;
	        return val
	      }

	      try {
	        if (window.localStorage)debug.enable(localStorage.debug)
	      } catch (e) {
	      }
	    }, {}],
	    10: [function (_dereq_, module, exports) {
	      module.exports = _dereq_("./lib/")
	    }, {"./lib/": 11}],
	    11: [function (_dereq_, module, exports) {
	      module.exports = _dereq_("./socket");
	      module.exports.parser = _dereq_("engine.io-parser")
	    }, {"./socket": 12, "engine.io-parser": 24}],
	    12: [function (_dereq_, module, exports) {
	      (function (global) {
	        var transports = _dereq_("./transports");
	        var Emitter = _dereq_("component-emitter");
	        var debug = _dereq_("debug")("engine.io-client:socket");
	        var index = _dereq_("indexof");
	        var parser = _dereq_("engine.io-parser");
	        var parseuri = _dereq_("parseuri");
	        var parsejson = _dereq_("parsejson");
	        var parseqs = _dereq_("parseqs");
	        module.exports = Socket;
	        function noop() {
	        }

	        function Socket(uri, opts) {
	          if (!(this instanceof Socket))return new Socket(uri, opts);
	          opts = opts || {};
	          if (uri && "object" == typeof uri) {
	            opts = uri;
	            uri = null
	          }
	          if (uri) {
	            uri = parseuri(uri);
	            opts.host = uri.host;
	            opts.secure = uri.protocol == "https" || uri.protocol == "wss";
	            opts.port = uri.port;
	            if (uri.query)opts.query = uri.query
	          }
	          this.secure = null != opts.secure ? opts.secure : global.location && "https:" == location.protocol;
	          if (opts.host) {
	            var pieces = opts.host.split(":");
	            opts.hostname = pieces.shift();
	            if (pieces.length)opts.port = pieces.pop()
	          }
	          this.agent = opts.agent || false;
	          this.hostname = opts.hostname || (global.location ? location.hostname : "localhost");
	          this.port = opts.port || (global.location && location.port ? location.port : this.secure ? 443 : 80);
	          this.query = opts.query || {};
	          if ("string" == typeof this.query)this.query = parseqs.decode(this.query);
	          this.upgrade = false !== opts.upgrade;
	          this.path = (opts.path || "/engine.io").replace(/\/$/, "") + "/";
	          this.forceJSONP = !!opts.forceJSONP;
	          this.jsonp = false !== opts.jsonp;
	          this.forceBase64 = !!opts.forceBase64;
	          this.enablesXDR = !!opts.enablesXDR;
	          this.timestampParam = opts.timestampParam || "t";
	          this.timestampRequests = opts.timestampRequests;
	          this.transports = opts.transports || ["polling", "websocket"];
	          this.readyState = "";
	          this.writeBuffer = [];
	          this.callbackBuffer = [];
	          this.policyPort = opts.policyPort || 843;
	          this.rememberUpgrade = opts.rememberUpgrade || false;
	          this.open();
	          this.binaryType = null;
	          this.onlyBinaryUpgrades = opts.onlyBinaryUpgrades
	        }

	        Socket.priorWebsocketSuccess = false;
	        Emitter(Socket.prototype);
	        Socket.protocol = parser.protocol;
	        Socket.Socket = Socket;
	        Socket.Transport = _dereq_("./transport");
	        Socket.transports = _dereq_("./transports");
	        Socket.parser = _dereq_("engine.io-parser");
	        Socket.prototype.createTransport = function (name) {
	          debug('creating transport "%s"', name);
	          var query = clone(this.query);
	          query.EIO = parser.protocol;
	          query.transport = name;
	          if (this.id)query.sid = this.id;
	          var transport = new transports[name]({
	            agent: this.agent,
	            hostname: this.hostname,
	            port: this.port,
	            secure: this.secure,
	            path: this.path,
	            query: query,
	            forceJSONP: this.forceJSONP,
	            jsonp: this.jsonp,
	            forceBase64: this.forceBase64,
	            enablesXDR: this.enablesXDR,
	            timestampRequests: this.timestampRequests,
	            timestampParam: this.timestampParam,
	            policyPort: this.policyPort,
	            socket: this
	          });
	          return transport
	        };
	        function clone(obj) {
	          var o = {};
	          for (var i in obj) {
	            if (obj.hasOwnProperty(i)) {
	              o[i] = obj[i]
	            }
	          }
	          return o
	        }

	        Socket.prototype.open = function () {
	          var transport;
	          if (this.rememberUpgrade && Socket.priorWebsocketSuccess && this.transports.indexOf("websocket") != -1) {
	            transport = "websocket"
	          } else if (0 == this.transports.length) {
	            var self = this;
	            setTimeout(function () {
	              self.emit("error", "No transports available")
	            }, 0);
	            return
	          } else {
	            transport = this.transports[0]
	          }
	          this.readyState = "opening";
	          var transport;
	          try {
	            transport = this.createTransport(transport)
	          } catch (e) {
	            this.transports.shift();
	            this.open();
	            return
	          }
	          transport.open();
	          this.setTransport(transport)
	        };
	        Socket.prototype.setTransport = function (transport) {
	          debug("setting transport %s", transport.name);
	          var self = this;
	          if (this.transport) {
	            debug("clearing existing transport %s", this.transport.name);
	            this.transport.removeAllListeners()
	          }
	          this.transport = transport;
	          transport.on("drain", function () {
	            self.onDrain()
	          }).on("packet", function (packet) {
	            self.onPacket(packet)
	          }).on("error", function (e) {
	            self.onError(e)
	          }).on("close", function () {
	            self.onClose("transport close")
	          })
	        };
	        Socket.prototype.probe = function (name) {
	          debug('probing transport "%s"', name);
	          var transport = this.createTransport(name, {probe: 1}), failed = false, self = this;
	          Socket.priorWebsocketSuccess = false;
	          function onTransportOpen() {
	            if (self.onlyBinaryUpgrades) {
	              var upgradeLosesBinary = !this.supportsBinary && self.transport.supportsBinary;
	              failed = failed || upgradeLosesBinary
	            }
	            if (failed)return;
	            debug('probe transport "%s" opened', name);
	            transport.send([{type: "ping", data: "probe"}]);
	            transport.once("packet", function (msg) {
	              if (failed)return;
	              if ("pong" == msg.type && "probe" == msg.data) {
	                debug('probe transport "%s" pong', name);
	                self.upgrading = true;
	                self.emit("upgrading", transport);
	                if (!transport)return;
	                Socket.priorWebsocketSuccess = "websocket" == transport.name;
	                debug('pausing current transport "%s"', self.transport.name);
	                self.transport.pause(function () {
	                  if (failed)return;
	                  if ("closed" == self.readyState)return;
	                  debug("changing transport and sending upgrade packet");
	                  cleanup();
	                  self.setTransport(transport);
	                  transport.send([{type: "upgrade"}]);
	                  self.emit("upgrade", transport);
	                  transport = null;
	                  self.upgrading = false;
	                  self.flush()
	                })
	              } else {
	                debug('probe transport "%s" failed', name);
	                var err = new Error("probe error");
	                err.transport = transport.name;
	                self.emit("upgradeError", err)
	              }
	            })
	          }

	          function freezeTransport() {
	            if (failed)return;
	            failed = true;
	            cleanup();
	            transport.close();
	            transport = null
	          }

	          function onerror(err) {
	            var error = new Error("probe error: " + err);
	            error.transport = transport.name;
	            freezeTransport();
	            debug('probe transport "%s" failed because of error: %s', name, err);
	            self.emit("upgradeError", error)
	          }

	          function onTransportClose() {
	            onerror("transport closed")
	          }

	          function onclose() {
	            onerror("socket closed")
	          }

	          function onupgrade(to) {
	            if (transport && to.name != transport.name) {
	              debug('"%s" works - aborting "%s"', to.name, transport.name);
	              freezeTransport()
	            }
	          }

	          function cleanup() {
	            transport.removeListener("open", onTransportOpen);
	            transport.removeListener("error", onerror);
	            transport.removeListener("close", onTransportClose);
	            self.removeListener("close", onclose);
	            self.removeListener("upgrading", onupgrade)
	          }

	          transport.once("open", onTransportOpen);
	          transport.once("error", onerror);
	          transport.once("close", onTransportClose);
	          this.once("close", onclose);
	          this.once("upgrading", onupgrade);
	          transport.open()
	        };
	        Socket.prototype.onOpen = function () {
	          debug("socket open");
	          this.readyState = "open";
	          Socket.priorWebsocketSuccess = "websocket" == this.transport.name;
	          this.emit("open");
	          this.flush();
	          if ("open" == this.readyState && this.upgrade && this.transport.pause) {
	            debug("starting upgrade probes");
	            for (var i = 0, l = this.upgrades.length; i < l; i++) {
	              this.probe(this.upgrades[i])
	            }
	          }
	        };
	        Socket.prototype.onPacket = function (packet) {
	          if ("opening" == this.readyState || "open" == this.readyState) {
	            debug('socket receive: type "%s", data "%s"', packet.type, packet.data);
	            this.emit("packet", packet);
	            this.emit("heartbeat");
	            switch (packet.type) {
	              case"open":
	                this.onHandshake(parsejson(packet.data));
	                break;
	              case"pong":
	                this.setPing();
	                break;
	              case"error":
	                var err = new Error("server error");
	                err.code = packet.data;
	                this.emit("error", err);
	                break;
	              case"message":
	                this.emit("data", packet.data);
	                this.emit("message", packet.data);
	                break
	            }
	          } else {
	            debug('packet received with socket readyState "%s"', this.readyState)
	          }
	        };
	        Socket.prototype.onHandshake = function (data) {
	          this.emit("handshake", data);
	          this.id = data.sid;
	          this.transport.query.sid = data.sid;
	          this.upgrades = this.filterUpgrades(data.upgrades);
	          this.pingInterval = data.pingInterval;
	          this.pingTimeout = data.pingTimeout;
	          this.onOpen();
	          if ("closed" == this.readyState)return;
	          this.setPing();
	          this.removeListener("heartbeat", this.onHeartbeat);
	          this.on("heartbeat", this.onHeartbeat)
	        };
	        Socket.prototype.onHeartbeat = function (timeout) {
	          clearTimeout(this.pingTimeoutTimer);
	          var self = this;
	          self.pingTimeoutTimer = setTimeout(function () {
	            if ("closed" == self.readyState)return;
	            self.onClose("ping timeout")
	          }, timeout || self.pingInterval + self.pingTimeout)
	        };
	        Socket.prototype.setPing = function () {
	          var self = this;
	          clearTimeout(self.pingIntervalTimer);
	          self.pingIntervalTimer = setTimeout(function () {
	            debug("writing ping packet - expecting pong within %sms", self.pingTimeout);
	            self.ping();
	            self.onHeartbeat(self.pingTimeout)
	          }, self.pingInterval)
	        };
	        Socket.prototype.ping = function () {
	          this.sendPacket("ping")
	        };
	        Socket.prototype.onDrain = function () {
	          for (var i = 0; i < this.prevBufferLen; i++) {
	            if (this.callbackBuffer[i]) {
	              this.callbackBuffer[i]()
	            }
	          }
	          this.writeBuffer.splice(0, this.prevBufferLen);
	          this.callbackBuffer.splice(0, this.prevBufferLen);
	          this.prevBufferLen = 0;
	          if (this.writeBuffer.length == 0) {
	            this.emit("drain")
	          } else {
	            this.flush()
	          }
	        };
	        Socket.prototype.flush = function () {
	          if ("closed" != this.readyState && this.transport.writable && !this.upgrading && this.writeBuffer.length) {
	            debug("flushing %d packets in socket", this.writeBuffer.length);
	            this.transport.send(this.writeBuffer);
	            this.prevBufferLen = this.writeBuffer.length;
	            this.emit("flush")
	          }
	        };
	        Socket.prototype.write = Socket.prototype.send = function (msg, fn) {
	          this.sendPacket("message", msg, fn);
	          return this
	        };
	        Socket.prototype.sendPacket = function (type, data, fn) {
	          if ("closing" == this.readyState || "closed" == this.readyState) {
	            return
	          }
	          var packet = {type: type, data: data};
	          this.emit("packetCreate", packet);
	          this.writeBuffer.push(packet);
	          this.callbackBuffer.push(fn);
	          this.flush()
	        };
	        Socket.prototype.close = function () {
	          if ("opening" == this.readyState || "open" == this.readyState) {
	            this.readyState = "closing";
	            var self = this;

	            function close() {
	              self.onClose("forced close");
	              debug("socket closing - telling transport to close");
	              self.transport.close()
	            }

	            function cleanupAndClose() {
	              self.removeListener("upgrade", cleanupAndClose);
	              self.removeListener("upgradeError", cleanupAndClose);
	              close()
	            }

	            function waitForUpgrade() {
	              self.once("upgrade", cleanupAndClose);
	              self.once("upgradeError", cleanupAndClose)
	            }

	            if (this.writeBuffer.length) {
	              this.once("drain", function () {
	                if (this.upgrading) {
	                  waitForUpgrade()
	                } else {
	                  close()
	                }
	              })
	            } else if (this.upgrading) {
	              waitForUpgrade()
	            } else {
	              close()
	            }
	          }
	          return this
	        };
	        Socket.prototype.onError = function (err) {
	          debug("socket error %j", err);
	          Socket.priorWebsocketSuccess = false;
	          this.emit("error", err);
	          this.onClose("transport error", err)
	        };
	        Socket.prototype.onClose = function (reason, desc) {
	          if ("opening" == this.readyState || "open" == this.readyState || "closing" == this.readyState) {
	            debug('socket close with reason: "%s"', reason);
	            var self = this;
	            clearTimeout(this.pingIntervalTimer);
	            clearTimeout(this.pingTimeoutTimer);
	            setTimeout(function () {
	              self.writeBuffer = [];
	              self.callbackBuffer = [];
	              self.prevBufferLen = 0
	            }, 0);
	            this.transport.removeAllListeners("close");
	            this.transport.close();
	            this.transport.removeAllListeners();
	            this.readyState = "closed";
	            this.id = null;
	            this.emit("close", reason, desc)
	          }
	        };
	        Socket.prototype.filterUpgrades = function (upgrades) {
	          var filteredUpgrades = [];
	          for (var i = 0, j = upgrades.length; i < j; i++) {
	            if (~index(this.transports, upgrades[i]))filteredUpgrades.push(upgrades[i])
	          }
	          return filteredUpgrades
	        }
	      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
	    }, {
	      "./transport": 13,
	      "./transports": 14,
	      "component-emitter": 8,
	      debug: 21,
	      "engine.io-parser": 24,
	      indexof: 39,
	      parsejson: 31,
	      parseqs: 32,
	      parseuri: 33
	    }],
	    13: [function (_dereq_, module, exports) {
	      var parser = _dereq_("engine.io-parser");
	      var Emitter = _dereq_("component-emitter");
	      module.exports = Transport;
	      function Transport(opts) {
	        this.path = opts.path;
	        this.hostname = opts.hostname;
	        this.port = opts.port;
	        this.secure = opts.secure;
	        this.query = opts.query;
	        this.timestampParam = opts.timestampParam;
	        this.timestampRequests = opts.timestampRequests;
	        this.readyState = "";
	        this.agent = opts.agent || false;
	        this.socket = opts.socket;
	        this.enablesXDR = opts.enablesXDR
	      }

	      Emitter(Transport.prototype);
	      Transport.timestamps = 0;
	      Transport.prototype.onError = function (msg, desc) {
	        var err = new Error(msg);
	        err.type = "TransportError";
	        err.description = desc;
	        this.emit("error", err);
	        return this
	      };
	      Transport.prototype.open = function () {
	        if ("closed" == this.readyState || "" == this.readyState) {
	          this.readyState = "opening";
	          this.doOpen()
	        }
	        return this
	      };
	      Transport.prototype.close = function () {
	        if ("opening" == this.readyState || "open" == this.readyState) {
	          this.doClose();
	          this.onClose()
	        }
	        return this
	      };
	      Transport.prototype.send = function (packets) {
	        if ("open" == this.readyState) {
	          this.write(packets)
	        } else {
	          throw new Error("Transport not open")
	        }
	      };
	      Transport.prototype.onOpen = function () {
	        this.readyState = "open";
	        this.writable = true;
	        this.emit("open")
	      };
	      Transport.prototype.onData = function (data) {
	        var packet = parser.decodePacket(data, this.socket.binaryType);
	        this.onPacket(packet)
	      };
	      Transport.prototype.onPacket = function (packet) {
	        this.emit("packet", packet)
	      };
	      Transport.prototype.onClose = function () {
	        this.readyState = "closed";
	        this.emit("close")
	      }
	    }, {"component-emitter": 8, "engine.io-parser": 24}],
	    14: [function (_dereq_, module, exports) {
	      (function (global) {
	        var XMLHttpRequest = _dereq_("xmlhttprequest");
	        var XHR = _dereq_("./polling-xhr");
	        var JSONP = _dereq_("./polling-jsonp");
	        var websocket = _dereq_("./websocket");
	        exports.polling = polling;
	        exports.websocket = websocket;
	        function polling(opts) {
	          var xhr;
	          var xd = false;
	          var xs = false;
	          var jsonp = false !== opts.jsonp;
	          if (global.location) {
	            var isSSL = "https:" == location.protocol;
	            var port = location.port;
	            if (!port) {
	              port = isSSL ? 443 : 80
	            }
	            xd = opts.hostname != location.hostname || port != opts.port;
	            xs = opts.secure != isSSL
	          }
	          opts.xdomain = xd;
	          opts.xscheme = xs;
	          xhr = new XMLHttpRequest(opts);
	          if ("open"in xhr && !opts.forceJSONP) {
	            return new XHR(opts)
	          } else {
	            if (!jsonp)throw new Error("JSONP disabled");
	            return new JSONP(opts)
	          }
	        }
	      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
	    }, {"./polling-jsonp": 15, "./polling-xhr": 16, "./websocket": 18, xmlhttprequest: 19}],
	    15: [function (_dereq_, module, exports) {
	      (function (global) {
	        var Polling = _dereq_("./polling");
	        var inherit = _dereq_("component-inherit");
	        module.exports = JSONPPolling;
	        var rNewline = /\n/g;
	        var rEscapedNewline = /\\n/g;
	        var callbacks;
	        var index = 0;

	        function empty() {
	        }

	        function JSONPPolling(opts) {
	          Polling.call(this, opts);
	          this.query = this.query || {};
	          if (!callbacks) {
	            if (!global.___eio)global.___eio = [];
	            callbacks = global.___eio
	          }
	          this.index = callbacks.length;
	          var self = this;
	          callbacks.push(function (msg) {
	            self.onData(msg)
	          });
	          this.query.j = this.index;
	          if (global.document && global.addEventListener) {
	            global.addEventListener("beforeunload", function () {
	              if (self.script)self.script.onerror = empty
	            }, false)
	          }
	        }

	        inherit(JSONPPolling, Polling);
	        JSONPPolling.prototype.supportsBinary = false;
	        JSONPPolling.prototype.doClose = function () {
	          if (this.script) {
	            this.script.parentNode.removeChild(this.script);
	            this.script = null
	          }
	          if (this.form) {
	            this.form.parentNode.removeChild(this.form);
	            this.form = null;
	            this.iframe = null
	          }
	          Polling.prototype.doClose.call(this)
	        };
	        JSONPPolling.prototype.doPoll = function () {
	          var self = this;
	          var script = document.createElement("script");
	          if (this.script) {
	            this.script.parentNode.removeChild(this.script);
	            this.script = null
	          }
	          script.async = true;
	          script.src = this.uri();
	          script.onerror = function (e) {
	            self.onError("jsonp poll error", e)
	          };
	          var insertAt = document.getElementsByTagName("script")[0];
	          insertAt.parentNode.insertBefore(script, insertAt);
	          this.script = script;
	          var isUAgecko = "undefined" != typeof navigator && /gecko/i.test(navigator.userAgent);
	          if (isUAgecko) {
	            setTimeout(function () {
	              var iframe = document.createElement("iframe");
	              document.body.appendChild(iframe);
	              document.body.removeChild(iframe)
	            }, 100)
	          }
	        };
	        JSONPPolling.prototype.doWrite = function (data, fn) {
	          var self = this;
	          if (!this.form) {
	            var form = document.createElement("form");
	            var area = document.createElement("textarea");
	            var id = this.iframeId = "eio_iframe_" + this.index;
	            var iframe;
	            form.className = "socketio";
	            form.style.position = "absolute";
	            form.style.top = "-1000px";
	            form.style.left = "-1000px";
	            form.target = id;
	            form.method = "POST";
	            form.setAttribute("accept-charset", "utf-8");
	            area.name = "d";
	            form.appendChild(area);
	            document.body.appendChild(form);
	            this.form = form;
	            this.area = area
	          }
	          this.form.action = this.uri();
	          function complete() {
	            initIframe();
	            fn()
	          }

	          function initIframe() {
	            if (self.iframe) {
	              try {
	                self.form.removeChild(self.iframe)
	              } catch (e) {
	                self.onError("jsonp polling iframe removal error", e)
	              }
	            }
	            try {
	              var html = '<iframe src="javascript:0" name="' + self.iframeId + '">';
	              iframe = document.createElement(html)
	            } catch (e) {
	              iframe = document.createElement("iframe");
	              iframe.name = self.iframeId;
	              iframe.src = "javascript:0"
	            }
	            iframe.id = self.iframeId;
	            self.form.appendChild(iframe);
	            self.iframe = iframe
	          }

	          initIframe();
	          data = data.replace(rEscapedNewline, "\\\n");
	          this.area.value = data.replace(rNewline, "\\n");
	          try {
	            this.form.submit()
	          } catch (e) {
	          }
	          if (this.iframe.attachEvent) {
	            this.iframe.onreadystatechange = function () {
	              if (self.iframe.readyState == "complete") {
	                complete()
	              }
	            }
	          } else {
	            this.iframe.onload = complete
	          }
	        }
	      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
	    }, {"./polling": 17, "component-inherit": 20}],
	    16: [function (_dereq_, module, exports) {
	      (function (global) {
	        var XMLHttpRequest = _dereq_("xmlhttprequest");
	        var Polling = _dereq_("./polling");
	        var Emitter = _dereq_("component-emitter");
	        var inherit = _dereq_("component-inherit");
	        var debug = _dereq_("debug")("engine.io-client:polling-xhr");
	        module.exports = XHR;
	        module.exports.Request = Request;
	        function empty() {
	        }

	        function XHR(opts) {
	          Polling.call(this, opts);
	          if (global.location) {
	            var isSSL = "https:" == location.protocol;
	            var port = location.port;
	            if (!port) {
	              port = isSSL ? 443 : 80
	            }
	            this.xd = opts.hostname != global.location.hostname || port != opts.port;
	            this.xs = opts.secure != isSSL
	          }
	        }

	        inherit(XHR, Polling);
	        XHR.prototype.supportsBinary = true;
	        XHR.prototype.request = function (opts) {
	          opts = opts || {};
	          opts.uri = this.uri();
	          opts.xd = this.xd;
	          opts.xs = this.xs;
	          opts.agent = this.agent || false;
	          opts.supportsBinary = this.supportsBinary;
	          opts.enablesXDR = this.enablesXDR;
	          return new Request(opts)
	        };
	        XHR.prototype.doWrite = function (data, fn) {
	          var isBinary = typeof data !== "string" && data !== undefined;
	          var req = this.request({method: "POST", data: data, isBinary: isBinary});
	          var self = this;
	          req.on("success", fn);
	          req.on("error", function (err) {
	            self.onError("xhr post error", err)
	          });
	          this.sendXhr = req
	        };
	        XHR.prototype.doPoll = function () {
	          debug("xhr poll");
	          var req = this.request();
	          var self = this;
	          req.on("data", function (data) {
	            self.onData(data)
	          });
	          req.on("error", function (err) {
	            self.onError("xhr poll error", err)
	          });
	          this.pollXhr = req
	        };
	        function Request(opts) {
	          this.method = opts.method || "GET";
	          this.uri = opts.uri;
	          this.xd = !!opts.xd;
	          this.xs = !!opts.xs;
	          this.async = false !== opts.async;
	          this.data = undefined != opts.data ? opts.data : null;
	          this.agent = opts.agent;
	          this.isBinary = opts.isBinary;
	          this.supportsBinary = opts.supportsBinary;
	          this.enablesXDR = opts.enablesXDR;
	          this.create()
	        }

	        Emitter(Request.prototype);
	        Request.prototype.create = function () {
	          var xhr = this.xhr = new XMLHttpRequest({
	            agent: this.agent,
	            xdomain: this.xd,
	            xscheme: this.xs,
	            enablesXDR: this.enablesXDR
	          });
	          var self = this;
	          try {
	            debug("xhr open %s: %s", this.method, this.uri);
	            xhr.open(this.method, this.uri, this.async);
	            if (this.supportsBinary) {
	              xhr.responseType = "arraybuffer"
	            }
	            if ("POST" == this.method) {
	              try {
	                if (this.isBinary) {
	                  xhr.setRequestHeader("Content-type", "application/octet-stream")
	                } else {
	                  xhr.setRequestHeader("Content-type", "text/plain;charset=UTF-8")
	                }
	              } catch (e) {
	              }
	            }
	            if ("withCredentials"in xhr) {
	              xhr.withCredentials = true
	            }
	            if (this.hasXDR()) {
	              xhr.onload = function () {
	                self.onLoad()
	              };
	              xhr.onerror = function () {
	                self.onError(xhr.responseText)
	              }
	            } else {
	              xhr.onreadystatechange = function () {
	                if (4 != xhr.readyState)return;
	                if (200 == xhr.status || 1223 == xhr.status) {
	                  self.onLoad()
	                } else {
	                  setTimeout(function () {
	                    self.onError(xhr.status)
	                  }, 0)
	                }
	              }
	            }
	            debug("xhr data %s", this.data);
	            xhr.send(this.data)
	          } catch (e) {
	            setTimeout(function () {
	              self.onError(e)
	            }, 0);
	            return
	          }
	          if (global.document) {
	            this.index = Request.requestsCount++;
	            Request.requests[this.index] = this
	          }
	        };
	        Request.prototype.onSuccess = function () {
	          this.emit("success");
	          this.cleanup()
	        };
	        Request.prototype.onData = function (data) {
	          this.emit("data", data);
	          this.onSuccess()
	        };
	        Request.prototype.onError = function (err) {
	          this.emit("error", err);
	          this.cleanup()
	        };
	        Request.prototype.cleanup = function () {
	          if ("undefined" == typeof this.xhr || null === this.xhr) {
	            return
	          }
	          if (this.hasXDR()) {
	            this.xhr.onload = this.xhr.onerror = empty
	          } else {
	            this.xhr.onreadystatechange = empty
	          }
	          try {
	            this.xhr.abort()
	          } catch (e) {
	          }
	          if (global.document) {
	            delete Request.requests[this.index]
	          }
	          this.xhr = null
	        };
	        Request.prototype.onLoad = function () {
	          var data;
	          try {
	            var contentType;
	            try {
	              contentType = this.xhr.getResponseHeader("Content-Type").split(";")[0]
	            } catch (e) {
	            }
	            if (contentType === "application/octet-stream") {
	              data = this.xhr.response
	            } else {
	              if (!this.supportsBinary) {
	                data = this.xhr.responseText
	              } else {
	                data = "ok"
	              }
	            }
	          } catch (e) {
	            this.onError(e)
	          }
	          if (null != data) {
	            this.onData(data)
	          }
	        };
	        Request.prototype.hasXDR = function () {
	          return "undefined" !== typeof global.XDomainRequest && !this.xs && this.enablesXDR
	        };
	        Request.prototype.abort = function () {
	          this.cleanup()
	        };
	        if (global.document) {
	          Request.requestsCount = 0;
	          Request.requests = {};
	          if (global.attachEvent) {
	            global.attachEvent("onunload", unloadHandler)
	          } else if (global.addEventListener) {
	            global.addEventListener("beforeunload", unloadHandler, false)
	          }
	        }
	        function unloadHandler() {
	          for (var i in Request.requests) {
	            if (Request.requests.hasOwnProperty(i)) {
	              Request.requests[i].abort()
	            }
	          }
	        }
	      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
	    }, {"./polling": 17, "component-emitter": 8, "component-inherit": 20, debug: 21, xmlhttprequest: 19}],
	    17: [function (_dereq_, module, exports) {
	      var Transport = _dereq_("../transport");
	      var parseqs = _dereq_("parseqs");
	      var parser = _dereq_("engine.io-parser");
	      var inherit = _dereq_("component-inherit");
	      var debug = _dereq_("debug")("engine.io-client:polling");
	      module.exports = Polling;
	      var hasXHR2 = function () {
	        var XMLHttpRequest = _dereq_("xmlhttprequest");
	        var xhr = new XMLHttpRequest({xdomain: false});
	        return null != xhr.responseType
	      }();

	      function Polling(opts) {
	        var forceBase64 = opts && opts.forceBase64;
	        if (!hasXHR2 || forceBase64) {
	          this.supportsBinary = false
	        }
	        Transport.call(this, opts)
	      }

	      inherit(Polling, Transport);
	      Polling.prototype.name = "polling";
	      Polling.prototype.doOpen = function () {
	        this.poll()
	      };
	      Polling.prototype.pause = function (onPause) {
	        var pending = 0;
	        var self = this;
	        this.readyState = "pausing";
	        function pause() {
	          debug("paused");
	          self.readyState = "paused";
	          onPause()
	        }

	        if (this.polling || !this.writable) {
	          var total = 0;
	          if (this.polling) {
	            debug("we are currently polling - waiting to pause");
	            total++;
	            this.once("pollComplete", function () {
	              debug("pre-pause polling complete");
	              --total || pause()
	            })
	          }
	          if (!this.writable) {
	            debug("we are currently writing - waiting to pause");
	            total++;
	            this.once("drain", function () {
	              debug("pre-pause writing complete");
	              --total || pause()
	            })
	          }
	        } else {
	          pause()
	        }
	      };
	      Polling.prototype.poll = function () {
	        debug("polling");
	        this.polling = true;
	        this.doPoll();
	        this.emit("poll")
	      };
	      Polling.prototype.onData = function (data) {
	        var self = this;
	        debug("polling got data %s", data);
	        var callback = function (packet, index, total) {
	          if ("opening" == self.readyState) {
	            self.onOpen()
	          }
	          if ("close" == packet.type) {
	            self.onClose();
	            return false
	          }
	          self.onPacket(packet)
	        };
	        parser.decodePayload(data, this.socket.binaryType, callback);
	        if ("closed" != this.readyState) {
	          this.polling = false;
	          this.emit("pollComplete");
	          if ("open" == this.readyState) {
	            this.poll()
	          } else {
	            debug('ignoring poll - transport state "%s"', this.readyState)
	          }
	        }
	      };
	      Polling.prototype.doClose = function () {
	        var self = this;

	        function close() {
	          debug("writing close packet");
	          self.write([{type: "close"}])
	        }

	        if ("open" == this.readyState) {
	          debug("transport open - closing");
	          close()
	        } else {
	          debug("transport not open - deferring close");
	          this.once("open", close)
	        }
	      };
	      Polling.prototype.write = function (packets) {
	        var self = this;
	        this.writable = false;
	        var callbackfn = function () {
	          self.writable = true;
	          self.emit("drain")
	        };
	        var self = this;
	        parser.encodePayload(packets, this.supportsBinary, function (data) {
	          self.doWrite(data, callbackfn)
	        })
	      };
	      Polling.prototype.uri = function () {
	        var query = this.query || {};
	        var schema = this.secure ? "https" : "http";
	        var port = "";
	        if (false !== this.timestampRequests) {
	          query[this.timestampParam] = +new Date + "-" + Transport.timestamps++
	        }
	        if (!this.supportsBinary && !query.sid) {
	          query.b64 = 1
	        }
	        query = parseqs.encode(query);
	        if (this.port && ("https" == schema && this.port != 443 || "http" == schema && this.port != 80)) {
	          port = ":" + this.port
	        }
	        if (query.length) {
	          query = "?" + query
	        }
	        return schema + "://" + this.hostname + port + this.path + query
	      }
	    }, {
	      "../transport": 13,
	      "component-inherit": 20,
	      debug: 21,
	      "engine.io-parser": 24,
	      parseqs: 32,
	      xmlhttprequest: 19
	    }],
	    18: [function (_dereq_, module, exports) {
	      var Transport = _dereq_("../transport");
	      var parser = _dereq_("engine.io-parser");
	      var parseqs = _dereq_("parseqs");
	      var inherit = _dereq_("component-inherit");
	      var debug = _dereq_("debug")("engine.io-client:websocket");
	      var WebSocket = _dereq_("ws");
	      module.exports = WS;
	      function WS(opts) {
	        var forceBase64 = opts && opts.forceBase64;
	        if (forceBase64) {
	          this.supportsBinary = false
	        }
	        Transport.call(this, opts)
	      }

	      inherit(WS, Transport);
	      WS.prototype.name = "websocket";
	      WS.prototype.supportsBinary = true;
	      WS.prototype.doOpen = function () {
	        if (!this.check()) {
	          return
	        }
	        var self = this;
	        var uri = this.uri();
	        var protocols = void 0;
	        var opts = {agent: this.agent};
	        this.ws = new WebSocket(uri, protocols, opts);
	        if (this.ws.binaryType === undefined) {
	          this.supportsBinary = false
	        }
	        this.ws.binaryType = "arraybuffer";
	        this.addEventListeners()
	      };
	      WS.prototype.addEventListeners = function () {
	        var self = this;
	        this.ws.onopen = function () {
	          self.onOpen()
	        };
	        this.ws.onclose = function () {
	          self.onClose()
	        };
	        this.ws.onmessage = function (ev) {
	          self.onData(ev.data)
	        };
	        this.ws.onerror = function (e) {
	          self.onError("websocket error", e)
	        }
	      };
	      if ("undefined" != typeof navigator && /iPad|iPhone|iPod/i.test(navigator.userAgent)) {
	        WS.prototype.onData = function (data) {
	          var self = this;
	          setTimeout(function () {
	            Transport.prototype.onData.call(self, data)
	          }, 0)
	        }
	      }
	      WS.prototype.write = function (packets) {
	        var self = this;
	        this.writable = false;
	        for (var i = 0, l = packets.length; i < l; i++) {
	          parser.encodePacket(packets[i], this.supportsBinary, function (data) {
	            try {
	              self.ws.send(data)
	            } catch (e) {
	              debug("websocket closed before onclose event")
	            }
	          })
	        }
	        function ondrain() {
	          self.writable = true;
	          self.emit("drain")
	        }

	        setTimeout(ondrain, 0)
	      };
	      WS.prototype.onClose = function () {
	        Transport.prototype.onClose.call(this)
	      };
	      WS.prototype.doClose = function () {
	        if (typeof this.ws !== "undefined") {
	          this.ws.close()
	        }
	      };
	      WS.prototype.uri = function () {
	        var query = this.query || {};
	        var schema = this.secure ? "wss" : "ws";
	        var port = "";
	        if (this.port && ("wss" == schema && this.port != 443 || "ws" == schema && this.port != 80)) {
	          port = ":" + this.port
	        }
	        if (this.timestampRequests) {
	          query[this.timestampParam] = +new Date
	        }
	        if (!this.supportsBinary) {
	          query.b64 = 1
	        }
	        query = parseqs.encode(query);
	        if (query.length) {
	          query = "?" + query
	        }
	        return schema + "://" + this.hostname + port + this.path + query
	      };
	      WS.prototype.check = function () {
	        return !!WebSocket && !("__initialize"in WebSocket && this.name === WS.prototype.name)
	      }
	    }, {"../transport": 13, "component-inherit": 20, debug: 21, "engine.io-parser": 24, parseqs: 32, ws: 34}],
	    19: [function (_dereq_, module, exports) {
	      var hasCORS = _dereq_("has-cors");
	      module.exports = function (opts) {
	        var xdomain = opts.xdomain;
	        var xscheme = opts.xscheme;
	        var enablesXDR = opts.enablesXDR;
	        try {
	          if ("undefined" != typeof XMLHttpRequest && (!xdomain || hasCORS)) {
	            return new XMLHttpRequest
	          }
	        } catch (e) {
	        }
	        try {
	          if ("undefined" != typeof XDomainRequest && !xscheme && enablesXDR) {
	            return new XDomainRequest
	          }
	        } catch (e) {
	        }
	        if (!xdomain) {
	          try {
	            return new ActiveXObject("Microsoft.XMLHTTP")
	          } catch (e) {
	          }
	        }
	      }
	    }, {"has-cors": 37}],
	    20: [function (_dereq_, module, exports) {
	      module.exports = function (a, b) {
	        var fn = function () {
	        };
	        fn.prototype = b.prototype;
	        a.prototype = new fn;
	        a.prototype.constructor = a
	      }
	    }, {}],
	    21: [function (_dereq_, module, exports) {
	      exports = module.exports = _dereq_("./debug");
	      exports.log = log;
	      exports.formatArgs = formatArgs;
	      exports.save = save;
	      exports.load = load;
	      exports.useColors = useColors;
	      exports.colors = ["lightseagreen", "forestgreen", "goldenrod", "dodgerblue", "darkorchid", "crimson"];
	      function useColors() {
	        return "WebkitAppearance"in document.documentElement.style || window.console && (console.firebug || console.exception && console.table) || navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31
	      }

	      exports.formatters.j = function (v) {
	        return JSON.stringify(v)
	      };
	      function formatArgs() {
	        var args = arguments;
	        var useColors = this.useColors;
	        args[0] = (useColors ? "%c" : "") + this.namespace + (useColors ? " %c" : " ") + args[0] + (useColors ? "%c " : " ") + "+" + exports.humanize(this.diff);
	        if (!useColors)return args;
	        var c = "color: " + this.color;
	        args = [args[0], c, "color: inherit"].concat(Array.prototype.slice.call(args, 1));
	        var index = 0;
	        var lastC = 0;
	        args[0].replace(/%[a-z%]/g, function (match) {
	          if ("%" === match)return;
	          index++;
	          if ("%c" === match) {
	            lastC = index
	          }
	        });
	        args.splice(lastC, 0, c);
	        return args
	      }

	      function log() {
	        return "object" == typeof console && "function" == typeof console.log && Function.prototype.apply.call(console.log, console, arguments)
	      }

	      function save(namespaces) {
	        try {
	          if (null == namespaces) {
	            localStorage.removeItem("debug")
	          } else {
	            localStorage.debug = namespaces
	          }
	        } catch (e) {
	        }
	      }

	      function load() {
	        var r;
	        try {
	          r = localStorage.debug
	        } catch (e) {
	        }
	        return r
	      }

	      exports.enable(load())
	    }, {"./debug": 22}],
	    22: [function (_dereq_, module, exports) {
	      exports = module.exports = debug;
	      exports.coerce = coerce;
	      exports.disable = disable;
	      exports.enable = enable;
	      exports.enabled = enabled;
	      exports.humanize = _dereq_("ms");
	      exports.names = [];
	      exports.skips = [];
	      exports.formatters = {};
	      var prevColor = 0;
	      var prevTime;

	      function selectColor() {
	        return exports.colors[prevColor++ % exports.colors.length]
	      }

	      function debug(namespace) {
	        function disabled() {
	        }

	        disabled.enabled = false;
	        function enabled() {
	          var self = enabled;
	          var curr = +new Date;
	          var ms = curr - (prevTime || curr);
	          self.diff = ms;
	          self.prev = prevTime;
	          self.curr = curr;
	          prevTime = curr;
	          if (null == self.useColors)self.useColors = exports.useColors();
	          if (null == self.color && self.useColors)self.color = selectColor();
	          var args = Array.prototype.slice.call(arguments);
	          args[0] = exports.coerce(args[0]);
	          if ("string" !== typeof args[0]) {
	            args = ["%o"].concat(args)
	          }
	          var index = 0;
	          args[0] = args[0].replace(/%([a-z%])/g, function (match, format) {
	            if (match === "%")return match;
	            index++;
	            var formatter = exports.formatters[format];
	            if ("function" === typeof formatter) {
	              var val = args[index];
	              match = formatter.call(self, val);
	              args.splice(index, 1);
	              index--
	            }
	            return match
	          });
	          if ("function" === typeof exports.formatArgs) {
	            args = exports.formatArgs.apply(self, args)
	          }
	          var logFn = enabled.log || exports.log || console.log.bind(console);
	          logFn.apply(self, args)
	        }

	        enabled.enabled = true;
	        var fn = exports.enabled(namespace) ? enabled : disabled;
	        fn.namespace = namespace;
	        return fn
	      }

	      function enable(namespaces) {
	        exports.save(namespaces);
	        var split = (namespaces || "").split(/[\s,]+/);
	        var len = split.length;
	        for (var i = 0; i < len; i++) {
	          if (!split[i])continue;
	          namespaces = split[i].replace(/\*/g, ".*?");
	          if (namespaces[0] === "-") {
	            exports.skips.push(new RegExp("^" + namespaces.substr(1) + "$"))
	          } else {
	            exports.names.push(new RegExp("^" + namespaces + "$"))
	          }
	        }
	      }

	      function disable() {
	        exports.enable("")
	      }

	      function enabled(name) {
	        var i, len;
	        for (i = 0, len = exports.skips.length; i < len; i++) {
	          if (exports.skips[i].test(name)) {
	            return false
	          }
	        }
	        for (i = 0, len = exports.names.length; i < len; i++) {
	          if (exports.names[i].test(name)) {
	            return true
	          }
	        }
	        return false
	      }

	      function coerce(val) {
	        if (val instanceof Error)return val.stack || val.message;
	        return val
	      }
	    }, {ms: 23}],
	    23: [function (_dereq_, module, exports) {
	      var s = 1e3;
	      var m = s * 60;
	      var h = m * 60;
	      var d = h * 24;
	      var y = d * 365.25;
	      module.exports = function (val, options) {
	        options = options || {};
	        if ("string" == typeof val)return parse(val);
	        return options.long ? long(val) : short(val)
	      };
	      function parse(str) {
	        var match = /^((?:\d+)?\.?\d+) *(ms|seconds?|s|minutes?|m|hours?|h|days?|d|years?|y)?$/i.exec(str);
	        if (!match)return;
	        var n = parseFloat(match[1]);
	        var type = (match[2] || "ms").toLowerCase();
	        switch (type) {
	          case"years":
	          case"year":
	          case"y":
	            return n * y;
	          case"days":
	          case"day":
	          case"d":
	            return n * d;
	          case"hours":
	          case"hour":
	          case"h":
	            return n * h;
	          case"minutes":
	          case"minute":
	          case"m":
	            return n * m;
	          case"seconds":
	          case"second":
	          case"s":
	            return n * s;
	          case"ms":
	            return n
	        }
	      }

	      function short(ms) {
	        if (ms >= d)return Math.round(ms / d) + "d";
	        if (ms >= h)return Math.round(ms / h) + "h";
	        if (ms >= m)return Math.round(ms / m) + "m";
	        if (ms >= s)return Math.round(ms / s) + "s";
	        return ms + "ms"
	      }

	      function long(ms) {
	        return plural(ms, d, "day") || plural(ms, h, "hour") || plural(ms, m, "minute") || plural(ms, s, "second") || ms + " ms"
	      }

	      function plural(ms, n, name) {
	        if (ms < n)return;
	        if (ms < n * 1.5)return Math.floor(ms / n) + " " + name;
	        return Math.ceil(ms / n) + " " + name + "s"
	      }
	    }, {}],
	    24: [function (_dereq_, module, exports) {
	      (function (global) {
	        var keys = _dereq_("./keys");
	        var sliceBuffer = _dereq_("arraybuffer.slice");
	        var base64encoder = _dereq_("base64-arraybuffer");
	        var after = _dereq_("after");
	        var utf8 = _dereq_("utf8");
	        var isAndroid = navigator.userAgent.match(/Android/i);
	        exports.protocol = 3;
	        var packets = exports.packets = {open: 0, close: 1, ping: 2, pong: 3, message: 4, upgrade: 5, noop: 6};
	        var packetslist = keys(packets);
	        var err = {type: "error", data: "parser error"};
	        var Blob = _dereq_("blob");
	        exports.encodePacket = function (packet, supportsBinary, utf8encode, callback) {
	          if ("function" == typeof supportsBinary) {
	            callback = supportsBinary;
	            supportsBinary = false
	          }
	          if ("function" == typeof utf8encode) {
	            callback = utf8encode;
	            utf8encode = null
	          }
	          var data = packet.data === undefined ? undefined : packet.data.buffer || packet.data;
	          if (global.ArrayBuffer && data instanceof ArrayBuffer) {
	            return encodeArrayBuffer(packet, supportsBinary, callback)
	          } else if (Blob && data instanceof global.Blob) {
	            return encodeBlob(packet, supportsBinary, callback)
	          }
	          var encoded = packets[packet.type];
	          if (undefined !== packet.data) {
	            encoded += utf8encode ? utf8.encode(String(packet.data)) : String(packet.data)
	          }
	          return callback("" + encoded)
	        };
	        function encodeArrayBuffer(packet, supportsBinary, callback) {
	          if (!supportsBinary) {
	            return exports.encodeBase64Packet(packet, callback)
	          }
	          var data = packet.data;
	          var contentArray = new Uint8Array(data);
	          var resultBuffer = new Uint8Array(1 + data.byteLength);
	          resultBuffer[0] = packets[packet.type];
	          for (var i = 0; i < contentArray.length; i++) {
	            resultBuffer[i + 1] = contentArray[i]
	          }
	          return callback(resultBuffer.buffer)
	        }

	        function encodeBlobAsArrayBuffer(packet, supportsBinary, callback) {
	          if (!supportsBinary) {
	            return exports.encodeBase64Packet(packet, callback)
	          }
	          var fr = new FileReader;
	          fr.onload = function () {
	            packet.data = fr.result;
	            exports.encodePacket(packet, supportsBinary, true, callback)
	          };
	          return fr.readAsArrayBuffer(packet.data)
	        }

	        function encodeBlob(packet, supportsBinary, callback) {
	          if (!supportsBinary) {
	            return exports.encodeBase64Packet(packet, callback)
	          }
	          if (isAndroid) {
	            return encodeBlobAsArrayBuffer(packet, supportsBinary, callback)
	          }
	          var length = new Uint8Array(1);
	          length[0] = packets[packet.type];
	          var blob = new Blob([length.buffer, packet.data]);
	          return callback(blob)
	        }

	        exports.encodeBase64Packet = function (packet, callback) {
	          var message = "b" + exports.packets[packet.type];
	          if (Blob && packet.data instanceof Blob) {
	            var fr = new FileReader;
	            fr.onload = function () {
	              var b64 = fr.result.split(",")[1];
	              callback(message + b64)
	            };
	            return fr.readAsDataURL(packet.data)
	          }
	          var b64data;
	          try {
	            b64data = String.fromCharCode.apply(null, new Uint8Array(packet.data))
	          } catch (e) {
	            var typed = new Uint8Array(packet.data);
	            var basic = new Array(typed.length);
	            for (var i = 0; i < typed.length; i++) {
	              basic[i] = typed[i]
	            }
	            b64data = String.fromCharCode.apply(null, basic)
	          }
	          message += global.btoa(b64data);
	          return callback(message)
	        };
	        exports.decodePacket = function (data, binaryType, utf8decode) {
	          if (typeof data == "string" || data === undefined) {
	            if (data.charAt(0) == "b") {
	              return exports.decodeBase64Packet(data.substr(1), binaryType)
	            }
	            if (utf8decode) {
	              try {
	                data = utf8.decode(data)
	              } catch (e) {
	                return err
	              }
	            }
	            var type = data.charAt(0);
	            if (Number(type) != type || !packetslist[type]) {
	              return err
	            }
	            if (data.length > 1) {
	              return {type: packetslist[type], data: data.substring(1)}
	            } else {
	              return {type: packetslist[type]}
	            }
	          }
	          var asArray = new Uint8Array(data);
	          var type = asArray[0];
	          var rest = sliceBuffer(data, 1);
	          if (Blob && binaryType === "blob") {
	            rest = new Blob([rest])
	          }
	          return {type: packetslist[type], data: rest}
	        };
	        exports.decodeBase64Packet = function (msg, binaryType) {
	          var type = packetslist[msg.charAt(0)];
	          if (!global.ArrayBuffer) {
	            return {type: type, data: {base64: true, data: msg.substr(1)}}
	          }
	          var data = base64encoder.decode(msg.substr(1));
	          if (binaryType === "blob" && Blob) {
	            data = new Blob([data])
	          }
	          return {type: type, data: data}
	        };
	        exports.encodePayload = function (packets, supportsBinary, callback) {
	          if (typeof supportsBinary == "function") {
	            callback = supportsBinary;
	            supportsBinary = null
	          }
	          if (supportsBinary) {
	            if (Blob && !isAndroid) {
	              return exports.encodePayloadAsBlob(packets, callback)
	            }
	            return exports.encodePayloadAsArrayBuffer(packets, callback)
	          }
	          if (!packets.length) {
	            return callback("0:")
	          }
	          function setLengthHeader(message) {
	            return message.length + ":" + message
	          }

	          function encodeOne(packet, doneCallback) {
	            exports.encodePacket(packet, supportsBinary, true, function (message) {
	              doneCallback(null, setLengthHeader(message))
	            })
	          }

	          map(packets, encodeOne, function (err, results) {
	            return callback(results.join(""))
	          })
	        };
	        function map(ary, each, done) {
	          var result = new Array(ary.length);
	          var next = after(ary.length, done);
	          var eachWithIndex = function (i, el, cb) {
	            each(el, function (error, msg) {
	              result[i] = msg;
	              cb(error, result)
	            })
	          };
	          for (var i = 0; i < ary.length; i++) {
	            eachWithIndex(i, ary[i], next)
	          }
	        }

	        exports.decodePayload = function (data, binaryType, callback) {
	          if (typeof data != "string") {
	            return exports.decodePayloadAsBinary(data, binaryType, callback)
	          }
	          if (typeof binaryType === "function") {
	            callback = binaryType;
	            binaryType = null
	          }
	          var packet;
	          if (data == "") {
	            return callback(err, 0, 1)
	          }
	          var length = "", n, msg;
	          for (var i = 0, l = data.length; i < l; i++) {
	            var chr = data.charAt(i);
	            if (":" != chr) {
	              length += chr
	            } else {
	              if ("" == length || length != (n = Number(length))) {
	                return callback(err, 0, 1)
	              }
	              msg = data.substr(i + 1, n);
	              if (length != msg.length) {
	                return callback(err, 0, 1)
	              }
	              if (msg.length) {
	                packet = exports.decodePacket(msg, binaryType, true);
	                if (err.type == packet.type && err.data == packet.data) {
	                  return callback(err, 0, 1)
	                }
	                var ret = callback(packet, i + n, l);
	                if (false === ret)return
	              }
	              i += n;
	              length = ""
	            }
	          }
	          if (length != "") {
	            return callback(err, 0, 1)
	          }
	        };
	        exports.encodePayloadAsArrayBuffer = function (packets, callback) {
	          if (!packets.length) {
	            return callback(new ArrayBuffer(0))
	          }
	          function encodeOne(packet, doneCallback) {
	            exports.encodePacket(packet, true, true, function (data) {
	              return doneCallback(null, data)
	            })
	          }

	          map(packets, encodeOne, function (err, encodedPackets) {
	            var totalLength = encodedPackets.reduce(function (acc, p) {
	              var len;
	              if (typeof p === "string") {
	                len = p.length
	              } else {
	                len = p.byteLength
	              }
	              return acc + len.toString().length + len + 2
	            }, 0);
	            var resultArray = new Uint8Array(totalLength);
	            var bufferIndex = 0;
	            encodedPackets.forEach(function (p) {
	              var isString = typeof p === "string";
	              var ab = p;
	              if (isString) {
	                var view = new Uint8Array(p.length);
	                for (var i = 0; i < p.length; i++) {
	                  view[i] = p.charCodeAt(i)
	                }
	                ab = view.buffer
	              }
	              if (isString) {
	                resultArray[bufferIndex++] = 0
	              } else {
	                resultArray[bufferIndex++] = 1
	              }
	              var lenStr = ab.byteLength.toString();
	              for (var i = 0; i < lenStr.length; i++) {
	                resultArray[bufferIndex++] = parseInt(lenStr[i])
	              }
	              resultArray[bufferIndex++] = 255;
	              var view = new Uint8Array(ab);
	              for (var i = 0; i < view.length; i++) {
	                resultArray[bufferIndex++] = view[i]
	              }
	            });
	            return callback(resultArray.buffer)
	          })
	        };
	        exports.encodePayloadAsBlob = function (packets, callback) {
	          function encodeOne(packet, doneCallback) {
	            exports.encodePacket(packet, true, true, function (encoded) {
	              var binaryIdentifier = new Uint8Array(1);
	              binaryIdentifier[0] = 1;
	              if (typeof encoded === "string") {
	                var view = new Uint8Array(encoded.length);
	                for (var i = 0; i < encoded.length; i++) {
	                  view[i] = encoded.charCodeAt(i)
	                }
	                encoded = view.buffer;
	                binaryIdentifier[0] = 0
	              }
	              var len = encoded instanceof ArrayBuffer ? encoded.byteLength : encoded.size;
	              var lenStr = len.toString();
	              var lengthAry = new Uint8Array(lenStr.length + 1);
	              for (var i = 0; i < lenStr.length; i++) {
	                lengthAry[i] = parseInt(lenStr[i])
	              }
	              lengthAry[lenStr.length] = 255;
	              if (Blob) {
	                var blob = new Blob([binaryIdentifier.buffer, lengthAry.buffer, encoded]);
	                doneCallback(null, blob)
	              }
	            })
	          }

	          map(packets, encodeOne, function (err, results) {
	            return callback(new Blob(results))
	          })
	        };
	        exports.decodePayloadAsBinary = function (data, binaryType, callback) {
	          if (typeof binaryType === "function") {
	            callback = binaryType;
	            binaryType = null
	          }
	          var bufferTail = data;
	          var buffers = [];
	          var numberTooLong = false;
	          while (bufferTail.byteLength > 0) {
	            var tailArray = new Uint8Array(bufferTail);
	            var isString = tailArray[0] === 0;
	            var msgLength = "";
	            for (var i = 1; ; i++) {
	              if (tailArray[i] == 255)break;
	              if (msgLength.length > 310) {
	                numberTooLong = true;
	                break
	              }
	              msgLength += tailArray[i]
	            }
	            if (numberTooLong)return callback(err, 0, 1);
	            bufferTail = sliceBuffer(bufferTail, 2 + msgLength.length);
	            msgLength = parseInt(msgLength);
	            var msg = sliceBuffer(bufferTail, 0, msgLength);
	            if (isString) {
	              try {
	                msg = String.fromCharCode.apply(null, new Uint8Array(msg))
	              } catch (e) {
	                var typed = new Uint8Array(msg);
	                msg = "";
	                for (var i = 0; i < typed.length; i++) {
	                  msg += String.fromCharCode(typed[i])
	                }
	              }
	            }
	            buffers.push(msg);
	            bufferTail = sliceBuffer(bufferTail, msgLength)
	          }
	          var total = buffers.length;
	          buffers.forEach(function (buffer, i) {
	            callback(exports.decodePacket(buffer, binaryType, true), i, total)
	          })
	        }
	      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
	    }, {"./keys": 25, after: 26, "arraybuffer.slice": 27, "base64-arraybuffer": 28, blob: 29, utf8: 30}],
	    25: [function (_dereq_, module, exports) {
	      module.exports = Object.keys || function keys(obj) {
	        var arr = [];
	        var has = Object.prototype.hasOwnProperty;
	        for (var i in obj) {
	          if (has.call(obj, i)) {
	            arr.push(i)
	          }
	        }
	        return arr
	      }
	    }, {}],
	    26: [function (_dereq_, module, exports) {
	      module.exports = after;
	      function after(count, callback, err_cb) {
	        var bail = false;
	        err_cb = err_cb || noop;
	        proxy.count = count;
	        return count === 0 ? callback() : proxy;
	        function proxy(err, result) {
	          if (proxy.count <= 0) {
	            throw new Error("after called too many times")
	          }
	          --proxy.count;
	          if (err) {
	            bail = true;
	            callback(err);
	            callback = err_cb
	          } else if (proxy.count === 0 && !bail) {
	            callback(null, result)
	          }
	        }
	      }

	      function noop() {
	      }
	    }, {}],
	    27: [function (_dereq_, module, exports) {
	      module.exports = function (arraybuffer, start, end) {
	        var bytes = arraybuffer.byteLength;
	        start = start || 0;
	        end = end || bytes;
	        if (arraybuffer.slice) {
	          return arraybuffer.slice(start, end)
	        }
	        if (start < 0) {
	          start += bytes
	        }
	        if (end < 0) {
	          end += bytes
	        }
	        if (end > bytes) {
	          end = bytes
	        }
	        if (start >= bytes || start >= end || bytes === 0) {
	          return new ArrayBuffer(0)
	        }
	        var abv = new Uint8Array(arraybuffer);
	        var result = new Uint8Array(end - start);
	        for (var i = start, ii = 0; i < end; i++, ii++) {
	          result[ii] = abv[i]
	        }
	        return result.buffer
	      }
	    }, {}],
	    28: [function (_dereq_, module, exports) {
	      (function (chars) {
	        "use strict";
	        exports.encode = function (arraybuffer) {
	          var bytes = new Uint8Array(arraybuffer), i, len = bytes.length, base64 = "";
	          for (i = 0; i < len; i += 3) {
	            base64 += chars[bytes[i] >> 2];
	            base64 += chars[(bytes[i] & 3) << 4 | bytes[i + 1] >> 4];
	            base64 += chars[(bytes[i + 1] & 15) << 2 | bytes[i + 2] >> 6];
	            base64 += chars[bytes[i + 2] & 63]
	          }
	          if (len % 3 === 2) {
	            base64 = base64.substring(0, base64.length - 1) + "="
	          } else if (len % 3 === 1) {
	            base64 = base64.substring(0, base64.length - 2) + "=="
	          }
	          return base64
	        };
	        exports.decode = function (base64) {
	          var bufferLength = base64.length * .75, len = base64.length, i, p = 0, encoded1, encoded2, encoded3, encoded4;
	          if (base64[base64.length - 1] === "=") {
	            bufferLength--;
	            if (base64[base64.length - 2] === "=") {
	              bufferLength--
	            }
	          }
	          var arraybuffer = new ArrayBuffer(bufferLength), bytes = new Uint8Array(arraybuffer);
	          for (i = 0; i < len; i += 4) {
	            encoded1 = chars.indexOf(base64[i]);
	            encoded2 = chars.indexOf(base64[i + 1]);
	            encoded3 = chars.indexOf(base64[i + 2]);
	            encoded4 = chars.indexOf(base64[i + 3]);
	            bytes[p++] = encoded1 << 2 | encoded2 >> 4;
	            bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
	            bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63
	          }
	          return arraybuffer
	        }
	      })("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/")
	    }, {}],
	    29: [function (_dereq_, module, exports) {
	      (function (global) {
	        var BlobBuilder = global.BlobBuilder || global.WebKitBlobBuilder || global.MSBlobBuilder || global.MozBlobBuilder;
	        var blobSupported = function () {
	          try {
	            var b = new Blob(["hi"]);
	            return b.size == 2
	          } catch (e) {
	            return false
	          }
	        }();
	        var blobBuilderSupported = BlobBuilder && BlobBuilder.prototype.append && BlobBuilder.prototype.getBlob;

	        function BlobBuilderConstructor(ary, options) {
	          options = options || {};
	          var bb = new BlobBuilder;
	          for (var i = 0; i < ary.length; i++) {
	            bb.append(ary[i])
	          }
	          return options.type ? bb.getBlob(options.type) : bb.getBlob()
	        }

	        module.exports = function () {
	          if (blobSupported) {
	            return global.Blob
	          } else if (blobBuilderSupported) {
	            return BlobBuilderConstructor
	          } else {
	            return undefined
	          }
	        }()
	      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
	    }, {}],
	    30: [function (_dereq_, module, exports) {
	      (function (global) {
	        (function (root) {
	          var freeExports = typeof exports == "object" && exports;
	          var freeModule = typeof module == "object" && module && module.exports == freeExports && module;
	          var freeGlobal = typeof global == "object" && global;
	          if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
	            root = freeGlobal
	          }
	          var stringFromCharCode = String.fromCharCode;

	          function ucs2decode(string) {
	            var output = [];
	            var counter = 0;
	            var length = string.length;
	            var value;
	            var extra;
	            while (counter < length) {
	              value = string.charCodeAt(counter++);
	              if (value >= 55296 && value <= 56319 && counter < length) {
	                extra = string.charCodeAt(counter++);
	                if ((extra & 64512) == 56320) {
	                  output.push(((value & 1023) << 10) + (extra & 1023) + 65536)
	                } else {
	                  output.push(value);
	                  counter--
	                }
	              } else {
	                output.push(value)
	              }
	            }
	            return output
	          }

	          function ucs2encode(array) {
	            var length = array.length;
	            var index = -1;
	            var value;
	            var output = "";
	            while (++index < length) {
	              value = array[index];
	              if (value > 65535) {
	                value -= 65536;
	                output += stringFromCharCode(value >>> 10 & 1023 | 55296);
	                value = 56320 | value & 1023
	              }
	              output += stringFromCharCode(value)
	            }
	            return output
	          }

	          function createByte(codePoint, shift) {
	            return stringFromCharCode(codePoint >> shift & 63 | 128)
	          }

	          function encodeCodePoint(codePoint) {
	            if ((codePoint & 4294967168) == 0) {
	              return stringFromCharCode(codePoint)
	            }
	            var symbol = "";
	            if ((codePoint & 4294965248) == 0) {
	              symbol = stringFromCharCode(codePoint >> 6 & 31 | 192)
	            } else if ((codePoint & 4294901760) == 0) {
	              symbol = stringFromCharCode(codePoint >> 12 & 15 | 224);
	              symbol += createByte(codePoint, 6)
	            } else if ((codePoint & 4292870144) == 0) {
	              symbol = stringFromCharCode(codePoint >> 18 & 7 | 240);
	              symbol += createByte(codePoint, 12);
	              symbol += createByte(codePoint, 6)
	            }
	            symbol += stringFromCharCode(codePoint & 63 | 128);
	            return symbol
	          }

	          function utf8encode(string) {
	            var codePoints = ucs2decode(string);
	            var length = codePoints.length;
	            var index = -1;
	            var codePoint;
	            var byteString = "";
	            while (++index < length) {
	              codePoint = codePoints[index];
	              byteString += encodeCodePoint(codePoint)
	            }
	            return byteString
	          }

	          function readContinuationByte() {
	            if (byteIndex >= byteCount) {
	              throw Error("Invalid byte index")
	            }
	            var continuationByte = byteArray[byteIndex] & 255;
	            byteIndex++;
	            if ((continuationByte & 192) == 128) {
	              return continuationByte & 63
	            }
	            throw Error("Invalid continuation byte")
	          }

	          function decodeSymbol() {
	            var byte1;
	            var byte2;
	            var byte3;
	            var byte4;
	            var codePoint;
	            if (byteIndex > byteCount) {
	              throw Error("Invalid byte index")
	            }
	            if (byteIndex == byteCount) {
	              return false
	            }
	            byte1 = byteArray[byteIndex] & 255;
	            byteIndex++;
	            if ((byte1 & 128) == 0) {
	              return byte1
	            }
	            if ((byte1 & 224) == 192) {
	              var byte2 = readContinuationByte();
	              codePoint = (byte1 & 31) << 6 | byte2;
	              if (codePoint >= 128) {
	                return codePoint
	              } else {
	                throw Error("Invalid continuation byte")
	              }
	            }
	            if ((byte1 & 240) == 224) {
	              byte2 = readContinuationByte();
	              byte3 = readContinuationByte();
	              codePoint = (byte1 & 15) << 12 | byte2 << 6 | byte3;
	              if (codePoint >= 2048) {
	                return codePoint
	              } else {
	                throw Error("Invalid continuation byte")
	              }
	            }
	            if ((byte1 & 248) == 240) {
	              byte2 = readContinuationByte();
	              byte3 = readContinuationByte();
	              byte4 = readContinuationByte();
	              codePoint = (byte1 & 15) << 18 | byte2 << 12 | byte3 << 6 | byte4;
	              if (codePoint >= 65536 && codePoint <= 1114111) {
	                return codePoint
	              }
	            }
	            throw Error("Invalid UTF-8 detected")
	          }

	          var byteArray;
	          var byteCount;
	          var byteIndex;

	          function utf8decode(byteString) {
	            byteArray = ucs2decode(byteString);
	            byteCount = byteArray.length;
	            byteIndex = 0;
	            var codePoints = [];
	            var tmp;
	            while ((tmp = decodeSymbol()) !== false) {
	              codePoints.push(tmp)
	            }
	            return ucs2encode(codePoints)
	          }

	          var utf8 = {version: "2.0.0", encode: utf8encode, decode: utf8decode};
	          if (typeof define == "function" && typeof define.amd == "object" && define.amd) {
	            define(function () {
	              return utf8
	            })
	          } else if (freeExports && !freeExports.nodeType) {
	            if (freeModule) {
	              freeModule.exports = utf8
	            } else {
	              var object = {};
	              var hasOwnProperty = object.hasOwnProperty;
	              for (var key in utf8) {
	                hasOwnProperty.call(utf8, key) && (freeExports[key] = utf8[key])
	              }
	            }
	          } else {
	            root.utf8 = utf8
	          }
	        })(this)
	      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
	    }, {}],
	    31: [function (_dereq_, module, exports) {
	      (function (global) {
	        var rvalidchars = /^[\],:{}\s]*$/;
	        var rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
	        var rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
	        var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
	        var rtrimLeft = /^\s+/;
	        var rtrimRight = /\s+$/;
	        module.exports = function parsejson(data) {
	          if ("string" != typeof data || !data) {
	            return null
	          }
	          data = data.replace(rtrimLeft, "").replace(rtrimRight, "");
	          if (global.JSON && JSON.parse) {
	            return JSON.parse(data)
	          }
	          if (rvalidchars.test(data.replace(rvalidescape, "@").replace(rvalidtokens, "]").replace(rvalidbraces, ""))) {
	            return new Function("return " + data)()
	          }
	        }
	      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
	    }, {}],
	    32: [function (_dereq_, module, exports) {
	      exports.encode = function (obj) {
	        var str = "";
	        for (var i in obj) {
	          if (obj.hasOwnProperty(i)) {
	            if (str.length)str += "&";
	            str += encodeURIComponent(i) + "=" + encodeURIComponent(obj[i])
	          }
	        }
	        return str
	      };
	      exports.decode = function (qs) {
	        var qry = {};
	        var pairs = qs.split("&");
	        for (var i = 0, l = pairs.length; i < l; i++) {
	          var pair = pairs[i].split("=");
	          qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1])
	        }
	        return qry
	      }
	    }, {}],
	    33: [function (_dereq_, module, exports) {
	      var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
	      var parts = ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"];
	      module.exports = function parseuri(str) {
	        var src = str, b = str.indexOf("["), e = str.indexOf("]");
	        if (b != -1 && e != -1) {
	          str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ";") + str.substring(e, str.length)
	        }
	        var m = re.exec(str || ""), uri = {}, i = 14;
	        while (i--) {
	          uri[parts[i]] = m[i] || ""
	        }
	        if (b != -1 && e != -1) {
	          uri.source = src;
	          uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ":");
	          uri.authority = uri.authority.replace("[", "").replace("]", "").replace(/;/g, ":");
	          uri.ipv6uri = true
	        }
	        return uri
	      }
	    }, {}],
	    34: [function (_dereq_, module, exports) {
	      var global = function () {
	        return this
	      }();
	      var WebSocket = global.WebSocket || global.MozWebSocket;
	      module.exports = WebSocket ? ws : null;
	      function ws(uri, protocols, opts) {
	        var instance;
	        if (protocols) {
	          instance = new WebSocket(uri, protocols)
	        } else {
	          instance = new WebSocket(uri)
	        }
	        return instance
	      }

	      if (WebSocket)ws.prototype = WebSocket.prototype
	    }, {}],
	    35: [function (_dereq_, module, exports) {
	      (function (global) {
	        var isArray = _dereq_("isarray");
	        module.exports = hasBinary;
	        function hasBinary(data) {
	          function _hasBinary(obj) {
	            if (!obj)return false;
	            if (global.Buffer && global.Buffer.isBuffer(obj) || global.ArrayBuffer && obj instanceof ArrayBuffer || global.Blob && obj instanceof Blob || global.File && obj instanceof File) {
	              return true
	            }
	            if (isArray(obj)) {
	              for (var i = 0; i < obj.length; i++) {
	                if (_hasBinary(obj[i])) {
	                  return true
	                }
	              }
	            } else if (obj && "object" == typeof obj) {
	              if (obj.toJSON) {
	                obj = obj.toJSON()
	              }
	              for (var key in obj) {
	                if (obj.hasOwnProperty(key) && _hasBinary(obj[key])) {
	                  return true
	                }
	              }
	            }
	            return false
	          }

	          return _hasBinary(data)
	        }
	      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
	    }, {isarray: 36}],
	    36: [function (_dereq_, module, exports) {
	      module.exports = Array.isArray || function (arr) {
	        return Object.prototype.toString.call(arr) == "[object Array]"
	      }
	    }, {}],
	    37: [function (_dereq_, module, exports) {
	      var global = _dereq_("global");
	      try {
	        module.exports = "XMLHttpRequest"in global && "withCredentials"in new global.XMLHttpRequest
	      } catch (err) {
	        module.exports = false
	      }
	    }, {global: 38}],
	    38: [function (_dereq_, module, exports) {
	      module.exports = function () {
	        return this
	      }()
	    }, {}],
	    39: [function (_dereq_, module, exports) {
	      var indexOf = [].indexOf;
	      module.exports = function (arr, obj) {
	        if (indexOf)return arr.indexOf(obj);
	        for (var i = 0; i < arr.length; ++i) {
	          if (arr[i] === obj)return i
	        }
	        return -1
	      }
	    }, {}],
	    40: [function (_dereq_, module, exports) {
	      var has = Object.prototype.hasOwnProperty;
	      exports.keys = Object.keys || function (obj) {
	        var keys = [];
	        for (var key in obj) {
	          if (has.call(obj, key)) {
	            keys.push(key)
	          }
	        }
	        return keys
	      };
	      exports.values = function (obj) {
	        var vals = [];
	        for (var key in obj) {
	          if (has.call(obj, key)) {
	            vals.push(obj[key])
	          }
	        }
	        return vals
	      };
	      exports.merge = function (a, b) {
	        for (var key in b) {
	          if (has.call(b, key)) {
	            a[key] = b[key]
	          }
	        }
	        return a
	      };
	      exports.length = function (obj) {
	        return exports.keys(obj).length
	      };
	      exports.isEmpty = function (obj) {
	        return 0 == exports.length(obj)
	      }
	    }, {}],
	    41: [function (_dereq_, module, exports) {
	      var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
	      var parts = ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"];
	      module.exports = function parseuri(str) {
	        var m = re.exec(str || ""), uri = {}, i = 14;
	        while (i--) {
	          uri[parts[i]] = m[i] || ""
	        }
	        return uri
	      }
	    }, {}],
	    42: [function (_dereq_, module, exports) {
	      (function (global) {
	        var isArray = _dereq_("isarray");
	        var isBuf = _dereq_("./is-buffer");
	        exports.deconstructPacket = function (packet) {
	          var buffers = [];
	          var packetData = packet.data;

	          function _deconstructPacket(data) {
	            if (!data)return data;
	            if (isBuf(data)) {
	              var placeholder = {_placeholder: true, num: buffers.length};
	              buffers.push(data);
	              return placeholder
	            } else if (isArray(data)) {
	              var newData = new Array(data.length);
	              for (var i = 0; i < data.length; i++) {
	                newData[i] = _deconstructPacket(data[i])
	              }
	              return newData
	            } else if ("object" == typeof data && !(data instanceof Date)) {
	              var newData = {};
	              for (var key in data) {
	                newData[key] = _deconstructPacket(data[key])
	              }
	              return newData
	            }
	            return data
	          }

	          var pack = packet;
	          pack.data = _deconstructPacket(packetData);
	          pack.attachments = buffers.length;
	          return {packet: pack, buffers: buffers}
	        };
	        exports.reconstructPacket = function (packet, buffers) {
	          var curPlaceHolder = 0;

	          function _reconstructPacket(data) {
	            if (data && data._placeholder) {
	              var buf = buffers[data.num];
	              return buf
	            } else if (isArray(data)) {
	              for (var i = 0; i < data.length; i++) {
	                data[i] = _reconstructPacket(data[i])
	              }
	              return data
	            } else if (data && "object" == typeof data) {
	              for (var key in data) {
	                data[key] = _reconstructPacket(data[key])
	              }
	              return data
	            }
	            return data
	          }

	          packet.data = _reconstructPacket(packet.data);
	          packet.attachments = undefined;
	          return packet
	        };
	        exports.removeBlobs = function (data, callback) {
	          function _removeBlobs(obj, curKey, containingObject) {
	            if (!obj)return obj;
	            if (global.Blob && obj instanceof Blob || global.File && obj instanceof File) {
	              pendingBlobs++;
	              var fileReader = new FileReader;
	              fileReader.onload = function () {
	                if (containingObject) {
	                  containingObject[curKey] = this.result
	                } else {
	                  bloblessData = this.result
	                }
	                if (!--pendingBlobs) {
	                  callback(bloblessData)
	                }
	              };
	              fileReader.readAsArrayBuffer(obj)
	            } else if (isArray(obj)) {
	              for (var i = 0; i < obj.length; i++) {
	                _removeBlobs(obj[i], i, obj)
	              }
	            } else if (obj && "object" == typeof obj && !isBuf(obj)) {
	              for (var key in obj) {
	                _removeBlobs(obj[key], key, obj)
	              }
	            }
	          }

	          var pendingBlobs = 0;
	          var bloblessData = data;
	          _removeBlobs(bloblessData);
	          if (!pendingBlobs) {
	            callback(bloblessData)
	          }
	        }
	      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
	    }, {"./is-buffer": 44, isarray: 45}],
	    43: [function (_dereq_, module, exports) {
	      var debug = _dereq_("debug")("socket.io-parser");
	      var json = _dereq_("json3");
	      var isArray = _dereq_("isarray");
	      var Emitter = _dereq_("component-emitter");
	      var binary = _dereq_("./binary");
	      var isBuf = _dereq_("./is-buffer");
	      exports.protocol = 4;
	      exports.types = ["CONNECT", "DISCONNECT", "EVENT", "BINARY_EVENT", "ACK", "BINARY_ACK", "ERROR"];
	      exports.CONNECT = 0;
	      exports.DISCONNECT = 1;
	      exports.EVENT = 2;
	      exports.ACK = 3;
	      exports.ERROR = 4;
	      exports.BINARY_EVENT = 5;
	      exports.BINARY_ACK = 6;
	      exports.Encoder = Encoder;
	      exports.Decoder = Decoder;
	      function Encoder() {
	      }

	      Encoder.prototype.encode = function (obj, callback) {
	        debug("encoding packet %j", obj);
	        if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {
	          encodeAsBinary(obj, callback)
	        } else {
	          var encoding = encodeAsString(obj);
	          callback([encoding])
	        }
	      };
	      function encodeAsString(obj) {
	        var str = "";
	        var nsp = false;
	        str += obj.type;
	        if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {
	          str += obj.attachments;
	          str += "-"
	        }
	        if (obj.nsp && "/" != obj.nsp) {
	          nsp = true;
	          str += obj.nsp
	        }
	        if (null != obj.id) {
	          if (nsp) {
	            str += ",";
	            nsp = false
	          }
	          str += obj.id
	        }
	        if (null != obj.data) {
	          if (nsp)str += ",";
	          str += json.stringify(obj.data)
	        }
	        debug("encoded %j as %s", obj, str);
	        return str
	      }

	      function encodeAsBinary(obj, callback) {
	        function writeEncoding(bloblessData) {
	          var deconstruction = binary.deconstructPacket(bloblessData);
	          var pack = encodeAsString(deconstruction.packet);
	          var buffers = deconstruction.buffers;
	          buffers.unshift(pack);
	          callback(buffers)
	        }

	        binary.removeBlobs(obj, writeEncoding)
	      }

	      function Decoder() {
	        this.reconstructor = null
	      }

	      Emitter(Decoder.prototype);
	      Decoder.prototype.add = function (obj) {
	        var packet;
	        if ("string" == typeof obj) {
	          packet = decodeString(obj);
	          if (exports.BINARY_EVENT == packet.type || exports.BINARY_ACK == packet.type) {
	            this.reconstructor = new BinaryReconstructor(packet);
	            if (this.reconstructor.reconPack.attachments == 0) {
	              this.emit("decoded", packet)
	            }
	          } else {
	            this.emit("decoded", packet)
	          }
	        } else if (isBuf(obj) || obj.base64) {
	          if (!this.reconstructor) {
	            throw new Error("got binary data when not reconstructing a packet")
	          } else {
	            packet = this.reconstructor.takeBinaryData(obj);
	            if (packet) {
	              this.reconstructor = null;
	              this.emit("decoded", packet)
	            }
	          }
	        } else {
	          throw new Error("Unknown type: " + obj)
	        }
	      };
	      function decodeString(str) {
	        var p = {};
	        var i = 0;
	        p.type = Number(str.charAt(0));
	        if (null == exports.types[p.type])return error();
	        if (exports.BINARY_EVENT == p.type || exports.BINARY_ACK == p.type) {
	          p.attachments = "";
	          while (str.charAt(++i) != "-") {
	            p.attachments += str.charAt(i)
	          }
	          p.attachments = Number(p.attachments)
	        }
	        if ("/" == str.charAt(i + 1)) {
	          p.nsp = "";
	          while (++i) {
	            var c = str.charAt(i);
	            if ("," == c)break;
	            p.nsp += c;
	            if (i + 1 == str.length)break
	          }
	        } else {
	          p.nsp = "/"
	        }
	        var next = str.charAt(i + 1);
	        if ("" != next && Number(next) == next) {
	          p.id = "";
	          while (++i) {
	            var c = str.charAt(i);
	            if (null == c || Number(c) != c) {
	              --i;
	              break
	            }
	            p.id += str.charAt(i);
	            if (i + 1 == str.length)break
	          }
	          p.id = Number(p.id)
	        }
	        if (str.charAt(++i)) {
	          try {
	            p.data = json.parse(str.substr(i))
	          } catch (e) {
	            return error()
	          }
	        }
	        debug("decoded %s as %j", str, p);
	        return p
	      }

	      Decoder.prototype.destroy = function () {
	        if (this.reconstructor) {
	          this.reconstructor.finishedReconstruction()
	        }
	      };
	      function BinaryReconstructor(packet) {
	        this.reconPack = packet;
	        this.buffers = []
	      }

	      BinaryReconstructor.prototype.takeBinaryData = function (binData) {
	        this.buffers.push(binData);
	        if (this.buffers.length == this.reconPack.attachments) {
	          var packet = binary.reconstructPacket(this.reconPack, this.buffers);
	          this.finishedReconstruction();
	          return packet
	        }
	        return null
	      };
	      BinaryReconstructor.prototype.finishedReconstruction = function () {
	        this.reconPack = null;
	        this.buffers = []
	      };
	      function error(data) {
	        return {type: exports.ERROR, data: "parser error"}
	      }
	    }, {"./binary": 42, "./is-buffer": 44, "component-emitter": 8, debug: 9, isarray: 45, json3: 46}],
	    44: [function (_dereq_, module, exports) {
	      (function (global) {
	        module.exports = isBuf;
	        function isBuf(obj) {
	          return global.Buffer && global.Buffer.isBuffer(obj) || global.ArrayBuffer && obj instanceof ArrayBuffer
	        }
	      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
	    }, {}],
	    45: [function (_dereq_, module, exports) {
	      module.exports = _dereq_(36)
	    }, {}],
	    46: [function (_dereq_, module, exports) {
	      (function (window) {
	        var getClass = {}.toString, isProperty, forEach, undef;
	        var isLoader = typeof define === "function" && define.amd;
	        var nativeJSON = typeof JSON == "object" && JSON;
	        var JSON3 = typeof exports == "object" && exports && !exports.nodeType && exports;
	        if (JSON3 && nativeJSON) {
	          JSON3.stringify = nativeJSON.stringify;
	          JSON3.parse = nativeJSON.parse
	        } else {
	          JSON3 = window.JSON = nativeJSON || {}
	        }
	        var isExtended = new Date(-0xc782b5b800cec);
	        try {
	          isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 && isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708
	        } catch (exception) {
	        }
	        function has(name) {
	          if (has[name] !== undef) {
	            return has[name]
	          }
	          var isSupported;
	          if (name == "bug-string-char-index") {
	            isSupported = "a"[0] != "a"
	          } else if (name == "json") {
	            isSupported = has("json-stringify") && has("json-parse")
	          } else {
	            var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
	            if (name == "json-stringify") {
	              var stringify = JSON3.stringify, stringifySupported = typeof stringify == "function" && isExtended;
	              if (stringifySupported) {
	                (value = function () {
	                  return 1
	                }).toJSON = value;
	                try {
	                  stringifySupported = stringify(0) === "0" && stringify(new Number) === "0" && stringify(new String) == '""' && stringify(getClass) === undef && stringify(undef) === undef && stringify() === undef && stringify(value) === "1" && stringify([value]) == "[1]" && stringify([undef]) == "[null]" && stringify(null) == "null" && stringify([undef, getClass, null]) == "[null,null,null]" && stringify({a: [value, true, false, null, "\x00\b\n\f\r  "]}) == serialized && stringify(null, value) === "1" && stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" && stringify(new Date(-864e13)) == '"-271821-04-20T00:00:00.000Z"' && stringify(new Date(864e13)) == '"+275760-09-13T00:00:00.000Z"' && stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' && stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"'
	                } catch (exception) {
	                  stringifySupported = false
	                }
	              }
	              isSupported = stringifySupported
	            }
	            if (name == "json-parse") {
	              var parse = JSON3.parse;
	              if (typeof parse == "function") {
	                try {
	                  if (parse("0") === 0 && !parse(false)) {
	                    value = parse(serialized);
	                    var parseSupported = value["a"].length == 5 && value["a"][0] === 1;
	                    if (parseSupported) {
	                      try {
	                        parseSupported = !parse('"  "')
	                      } catch (exception) {
	                      }
	                      if (parseSupported) {
	                        try {
	                          parseSupported = parse("01") !== 1
	                        } catch (exception) {
	                        }
	                      }
	                      if (parseSupported) {
	                        try {
	                          parseSupported = parse("1.") !== 1
	                        } catch (exception) {
	                        }
	                      }
	                    }
	                  }
	                } catch (exception) {
	                  parseSupported = false
	                }
	              }
	              isSupported = parseSupported
	            }
	          }
	          return has[name] = !!isSupported
	        }

	        if (!has("json")) {
	          var functionClass = "[object Function]";
	          var dateClass = "[object Date]";
	          var numberClass = "[object Number]";
	          var stringClass = "[object String]";
	          var arrayClass = "[object Array]";
	          var booleanClass = "[object Boolean]";
	          var charIndexBuggy = has("bug-string-char-index");
	          if (!isExtended) {
	            var floor = Math.floor;
	            var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
	            var getDay = function (year, month) {
	              return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400)
	            }
	          }
	          if (!(isProperty = {}.hasOwnProperty)) {
	            isProperty = function (property) {
	              var members = {}, constructor;
	              if ((members.__proto__ = null, members.__proto__ = {toString: 1}, members).toString != getClass) {
	                isProperty = function (property) {
	                  var original = this.__proto__, result = property in(this.__proto__ = null, this);
	                  this.__proto__ = original;
	                  return result
	                }
	              } else {
	                constructor = members.constructor;
	                isProperty = function (property) {
	                  var parent = (this.constructor || constructor).prototype;
	                  return property in this && !(property in parent && this[property] === parent[property])
	                }
	              }
	              members = null;
	              return isProperty.call(this, property)
	            }
	          }
	          var PrimitiveTypes = {"boolean": 1, number: 1, string: 1, undefined: 1};
	          var isHostType = function (object, property) {
	            var type = typeof object[property];
	            return type == "object" ? !!object[property] : !PrimitiveTypes[type]
	          };
	          forEach = function (object, callback) {
	            var size = 0, Properties, members, property;
	            (Properties = function () {
	              this.valueOf = 0
	            }).prototype.valueOf = 0;
	            members = new Properties;
	            for (property in members) {
	              if (isProperty.call(members, property)) {
	                size++
	              }
	            }
	            Properties = members = null;
	            if (!size) {
	              members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
	              forEach = function (object, callback) {
	                var isFunction = getClass.call(object) == functionClass, property, length;
	                var hasProperty = !isFunction && typeof object.constructor != "function" && isHostType(object, "hasOwnProperty") ? object.hasOwnProperty : isProperty;
	                for (property in object) {
	                  if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
	                    callback(property)
	                  }
	                }
	                for (length = members.length; property = members[--length]; hasProperty.call(object, property) && callback(property));
	              }
	            } else if (size == 2) {
	              forEach = function (object, callback) {
	                var members = {}, isFunction = getClass.call(object) == functionClass, property;
	                for (property in object) {
	                  if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
	                    callback(property)
	                  }
	                }
	              }
	            } else {
	              forEach = function (object, callback) {
	                var isFunction = getClass.call(object) == functionClass, property, isConstructor;
	                for (property in object) {
	                  if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
	                    callback(property)
	                  }
	                }
	                if (isConstructor || isProperty.call(object, property = "constructor")) {
	                  callback(property)
	                }
	              }
	            }
	            return forEach(object, callback)
	          };
	          if (!has("json-stringify")) {
	            var Escapes = {92: "\\\\", 34: '\\"', 8: "\\b", 12: "\\f", 10: "\\n", 13: "\\r", 9: "\\t"};
	            var leadingZeroes = "000000";
	            var toPaddedString = function (width, value) {
	              return (leadingZeroes + (value || 0)).slice(-width)
	            };
	            var unicodePrefix = "\\u00";
	            var quote = function (value) {
	              var result = '"', index = 0, length = value.length, isLarge = length > 10 && charIndexBuggy, symbols;
	              if (isLarge) {
	                symbols = value.split("")
	              }
	              for (; index < length; index++) {
	                var charCode = value.charCodeAt(index);
	                switch (charCode) {
	                  case 8:
	                  case 9:
	                  case 10:
	                  case 12:
	                  case 13:
	                  case 34:
	                  case 92:
	                    result += Escapes[charCode];
	                    break;
	                  default:
	                    if (charCode < 32) {
	                      result += unicodePrefix + toPaddedString(2, charCode.toString(16));
	                      break
	                    }
	                    result += isLarge ? symbols[index] : charIndexBuggy ? value.charAt(index) : value[index]
	                }
	              }
	              return result + '"'
	            };
	            var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
	              var value, className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, result;
	              try {
	                value = object[property]
	              } catch (exception) {
	              }
	              if (typeof value == "object" && value) {
	                className = getClass.call(value);
	                if (className == dateClass && !isProperty.call(value, "toJSON")) {
	                  if (value > -1 / 0 && value < 1 / 0) {
	                    if (getDay) {
	                      date = floor(value / 864e5);
	                      for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
	                      for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
	                      date = 1 + date - getDay(year, month);
	                      time = (value % 864e5 + 864e5) % 864e5;
	                      hours = floor(time / 36e5) % 24;
	                      minutes = floor(time / 6e4) % 60;
	                      seconds = floor(time / 1e3) % 60;
	                      milliseconds = time % 1e3
	                    } else {
	                      year = value.getUTCFullYear();
	                      month = value.getUTCMonth();
	                      date = value.getUTCDate();
	                      hours = value.getUTCHours();
	                      minutes = value.getUTCMinutes();
	                      seconds = value.getUTCSeconds();
	                      milliseconds = value.getUTCMilliseconds()
	                    }
	                    value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) + "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) + "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) + "." + toPaddedString(3, milliseconds) + "Z"
	                  } else {
	                    value = null
	                  }
	                } else if (typeof value.toJSON == "function" && (className != numberClass && className != stringClass && className != arrayClass || isProperty.call(value, "toJSON"))) {
	                  value = value.toJSON(property)
	                }
	              }
	              if (callback) {
	                value = callback.call(object, property, value)
	              }
	              if (value === null) {
	                return "null"
	              }
	              className = getClass.call(value);
	              if (className == booleanClass) {
	                return "" + value
	              } else if (className == numberClass) {
	                return value > -1 / 0 && value < 1 / 0 ? "" + value : "null"
	              } else if (className == stringClass) {
	                return quote("" + value)
	              }
	              if (typeof value == "object") {
	                for (length = stack.length; length--;) {
	                  if (stack[length] === value) {
	                    throw TypeError()
	                  }
	                }
	                stack.push(value);
	                results = [];
	                prefix = indentation;
	                indentation += whitespace;
	                if (className == arrayClass) {
	                  for (index = 0, length = value.length; index < length; index++) {
	                    element = serialize(index, value, callback, properties, whitespace, indentation, stack);
	                    results.push(element === undef ? "null" : element)
	                  }
	                  result = results.length ? whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : "[" + results.join(",") + "]" : "[]"
	                } else {
	                  forEach(properties || value, function (property) {
	                    var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
	                    if (element !== undef) {
	                      results.push(quote(property) + ":" + (whitespace ? " " : "") + element)
	                    }
	                  });
	                  result = results.length ? whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : "{" + results.join(",") + "}" : "{}"
	                }
	                stack.pop();
	                return result
	              }
	            };
	            JSON3.stringify = function (source, filter, width) {
	              var whitespace, callback, properties, className;
	              if (typeof filter == "function" || typeof filter == "object" && filter) {
	                if ((className = getClass.call(filter)) == functionClass) {
	                  callback = filter
	                } else if (className == arrayClass) {
	                  properties = {};
	                  for (var index = 0, length = filter.length, value; index < length; value = filter[index++], (className = getClass.call(value), className == stringClass || className == numberClass) && (properties[value] = 1));
	                }
	              }
	              if (width) {
	                if ((className = getClass.call(width)) == numberClass) {
	                  if ((width -= width % 1) > 0) {
	                    for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ");
	                  }
	                } else if (className == stringClass) {
	                  whitespace = width.length <= 10 ? width : width.slice(0, 10)
	                }
	              }
	              return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", [])
	            }
	          }
	          if (!has("json-parse")) {
	            var fromCharCode = String.fromCharCode;
	            var Unescapes = {92: "\\", 34: '"', 47: "/", 98: "\b", 116: "  ", 110: "\n", 102: "\f", 114: "\r"};
	            var Index, Source;
	            var abort = function () {
	              Index = Source = null;
	              throw SyntaxError()
	            };
	            var lex = function () {
	              var source = Source, length = source.length, value, begin, position, isSigned, charCode;
	              while (Index < length) {
	                charCode = source.charCodeAt(Index);
	                switch (charCode) {
	                  case 9:
	                  case 10:
	                  case 13:
	                  case 32:
	                    Index++;
	                    break;
	                  case 123:
	                  case 125:
	                  case 91:
	                  case 93:
	                  case 58:
	                  case 44:
	                    value = charIndexBuggy ? source.charAt(Index) : source[Index];
	                    Index++;
	                    return value;
	                  case 34:
	                    for (value = "@", Index++; Index < length;) {
	                      charCode = source.charCodeAt(Index);
	                      if (charCode < 32) {
	                        abort()
	                      } else if (charCode == 92) {
	                        charCode = source.charCodeAt(++Index);
	                        switch (charCode) {
	                          case 92:
	                          case 34:
	                          case 47:
	                          case 98:
	                          case 116:
	                          case 110:
	                          case 102:
	                          case 114:
	                            value += Unescapes[charCode];
	                            Index++;
	                            break;
	                          case 117:
	                            begin = ++Index;
	                            for (position = Index + 4; Index < position; Index++) {
	                              charCode = source.charCodeAt(Index);
	                              if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
	                                abort()
	                              }
	                            }
	                            value += fromCharCode("0x" + source.slice(begin, Index));
	                            break;
	                          default:
	                            abort()
	                        }
	                      } else {
	                        if (charCode == 34) {
	                          break
	                        }
	                        charCode = source.charCodeAt(Index);
	                        begin = Index;
	                        while (charCode >= 32 && charCode != 92 && charCode != 34) {
	                          charCode = source.charCodeAt(++Index)
	                        }
	                        value += source.slice(begin, Index)
	                      }
	                    }
	                    if (source.charCodeAt(Index) == 34) {
	                      Index++;
	                      return value
	                    }
	                    abort();
	                  default:
	                    begin = Index;
	                    if (charCode == 45) {
	                      isSigned = true;
	                      charCode = source.charCodeAt(++Index)
	                    }
	                    if (charCode >= 48 && charCode <= 57) {
	                      if (charCode == 48 && (charCode = source.charCodeAt(Index + 1), charCode >= 48 && charCode <= 57)) {
	                        abort()
	                      }
	                      isSigned = false;
	                      for (; Index < length && (charCode = source.charCodeAt(Index), charCode >= 48 && charCode <= 57); Index++);
	                      if (source.charCodeAt(Index) == 46) {
	                        position = ++Index;
	                        for (; position < length && (charCode = source.charCodeAt(position), charCode >= 48 && charCode <= 57); position++);
	                        if (position == Index) {
	                          abort()
	                        }
	                        Index = position
	                      }
	                      charCode = source.charCodeAt(Index);
	                      if (charCode == 101 || charCode == 69) {
	                        charCode = source.charCodeAt(++Index);
	                        if (charCode == 43 || charCode == 45) {
	                          Index++
	                        }
	                        for (position = Index; position < length && (charCode = source.charCodeAt(position), charCode >= 48 && charCode <= 57); position++);
	                        if (position == Index) {
	                          abort()
	                        }
	                        Index = position
	                      }
	                      return +source.slice(begin, Index)
	                    }
	                    if (isSigned) {
	                      abort()
	                    }
	                    if (source.slice(Index, Index + 4) == "true") {
	                      Index += 4;
	                      return true
	                    } else if (source.slice(Index, Index + 5) == "false") {
	                      Index += 5;
	                      return false
	                    } else if (source.slice(Index, Index + 4) == "null") {
	                      Index += 4;
	                      return null
	                    }
	                    abort()
	                }
	              }
	              return "$"
	            };
	            var get = function (value) {
	              var results, hasMembers;
	              if (value == "$") {
	                abort()
	              }
	              if (typeof value == "string") {
	                if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
	                  return value.slice(1)
	                }
	                if (value == "[") {
	                  results = [];
	                  for (; ; hasMembers || (hasMembers = true)) {
	                    value = lex();
	                    if (value == "]") {
	                      break
	                    }
	                    if (hasMembers) {
	                      if (value == ",") {
	                        value = lex();
	                        if (value == "]") {
	                          abort()
	                        }
	                      } else {
	                        abort()
	                      }
	                    }
	                    if (value == ",") {
	                      abort()
	                    }
	                    results.push(get(value))
	                  }
	                  return results
	                } else if (value == "{") {
	                  results = {};
	                  for (; ; hasMembers || (hasMembers = true)) {
	                    value = lex();
	                    if (value == "}") {
	                      break
	                    }
	                    if (hasMembers) {
	                      if (value == ",") {
	                        value = lex();
	                        if (value == "}") {
	                          abort()
	                        }
	                      } else {
	                        abort()
	                      }
	                    }
	                    if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
	                      abort()
	                    }
	                    results[value.slice(1)] = get(lex())
	                  }
	                  return results
	                }
	                abort()
	              }
	              return value
	            };
	            var update = function (source, property, callback) {
	              var element = walk(source, property, callback);
	              if (element === undef) {
	                delete source[property]
	              } else {
	                source[property] = element
	              }
	            };
	            var walk = function (source, property, callback) {
	              var value = source[property], length;
	              if (typeof value == "object" && value) {
	                if (getClass.call(value) == arrayClass) {
	                  for (length = value.length; length--;) {
	                    update(value, length, callback)
	                  }
	                } else {
	                  forEach(value, function (property) {
	                    update(value, property, callback)
	                  })
	                }
	              }
	              return callback.call(source, property, value)
	            };
	            JSON3.parse = function (source, callback) {
	              var result, value;
	              Index = 0;
	              Source = "" + source;
	              result = get(lex());
	              if (lex() != "$") {
	                abort()
	              }
	              Index = Source = null;
	              return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result
	            }
	          }
	        }
	        if (isLoader) {
	          define(function () {
	            return JSON3
	          })
	        }
	      })(this)
	    }, {}],
	    47: [function (_dereq_, module, exports) {
	      module.exports = toArray;
	      function toArray(list, index) {
	        var array = [];
	        index = index || 0;
	        for (var i = index || 0; i < list.length; i++) {
	          array[i - index] = list[i]
	        }
	        return array
	      }
	    }, {}]
	  }, {}, [1])(1)
	});
	;

	/**
	 * sails.io.js
	 * ------------------------------------------------------------------------
	 * JavaScript Client (SDK) for communicating with Sails.
	 *
	 * Note that this script is completely optional, but it is handy if you're
	 * using WebSockets from the browser to talk to your Sails server.
	 *
	 * For tips and documentation, visit:
	 * http://sailsjs.org/#!documentation/reference/BrowserSDK/BrowserSDK.html
	 * ------------------------------------------------------------------------
	 *
	 * This file allows you to send and receive socket.io messages to & from Sails
	 * by simulating a REST client interface on top of socket.io. It models its API
	 * after the $.ajax pattern from jQuery you might already be familiar with.
	 *
	 * So if you're switching from using AJAX to sockets, instead of:
	 *    `$.post( url, [data], [cb] )`
	 *
	 * You would use:
	 *    `socket.post( url, [data], [cb] )`
	 */


	(function() {

	  // Save the URL that this script was fetched from for use below.
	  // (skip this if this SDK is being used outside of the DOM, i.e. in a Node process)
	  var urlThisScriptWasFetchedFrom = (function() {
	    if (
	      typeof window !== 'object' ||
	      typeof window.document !== 'object' ||
	      typeof window.document.getElementsByTagName !== 'function'
	    ) {
	      return '';
	    }

	    // Return the URL of the last script loaded (i.e. this one)
	    // (this must run before nextTick; see http://stackoverflow.com/a/2976714/486547)
	    var allScriptsCurrentlyInDOM = window.document.getElementsByTagName('script');
	    var thisScript = allScriptsCurrentlyInDOM[allScriptsCurrentlyInDOM.length - 1];
	    return thisScript.src;
	  })();

	  // Constants
	  var CONNECTION_METADATA_PARAMS = {
	    version: '__sails_io_sdk_version',
	    platform: '__sails_io_sdk_platform',
	    language: '__sails_io_sdk_language'
	  };

	  // Current version of this SDK (sailsDK?!?!) and other metadata
	  // that will be sent along w/ the initial connection request.
	  var SDK_INFO = {
	    version: '0.11.0', // TODO: pull this automatically from package.json during build.
	    platform: typeof module === 'undefined' ? 'browser' : 'node',
	    language: 'javascript'
	  };
	  SDK_INFO.versionString =
	    CONNECTION_METADATA_PARAMS.version + '=' + SDK_INFO.version + '&' +
	    CONNECTION_METADATA_PARAMS.platform + '=' + SDK_INFO.platform + '&' +
	    CONNECTION_METADATA_PARAMS.language + '=' + SDK_INFO.language;


	  // In case you're wrapping the socket.io client to prevent pollution of the
	  // global namespace, you can pass in your own `io` to replace the global one.
	  // But we still grab access to the global one if it's available here:
	  var _io = (typeof io !== 'undefined') ? io : null;

	  /**
	   * Augment the `io` object passed in with methods for talking and listening
	   * to one or more Sails backend(s).  Automatically connects a socket and
	   * exposes it on `io.socket`.  If a socket tries to make requests before it
	   * is connected, the sails.io.js client will queue it up.
	   *
	   * @param {SocketIO} io
	   */

	  function SailsIOClient(io) {

	    // Prefer the passed-in `io` instance, but also use the global one if we've got it.
	    if (!io) {
	      io = _io;
	    }


	    // If the socket.io client is not available, none of this will work.
	    if (!io) throw new Error('`sails.io.js` requires a socket.io client, but `io` was not passed in.');



	    //////////////////////////////////////////////////////////////
	    /////                              ///////////////////////////
	    ///// PRIVATE METHODS/CONSTRUCTORS ///////////////////////////
	    /////                              ///////////////////////////
	    //////////////////////////////////////////////////////////////


	    /**
	     * A little logger for this library to use internally.
	     * Basically just a wrapper around `console.log` with
	     * support for feature-detection.
	     *
	     * @api private
	     * @factory
	     */
	    function LoggerFactory(options) {
	      options = options || {
	        prefix: true
	      };

	      // If `console.log` is not accessible, `log` is a noop.
	      if (
	        typeof console !== 'object' ||
	        typeof console.log !== 'function' ||
	        typeof console.log.bind !== 'function'
	      ) {
	        return function noop() {};
	      }

	      return function log() {
	        var args = Array.prototype.slice.call(arguments);

	        // All logs are disabled when `io.sails.environment = 'production'`.
	        if (io.sails.environment === 'production') return;

	        // Add prefix to log messages (unless disabled)
	        var PREFIX = '';
	        if (options.prefix) {
	          args.unshift(PREFIX);
	        }

	        // Call wrapped logger
	        console.log
	          .bind(console)
	          .apply(this, args);
	      };
	    }

	    // Create a private logger instance
	    var consolog = LoggerFactory();
	    consolog.noPrefix = LoggerFactory({
	      prefix: false
	    });



	    /**
	     * What is the `requestQueue`?
	     *
	     * The request queue is used to simplify app-level connection logic--
	     * i.e. so you don't have to wait for the socket to be connected
	     * to start trying to  synchronize data.
	     *
	     * @api private
	     * @param  {SailsSocket}  socket
	     */

	    function runRequestQueue (socket) {
	      var queue = socket.requestQueue;

	      if (!queue) return;
	      for (var i in queue) {

	        // Double-check that `queue[i]` will not
	        // inadvertently discover extra properties attached to the Object
	        // and/or Array prototype by other libraries/frameworks/tools.
	        // (e.g. Ember does this. See https://github.com/balderdashy/sails.io.js/pull/5)
	        var isSafeToDereference = ({}).hasOwnProperty.call(queue, i);
	        if (isSafeToDereference) {
	          // Emit the request.
	          _emitFrom(socket, queue[i]);
	        }
	      }

	      // Now empty the queue to remove it as a source of additional complexity.
	      queue = null;
	    }



	    /**
	     * Send a JSONP request.
	     *
	     * @param  {Object}   opts [optional]
	     * @param  {Function} cb
	     * @return {XMLHttpRequest}
	     */

	    function jsonp(opts, cb) {
	      opts = opts || {};

	      if (typeof window === 'undefined') {
	        // TODO: refactor node usage to live in here
	        return cb();
	      }

	      var scriptEl = document.createElement('script');
	      window._sailsIoJSConnect = function(response) {
	        scriptEl.parentNode.removeChild(scriptEl);

	        cb(response);
	      };
	      scriptEl.src = opts.url;
	      document.getElementsByTagName('head')[0].appendChild(scriptEl);

	    }



	    /**
	     * The JWR (JSON WebSocket Response) received from a Sails server.
	     *
	     * @api public
	     * @param  {Object}  responseCtx
	     *         => :body
	     *         => :statusCode
	     *         => :headers
	     *
	     * @constructor
	     */

	    function JWR(responseCtx) {
	      this.body = responseCtx.body || {};
	      this.headers = responseCtx.headers || {};
	      this.statusCode = responseCtx.statusCode || 200;
	      if (this.statusCode < 200 || this.statusCode >= 400) {
	        this.error = this.body || this.statusCode;
	      }
	    }
	    JWR.prototype.toString = function() {
	      return '[ResponseFromSails]' + '  -- ' +
	        'Status: ' + this.statusCode + '  -- ' +
	        'Headers: ' + this.headers + '  -- ' +
	        'Body: ' + this.body;
	    };
	    JWR.prototype.toPOJO = function() {
	      return {
	        body: this.body,
	        headers: this.headers,
	        statusCode: this.statusCode
	      };
	    };
	    JWR.prototype.pipe = function() {
	      // TODO: look at substack's stuff
	      return new Error('Client-side streaming support not implemented yet.');
	    };


	    /**
	     * @api private
	     * @param  {SailsSocket} socket  [description]
	     * @param  {Object} requestCtx [description]
	     */

	    function _emitFrom(socket, requestCtx) {

	      if (!socket._raw) {
	        throw new Error('Failed to emit from socket- raw SIO socket is missing.');
	      }

	      // Since callback is embedded in requestCtx,
	      // retrieve it and delete the key before continuing.
	      var cb = requestCtx.cb;
	      delete requestCtx.cb;

	      // Name of the appropriate socket.io listener on the server
	      // ( === the request method or "verb", e.g. 'get', 'post', 'put', etc. )
	      var sailsEndpoint = requestCtx.method;

	      socket._raw.emit(sailsEndpoint, requestCtx, function serverResponded(responseCtx) {

	        // Send back (emulatedHTTPBody, jsonWebSocketResponse)
	        if (cb) {
	          cb(responseCtx.body, new JWR(responseCtx));
	        }
	      });
	    }

	    //////////////////////////////////////////////////////////////
	    ///// </PRIVATE METHODS/CONSTRUCTORS> ////////////////////////
	    //////////////////////////////////////////////////////////////



	    // Version note:
	    //
	    // `io.SocketNamespace.prototype` doesn't exist in sio 1.0.
	    //
	    // Rather than adding methods to the prototype for the Socket instance that is returned
	    // when the browser connects with `io.connect()`, we create our own constructor, `SailsSocket`.
	    // This makes our solution more future-proof and helps us work better w/ the Socket.io team
	    // when changes are rolled out in the future.  To get a `SailsSocket`, you can run:
	    // ```
	    // io.sails.connect();
	    // ```



	    /**
	     * SailsSocket
	     *
	     * A wrapper for an underlying Socket instance that communicates directly
	     * to the Socket.io server running inside of Sails.
	     *
	     * If no `socket` option is provied, SailsSocket will function as a mock. It will queue socket
	     * requests and event handler bindings, replaying them when the raw underlying socket actually
	     * connects. This is handy when we don't necessarily have the valid configuration to know
	     * WHICH SERVER to talk to yet, etc.  It is also used by `io.socket` for your convenience.
	     *
	     * @constructor
	     */

	    function SailsSocket (opts){
	      var self = this;
	      opts = opts||{};

	      // Absorb opts
	      self.useCORSRouteToGetCookie = opts.useCORSRouteToGetCookie;
	      self.url = opts.url;
	      self.multiplex = opts.multiplex;
	      self.transports = opts.transports;

	      // Set up "eventQueue" to hold event handlers which have not been set on the actual raw socket yet.
	      self.eventQueue = {};

	      // Listen for special `parseError` event sent from sockets hook on the backend
	      // if an error occurs but a valid callback was not received from the client
	      // (i.e. so the server had no other way to send back the error information)
	      self.on('sails:parseError', function (err){
	        consolog('Sails encountered an error parsing a socket message sent from this client, and did not have access to a callback function to respond with.');
	        consolog('Error details:',err);
	      });

	      // TODO:
	      // Listen for a special private message on any connected that allows the server
	      // to set the environment (giving us 100% certainty that we guessed right)
	      // However, note that the `console.log`s called before and after connection
	      // are still forced to rely on our existing heuristics (to disable, tack #production
	      // onto the URL used to fetch this file.)
	    }


	    /**
	     * Start connecting this socket.
	     *
	     * @api private
	     */
	    SailsSocket.prototype._connect = function (){
	      var self = this;

	      // Apply `io.sails` config as defaults
	      // (now that at least one tick has elapsed)
	      self.useCORSRouteToGetCookie = self.useCORSRouteToGetCookie||io.sails.useCORSRouteToGetCookie;
	      self.url = self.url||io.sails.url;
	      self.transports = self.transports || io.sails.transports;

	      // Ensure URL has no trailing slash
	      self.url = self.url ? self.url.replace(/(\/)$/, '') : undefined;

	      // Mix the current SDK version into the query string in
	      // the connection request to the server:
	      if (typeof self.query !== 'string') self.query = SDK_INFO.versionString;
	      else self.query += '&' + SDK_INFO.versionString;

	      // Determine whether this is a cross-origin socket by examining the
	      // hostname and port on the `window.location` object.
	      var isXOrigin = (function (){

	        // If `window` doesn't exist (i.e. being used from node.js), then it's
	        // always "cross-domain".
	        if (typeof window === 'undefined' || typeof window.location === 'undefined') {
	          return false;
	        }

	        // If `self.url` (aka "target") is falsy, then we don't need to worry about it.
	        if (typeof self.url !== 'string') { return false; }

	        // Get information about the "target" (`self.url`)
	        var targetProtocol = (function (){
	          try {
	            targetProtocol = self.url.match(/^([a-z]+:\/\/)/i)[1].toLowerCase();
	          }
	          catch (e) {}
	          targetProtocol = targetProtocol || 'http://';
	          return targetProtocol;
	        })();
	        var isTargetSSL = !!self.url.match('^https');
	        var targetPort = (function (){
	          try {
	            return self.url.match(/^[a-z]+:\/\/[^:]*:([0-9]*)/i)[1];
	          }
	          catch (e){}
	          return isTargetSSL ? '443' : '80';
	        })();
	        var targetAfterProtocol = self.url.replace(/^([a-z]+:\/\/)/i, '');


	        // If target protocol is different than the actual protocol,
	        // then we'll consider this cross-origin.
	        if (targetProtocol.replace(/[:\/]/g, '') !== window.location.protocol.replace(/[:\/]/g,'')) {
	          return true;
	        }


	        // If target hostname is different than actual hostname, we'll consider this cross-origin.
	        var hasSameHostname = targetAfterProtocol.search(window.location.hostname) !== 0;
	        if (!hasSameHostname) {
	          return true;
	        }

	        // If no actual port is explicitly set on the `window.location` object,
	        // we'll assume either 80 or 443.
	        var isLocationSSL = window.location.protocol.match(/https/i);
	        var locationPort = (window.location.port+'') || (isLocationSSL ? '443' : '80');

	        // Finally, if ports don't match, we'll consider this cross-origin.
	        if (targetPort !== locationPort) {
	          return true;
	        }

	        // Otherwise, it's the same origin.
	        return false;

	      })();


	      // Prepare to start connecting the socket
	      (function selfInvoking (cb){

	        // If this is an attempt at a cross-origin or cross-port
	        // socket connection, send a JSONP request first to ensure
	        // that a valid cookie is available.  This can be disabled
	        // by setting `io.sails.useCORSRouteToGetCookie` to false.
	        //
	        // Otherwise, skip the stuff below.
	        if (!(self.useCORSRouteToGetCookie && isXOrigin)) {
	          return cb();
	        }

	        // Figure out the x-origin CORS route
	        // (Sails provides a default)
	        var xOriginCookieURL = self.url;
	        if (typeof self.useCORSRouteToGetCookie === 'string') {
	          xOriginCookieURL += self.useCORSRouteToGetCookie;
	        }
	        else {
	          xOriginCookieURL += '/__getcookie';
	        }


	        // Make the AJAX request (CORS)
	        if (typeof window !== 'undefined') {
	          jsonp({
	            url: xOriginCookieURL,
	            method: 'GET'
	          }, cb);
	          return;
	        }


	      })(function goAheadAndActuallyConnect() {

	        // Now that we're ready to connect, create a raw underlying Socket
	        // using Socket.io and save it as `_raw` (this will start it connecting)
	        self._raw = io(self.url, self);

	        // Replay event bindings from the eager socket
	        self.replay();


	        /**
	         * 'connect' event is triggered when the socket establishes a connection
	         *  successfully.
	         */
	        self.on('connect', function socketConnected() {

	          consolog.noPrefix(
	            '\n' +
	            '\n' +
	            // '    |>    ' + '\n' +
	            // '  \\___/  '+️
	            // '\n'+
	             '  |>    Now connected to Sails.' + '\n' +
	            '\\___/   For help, see: http://bit.ly/1DmTvgK' + '\n' +
	             '        (using '+io.sails.sdk.platform+' SDK @v'+io.sails.sdk.version+')'+ '\n' +
	            '\n'+
	            '\n'+
	            // '\n'+
	            ''
	            // ' ⚓︎ (development mode)'
	            // 'e.g. to send a GET request to Sails via WebSockets, run:'+ '\n' +
	            // '`io.socket.get("/foo", function serverRespondedWith (body, jwr) { console.log(body); })`'+ '\n' +
	          );
	        });

	        self.on('disconnect', function() {
	          self.connectionLostTimestamp = (new Date()).getTime();
	          consolog('====================================');
	          consolog('Socket was disconnected from Sails.');
	          consolog('Usually, this is due to one of the following reasons:' + '\n' +
	            ' -> the server ' + (self.url ? self.url + ' ' : '') + 'was taken down' + '\n' +
	            ' -> your browser lost internet connectivity');
	          consolog('====================================');
	        });

	        self.on('reconnecting', function(numAttempts) {
	          consolog(
	            '\n'+
	            '        Socket is trying to reconnect to Sails...\n'+
	            '_-|>_-  (attempt #' + numAttempts + ')'+'\n'+
	            '\n'
	          );
	        });

	        self.on('reconnect', function(transport, numAttempts) {
	          var msSinceConnectionLost = ((new Date()).getTime() - self.connectionLostTimestamp);
	          var numSecsOffline = (msSinceConnectionLost / 1000);
	          consolog(
	            '\n'+
	             '  |>    Socket reconnected successfully after'+'\n'+
	            '\\___/   being offline for ~' + numSecsOffline + ' seconds.'+'\n'+
	            '\n'
	          );
	        });

	        // 'error' event is triggered if connection can not be established.
	        // (usually because of a failed authorization, which is in turn
	        // usually due to a missing or invalid cookie)
	        self.on('error', function failedToConnect(err) {

	          // TODO:
	          // handle failed connections due to failed authorization
	          // in a smarter way (probably can listen for a different event)

	          // A bug in Socket.io 0.9.x causes `connect_failed`
	          // and `reconnect_failed` not to fire.
	          // Check out the discussion in github issues for details:
	          // https://github.com/LearnBoost/socket.io/issues/652
	          // io.socket.on('connect_failed', function () {
	          //  consolog('io.socket emitted `connect_failed`');
	          // });
	          // io.socket.on('reconnect_failed', function () {
	          //  consolog('io.socket emitted `reconnect_failed`');
	          // });

	          consolog(
	            'Failed to connect socket (probably due to failed authorization on server)',
	            'Error:', err
	          );
	        });
	      });

	    };


	    /**
	     * Disconnect the underlying socket.
	     *
	     * @api public
	     */
	    SailsSocket.prototype.disconnect = function (){
	      if (!this._raw) {
	        throw new Error('Cannot disconnect- socket is already disconnected');
	      }
	      return this._raw.disconnect();
	    };



	    /**
	     * isConnected
	     *
	     * @api private
	     * @return {Boolean} whether the socket is connected and able to
	     *                           communicate w/ the server.
	     */

	    SailsSocket.prototype.isConnected = function () {
	      if (!this._raw) {
	        return false;
	      }

	      return !!this._raw.connected;
	    };



	    /**
	     * [replay description]
	     * @return {[type]} [description]
	     */
	    SailsSocket.prototype.replay = function (){
	      var self = this;

	      // Pass events and a reference to the request queue
	      // off to the self._raw for consumption
	      for (var evName in self.eventQueue) {
	        for (var i in self.eventQueue[evName]) {
	          self._raw.on(evName, self.eventQueue[evName][i]);
	        }
	      }

	      // Bind a one-time function to run the request queue
	      // when the self._raw connects.
	      if ( !self.isConnected() ) {
	        var alreadyRanRequestQueue = false;
	        self._raw.on('connect', function whenRawSocketConnects() {
	          if (alreadyRanRequestQueue) return;
	          runRequestQueue(self);
	          alreadyRanRequestQueue = true;
	        });
	      }
	      // Or run it immediately if self._raw is already connected
	      else {
	        runRequestQueue(self);
	      }

	      return self;
	    };


	    /**
	     * Chainable method to bind an event to the socket.
	     *
	     * @param  {String}   evName [event name]
	     * @param  {Function} fn     [event handler function]
	     * @return {SailsSocket}
	     */
	    SailsSocket.prototype.on = function (evName, fn){

	      // Bind the event to the raw underlying socket if possible.
	      if (this._raw) {
	        this._raw.on(evName, fn);
	        return this;
	      }

	      // Otherwise queue the event binding.
	      if (!this.eventQueue[evName]) {
	        this.eventQueue[evName] = [fn];
	      }
	      else {
	        this.eventQueue[evName].push(fn);
	      }

	      return this;
	    };

	    /**
	     * Chainable method to unbind an event from the socket.
	     *
	     * @param  {String}   evName [event name]
	     * @param  {Function} fn     [event handler function]
	     * @return {SailsSocket}
	     */
	    SailsSocket.prototype.off = function (evName, fn){

	      // Bind the event to the raw underlying socket if possible.
	      if (this._raw) {
	        this._raw.off(evName, fn);
	        return this;
	      }

	      // Otherwise queue the event binding.
	      if (this.eventQueue[evName] && this.eventQueue[evName].indexOf(fn) > -1) {
	        this.eventQueue[evName].splice(this.eventQueue[evName].indexOf(fn), 1);
	      }

	      return this;
	    };


	    /**
	     * Chainable method to unbind all events from the socket.
	     *
	     * @return {SailsSocket}
	     */
	    SailsSocket.prototype.removeAllListeners = function (){

	      // Bind the event to the raw underlying socket if possible.
	      if (this._raw) {
	        this._raw.removeAllListeners();
	        return this;
	      }

	      // Otherwise queue the event binding.
	      this.eventQueue = {};

	      return this;
	    };

	    /**
	     * Simulate a GET request to sails
	     * e.g.
	     *    `socket.get('/user/3', Stats.populate)`
	     *
	     * @api public
	     * @param {String} url    ::    destination URL
	     * @param {Object} params ::    parameters to send with the request [optional]
	     * @param {Function} cb   ::    callback function to call when finished [optional]
	     */

	    SailsSocket.prototype.get = function(url, data, cb) {

	      // `data` is optional
	      if (typeof data === 'function') {
	        cb = data;
	        data = {};
	      }

	      return this.request({
	        method: 'get',
	        params: data,
	        url: url
	      }, cb);
	    };



	    /**
	     * Simulate a POST request to sails
	     * e.g.
	     *    `socket.post('/event', newMeeting, $spinner.hide)`
	     *
	     * @api public
	     * @param {String} url    ::    destination URL
	     * @param {Object} params ::    parameters to send with the request [optional]
	     * @param {Function} cb   ::    callback function to call when finished [optional]
	     */

	    SailsSocket.prototype.post = function(url, data, cb) {

	      // `data` is optional
	      if (typeof data === 'function') {
	        cb = data;
	        data = {};
	      }

	      return this.request({
	        method: 'post',
	        data: data,
	        url: url
	      }, cb);
	    };



	    /**
	     * Simulate a PUT request to sails
	     * e.g.
	     *    `socket.post('/event/3', changedFields, $spinner.hide)`
	     *
	     * @api public
	     * @param {String} url    ::    destination URL
	     * @param {Object} params ::    parameters to send with the request [optional]
	     * @param {Function} cb   ::    callback function to call when finished [optional]
	     */

	    SailsSocket.prototype.put = function(url, data, cb) {

	      // `data` is optional
	      if (typeof data === 'function') {
	        cb = data;
	        data = {};
	      }

	      return this.request({
	        method: 'put',
	        params: data,
	        url: url
	      }, cb);
	    };



	    /**
	     * Simulate a DELETE request to sails
	     * e.g.
	     *    `socket.delete('/event', $spinner.hide)`
	     *
	     * @api public
	     * @param {String} url    ::    destination URL
	     * @param {Object} params ::    parameters to send with the request [optional]
	     * @param {Function} cb   ::    callback function to call when finished [optional]
	     */

	    SailsSocket.prototype['delete'] = function(url, data, cb) {

	      // `data` is optional
	      if (typeof data === 'function') {
	        cb = data;
	        data = {};
	      }

	      return this.request({
	        method: 'delete',
	        params: data,
	        url: url
	      }, cb);
	    };



	    /**
	     * Simulate an HTTP request to sails
	     * e.g.
	     * ```
	     * socket.request({
	     *   url:'/user',
	     *   params: {},
	     *   method: 'POST',
	     *   headers: {}
	     * }, function (responseBody, JWR) {
	     *   // ...
	     * });
	     * ```
	     *
	     * @api public
	     * @option {String} url    ::    destination URL
	     * @option {Object} params ::    parameters to send with the request [optional]
	     * @option {Object} headers::    headers to send with the request [optional]
	     * @option {Function} cb   ::    callback function to call when finished [optional]
	     * @option {String} method ::    HTTP request method [optional]
	     */

	    SailsSocket.prototype.request = function(options, cb) {

	      var usage =
	      'Usage:\n'+
	      'socket.request( options, [fnToCallWhenComplete] )\n\n'+
	      'options.url :: e.g. "/foo/bar"'+'\n'+
	      'options.method :: e.g. "get", "post", "put", or "delete", etc.'+'\n'+
	      'options.params :: e.g. { emailAddress: "mike@sailsjs.org" }'+'\n'+
	      'options.headers :: e.g. { "x-my-custom-header": "some string" }';
	      // Old usage:
	      // var usage = 'Usage:\n socket.'+(options.method||'request')+'('+
	      //   ' destinationURL, [dataToSend], [fnToCallWhenComplete] )';


	      // Validate options and callback
	      if (typeof options !== 'object' || typeof options.url !== 'string') {
	        throw new Error('Invalid or missing URL!\n' + usage);
	      }
	      if (options.method && typeof options.method !== 'string') {
	        throw new Error('Invalid `method` provided (should be a string like "post" or "put")\n' + usage);
	      }
	      if (options.headers && typeof options.headers !== 'object') {
	        throw new Error('Invalid `headers` provided (should be an object with string values)\n' + usage);
	      }
	      if (options.params && typeof options.params !== 'object') {
	        throw new Error('Invalid `params` provided (should be an object with string values)\n' + usage);
	      }
	      if (cb && typeof cb !== 'function') {
	        throw new Error('Invalid callback function!\n' + usage);
	      }


	      // Build a simulated request object
	      // (and sanitize/marshal options along the way)
	      var requestCtx = {

	        method: options.method.toLowerCase() || 'get',

	        headers: options.headers || {},

	        data: options.params || options.data || {},

	        // Remove trailing slashes and spaces to make packets smaller.
	        url: options.url.replace(/^(.+)\/*\s*$/, '$1'),

	        cb: cb
	      };

	      // If this socket is not connected yet, queue up this request
	      // instead of sending it.
	      // (so it can be replayed when the socket comes online.)
	      if ( ! this.isConnected() ) {

	        // If no queue array exists for this socket yet, create it.
	        this.requestQueue = this.requestQueue || [];
	        this.requestQueue.push(requestCtx);
	        return;
	      }


	      // Otherwise, our socket is ok!
	      // Send the request.
	      _emitFrom(this, requestCtx);
	    };



	    /**
	     * Socket.prototype._request
	     *
	     * Simulate HTTP over Socket.io.
	     *
	     * @api private
	     * @param  {[type]}   options [description]
	     * @param  {Function} cb      [description]
	     */
	    SailsSocket.prototype._request = function(options, cb) {
	      throw new Error('`_request()` was a private API deprecated as of v0.11 of the sails.io.js client. Use `.request()` instead.');
	    };



	    // Set a `sails` object that may be used for configuration before the
	    // first socket connects (i.e. to prevent auto-connect)
	    io.sails = {

	      // Whether to automatically connect a socket and save it as `io.socket`.
	      autoConnect: true,

	      // The route (path) to hit to get a x-origin (CORS) cookie
	      // (or true to use the default: '/__getcookie')
	      useCORSRouteToGetCookie: true,

	      // The environment we're running in.
	      // (logs are not displayed when this is set to 'production')
	      //
	      // Defaults to development unless this script was fetched from a URL
	      // that ends in `*.min.js` or '#production' (may also be manually overridden.)
	      //
	      environment: urlThisScriptWasFetchedFrom.match(/(\#production|\.min\.js)/g) ? 'production' : 'development',

	      // The version of this sails.io.js client SDK
	      sdk: SDK_INFO,

	      // Transports to use when communicating with the server, in the order they will be tried
	      transports: ['polling', 'websocket']
	    };



	    /**
	     * Add `io.sails.connect` function as a wrapper for the built-in `io()` aka `io.connect()`
	     * method, returning a SailsSocket. This special function respects the configured io.sails
	     * connection URL, as well as sending other identifying information (most importantly, the
	     * current version of this SDK).
	     *
	     * @param  {String} url  [optional]
	     * @param  {Object} opts [optional]
	     * @return {Socket}
	     */
	    io.sails.connect = function(url, opts) {
	      opts = opts || {};

	      // If explicit connection url is specified, save it to options
	      opts.url = url || opts.url || undefined;

	      // Instantiate and return a new SailsSocket- and try to connect immediately.
	      var socket = new SailsSocket(opts);
	      socket._connect();
	      return socket;
	    };



	    // io.socket
	    //
	    // The eager instance of Socket which will automatically try to connect
	    // using the host that this js file was served from.
	    //
	    // This can be disabled or configured by setting properties on `io.sails.*` within the
	    // first cycle of the event loop.
	    //


	    // Build `io.socket` so it exists
	    // (this does not start the connection process)
	    io.socket = new SailsSocket();

	    // In the mean time, this eager socket will be queue events bound by the user
	    // before the first cycle of the event loop (using `.on()`), which will later
	    // be rebound on the raw underlying socket.

	    // If configured to do so, start auto-connecting after the first cycle of the event loop
	    // has completed (to allow time for this behavior to be configured/disabled
	    // by specifying properties on `io.sails`)
	    setTimeout(function() {

	      // If autoConnect is disabled, delete the eager socket (io.socket) and bail out.
	      if (!io.sails.autoConnect) {
	        delete io.socket;
	        return;
	      }

	      // consolog('Eagerly auto-connecting socket to Sails... (requests will be queued in the mean-time)');
	      io.socket._connect();


	    }, 0); // </setTimeout>


	    // Return the `io` object.
	    return io;
	  }


	  // Add CommonJS support to allow this client SDK to be used from Node.js.
	  if (typeof module === 'object' && typeof module.exports !== 'undefined') {
	    module.exports = SailsIOClient;
	    return SailsIOClient;
	  }

	  // Otherwise, try to instantiate the client:
	  // In case you're wrapping the socket.io client to prevent pollution of the
	  // global namespace, you can replace the global `io` with your own `io` here:
	  debugger;
	  return SailsIOClient();

	})();


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	
	var screen = "SCREEN";

	var register = "REGISTER";
	var unregister = "UNREGISTER";
	var reassign = "REASSIGN";
	var resize = "RESIZE";
	var display = "DISPLAY";


	module.exports = {
	  screen:{
	    register:buildEvt(screen,register),
	    unregister:buildEvt(screen,unregister),
	    reassign:buildEvt(screen,reassign),
	    display:buildEvt(screen,display),
	    resize:buildEvt(screen,resize)
	  }
	};


	function buildEvt(prefix,suffix){
	  return [prefix,suffix].join(":");
	}


/***/ }
/******/ ]);