const mongoose=require('mongoose');
const config=require('config');

mongoose.connect(`mongodb://${config.get('database.host')}:${config.get('database.port')}/${config.get('database.dbname')}`,{
    useCreateIndex:true,
    useFindAndModify:false,
    useUnifiedTopology:true,
    useNewUrlParser:true
}).then(()=>{
    console.log('App is connetced with the database');
}).catch(()=>{
    console.log('App is failed to connect to the database');
});