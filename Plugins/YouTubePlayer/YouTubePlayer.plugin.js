//META { "name": "YouTubePlayer" } *//

class YouTubePlayer {

	constructor() {

		this.onClick = this.onClickFunction;
		this.onDrag = this.onDragFunction;
		this.listener;
		this.player;
		this.added;
		this.vidTitleGot;

		let svgsize = 20;

		this.style = `
		:root {
			--resizeThickness: 4px;
		}

		.player-fixed-video {
			position: absolute;
			left: 0;
			top: 0;
			width: 100%;
			height: 100%;
			pointer-events: none
		}

		.player-fixed-video-frame {
			pointer-events: auto;
			position: absolute;
			z-index: 1000;
			background: white;
			border: 4px solid black;
		}

		.player-fixed-video-titleframe {
			display: inline-block;
			height: 100%;
		}

		.player-fixed-video-titlebar {
			height: 30px;
			background: rgba(0,0,0,.4);
		}

		#player-fixed-video-player {
			pointer-events: none;
			vertical-align: bottom;
		}

		.icon-played {
			color : red;
			transition: 1;
		}

		.player-fixed-video-title {
			display: inline-block;
			text-overflow: ellipsis;
			height: 1rem;
			overflow: hidden;
			vertical-align: -webkit-baseline-middle;
		}

		.player-fixed-video-btnclose {
			height: 20px;
			width: 20px;
			margin: 5px;
			float: right;
			border-radius: 50%;
			background-color: rgba(150,0,0,1);
			transition: 0.4s;
		}

		.player-fixed-video-btnclose:hover {
			background-color: rgba(200,0,0,1);
		}

		.player-fixed-video-btnplay {
			top: 10px;
			left: 10px;
			z-index: 5;
			background: url(https://spthiel.github.io/files/play.svg);
			background-size: cover;
		}

		.player-fixed-video-btnpause {
			top: 35px;
			left: 10px;
			z-index: 5;
			background: url(https://spthiel.github.io/files/pause.svg);
			background-size: cover;
		}

		.player-fixed-video-timebar-frame {
			background: white;
			height: 7px;
			width: 100%;
			cursor: pointer;
		}

		.player-fixed-video-timebar {
			background: red;
			height: 100%;
		}

		.player-fixed-video-btnstop {
			top: 60px;
			left: 10px;
			z-index: 5;
			background: url(https://spthiel.github.io/files/stop.svg);
			background-size: cover;
		}

		.player-fixed-video-button {
			margin: 0 0 3px 0;
			width: ` + svgsize + `px;
			height: ` + svgsize + `px;
		}

		.player-fixed-video-buttonbar {
			padding: 3px;
			float: right;
		}

		.player-fixed-video-resizeN {
			cursor: n-resize;
			position: absolute;
			left: 0;
			top: calc(-1 * var(--resizeThickness));
			width: 100%;
			height: var(--resizeThickness);
		}

		.player-fixed-video-resizeE {
			cursor: e-resize;
			position: absolute;
			left: 100%;
			top: calc(-1 * var(--resizeThickness));
			width: var(--resizeThickness);
			height: calc(100% + 2 * var(--resizeThickness));
		}

		.player-fixed-video-resizeS {
			cursor: s-resize;
			position: absolute;
			left: 0;
			top: 100%;
			width: 100%;
			height: var(--resizeThickness);
		}

		.player-fixed-video-resizeW {
			cursor: w-resize;
			position: absolute;
			left: calc(-1 * var(--resizeThickness));
			top: calc(-1 * var(--resizeThickness));
			width: var(--resizeThickness);
			height: calc(100% + 2 * var(--resizeThickness));
		}

		`;

		this.dynamicallyLoadScript("https://www.youtube.com/iframe_api","youtube-iframe-api");
	}

	dynamicallyLoadScript(url,id) {
		if(!document.getElementById(id)) {
		    var script = document.createElement("script"); // Make a script DOM node
			script.setAttribute("id",id)
		    script.src = url; // Set it's src to the provided URL
			console.log("Loading " + url + " api");
		    document.head.appendChild(script); // Add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
		}
	}

    getName() { return "YouTubePlayer"; }

    getDescription() { return "Plays youtube videos in a new dragable, resizeable and over channelswitch lasting popout."; }

    getAuthor() { return "spthiel"; };

    getVersion() { return "1.0.0"; }

    load(){
	}

