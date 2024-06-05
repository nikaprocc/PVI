const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const socket = require('socket.io');
const port = process.env.Port || 5000;
const mongoose = require('mongoose');
const app = express();
var user = [];

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'veronika2005',
    database: 'studentsdb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
const password = encodeURIComponent("oWK1MRTg");

let uri = 'mongodb+srv://nikaproc:xuixuixui@cluster0.9zkk8of.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(uri)
  .then(() => console.log('Connected to MongoDB database!'))
  .catch(err => console.error('MongoDB connection error:', err));


const accountSchema = new mongoose.Schema({
    id: Number,
    username: String,
    password: String,
    name: String,
    surname: String
}, {collection: 'accounts'});

const chatSchema = new mongoose.Schema({
    id: Number,
    name: String,
    members: [Number]
}, {collection: 'chatInfo'});

const messageSchema = new mongoose.Schema({
    id: Number,
    chatId: Number,
    senderId: Number,
    content: String,
    readBy: [Boolean]
}, {collection: 'Messages'});

const Account = mongoose.model('accounts', accountSchema);
const Chat = mongoose.model('chatInfo', chatSchema);
const Message = mongoose.model('Messages', messageSchema);

class Student {
    constructor(firstName, lastName, groupName, gender, birthDate, id) {
      this.firstName = firstName;
      this.lastName = lastName;
      this.groupName = groupName;
      this.gender = gender;
      this.birthDate = birthDate;
      this.id = id;
    }
  }
  
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.static(__dirname));
app.use(bodyParser.json());

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err.message);
    } else {
        console.log('Connected to MySQL database!');
        connection.release();
    }
});

pool.on('error', (err) => {
    console.error('MySQL database error:', err.message);
});


app.get('/', (req, res)=>{
    res.sendFile(__dirname + 'index.html');
    
})

//+380 66 871 09 01 уероніка
app.post('/deleteConf', (req, res) =>{
    console.log(req.body);
    const { id } = req.body;
    pool.query('DELETE FROM student WHERE id = ?', [id], (error, res) => {
        if(error){
            console.error('Error executing query:', error);
            return res.status(500).json({ valid: false, message: 'Error occurred while deleting in database.' });
        }
       }) 
       return res.status(200).json({ valid: true, message: 'Student deleted succesfully.' });

})

app.post('/loginValidation', (req, res) =>{
    console.log(req.body);
    const {username, password} = req.body;
        pool.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password],(error, results) => {
        if(results.length > 0){
            return res.status(200).json({ valid: true, name:results[0].name+" "+results[0].surname, username: username, id: results[0].id});
        } else {
            return res.status(200).json({valid: false});
        }
        
    });
})

app.post('/getChats', (req, res)=>{

    var {id} = req.body;
    pool.query('SELECT * FROM `chat-info`', (error, results) => {
        if (error) {
            res.status(200).json({ valid: false, error: 'Database error' });
        }
        console.log(results);
        const userChats = [];
        results.forEach(chat => {
            let members = [];
            if (Array.isArray(chat.members)) {
                members = chat.members;
            } else {
                members.push(chat.members);
            }
            console.log(id);
            console.log(members);
            if (members.includes(id)) {
                userChats.push(chat);
            }
        });
        
        if(userChats == null) { userChats = 0;}
        res.status(200).json({valid:true, userChats: userChats});
    });
})
app.post('/getNames', (req, res)=>{
    const {ids} = req.body;
    console.log(ids);
    
    pool.query(`SELECT name, surname FROM accounts WHERE id IN (${ids.join(',')})`, (req, results)=>{
        if(results){
        const userNames = results.map(user => user.name+ " " + user.surname);
        console.log(userNames);
        res.status(200).json({valid:true, userNames:userNames});
        return;}
    });
})

app.post('/registerValidation', (req, res) => {
    console.log(req.body);
    let id;
    const {username, password, name, surname} = req.body;
    
    pool.query('SELECT * FROM accounts WHERE username = ?', [username], (error, results) => {
        if (error) {
            return res.status(500).json({ valid: false, message: "Internal server error" });
        }
        
        if (results.length > 0) {
            return res.status(200).json({ valid: false, message: "Account with such username already exists" });
        } else {
            do {
                id = Math.floor(10000 + Math.random() * 90000);
            } while (idExists(id));

            pool.query('INSERT INTO accounts (id, username, password, name, surname) VALUES (?, ?, ?, ?, ?)', 
                       [id, username, password, name, surname], 
                       (error, results) => {
                if (error) {
                    return res.status(500).json({ valid: false, message: "Error while saving data" });
                }
                user = [id, username, name, surname];

                const newAccount = new Account({ id: id, username: username, password: password, name: name, surname: surname });
            newAccount.save()
            .then(() => {
            })
            .catch(err => {
              console.error('Error while saving data to MongoDB:', err);
              return res.status(200).json({ valid: false, message: "Error while saving data to MongoDB" });
            });
                return res.status(200).json({ valid: true, name: name + " " + surname, id: id, username: username });
            });
        }
    });
});

