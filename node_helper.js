/* Magic Mirror
 * Module: MMM-Therm
 *
 * By Cowboysdude
 * 
 */
const NodeHelper = require('node_helper');
const cheerio = require('cheerio');
const request = require('request'); 
const translate = require('google-translate-api');
var alist;

module.exports = NodeHelper.create({

    start: function() {
        console.log("Starting module: " + this.name);
    },

     getNPR: function(url) {
		 var self = this;
        request( url, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                const $ = cheerio.load(body);

                const artlist = [];

                $('.imagewrap').each(function(i, elem) {
				const headlines  = $(elem).find('img').attr("alt");
				const srcimage = $(elem).find('img').attr('src').split('=');
                const image  = srcimage[srcimage.length - 1];
				translate(headlines, {to: self.config.lang}).then(res  => {	
				headline = res.text;
				  	alist = {headline, image};
					artlist.push(alist);
				self.sendSocketNotification("NPR_RESULT", artlist);	
				});	
              });
            }
        });
    }, 
	
	
    socketNotificationReceived: function(notification, payload) {
        if (notification === 'GET_NPR') {
			this.getNPR(payload);
        }
        if (notification === 'CONFIG') {
            this.config = payload;
        }
    }
});