	start() {
		BdApi.clearCSS("betteryoutubeplayerstyle");
		BdApi.injectCSS("betteryoutubeplayerstyle",this.style);

		this.listener = e => {
  			let {target} = e;
  			"polygon" === target.tagName && (target = target.parentNode);
  			if("svg" === target.tagName && "Play" === target.getAttribute("name")){
				this.onClick(target);
    			e.stopImmediatePropagation();
    			e.preventDefault();
  			}
		}
		document.addEventListener("click", this.listener, true);
		document.addEventListener('drag',this.onDrag,false);

	}

    stop() {
		BdApi.clearCSS("betteryoutubeplayerstyle");
		let toRemove = document.getElementsByClassName("player-fixed-video")[0];
		if(toRemove)
			toRemove.parentElement.removeChild(toRemove);
		document.removeEventListener('click',this.listener,true);
		document.removeEventListener('drag',this.onDrag,false);
		if(this.player)
			this.player.removeListener();
    }

	onClickFunction(e) {

		// let oldicons = document.getElementsByClassName('icon-played')
		// for(let i = 0; i < oldicons.length; i++) {
		// 	oldicons[i].classList.remove("icon-played");
		// };

		// e.classList.add("icon-played");
		let link = e.nextSibling;
		let url = link.href;
		let regex = /https?:\/\/(?:www\.youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+?)(?:(?:&|\?).+?)?$/
		let vid = url.match(regex);

		this.changeOrCreatePlayer(vid[1]);
	}


	changeOrCreatePlayer(vid) {
		if(!this.player || document.getElementsByClassName("player-fixed-video")[0] == undefined) {
			this.player = new YoutubePlayer(vid);
		} else {
			this.player.setSrc(vid);
		}

		let player = this.player;

		var vidTitleGet = 'https://www.googleapis.com/youtube/v3/videos?id=' + vid + '&key=AIzaSyB-YS89N3Io4FB9UqNdgCcH_nq4rt6F8sA&fields=items(snippet(title))&part=snippet';
		$.ajax({
			url: vidTitleGet,
			dataType: "jsonp",
			success: function(data){
					 player.setTitle(data.items[0].snippet.title);
			},
			error: function() {
				player.setTitle('An error has occurred.');
			}
		});
	}

}

//--------------------------------------------------------------------------------------------------------------------------------------------
//
//--------------------------------------------------------------------------------------------------------------------------------------------

class Player {

	constructor(args) {

		this.minheight = 191.25;
		this.minwidth = 340;

		this.width = 340;
		this.height = 191.25;

		this.generateBaseElements();
		this.generateElements();

		const callback = () => {
			this.frame.removeEventListener("animationend", callback, false);
			this.frame.classList.remove("player-video-in-anim");
			this.frame.classList.add("player-video-in");
		}

		this.frame.addEventListener("animationend", callback, false);


		this.frame.classList.add("player-video-in-anim");

		this.paused = false;

		this.mdown = 0;
		this.mstartx = 0;
		this.mstarty = 0;

		this.mousedown = e => {
			this.mdown = 1;
			this.mstartx = e.pageX;
			this.mstarty = e.pageY;
		}
		this.mousemove = e => {
			if(this.mdown == 1) {
				let xnew = e.pageX-this.mstartx;
				let ynew = e.pageY-this.mstarty;
				this.mstartx = e.pageX;
				this.mstarty = e.pageY;
				this.drop(xnew,ynew);
				e.preventDefault();
			} else if(this.mdown == 2) {
				let newheight = this.mstarty-e.pageY;
				let movey = (newheight+this.height > this.minheight ? newheight : this.minheight-this.height)
				let newwidth = newheight*16/9
				let movex = (newwidth+this.width > this.minwidth ? newwidth : this.minwidth-this.width)
				this.mstartx = e.pageX;
				this.mstarty = e.pageY;
				this.resizeHeight(newheight);
				this.drop(-movex,-movey);
				e.preventDefault();
			} else if(this.mdown == 3) {
				let newwidth = e.pageX-this.mstartx;
				this.mstartx = e.pageX;
				this.mstarty = e.pageY;
				this.resizeWidth(newwidth);
				e.preventDefault();
			} else if(this.mdown == 4) {
				let newheight = e.pageY-this.mstarty;
				this.mstartx = e.pageX;
				this.mstarty = e.pageY;
				this.resizeHeight(newheight);
				e.preventDefault();
			} else if(this.mdown == 5) {
				let newwidth = this.mstartx-e.pageX;
				let movex = (newwidth+this.width > this.minwidth ? newwidth : this.minwidth-this.width)
				let newheight = newwidth*9/16
				let movey = (newheight+this.height > this.minheight ? newheight : this.minheight-this.height)
				this.mstartx = e.pageX;
				this.mstarty = e.pageY;
				this.resizeWidth(newwidth);
				this.drop(-movex,-movey);
				e.preventDefault();
			}
		}
		this.mouseup = e => this.mdown = 0;

		this.addBaseListener();
		this.addListener();

		this.x = 0;
		this.y = 0;

		this.construct(args);

		let xoff = 30;
		let yoff = 120;

		let channelmembers = document.getElementsByClassName("channel-members")[0];

		if(channelmembers) {
			xoff += channelmembers.offsetWidth
		}

		this.x = this.box.offsetLeft + this.box.offsetWidth - this.frame.offsetWidth - xoff;
		this.y = this.box.offsetTop + this.box.offsetHeight - this.frame.offsetHeight - yoff;

		this.drop(0,0);
		this.resizeHeight(0);

		this.intervalltask = setInterval(
			(function(self){
				return function() {
					self.updateTimebar();
				}
			})(this),10);
	}