function idExists(id) {
    pool.query('SELECT id FROM accounts WHERE id = ?', [id], (error, results) => {
        if (error || results.length > 0) {
            return true;
        } else {
            return false; 
        }
    });
}

app.post('/createChat', (req, res) => {
    const {name, id} = req.body;
    var idExist = false, chatid = Math.floor(10000 + Math.random() * 90000);
        pool.query('SELECT id FROM `chat-info`',(error, results) => {
                do {
                    chatid = Math.floor(10000 + Math.random() * 90000);
                    let i = 0;
                    idExist = false;
                    if(results!=null) {
                    while(chatid!=results[i]){
                        if(i == results.length-1){
                            break;
                        }
                        i++;
                    }  if(i!= results.length){idExist=true;}}
                    else {idExist = true;}
                }while(!idExist);});
                if(!id){
                    return res.status(200).json({ valid: false, message: 'Problem with login.'});
                }
        pool.query('INSERT INTO `chat-info` (id, name, members) VALUES (?, ?, ?)', [chatid, name, JSON.stringify(id)], (error, results) => {
            if(error){
                return res.status(200).json({valid: false, message:"Error"});
            }
        });

        const newChat = new Chat({ id: chatid, name: name, members: id });
      newChat.save((err) => {
        if (err) {
            console.error('Error while saving data to MongoDB:', err);
     
          return res.status(200).json({ valid: false, message: "Error while saving data to MongoDB" });
        }
      });
        return res.status(200).json({valid: true});   
});

app.get('/users', async (req, res) => {
    try {
        const users = await Account.find().exec();
        return res.status(200).json({ valid: true, users: users });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ valid: false, message: 'Error fetching users.' });
    }
});

app.post('/formPost', (req, res)=>{
    console.log(req.body);
    const { firstName, lastName, groupName, gender, birthDate, id } = req.body;
   
    if (!firstName || !lastName || !groupName || !gender || !birthDate) {
        var f = [];
        if(!firstName){
            f.push('firstName');
        }
        if(!lastName){
            f.push('lastName');
        }
        if(!gender){
            f.push('gender');
        }
        if(!birthDate){
            f.push('birthDate');
        }
        return res.status(200).json({ valid: false, message: 'All fields are required.', invalidFields: f });
    }

    const regex = /^[a-zA-Z\s]*$/;

    if (!regex.test(firstName) || !regex.test(lastName)) {
        var f = [];
        if(!regex.firstName){
            f.push('firstName');
        }
        if(!regex.lastName){
            f.push('lastName');
        }
        return res.status(200).json({ valid: false, message: 'Name and lastname can only contain letters and spaces.', invalidFields: f});
    }

    const dob = new Date(birthDate);
    const age = Math.floor((new Date() - dob) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 16 || age > 70) {
        return res.status(200).json({ valid: false, message: 'Age must be between 16 and 70 years old.', invalidFields: ["birthDate"] });
    }


    pool.query('SELECT * FROM student WHERE id = ?', [id], (error, results) => {
        if(results.length > 0){
            pool.query('UPDATE student SET firstName=?, lastName=?, groupName=?, gender=?, birthDate=? WHERE id=?', [firstName, lastName, groupName, gender, birthDate, id], (updateError, updateResults) => {
                if (updateError) {
                    console.error('Error updating record:', updateError);
                    return res.status(500).json({ valid: false, message: 'Error occurred while updating record.' });
                }
            });
        } else {
            pool.query('INSERT INTO student (firstName, lastName, groupName, gender, birthDate, id) VALUES (?, ?, ?, ?, ?, ?)', [firstName, lastName, groupName, gender, birthDate, id], (error, results) => {
                if (error) {
                    console.error('Error executing query:', error);
                    return res.status(500).json({ valid: false, message: 'Error occurred while saving data to the database.' });
                }

        })
        }
})
    return res.status(200).json({ valid: true, message: 'Form data validated successfully.' });
})


app.get('/students', (req, res) => {
    getAllStudents((error, students) => {
        if (error) {
            res.status(500).json({ error: 'Failed to retrieve students' });
        } else {
            res.json(students);
        }
    });
});

function getAllStudents(callback) {
    pool.query('SELECT firstName, lastName, groupName, gender, DATE_FORMAT(birthDate, "%Y-%m-%d") AS formattedBirthDate, id FROM student', (error, results, fields) => {
        if (error) {
          callback(error, null);
          return;
        }

        const students = results.map(row => new Student(row.firstName, row.lastName, row.groupName, row.gender, row.formattedBirthDate, row.id));
        
        callback(null, students);
    });
}

const server = app.listen(port, ()=>{
    console.log('Server started at http://localhost:${port}')
})

