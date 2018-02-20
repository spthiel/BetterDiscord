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

		.player-fixed-video-titlebar {
			height: 30px;
			background: rgba(0,0,0,.4);
		}

		#player-fixed-video-player {
			vertical-align: bottom;
		}

		.icon-played {
			color : red;
			transition: 1;
		}

		.player-fixed-video-title {
			max-width: calc(100% - 30px);
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
			this.player = new Player(vid);
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
					 console.log(data.items[0].snippet.title);
					 console.log('good');
			},
			error: function() {
				player.setTitle('An error has occurred.');
				console.log(data.items[0].snippet.title);
				console.log('poo');
			}
		});
	}

}

//--------------------------------------------------------------------------------------------------------------------------------------------
//
//--------------------------------------------------------------------------------------------------------------------------------------------

class Player {

	constructor(vid) {

		this.minheight = 191.25;
		this.minwidth = 340;

		this.x = 0;
		this.y = 0;
		this.width = 340;
		this.height = 191.25;
		this.vid = vid;

		this.generateElements();

		const callback = () => {
			this.frame.removeEventListener("animationend", callback, false);
			this.frame.classList.remove("player-video-in-anim");
			this.frame.classList.add("player-video-in");
		}

		this.frame.addEventListener("animationend", callback, false);

		this.frame.classList.add("player-video-in-anim");

		let yoffset = document.getElementsByClassName("titleBar-3_fDwJ")[0].offsetHeight;

		let mdown = 0;
		let mstartx = 0;
		let mstarty = 0;
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

		this.mousedown = e => {
			mdown = 1;
			mstartx = e.pageX;
			mstarty = e.pageY;
		}
		this.mousemove = e => {
			if(mdown == 1) {
				let xnew = e.pageX-mstartx;
				let ynew = e.pageY-mstarty;
				this.move(xnew,ynew);
				e.preventDefault();
			} else if(mdown == 2) {
				let newheight = mstarty-e.pageY;
				let movey = (newheight+this.height > this.minheight ? newheight : this.minheight-this.height)
				let newwidth = newheight*16/9
				let movex = (newwidth+this.width > this.minwidth ? newwidth : this.minwidth-this.width)
				this.sizeHeight(newheight);
				this.move(-movex,-movey);
				e.preventDefault();
			} else if(mdown == 3) {
				let newwidth = e.pageX-mstartx;
				this.sizeWidth(newwidth);
				e.preventDefault();
			} else if(mdown == 4) {
				let newheight = e.pageY-mstarty;
				this.sizeHeight(newheight);
				e.preventDefault();
			} else if(mdown == 5) {
				let newwidth = mstartx-e.pageX;
				let movex = (newwidth+this.width > this.minwidth ? newwidth : this.minwidth-this.width)
				let newheight = newwidth*9/16
				let movey = (newheight+this.height > this.minheight ? newheight : this.minheight-this.height)
				this.sizeWidth(newwidth);
				this.move(-movex,-movey);
				e.preventDefault();
			}
		}
		this.mouseup = e => {
			if(mdown == 1) {
				let xnew = e.pageX-mstartx;
				let ynew = e.pageY-mstarty;
				this.drop(xnew,ynew);
			} else if(mdown == 2) {
				let newheight = mstarty-e.pageY;
				let movey = (newheight+this.height > this.minheight ? newheight : this.minheight-this.height)
				let newwidth = newheight*16/9
				let movex = (newwidth+this.width > this.minwidth ? newwidth : this.minwidth-this.width)
				this.resizeHeight(newheight);
				this.drop(-movex,-movey);
			} else if(mdown == 3) {
				let newwidth = e.pageX-mstartx;
				this.resizeWidth(newwidth);
			} else if(mdown == 4) {
				let newheight = e.pageY-mstarty;
				this.resizeHeight(newheight);
			} else if(mdown == 5) {
				let newwidth = mstartx-e.pageX;
				let movex = (newwidth+this.width > this.minwidth ? newwidth : this.minwidth-this.width)
				let newheight = newwidth*9/16
				let movey = (newheight+this.height > this.minheight ? newheight : this.minheight-this.height)
				this.resizeWidth(newwidth);
				this.drop(-movex,-movey);
				e.preventDefault();
			}
			mdown = 0;
		}
		this.framelistener = e => {
			mstartx = e.pageX;
			mstarty = e.pageY;

			let border = 4;

			let bars =
				[
					[
						this.x+border,
						this.y,
						this.x+this.width+border,
						this.y+border
					],
					[
						this.x+this.width+border,
						this.y,
						this.x+this.width+2*border,
						this.y+this.height+30+2*border
					],
					[
						this.x+border,
						this.y+this.height+30+border,
						this.x+this.width+border,
						this.y+this.height+30+2*border
					],
					[
						this.x,
						this.y,
						this.x+border,
						this.y+this.height+30+2*border
					]
				]

			let sbar = -1;
			for(let i = 0; i < bars.length; i++) {
				let bar = bars[i];
				if(mstartx >= bar[0] && mstartx <= bar[2] && mstarty-yoffset >= bar[1] && mstarty-yoffset <= bar[3]) {
					sbar = i;
					break;
				}
			}

			if(sbar == 0) {
				mdown = 2
			} else if(sbar == 1) {
				mdown = 3;
			} else if(sbar == 2) {
				mdown = 4;
			} else if(sbar == 3) {
				mdown = 5;
			}


		}

		this.addListener();

	}

