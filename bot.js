// Our Twitter library
var Twit = require('twit');
const images = require('./images.js');
const path = require('path');
const fs = require('fs');
const config = require(path.join(__dirname, 'config.js'));

// We need to include our configuration file
var T = new Twit(require('./config.js'));

// This is the URL of a search for the latest tweets on the '#Kanye' hashtag.
var hashTagSearch = { q: "#Kanye", count: 10, result_type: "recent" };

// This function finds the latest tweet with the #Kanye hashtag, and retweets it.
function likeYeTweet() {
	T.get('search/tweets', hashTagSearch, function (error, data) {
		// log out any errors and responses
		console.log(error, data);
		// If our search request to the server had no errors...
		if (!error) {
			// ... How to “like” a post after finds the latest tweet
			var likeId = data.statuses[0].id_str;
			T.post('favorites/create', { id: likeId }, function (error, data, response) { console.log("just liked a post") });
			console.log(data);
			// ...then we grab the ID of the tweet we want to retweet...
			var retweetId = data.statuses[0].id_str;
			// ...and then we tell Twitter we want to retweet it!
			T.post('statuses/retweet/' + retweetId, {}, function (error, response) {
				if (response) {
					console.log('Success! Check your bot, it should have retweeted something.')
				}
				// If there was an error with our Twitter call, we print it out here.
				if (error) {
					console.log('There was an error with Twitter:', error);
				}
			})
		}
		// However, if our original search request had an error, we want to print it out here.
		else {
			console.log('There was an error with your hashtag search:', error);
		}
	});
}

// This function finds the latest tweet with the #Kanye hashtag and replies to it.
function replyToYeTweet() {
	T.get('search/tweets', hashTagSearch, function (error, data) {
		// log out any errors and responses
		console.log(error, data);
		// If our search request to the server had no errors...
		if (!error) {
			// ... How to reply to a post after latest tweet is found
			var replyId = data.statuses[0].id_str;
			console.log(data);
			// ...then we grab the ID of the tweet we want to reply to...
			var name = data.statuses[0].user.screen_name;
			// we choose whether to post an image or a sentence reply
			var rand = Math.floor(Math.random() * 2);
			if (rand == 1) {
				// ...we find our targeted twitter user's handle and write our bot reply
				var replyText = data.statuses[0].text.replace(data.statuses[0].text, "@" + name + " Kanye deserves everything he's getting");
				// ...and then we tell Twitter we want to reply to the tweet!
				T.post('statuses/update', { status: replyText, in_reply_to_status_id: replyId }, function (error, response) {
					if (response) {
						console.log('Success! Check your bot, it should have replied to a tweet.')
					}
					// If there was an error with our Twitter call, we print it out here.
					if (error) {
						console.log('There was an error with Twitter:', error);
					}
				})
			} else {
				// ...we choose an image to reply with...
				const imageName = images[Math.floor(Math.random() * images.length)];
				const imagePath = path.join(__dirname, '/images/' + imageName.file);

				var replyImage = fs.readFileSync(imagePath, { encoding: 'base64' });

				// ...and then we tell Twitter we want to reply to the tweet!
				T.post('media/upload', { media_data: replyImage }, function (error, data, response) {
					if (response) {
						const image = data;
						console.log('uploading image...', imagePath);
						// create the image on twitter
						T.post('media/metadata/create', { media_id: image.media_id_string, }, function (error, data, response) {
							if (response) {
								var replyText = ("@" + name + " Kanye moment");
								// reply the tweet
								T.post('statuses/update', { status: replyText, media_ids: image.media_id_string,
									in_reply_to_status_id: replyId }, function (error, data, response) {
									if (response) {
										console.log('Success! Check your bot, it should have posted an image reply to a tweet.');
									}
									// If there was an error with adding a status, we print it here.
									else if (error) {
										console.log('There was an error with the status:', error);
									}
								})
							}
							// If there was an error uploading our image, we print it out here.
							else if (error) {
								console.log('There was an error with the image:', error);
							}
						})
					}
					// If there was an error with our Twitter call, we print it out here.                                                                         r call, we print it out here.
					else if (error) {
						console.log('There was an error with Twitter:', error);
					}
				})
			}
		}
		// However, if our original search request had an error, we want to print it out here.
		else {
			console.log('There was an error with your hashtag search:', error);
		}

	});
}
function returnAMention() {
	var mentionSearch = { q: "@DoanTran1212", count: 10, result_type: "recent" };
	T.get('search/tweets', mentionSearch, function (error, data) {
		// log out any errors and responses
		console.log(error, data);
		// If our search request to the server had no errors...
		if (!error) {
			//Replaces our name with the mentioners ID
			var tweet = data.statuses[0].text.replace("@DoanTran1212", "@" + data.statuses[0].user.screen_name);
			// // ...then we grab the ID of the tweet we want to reply..
			var mentionId = data.statuses[0].id_str;
			T.post('statuses/update', { status: tweet, in_reply_to_status_id: mentionId }, function (error, response) {
				if (response) {
					console.log('Success! Check your bot, it should have tweet something.');
				}
				// If there was an error with our Twitter call, we print it out here.
				if (error) {
					console.log('There was an error with Twitter:', error);
				}
			})

		}
		// However, if our original search request had an error, we want to print it out here.
		else {
			console.log('There was an error with your hashtag search:', error);
		}
	});
}

function retweetLatest() {
	likeYeTweet();
	returnAMention();
	replyToYeTweet();
}
// Try to retweet something as soon as we run the program...
retweetLatest();


// ...and then every hour after that. Time here is in milliseconds, so
// 1000 ms = 1 second, 1 sec * 60 = 1 min, 1 min * 60 = 1 hour --> 1000 * 60 * 60
setInterval(retweetLatest, 1000 * 60 * 60);
