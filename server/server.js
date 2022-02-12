const express = require('express');
const cors = require("cors");
const path= require('path');
const sequelize = require('./sequelize');
const Ship = require('./Ship');
const CrewMember = require('./CrewMember');
const shiproutes = require('./shiproutes');
const crewroutes = require('./crewroutes');
const pg = require('pg');

const application = express();
application.use(express.urlencoded({ extended: true, }) );
application.use(express.json());
application.use(express.static(path.join(__dirname,'build')))
application.use(cors());

if(process.env.DATABASE_URL)
{
const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
  });
  client.connect();
  client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
    if (err) throw err;
    for (let row of res.rows) {
        console.log(JSON.stringify(row));
    }
    client.end();
  });
}

application.listen(process.env.PORT || 8080, function() {
    console.log("Serverul se afla pe port " + (process.env.PORT || 8080) + "...");
});

Ship.hasMany(CrewMember);
CrewMember.belongsTo(Ship);

application.get("/sync", async (req, res, next) => {
    try {
      await sequelize.sync({ force: true });
      res.status(201).json({ message: "Database created." });
    } catch (err) {
      next(err);
    }
});

application.use('/ships',shiproutes);
application.use('/crew',crewroutes);
application.get('*',(req,res)=>{
  res.sendFile(path.join(__dirname,'build','index.html'));
});