	addClassName(element,className) {
		element.className += (!element.className || element.className == "" ? "" : " ") + "player-fixed-video" + ((className && className !== "") ? "-" + className : "");
	}

	setId(element,idname) {
		element.setAttribute("id","player-fixed-video" + ((idname && idname !== "") ? "-" + idname : ""));
	}

	generateElements() {

		let toAppendTo = document.getElementsByClassName("app")[0];
		this.box = document.createElement("div");
		this.addClassName(this.box);

		this.frame = document.createElement("div");
		this.addClassName(this.frame,"frame");
		let placeholder = document.createElement("div");
		this.setId(placeholder,"player");
		this.titleBar = document.createElement("div");
		this.addClassName(this.titleBar,"titlebar");
		this.videoTitle = document.createElement("div");
		this.addClassName(this.videoTitle,"title");
		this.closeButton = document.createElement("div");
		this.addClassName(this.closeButton,"btnclose");

		this.titleBar.appendChild(this.videoTitle);
		this.titleBar.appendChild(this.closeButton);
		this.frame.appendChild(this.titleBar);
		this.frame.appendChild(placeholder);
		this.box.appendChild(this.frame);
		toAppendTo.appendChild(this.box);

		this.buttonBar = document.createElement("div");
		this.addClassName(this.buttonBar,"buttonbar")

		this.playButton = document.createElement("div");
		this.addClassName(this.playButton,"btnplay");
		this.addClassName(this.playButton,"button");
		this.pauseButton = document.createElement("div");
		this.addClassName(this.pauseButton,"btnpause");
		this.addClassName(this.pauseButton,"button");
		this.stopButton = document.createElement("div");
		this.addClassName(this.stopButton,"btnstop");
		this.addClassName(this.stopButton,"button");
		this.timebarFrame = document.createElement("div");
		this.addClassName(this.timebarFrame,"timebar-frame");
		this.timebar = document.createElement("div");
		this.addClassName(this.timebar,"timebar");

		this.buttonBar.appendChild(this.playButton);
		this.buttonBar.appendChild(this.pauseButton);
		this.buttonBar.appendChild(this.stopButton);
		this.frame.appendChild(this.buttonBar);
		this.frame.appendChild(this.timebarFrame);
		this.timebarFrame.appendChild(this.timebar);

	}

	addListener() {

		this.closeButton.addEventListener("click",function(e) {
			let toRemove = document.getElementsByClassName("player-fixed-video")[0];
			if(toRemove)
				toRemove.firstChild.classList.remove('player-video-in');
				setTimeout(() => {
				toRemove.parentElement.removeChild(toRemove);
				}, 300);
		}, false);
		this.frame.addEventListener("mousedown", this.framelistener,false);
		this.titleBar.addEventListener("mousedown", this.mousedown, false);
		document.addEventListener("mousemove", this.mousemove, false);
		document.addEventListener("mouseup", this.mouseup, false);

		this.playButton.addEventListener("click", e => this.player.playVideo(), false);
		this.pauseButton.addEventListener("click", e => this.player.pauseVideo(), false);
		this.stopButton.addEventListener("click", e => this.player.stopVideo(), false);

	}

	removeListener() {

		document.removeEventListener("mousemove", this.mousemove, false);
		document.removeEventListener("mouseup", this.mouseup, false);

	}

	move(x,y) {
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
		return x,y;
	}

	drop(x,y) {
		x,y = this.move(x,y);
		this.x = (this.x + x);
		this.y = (this.y + y);
	}

	setSrc(vid) {
		if(!this.vid || this.vid !== vid) {
			this.vid = vid;
			this.player.loadVideoById({
					'videoId' : vid
			});
		}
	}

	sizeWidth(width) {
		let newwidth = this.width + width;
		if(newwidth < this.minwidth) {
			newwidth = this.minwidth;
		}
		let newheight = newwidth*9/16;
		this.size(newwidth,newheight);
	}

	sizeHeight(height) {
		let newheight = this.height + height;
		if(newheight < this.minheight) {
			newheight = this.minheight;
		}
		let newwidth = newheight*16/9;
		this.size(newwidth,newheight);
	}

	size(width, height) {
		this.player.setSize(width,height);
	}

	resizeWidth(width) {
		this.width = this.width + width;
		if(this.width < this.minwidth) {
			this.width = this.minwidth;
		}
		this.height = this.width*9/16;
		this.resize();
	}

	resizeHeight(height) {
		this.height = this.height + height;
		if(this.height < this.minheight) {
			this.height = this.minheight;
		}
		this.width = this.height*16/9;
		this.resize();
	}

	resize() {
		this.player.setSize(this.width,this.height);
	}

	setTitle(title) {
		this.videoTitle.innerHTML = title;
	}

}
