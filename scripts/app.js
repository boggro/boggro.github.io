(function(){
	var app = angular.module('Boggro', ['ui.router', 'ngTagCloud', 'duScroll']);

	app.config(
		['$stateProvider', '$locationProvider',
			function($stateProvider, $locationProvider){
				$locationProvider.html5Mode({
					enabled: true,
					requireBase: false
				});
				$stateProvider
					.state('/', {
						url:'/:tags',
						views: {
							'content': {
								templateUrl: 'view/content.html',
								controller: 'contentCtrl',
								controllerAs: 'content'
							}
						}
					})
			}
		]
	);

	function checkAccessOnStateChange($rootScope){
		$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
			if(toParams.tags !== ""){
				var elem = angular.element('#tag');
				if(elem !== null){
					angular.element(document).scrollToElementAnimated(elem, 60);
				}
			}
		});
	}

	checkAccessOnStateChange.$inject = ['$rootScope'];
	app.run(checkAccessOnStateChange);
// main controller
	function main($scope, $http, $state, $stateParams, $location, $anchorScroll){
		var tagArray = [];

		$scope.data = [];

		$http.get('sounds.json').then(function (res){
			res.data.files.forEach(function(item,index){//files
				item.tag.forEach(function(item2,index2){//files.tag
					//var a = search(item2,tagArray);
					var a = _.find(tagArray, function(tags){
						return tags.text == item2;
					})
					if(a){
						a.weight +=1;
					}else if(a === undefined){
						tagArray.push({text: item2, weight: 1, link: item2});
					}
				});
			});
			$scope.data = tagArray;
		});
		
	};

	main.$inject = ['$scope', '$http', '$state', '$stateParams', '$location', '$anchorScroll'];
	app.controller('MainCtrl', main);

// tags controller
	function contentController($scope, $http, $state, $stateParams){
		var content = this;
		var tag = $stateParams.tags || null;
		$scope.tag = tag || '';
		$scope.sounds = [];
		$scope.newSounds = [];
		$scope.mob = [];
		if(tag == null){
			$http.get('sounds.json').then(function(res){
				//$scope.sounds = res.data.files;
				$scope.newSounds = res.data.files;
				$scope.mob = res.data.files;
			});
		}else{
			$http.get('sounds.json').then(function(res){
				$scope.newSounds = res.data.files;
				$scope.mob = res.data.files;
				res.data.files.forEach(function(item,index){//files
					var a = _.find(item.tag, function(tags){
						return tags == tag;
					});
					if(a == tag){
						$scope.sounds.push(item);
					}
				});

			})
		}

		var befAudioId = null;

		content.play = function ($event){
			var audioWrap = angular.element($event.currentTarget),
				id = audioWrap[0].id,
				audioObj = audioWrap.find('audio'),
				audio = audioWrap.find('audio')[0],
				progress = audioWrap.find('.progress'),
				icon = audioWrap.find('.icon'),
				befAudio = angular.element(document).find('audio.'+befAudioId)[0] || null;
			if(befAudio !== null){
				if(befAudioId == id){
					if (audio && audio.readyState >= 1) audio.paused ? audio.play() : audio.pause();
				}else{
					var befAudioObj = angular.element(befAudio);
					befAudio.pause();
					befAudio.currentTime = 0;
					befAudioObj.siblings('.icon').removeClass('play pause');
					befAudioObj.siblings('.progress').css('height', 0);
					befAudioId = id;
					if (audio && audio.readyState >= 1) audio.paused ? audio.play() : audio.pause();
				}
			}else{
				befAudioId = id;
				if (audio && audio.readyState >= 1) audio.paused ? audio.play() : audio.pause();
			}
			
			audioObj.bind('play', function (){
				icon.removeClass('pause').addClass('play');
				progress.animate({height: 100+'%'}, (audio.duration - audio.currentTime)*1000, 'linear');
			});
			audioObj.bind('pause', function (){
				progress.stop();
				if(audio.currentTime == 0){
					progress.css('height', 0);
					icon.removeClass('play pause');
					audio.load();
				}else{
					icon.removeClass('play').addClass('pause');
				}
			});
			audioObj.bind('ended', function (){
				progress.stop();
				progress.css('height', 0);
				icon.removeClass('play pause');
				audio.load();
			});
		};
	};

	contentController.$inject = ['$scope', '$http', '$state', '$stateParams'];
	app.controller('contentCtrl', contentController);

})();
