var width = 1920;
var height = 1080;
var possible = "0123456789!§$%&/()=*'¬”#£ﬁ^˜·¯°’ÆŒŒ∏ß##-WISHASKHOPETRY, 诶, ēi. B, 比, bǐ. C, 西, xī. D, 迪, dí. E, 伊, yī. F, 艾弗, ài fú. G, 吉, jí. H, 艾尺, ài chǐ. I, 艾, ài. J, 杰, jié. K, 开, kāi. L, 艾勒, ài lè. M, 艾马, ài mǎ. N, 艾娜, ài nà. O, 哦, ó.";
//var possible = "0123456789!§$%&/()=*'¬”#£ﬁ^˜·¯°’ÆŒŒ∏ß##-_-_><≥≥≥°^=ß++";
var currentGen = 0;
var average = -100;
var to;


//--- CONFIG
var fadeout_1 = 1.6; //odd fadeout time
var fadeout_2 = 4.6; //even fadeout time
var scale_1 = 0.16; //odd final scale 
var scale_2 = 0.96; //even final scale 
var num_generations_surviving = 20; //when to delete an old generation of chars
var size_mul = 18; //size multiplicator for regular chars
var size_hilite_mul = 22; //size multiplicator for highlighted chars
var fadein = 0.2; //how fast to fade in new generations
var num_cols = 5; //how many cols are there for positioning?
var nextGenDelay = 500; //how long between new (non-audio) generations
var audioThreshold = 18; //threshold when audio level triggers a new generation
var randomRotation = true; //rotate characters randomly after they are shown


navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

function createRandomCharacter(isSound = false) {
	if(isSound) console.log("Trigger");
	//Random rotate
	if(randomRotation) {
		$(".char").each(function(elem){
			if(Math.random() > 0.3) {
				var degs = Math.random() > 0.5 ? "180deg" : "270deg";				
				$(elem).css("transform","rotate("+degs+")");
				//console.log(degs);
			}
		});
	}

	//Remove old
	if(currentGen%2) {
		TweenMax.to($(".char.gen"+currentGen), fadeout_1, {opacity:0, y:"-=20px", scale:scale_1, ease: SlowMo.ease.config(0.7, 0.7, false), onComplete:function(){
			$(".char.gen"+currentGen).remove(); 
		}});
	} else {
		TweenMax.to($(".char.gen"+currentGen), fadeout_2, {opacity:0, y:"+=40px", scale:scale_2, ease: SlowMo.ease.config(0.7, 0.7, false),onComplete:function(){
			$(".char.gen"+currentGen).remove(); 
		}});
	}
	

	//Cleanup + increase current generation
	$(".char.gen"+(currentGen-num_generations_surviving)).remove(); 
	currentGen++;

	//Create new
	var mul = size_mul;
	if(isSound) mul = size_hilite_mul;
	var numChars = Math.floor(Math.random()*mul);

	for(var i = 0; i < numChars; i++) {
		var charString = possible.charAt(Math.floor(Math.random() * possible.length));
		if(isSound) {
			if(numChars == 10) charString = "WISH";
			else if(numChars == 9) charString = "ASK";
			else if(numChars == 11) charString = "HOPE";
			else if(numChars == 8) charString = "TRY";
		}
		var rotation = (currentGen%2) ? "0deg" : "90deg"
		var elem = $("<div>"+charString+"</div>")
		.addClass("fontclass"+(i%3+1))
		.addClass("char")
		.addClass("gen"+currentGen)
		.attr("data-text",charString)
		.css("font-size",(Math.random()*100+30)+"pt")
		.css("opacity",0)
		.css("transform","rotate("+rotation+")")
		.css("filter","blur("+i*1+"px)")
		.appendTo("body");

		if(isSound && numChars < 12 && numChars > 5) {
			elem.addClass("colored");
			elem.addClass("glitch");
		}

		TweenMax.to(elem, fadein, {opacity:1});
		
		//TODO: cols better than random xpos?
		var cellX = 50+Math.floor(Math.random()*width/num_cols)*num_cols;
		var cellY = 50+Math.floor(Math.random()*height);

		TweenMax.set(elem, {x: cellX, y: cellY});
	}

	var nextTime = Math.floor(Math.random()*5*nextGenDelay);
	to = setTimeout(createRandomCharacter, nextTime);
}

$().ready(function(){
	//Manual generation creation
	$("body").click(function(){
		createRandomCharacter(true);
	});

	$(".dirtycontrols").on("change", function(e){
		/*console.log(e);
		console.log($(this).attr("name"));
		console.log(window[$(this).attr("name")]);*/
		window[$(this).attr("name")] = $(this).val();
	});

	//Audio Input from here
	if (navigator.getUserMedia) {
		navigator.getUserMedia({
			audio: true
		},
		function(stream) {
			audioContext = new AudioContext();
			analyser = audioContext.createAnalyser();
			microphone = audioContext.createMediaStreamSource(stream);
			javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

			analyser.smoothingTimeConstant = 0.8;
			analyser.fftSize = 1024;

			microphone.connect(analyser);
			analyser.connect(javascriptNode);
			javascriptNode.connect(audioContext.destination);

			javascriptNode.onaudioprocess = function() {
				var array = new Uint8Array(analyser.frequencyBinCount);
				analyser.getByteFrequencyData(array);
				var values = 0;

				var length = array.length;
				for (var i = 0; i < length; i++) {
					values += (array[i]);
				}

				average = values / length;

				//console.log(Math.round(average));
				if(average > audioThreshold) {
					 clearTimeout(to);
					 createRandomCharacter(true);					 
				}

        } // end fn stream
    },
    function(err) {
    	console.log("The following error occured: " + err.name)
    });
	} else {
		console.log("getUserMedia not supported");
	}
	
	//Now please go make me some nice output
	createRandomCharacter();
});