app.post('/getMessages', async(req, res)=>{
    const { chatId, userId } = req.body;

    try {

     //   console.log(chatId);
        const messages = await Message.find({chatId : chatId }).sort().exec();
        
       // console.log('Retrieved messages:', messages); 

        if (messages.length === 0) {
        //    console.log('No messages found for chatId:', chatId);
            return res.status(200).json({ valid: false, message: 'No messages found' });
        }

        const enrichedMessages = await Promise.all(messages.map(async (message) => {
            const sender = await Account.findOne({ id: message.senderId }).exec();
            return {
                ...message._doc,
                senderName: sender ? `${sender.name}` : 'Unknown'
            };
        }));

       // console.log('Enriched messages:', enrichedMessages);

        await Promise.all(messages.map(async (message) => {
            if (!message.readBy[userId]) {
                message.readBy.set(userId, true);
                await message.save();
                console.log(message);
            }
        }));
       // console.log('Enriched messages:', enrichedMessages); 

        res.status(200).json({ valid: true, messages: enrichedMessages });
    } catch (error) {
        res.status(500).json({ valid: false, message: 'Error retrieving messages.' });
    }
});

const getNextMessageId = async (chatId) => {
    const lastMessage = await Message.findOne({ chatId: chatId }).sort({ id: -1 });
    return lastMessage ? lastMessage.id + 1 : 1;
};

app.post('/sendMessage',async(req, res) => {
    const { chatId, userId, text } = req.body;
    console.log(chatId + " " + userId + " " + text);
try {
    console.log("Finding chat with ID:", chatId); 
    const chat = await Chat.findOne({ id: chatId }).exec();

    if (!chat) {
        console.log("Chat not found");
        return res.status(404).json({ valid: false, message: 'Chat not found.' });
    }

    console.log("Chat found:", chat);

    if (!chat.members || !Array.isArray(chat.members)) {
        console.log("Invalid chat members data"); 
        return res.status(400).json({ valid: false, message: 'Chat members data is invalid.' });
    }

    console.log("Chat members length: " + chat.members.length)
    const readBy = new Array(chat.members.length).fill(false);
    console.log("ReadBy lenght: " + readBy.length)
    const userIndex = chat.members.indexOf(userId);

    if (userIndex === -1) {
        console.log("User not a member of the chat"); 
        return res.status(400).json({ valid: false, message: 'User is not a member of the chat.' });
    }

    readBy[userIndex] = true;

    console.log("Generating new message ID"); 
    const newId = await getNextMessageId(chatId);

    const newMessage = new Message({
        id: newId,
        chatId: chatId,
        senderId: userId,
        content: text,
        readBy: readBy
    });

    console.log("Saving new message"); 
    await newMessage.save(); 

    const sender = await Account.findOne({ id: userId }).exec();
    console.log("Sender found:", sender);
    var s = sender.name;
    console.log(" ff " + sender.name);
   // if (sender.id == userId) { s = "Me";}

    res.status(200).json({ valid: true, message: 'Message sent.' , sender: s, chatId: chatId});
} catch (error) {
    console.error('Error saving message:', error);
   // res.status(500).json({ valid: false, message: 'Error saving message.' });
}
});


app.post('/unreadMessages', async (req, res) => {
    console.log("fffffffff");
    const {userId} = req.body; // Assuming you have the user ID from the session or token

    const unreadMessages = await getUnreadMessagesForUser(userId);

    res.status(200).json({ valid: true, messages: unreadMessages });

});

async function getUnreadMessagesForUser(userId) {
    try {
        // Retrieve the user's chats
        console.log("ewv kjkjiecrjf");
        console.log(await Chat.find().exec());
        const userChats = await Chat.find({ members: userId }).exec();
        if (!userChats || userChats.length === 0) {
            console.log('No chats found for this user.');
            return [];
        }

        const unreadMessages = [];

        for (const chat of userChats) {
            // Find the index of the user in the members array
            const userIndex = chat.members.indexOf(userId);

            if (userIndex === -1) {
                continue;
            }
            console.log(1);
            // Find messages in this chat where the readBy[userIndex] is false
            const messages = await Message.find({
                chatId: chat.id,
                [`readBy.${userIndex}`]: false // MongoDB query to check specific index in the array
            })
            .sort({ createdAt: -1 })
            .limit(3)
            .exec();

            const truncatedMessages = await Promise.all(messages.map(async message => {
                const truncatedContent = message.content.length > 10 ? message.content.slice(0, 10) + '...' : message.content;
                const sender = await Account.findOne({ id: message.senderId }).exec();
                return {
                    senderName: sender ? sender.name : 'Unknown',
                    content: truncatedContent,
                };
            }));
            unreadMessages.push(...truncatedMessages);
        }

        return unreadMessages;
    } catch (error) {
        console.error('Error fetching unread messages:', error);
        return [];
    }
}



const io = socket(server);

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('chat message', (msg, sender, chatId) => {
        io.emit('chat message', msg, sender, chatId);
    });
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

