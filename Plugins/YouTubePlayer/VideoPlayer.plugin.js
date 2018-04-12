//META { "name": "VideoPlayer" } *//

class VideoPlayer {

	constructor() {

		VideoPlayer.registeredPlayers = [];

		this.onClick = this.onClickFunction;
		this.onDrag = this.onDragFunction;
		this.listener;
		this.player;
		this.added;
		this.vidTitleGot;
		this.playerType;

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

		.player-fixed-video-volumeSlider {
			-webkit-appearance: slider-vertical;
			width: 20px;
			margin: 0;
			height: 100px;
		}

		.player-fixed-video-volumeIcon {
			height: 20px;
			width: 20px;
			background-size: cover;
		}

		/* Icons from https://thenounproject.com/ */

		#volume-icon-type-0 {
			background-image: url("data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9JzIwMCcgd2lkdGg9JzIwMCcgIGZpbGw9IiMwMDAwMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmVyc2lvbj0iMS4xIiBkYXRhLWljb249InZvbHVtZS1vZmYiIGRhdGEtY29udGFpbmVyLXRyYW5zZm9ybT0idHJhbnNsYXRlKDEyIDE2ICkgc2NhbGUoMSAxICkiIHZpZXdCb3g9IjAgMCAxMjggMTI4IiB4PSIwcHgiIHk9IjBweCI+PHBhdGggZD0iTTU1IDBjLS42IDAtMS40OTQuNC0yLjA5NCAxbC0zMS44MTMgMjhjLS42LjUtMS43OTQgMS0yLjU5NCAxaC0xN2MtLjggMC0xLjUuNy0xLjUgMS41djMzYzAgLjguNyAxLjUgMS41IDEuNWgxN2MuOCAwIDEuOTk0LjQgMi41OTQgMWwzMS44MTMgMjhjLjYuNSAxLjU5NCAxIDIuMDk0IDEgLjUgMCAxLS43IDEtMS41di05M2MwLS44LS40LTEuNS0xLTEuNXptMTUuODQ0IDI5LjE1NmwtNS42ODggNS42ODggMTMuMTU2IDEzLjE1Ni0xMy4xNTYgMTMuMTU2IDUuNjg4IDUuNjg4IDEzLjE1Ni0xMy4xNTYgMTMuMTU2IDEzLjE1NiA1LjY4OC01LjY4OC0xMy4xNTYtMTMuMTU2IDEzLjE1Ni0xMy4xNTYtNS42ODgtNS42ODgtMTMuMTU2IDEzLjE1Ni0xMy4xNTYtMTMuMTU2eiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTIgMTYpIj48L3BhdGg+PC9zdmc+");"
		}