	generateElements(){}
	addListener(){}
	construct(args){}
	getPlayerName(){return "default"}
	getVideoPercentage(){}
	setVideoPercentage(){}
	playVideo(){}
	pauseVideo(){}
	stopVideo(){}

	updateTimebar() {
		let progress = this.getVideoPercentage();
		let absolute = progress * 100;
		this.timebar.style.width = absolute + "%";
	}

	addClassName(element,className) {
		element.className += (!element.className || element.className == "" ? "" : " ") + "player-fixed-video" + ((className && className !== "") ? "-" + className : "");
		//this.addId(element);
	}

	setId(element,idname) {
		element.setAttribute("id", "player-fixed-video" + ((idname && idname !== "") ? "-" + idname : ""));
		this.addId(element);
	}

	addId(element) {
		let idclass = "player-" + this.getPlayerName();
		if(element && !element.classList.contains(idclass)) {
			element.className += " " + idclass;
		}
	}

	generateBaseElements() {
		let toAppendTo = document.getElementsByClassName("app")[0];
		this.box = document.createElement("div");
		this.addClassName(this.box);
		this.addId(this.box);

		this.frame = document.createElement("div");
		this.addClassName(this.frame,"frame");
		let placeholder = document.createElement("div");
		this.setId(placeholder,"player");
		this.titleBar = document.createElement("div");
		this.addClassName(this.titleBar,"titlebar");
		this.titleFrame = document.createElement("div");
		this.addClassName(this.titleFrame,"titleframe");
		this.videoTitle = document.createElement("div");
		this.addClassName(this.videoTitle,"title");
		this.closeButton = document.createElement("div");
		this.addClassName(this.closeButton,"btnclose");

		this.buttonBar = document.createElement("div");
		this.addClassName(this.buttonBar,"buttonbar");

		this.playButton = document.createElement("div");
		this.updatePlayButton();
		this.stopButton = document.createElement("div");
		this.addClassName(this.stopButton,"btnstop");
		this.addClassName(this.stopButton,"button");

		this.timebarFrame = document.createElement("div");
		this.addClassName(this.timebarFrame,"timebar-frame");
		this.timebar = document.createElement("div");
		this.addClassName(this.timebar,"timebar");

		this.timebarFrame.appendChild(this.timebar);

		this.buttonBar.appendChild(this.playButton);
		this.buttonBar.appendChild(this.stopButton);

		this.titleFrame.appendChild(this.videoTitle);
		this.titleBar.appendChild(this.titleFrame);
		this.titleBar.appendChild(this.closeButton);
		this.frame.appendChild(this.titleBar);
		this.frame.appendChild(placeholder);
		this.frame.appendChild(this.buttonBar);
		this.frame.appendChild(this.timebarFrame);
		this.box.appendChild(this.frame);
		toAppendTo.appendChild(this.box);

		let dirs = ["N","E","S","W"];
		this.boxes = [];
		for(let i = 0; i < dirs.length; i++) {
			this.boxes[i] = document.createElement("div");
			this.addClassName(this.boxes[i],"resize" + dirs[i]);
			this.frame.appendChild(this.boxes[i]);
		}

	}

