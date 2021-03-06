const express = require('express');
const router = express.Router();
const config = require('../../config/keys');
const twilio = require('twilio')(config.TWILIO_SID, config.TWILIO_AUTH);
const Student = require('../../models/Student');

// @route GET api/schools
// @desc Get all schools
// @access Public (for now)
router.get('/', (req, res) => {
	res.send('Welcome to the buddies API');
	// Student.find()
	// 	.sort({ studentrfid: -1 })
	// 	.then(students => res.json(students));
});

// @route POST api/schools
// @desc Add a school
// @access Public (for now)
router.post('/', (req, res) => {
	
	var studentID = req.body.student_id;
	res.json({
		"text": "this is from the server",
		"messenger": studentID
	});
	
	Student.find( { studentrfid: studentID } )
	.then(students => {
		//Make the data parseable
		let tmp = JSON.stringify(students);
		let	data = JSON.parse(tmp);
		
		//Data response starts in an array
		//If no response, data still valid out of array
		//If response, make sure var can be verified
		data = (data[0]) ? data[0] : data;

		//Send to execute function if not empty and valid
		(Object.keys(data).length !== 0 && data.constructor === Object) ? execute(data) : console.log(`We couldn't find that BuddyID`); 
	});
	
	//What to do if buddy is scanned and RFID exists in our DB
	function execute(result){
		let childName = result.studentDetails[0].firstName;
		let parentPhone = result.parentDetails[0].phone;

		return sendSuccessMessage(childName, parentPhone);
	}

	function sendSuccessMessage(childFirst, parentPhone){
		console.log(`Sending message to ${childFirst}'s parent...`);
		twilio.messages
		  .create({
		     body: `Off to school! ${childFirst} has boarded their bus! \n\nOpen the BusBuddy webapp to see exactly where it is. BusBuddy.com/view`,
		     from: `+1${config.TWILIO_PHONE}`,
		     to: `+1${parentPhone}`
		   })
		  .then(message => console.log(message.sid))
		  .done();
	}
});

module.exports = router;