		#volume-icon-type-1 {
			background-image: url("data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9JzIwMCcgd2lkdGg9JzIwMCcgIGZpbGw9IiMwMDAwMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmVyc2lvbj0iMS4xIiBkYXRhLWljb249InZvbHVtZS1sb3ciIGRhdGEtY29udGFpbmVyLXRyYW5zZm9ybT0idHJhbnNsYXRlKDI0IDE2ICkgc2NhbGUoMSAxICkiIHZpZXdCb3g9IjAgMCAxMjggMTI4IiB4PSIwcHgiIHk9IjBweCI+PHBhdGggZD0iTTU1IDBjLS42IDAtMS40OTQuNC0yLjA5NCAxbC0zMS44MTMgMjhjLS42LjUtMS43OTQgMS0yLjU5NCAxaC0xN2MtLjggMC0xLjUuNy0xLjUgMS41djMzYzAgLjguNyAxLjUgMS41IDEuNWgxN2MuOCAwIDEuOTk0LjQgMi41OTQgMWwzMS44MTMgMjhjLjYuNSAxLjU5NCAxIDIuMDk0IDEgLjUgMCAxLS43IDEtMS41di05M2MwLS44LS40LTEuNS0xLTEuNXptMTcuODc1IDMxLjAzMWwtNS41NjMgNS43NWMyLjk0MSAyLjg2MiA0LjY4OCA2Ljc4NSA0LjY4OCAxMS4yMTkgMCA0LjQzMy0xLjc0NiA4LjM1Ny00LjY4OCAxMS4yMTlsNS41NjMgNS43NWM0LjQ1OS00LjMzOCA3LjEyNS0xMC40MDIgNy4xMjUtMTYuOTY5IDAtNi41NjctMi42NjYtMTIuNjMtNy4xMjUtMTYuOTY5eiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjQgMTYpIj48L3BhdGg+PC9zdmc+");
		}

		#volume-icon-type-2 {
			background-image: url("data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9JzIwMCcgd2lkdGg9JzIwMCcgIGZpbGw9IiMwMDAwMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmVyc2lvbj0iMS4xIiBkYXRhLWljb249InZvbHVtZS1tZWRpdW0iIGRhdGEtY29udGFpbmVyLXRyYW5zZm9ybT0idHJhbnNsYXRlKDEyIDE2ICkgc2NhbGUoMSAxICkiIHZpZXdCb3g9IjAgMCAxMjggMTI4IiB4PSIwcHgiIHk9IjBweCI+PHBhdGggZD0iTTU1IDBjLS42IDAtMS40OTQuNC0yLjA5NCAxbC0zMS44MTMgMjhjLS42LjUtMS43OTQgMS0yLjU5NCAxaC0xN2MtLjggMC0xLjUuNy0xLjUgMS41djMzYzAgLjguNyAxLjUgMS41IDEuNWgxN2MuOCAwIDEuOTk0LjQgMi41OTQgMWwzMS44MTMgMjhjLjYuNSAxLjU5NCAxIDIuMDk0IDEgLjUgMCAxLS43IDEtMS41di05M2MwLS44LS40LTEuNS0xLTEuNXptMzQuOTM4IDE0LjA2M2wtNS42NTYgNS42NTZjNy4yODEgNy4yODEgMTEuNzE5IDE3LjI2MSAxMS43MTkgMjguMjgxcy00LjQ3MSAyMS4wOTItMTEuNzE5IDI4LjI1bDUuNjI1IDUuNjg4YzguNzUyLTguNjQyIDE0LjA5NC0yMC43NTggMTQuMDk0LTMzLjkzOCAwLTEzLjE4LTUuMzQ0LTI1LjIxOS0xNC4wNjMtMzMuOTM4em0tMTcuMDYzIDE2Ljk2OWwtNS41NjMgNS43NWMyLjk0MSAyLjg2MiA0LjY4OCA2Ljc4NSA0LjY4OCAxMS4yMTkgMCA0LjQzMy0xLjc0NiA4LjM1Ny00LjY4OCAxMS4yMTlsNS41NjMgNS43NWM0LjQ1OS00LjMzOCA3LjEyNS0xMC40MDIgNy4xMjUtMTYuOTY5IDAtNi41NjctMi42NjYtMTIuNjMtNy4xMjUtMTYuOTY5eiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTIgMTYpIj48L3BhdGg+PC9zdmc+");
		}

		#volume-icon-type-3 {
			background-image: url("data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9JzIwMCcgd2lkdGg9JzIwMCcgIGZpbGw9IiMwMDAwMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmVyc2lvbj0iMS4xIiBkYXRhLWljb249InZvbHVtZS1oaWdoIiBkYXRhLWNvbnRhaW5lci10cmFuc2Zvcm09InRyYW5zbGF0ZSgwIDEyICkgc2NhbGUoMSAxICkiIHZpZXdCb3g9IjAgMCAxMjggMTI4IiB4PSIwcHgiIHk9IjBweCI+PHBhdGggZD0iTTEwNi45MzggMS4wNjNsLTUuNjU2IDUuNjU2YzExLjU3OSAxMS41NzkgMTguNzE5IDI3LjU1OSAxOC43MTkgNDUuMjgxIDAgMTcuNzIyLTcuMTM5IDMzLjcwMi0xOC43MTkgNDUuMjgxbDUuNjU2IDUuNjU2YzEzLjAyMS0xMy4wMjEgMjEuMDYzLTMxLjA1OSAyMS4wNjMtNTAuOTM4IDAtMTkuODc4LTguMDQyLTM3LjkxNy0yMS4wNjMtNTAuOTM4em0tNTEuOTM4IDIuOTM4Yy0uNiAwLTEuNDk0LjQtMi4wOTQgMWwtMzEuODEzIDI4Yy0uNi41LTEuNzk0IDEtMi41OTQgMWgtMTdjLS44IDAtMS41LjctMS41IDEuNXYzM2MwIC44LjcgMS41IDEuNSAxLjVoMTdjLjggMCAxLjk5NC40IDIuNTk0IDFsMzEuODEzIDI4Yy42LjUgMS41OTQgMSAyLjA5NCAxIC41IDAgMS0uNyAxLTEuNXYtOTNjMC0uOC0uNC0xLjUtMS0xLjV6bTM0LjkzOCAxNC4wNjNsLTUuNjU2IDUuNjU2YzcuMjgxIDcuMjgxIDExLjcxOSAxNy4yNjEgMTEuNzE5IDI4LjI4MXMtNC40NzEgMjEuMDkyLTExLjcxOSAyOC4yNWw1LjYyNSA1LjY4OGM4Ljc1Mi04LjY0MiAxNC4wOTQtMjAuNzU4IDE0LjA5NC0zMy45MzggMC0xMy4xOC01LjM0NC0yNS4yMTktMTQuMDYzLTMzLjkzOHptLTE3LjA2MyAxNi45NjlsLTUuNTYzIDUuNzVjMi45NDEgMi44NjIgNC42ODggNi43ODUgNC42ODggMTEuMjE5IDAgNC40MzMtMS43NDYgOC4zNTctNC42ODggMTEuMjE5bDUuNTYzIDUuNzVjNC40NTktNC4zMzggNy4xMjUtMTAuNDAyIDcuMTI1LTE2Ljk2OSAwLTYuNTY3LTIuNjY2LTEyLjYzLTcuMTI1LTE2Ljk2OXoiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAgMTIpIj48L3BhdGg+PC9zdmc+");
		}

		`;

		this.dynamicallyLoadScript("https://www.youtube.com/iframe_api","youtube-iframe-api");

		VideoPlayer.registerPlayer(YoutubePlayer);
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

    getName() { return "VideoPlayer"; }

    getDescription() { return "Plays videos in a new dragable, resizeable and over channelswitch lasting popout."; }

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
		let players = VideoPlayer.registeredPlayers;
		console.log(url);
		for(let i = 0; i < players.length; i++) {
			let player = players[i];
			if(player.getRegex) {
				let regex = player.getRegex();
				if(regex.test(url)) {
					let vid = url.match(regex)[1];
					console.log(vid);
					if(!this.player || document.getElementsByClassName("player-fixed-video")[0] == undefined) {
						this.player = new player(vid);
						this.playerType = this.player.getPlayerName();
					} else {
						if(this.playerType == player.getPlayerName()) {
							this.player.setSrc(vid);
						} else {
							this.player.close();
							this.player = new player(vid);
							this.playerType = this.player.getPlayerName();
						}
					}
				}
			}
		}
	}

	static registerPlayer(player) {
		VideoPlayer.registeredPlayers[VideoPlayer.registeredPlayers.length] = player;
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

	generateElements(){} // for player specific elements
	addListener(){} // for player specific listener
	construct(args){} // called upon construction of the player
	static getPlayerName(){return "default"} // returns the name of the video player. Used for identification of different classes
	getPlayerName(){return "default"} // returns the name of the video player. Used for css classnames
	getVideoPercentage(){} // should return the amount that has been played of the video. 0 = start 1 = end
	setVideoPercentage(){} // get's executed when the user clicks on the timebar 0 = start 1 = end
	playVideo(){} // start/resume the video
	pauseVideo(){} // pause the video
	stopVideo(){} // resets the video
	setVolume(volume){} // apply the volume. 0 = no volume 100 = max volume
	static getRegex(){} // returns the regex of the player. used for identifing what player the video uses

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

		this.volumeDiv = document.createElement("div");
		this.volumeSlider = document.createElement("input");
		this.volumeDisplay = document.createElement("div");

		this.addClassName(this.volumeDiv,"volumeFrame");
		this.addClassName(this.volumeSlider,"volumeSlider");
		this.addClassName(this.volumeDisplay,"volumeIcon");

		this.volumeDisplay.setAttribute("id","volume-icon-type-2");

		this.volumeSlider.setAttribute("type","range");
		this.volumeSlider.setAttribute("min","0");
		this.volumeSlider.setAttribute("max","100");
		this.volumeSlider.setAttribute("value","50");
		this.volumeSlider.setAttribute("orient","vertical");

		this.timebarFrame = document.createElement("div");
		this.addClassName(this.timebarFrame,"timebar-frame");
		this.timebar = document.createElement("div");
		this.addClassName(this.timebar,"timebar");

		this.timebarFrame.appendChild(this.timebar);

		this.volumeDiv.appendChild(this.volumeSlider);
		this.volumeDiv.appendChild(this.volumeDisplay);

		this.buttonBar.appendChild(this.playButton);
		this.buttonBar.appendChild(this.stopButton);
		this.buttonBar.appendChild(this.volumeDiv);

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

	close() {
		let toRemove = document.getElementsByClassName("player-fixed-video")[0];
		this.removeListener();
		if(toRemove)
			toRemove.firstChild.classList.remove('player-video-in');
			setTimeout(() => {
				toRemove.parentElement.removeChild(toRemove);
			}, 300);
	}

	addBaseListener() {

		this.closeButton.addEventListener("click",e => {
			this.close();
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

		this.volumeSlider.addEventListener("change", e => {
			let value = this.volumeSlider.value;
			this.setVolume(value);
			this.updateVolumeIcon(value);
		}, false);

	}

	updateVolumeIcon(volume) {
		if(volume == 0)
			this.volumeDisplay.setAttribute("id","volume-icon-type-0");
		else if(volume <= 33)
			this.volumeDisplay.setAttribute("id","volume-icon-type-1");
		else if(volume > 33 && volume <= 66)
			this.volumeDisplay.setAttribute("id","volume-icon-type-2");
		else
			this.volumeDisplay.setAttribute("id","volume-icon-type-3");
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

	static getRegex() {
		return /https?:\/\/(?:www\.youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+?)(?:(?:&|\?).+?)?$/;
	}

	construct(vid) {
		this.vid = vid;

		this.player = new YT.Player('player-fixed-video-player', {
			width: this.width,
			height: this.height,
			videoId : vid,
			playerVars: {
				autoplay: 1,
				showinfo: 0,
				rel: 0,
				controls: 0
			}
		});

		this.setSrc(vid);

	}

	setVolume(volume) {
		this.player.setVolume(volume);
	}

	static getPlayerName(){return "youtube"}

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

		var vidTitleGet = 'https://www.googleapis.com/youtube/v3/videos?id=' + vid + '&key=AIzaSyCIjoEGlXy809VS59j2m4i2Kvp1lnsqjQk&fields=items(snippet(title))&part=snippet';
		let that = this;
		$.ajax({
			url: vidTitleGet,
			dataType: "jsonp",
			success: function(data){
					 that.setTitle(data.items[0].snippet.title);
			},
			error: function() {
				that.setTitle('An error has occurred.');
			}
		});
	}

	resize() {
		this.player.setSize(this.width,this.height);
	}

}
