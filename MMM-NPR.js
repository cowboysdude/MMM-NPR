/* Magic Mirror
 * Module: MMM-Therm
 *
 * 
 * Cowboysdude
 */
Module.register("MMM-NPR", {

    defaults: {
        updateInterval: 5 * 60 * 1000, 
		rotateInterval: 30 * 1000,
		type: "",
		
		
    },
	
	getScripts: function() {
        return ["moment.js"]
    },

    getStyles: function() {
        return ["MMM-NPR.css"]
    },

    // Define start sequence.
    start: function() {
        Log.info("Starting module: " + this.name);
        this.sendSocketNotification('CONFIG', this.config);
		this.config.lang = this.config.lang || config.language;
        this.loaded = true;
        this.url = this.getnewsUrl();
		this.getNPR();
        this.npr = {};
        this.activeItem = 0;
        this.rotateInterval = null;
		moment.locale(config.language);
    },
	
	getnewsUrl: function() {
		var url = null;  
		var news = this.config.type; 

		if (news == "us") {
			url = "https://www.npr.org/sections/news/";
		} else if (news == "world") {
			url = "https://www.npr.org/sections/world/";
		} 
		else {
			console.log("Error can't get News url.  Check your config.js");
		}
		return url;
	},
	
	scheduleCarousel: function() {
       		console.log("Scheduling news items");
	   		this.rotateInterval = setInterval(() => {
				this.activeItem++;
				this.updateDom(this.config.animationSpeed);
			}, this.config.rotateInterval);
	   },

    getDom: function() {

        var wrapper = document.createElement("div");
		wrapper.classList.add("container");

        var alist = this.npr;
		
       var  keys = Object.keys(this.npr);
			if( keys.length > 0){
           	if(this.activeItem >=  keys.length){
				this.activeItem = 0;
			}
         var alist = this.npr[keys[this.activeItem]];
		 
		var drinkLogo = document.createElement("div");
		   drinkLogo.classList.add("fixed");
           var drinkIcon = document.createElement("img");
		   drinkIcon.classList.add("imgs");
           drinkIcon.src = alist.image;

           drinkLogo.appendChild(drinkIcon);
           wrapper.appendChild(drinkLogo);		
		
        var top = document.createElement("div");
        top.classList.add("flex-item");
		var type = this.config.type;
	    top.innerHTML = "<u><font color=white>"+moment().format("dddd, MMMM Do YYYY")+ "</font></u><br><br>"+alist.headline;
        wrapper.appendChild(top);

		}
		
        return wrapper;
    },

    processNPR: function(data) {
        this.today = data.Today;
        this.npr = data; 
    },

    scheduleUpdate: function() {
        this.setInterval(() => {
            this.getNPR();
        }, this.config.updateInterval);
        this.getNPR(this.config.initialLoadDelay);
    },

    getNPR: function() {
        this.sendSocketNotification('GET_NPR', this.url);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "NPR_RESULT") {
            this.processNPR(payload);
		} 
	if (notification === "MP3_RESULT"){
		this.processMP3(payload);
	}
			if(this.rotateInterval == null){
			   	this.scheduleCarousel();
			   }
        
        this.updateDom();
    }

});