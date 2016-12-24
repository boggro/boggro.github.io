(function(){
	var app = angular.module('Boggro', ['ngAudio']);
	
	app.controller('MainCtrl', ['$scope', '$http', 'ngAudio', function ($scope, $http, ngAudio){
		var main = this,
			befAudioId = null;
		
		$scope.sounds = [];
		$scope.isLoaded = [];
		$scope.col = [];

		//ngAudio
		$scope.bell = ngAudio.load("sounds/Jingle Bells in Kazoo.mp3");
		$scope.bell.loop = true;

		(function(){
			$http.get('sounds.json').success(function (data){
				$scope.sounds = data;
				data.forEach(function(item,index){
					$scope.isLoaded.push(false);
					if(index==0){
						$scope.col.push(true);
					}else{
						$scope.col.push(false);
					}
				});
			});
		})();

		main.collapse = function ($event,_id){
			var col = angular.element($event.currentTarget),
				panel = col.parent().find('#collapse_'+_id);
			$scope.col[_id] = !panel.hasClass('in');
		}
		
		main.play = function ($event){
			var audioWrap = angular.element($event.currentTarget),
				id = audioWrap[0].id,
				audioEle = audioWrap.find('audio'),
				audio = audioWrap.find('audio')[0],
				progress = audioWrap.find('.progress'),
				icon = audioWrap.find('.icon'),
				befAudio = angular.element(document).find('audio.'+befAudioId)[0] || null;

			if(befAudio !== null){
				if(befAudioId == id){
					if (audio && audio.readyState >= 1) audio.paused ? audio.play() : audio.pause();
				}else{
					var befAudioEle = angular.element(befAudio);
					befAudio.pause();
					befAudio.currentTime = 0;
					befAudioEle.siblings('.icon').removeClass('play pause');
					befAudioEle.siblings('.progress').css('height', 0);
					befAudioId = id;
					if (audio && audio.readyState >= 1) audio.paused ? audio.play() : audio.pause();
				}
			}else{
				befAudioId = id;
				if (audio && audio.readyState >= 1) audio.paused ? audio.play() : audio.pause();
			}
			
			audioEle.bind('play', function (){
				icon.removeClass('pause').addClass('play');
				progress.animate({height: 100+'%'}, (audio.duration - audio.currentTime)*1000, 'linear');
			});
			audioEle.bind('pause', function (){
				progress.stop();
				if(audio.currentTime == 0){
					progress.css('height', 0);
					icon.removeClass('play pause');
					audio.load();
				}else{
					icon.removeClass('play').addClass('pause');
				}
			});
			audioEle.bind('ended', function (){
				progress.stop();
				progress.css('height', 0);
				icon.removeClass('play pause');
				audio.load();
			});
		};
	}]);

	app.directive('coll',[function(){
		return{
			restrict: 'A',
			scope:{
				sound: '=sound',
				col: '=cl',
				main: '=main'
			},
			link: function (scope, ele, attrs){
				var index = scope.$parent.$index;

				if (scope.$parent.$index == 0){
					angular.element(ele).addClass('in');
				}
				
				scope.$watch('col['+index+']', function(){
					if(scope.col[index]){
						scope.contentUrl = 'view/col.html';
						scope.$parent.isLoaded[index] = true;
					}else if(!scope.col[index] && !scope.$parent.isLoaded[index]){
						scope.contentUrl = 'view/default.html';
					}
				})
			},
			template: '<div ng-include="contentUrl"></div>'
		}
	}]);
})();