	addBaseListener() {

		this.closeButton.addEventListener("click",e => {
			let toRemove = document.getElementsByClassName("player-fixed-video")[0];
			this.removeListener();
			if(toRemove)
				toRemove.firstChild.classList.remove('player-video-in');
				setTimeout(() => {
					toRemove.parentElement.removeChild(toRemove);
				}, 300);
		}, false);
		this.timebarFrame.addEventListener("click",e => {
			let rect = this.timebarFrame.getBoundingClientRect();
			let percentage = (e.pageX-rect.left)/this.timebarFrame.offsetWidth;
			this.setVideoPercentage(percentage);
		},false);
		this.titleBar.addEventListener("mousedown", this.mousedown, false) ;
		document.addEventListener("mousemove", this.mousemove, false);
		document.addEventListener("mouseup", this.mouseup, false);

		for(let i = 0; i < this.boxes.length; i++) {
			this.boxes[i].addEventListener("mousedown",e => {
				this.mdown = 2+i;
				this.mstartx = e.pageX;
				this.mstarty = e.pageY;
			}, false);
		}

		this.playButton.addEventListener("click", e => {
			if(this.paused) {
				this.playVideo();
				this.paused = false;
				this.updatePlayButton();
			} else {
				this.pauseVideo();
				this.paused = true;
				this.updatePlayButton();
			}
		}, false);
		this.stopButton.addEventListener("click", e => {
			this.stopVideo();
			this.paused = true;
			this.updatePlayButton();
		}, false);

	}

	updatePlayButton() {
		this.playButton.className = "player-fixed-video-button player-fixed-video-" + (this.paused ? "btnplay" : "btnpause");
	}

	removeListener() {

		clearInterval(this.intervalltask);
		document.removeEventListener("mousemove", this.mousemove, false);
		document.removeEventListener("mouseup", this.mouseup, false);
		if(this.removePlayerListener)
			this.removePlayerListener();
	}

	resizeWidth(width) {
		this.width = this.width + width;
		if(this.width < this.minwidth) {
			this.width = this.minwidth;
		}
		this.height = this.width*9/16;
		this.titleFrame.style.width = (this.width | 0) + "px";
		this.resize();
	}

	resizeHeight(height) {
		this.height = this.height + height;
		if(this.height < this.minheight) {
			this.height = this.minheight;
		}
		this.width = this.height*16/9;
		this.titleFrame.style.width = (this.width | 0) + "px";
		this.resize();
	}

	drop(x,y) {
		let minx = this.box.offsetLeft;
		let miny = this.box.offsetTop;
		let maxx = minx + this.box.offsetWidth - this.frame.offsetWidth;
		let maxy = miny + this.box.offsetHeight - this.frame.offsetHeight;

		let xmove = this.x + x;
		let ymove = this.y + y;
		if(xmove > maxx)
			x = maxx-this.x;
		if(xmove  < minx)
			x = minx-this.x;
		if(ymove > maxy)
			y = maxy-this.y;
		if(ymove < miny)
			y = miny-this.y;
		this.frame.style.left = (this.x + x) + "px";
		this.frame.style.top = (this.y + y) + "px";
		this.x = (this.x + x);
		this.y = (this.y + y);
	}

	setTitle(title) {
		this.videoTitle.innerHTML = title;
	}

	getFrame() {
		return this.frame;
	}

}

//----------------------------------------------------------------------------------------------------
//
//----------------------------------------------------------------------------------------------------

class YoutubePlayer extends Player{

	construct(vid) {
		this.vid = vid;

		this.player = new YT.Player('player-fixed-video-player', {
			width: this.width,
			height: this.height,
			videoId: vid,
			playerVars: {
				autoplay: 1,
				showinfo: 0,
				rel: 0,
				controls: 0
			}
		});

	}

	getPlayerName(){return "youtube"}

	generateElements() {}

	getVideoPercentage() {
		if(!this.player.getDuration)
			return 0;
		if(this.player.getDuration() == 0)
			return 0;
		return this.player.getCurrentTime()/this.player.getDuration();
	}

	setVideoPercentage(percentage) {
		if(!this.player.getDuration)
			return;
		if(this.player.getDuration() == 0)
			return;
		let seconds = percentage * this.player.getDuration() | 0;
		this.player.seekTo(seconds, true);
	}

	playVideo() {
		this.player.playVideo();
	}

	pauseVideo() {
		this.player.pauseVideo();
	}

	stopVideo() {
		this.player.stopVideo();
	}

	addListener() {

	}

	setSrc(vid) {
		if(!this.vid || this.vid !== vid) {
			this.vid = vid;
			this.player.loadVideoById({
					'videoId' : vid
			});
		}
	}

	resize() {
		this.player.setSize(this.width,this.height);
	}

}
