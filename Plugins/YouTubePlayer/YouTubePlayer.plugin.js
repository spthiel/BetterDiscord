//META { "name": "YouTubePlayer" } *//

class YouTubePlayer {

	constructor() {
		this.onClick = this.onClickFunction;
		this.onDrag = this.onDragFunction;
		this.listener;
		this.player;
		this.added;
		this.style = `
		.playerbase {
			position: absolute;
			left: 0;
			top: 0;
		}

		.playerFrame {
			pointer-events: auto;
			position: absolute;
			z-index: 1000;
			background: white;
			border: 4px solid black;
		}

		.playerTitleBar {
			height: 30px;
			background: rgba(0,0,0,.4);
		}

		#betteryoutubeplayer {
			vertical-align: bottom;
		}

		.icon-played {
			color : red;
			transition: 1;
		}

		.btnclose {
			height: 20px;
			width: 20px;
			margin: 5px;
			float: right;
			border-radius: 50%;
			background-color: rgba(150,0,0,1);
			transition: 0.4s;
		}

		.btnclose:hover {
			background-color: rgba(200,0,0,1);
		}
		`;

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
		let toRemove = document.getElementsByClassName("playerbase")[0];
		if(toRemove)
			toRemove.parentElement.removeChild(toRemove);
		BdApi.clearCSS("betteryoutubeplayerstyle");
		document.removeEventListener('click',this.listener,true);
		document.removeEventListener('drag',this.onDrag,false);
		if(this.player)
			this.player.removeListener();
    }

    onSwitch() {

    }

	onClickFunction(e) {

		let oldicons = document.getElementsByClassName('icon-played')
		for(let i = 0; i < oldicons.length; i++) {
			oldicons[i].classList.remove("icon-played");
		};

		e.classList.add("icon-played");
		let link = e.nextSibling;
		let url = link.href;
		let regex = /https?:\/\/(?:www\.youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+?)(?:(?:&|\?).+?)?$/
		let vid = url.match(regex);
		this.changeOrCreatePlayer(vid[1]);
	}

	changeOrCreatePlayer(vid) {
		if(!this.player || document.getElementsByClassName("playerbase")[0] == undefined) {
			this.player = this.createPlayer();
		}

		this.player.setSrc("https://www.youtube.com/embed/" + vid + "?autoplay=1&auto_play=1");
	}

	createPlayer() {

		let player = new Player();
		player.addListener();

		return player;

	}

	onDragFunction(e) {
		console.log(e);
	}

}

class Player {

	constructor() {
		this.x = 0;
		this.y = 0;
		this.width = 320;
		this.height = 180;
		this.vid;

		let toAppendTo = document.getElementsByClassName("app")[0];
		let relative = document.createElement("div");
		relative.className += "playerbase";

		this.frame = document.createElement("div");
		this.frame.className += "playerFrame";
		this.player = document.createElement("iframe");
		this.player.setAttribute("id","betteryoutubeplayer");
		this.titleBar = document.createElement("div");
		this.titleBar.className += "playerTitleBar";
		this.closeButton = document.createElement("div");
		this.closeButton.className += "btnclose";

		this.resize();

		this.titleBar.appendChild(this.closeButton)
		this.frame.appendChild(this.titleBar);
		this.frame.appendChild(this.player);
		relative.appendChild(this.frame);
		toAppendTo.appendChild(relative);

		let yoffset = document.getElementsByClassName("titleBar-3_fDwJ")[0].offsetHeight;

		let mdown = 0;
		let mstartx = 0;
		let mstarty = 0;

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
				let newwidth = e.pageX-mstartx;
				this.sizeWidth(newwidth);
				e.preventDefault();
			} else if(mdown == 3) {
				let newheight = e.pageY-mstarty;
				this.sizeHeight(newheight);
				e.preventDefault();
			}
		}
		this.mouseup = e => {
			if(mdown == 1) {
				let xnew = e.pageX-mstartx;
				let ynew = e.pageY-mstarty;
				this.drop(xnew,ynew);
			} else if(mdown == 2) {
				let newheight = e.pageX-mstartx;
				this.resizeHeight(newheight);
			} else if(mdown == 3) {
				let newwidth = e.pageY-mstarty;
				this.resizeWidth(newwidth);
			}
			mdown = 0;
		}
		this.framelistener = e => {
			let border = 4;

			mstartx = e.pageX;
			mstarty = e.pageY;


			let bars =
				[
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
				mdown = 2;
			} else if(sbar == 1) {
				mdown = 3;
			}


		}

	}

	addListener() {

		this.closeButton.addEventListener("click",function(e) {
			let toRemove = document.getElementsByClassName("playerbase")[0];
			if(toRemove)
				toRemove.parentElement.removeChild(toRemove);
		}, false);
		this.frame.addEventListener("mousedown", this.framelistener,false);
		this.titleBar.addEventListener("mousedown", this.mousedown, false);
		document.addEventListener("mousemove", this.mousemove, false);
		document.addEventListener("mouseup", this.mouseup, false);

	}

	removeListener() {

		document.removeEventListener("mousemove", this.mousemove, false);
		document.removeEventListener("mouseup", this.mouseup, false);

	}

	move(x,y) {
		this.frame.style.left = (this.x + x) + "px";
		this.frame.style.top = (this.y + y) + "px";
	}

	drop(x,y) {
		this.frame.style.left = (this.x + x) + "px";
		this.frame.style.top = (this.y + y) + "px";
		this.x = (this.x + x);
		this.y = (this.y + y);
	}

	setSrc(url) {
		if(!this.player.src || this.player.src !== url)
			this.player.src = url;
	}

	sizeWidth(width) {
		let newwidth = this.width + width;
		if(newwidth < 320) {
			newwidth = 320;
		}
		let newheight = newwidth*9/16;
		this.size(newwidth,newheight);
	}

	sizeHeight(height) {
		let newheight = this.height + height;
		if(newheight < 180) {
			newheight = 180;
		}
		let newwidth = newheight*16/9;
		this.size(newwidth,newheight);
	}

	size(width, height) {
		this.player.style.width = width + "px";
		this.player.style.height = height + "px";
	}

	resizeWidth(width) {
		this.width = this.width + width;
		if(this.width < 320) {
			this.width = 320;
		}
		this.height = this.width*9/16;
		this.resize();
	}

	resizeHeight(height) {
		this.height = this.height + height;
		if(this.height < 180) {
			this.height = 180;
		}
		this.width = this.height*16/9;
		this.size();
	}

	resize() {
		this.player.style.width = this.width + "px";
		this.player.style.height = this.height + "px";
	}

}
