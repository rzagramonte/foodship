const scheduleMeetupQuestions = async (chatId, eventId, eventDateTime) => {
    try {
      await agenda.schedule(eventDateTime, 'send meetup questions', { chatId, eventId });
      console.log(`Job scheduled to send questions for event ${eventId} at ${eventDateTime}`);
    } catch (err) {
      console.error('Error scheduling meetup questions:', err);
    }
  };
  
  // In your controller handling event creation
const createEvent = async (req, res) => {
    const { chatId, eventId, eventDateTime } = req.body;
  
    try {
      // Save the event in the database
      // ... Your event creation logic here
  
      // Schedule the questions job
      await scheduleMeetupQuestions(chatId, eventId, eventDateTime);
  
      res.status(200).send('Event created and job scheduled');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error creating event or scheduling job');
    }
  };
  