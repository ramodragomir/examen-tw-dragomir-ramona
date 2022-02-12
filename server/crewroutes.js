const express = require('express');
const CrewMember = require('./CrewMember');
const Ship = require('./Ship');
const app = express();


app.get('/all', async (req, res, next) => {
    try {
      const crewMembers = await CrewMember.findAll();
      res.status(200).json(crewMembers);
    } catch (err) {
      next(err);
    }
  });

  
app.get('/Ships/:shipId', async (req, res, next) => {
    try {
      const ship = await Ship.findByPk(req.params.shipId);
      if(ship){
          const CrewMembers = await ship.getCrewMembers();
          res.status(200).json(CrewMembers);
      } else {
        res.status(404).json({ message: "No such Ship!" });
      } 
    } catch (err) {
      next(err);
    }
  });
  app.get('/:CrewMemberId/Ships/:shipId', async (req, res, next) => {
    try {
      const ship = await Ship.findByPk(req.params.shipId);
      if(ship){
          const crewMembers = await ship.getCrewMembers();
          if(crewMembers&&crewMembers.length>0){
          const ref =  await CrewMember.findOne(
            {
              where: {
                id: req.params.CrewMemberId,
                shipId: req.params.shipId
              }
            })
          res.status(200).json(ref);
          }
          else res.status(404).json({ message: "No such CrewMember!" });
      } else {
        res.status(404).json({ message: "No such Ship!" });
      } 
    } catch (err) {
      next(err);
    }
  });
  
app.post("/Ships/:shipId", async (req, res, next) => {
    try {
      if ( req.body.role && req.body.name) {
        const ship = await Ship.findByPk(req.params.shipId);
        if(ship){
          const crewMembers = await CrewMember.create(req.body);
          ship.addCrewMember(crewMembers);
          await ship.save();
          res.status(201).json({ message: "CrewMember Added!" });
        }else res.status(404).json({ message: "Not being able to find Ship." });
    } 
       else {
        res.status(400).json({ message: "Missing attributes!" });
      }
    } catch (err) {
      next(err);
    }
  });

app.put("/:CrewMemberId/Ships/:shipId", async (req, res, next) => {
  try {
    if (req.body.role && req.body.name) {
      const crewMember = await CrewMember.findByPk(req.params.CrewMemberId);
      if(crewMember){
        if(crewMember.shipId == req.params.shipId){
          await crewMember.update(req.body);
          res.status(201).json({ message: "CrewMember updated!" });
        } else res.status(404).json({ message: "This CrewMember doesnt belong to this Ship!" });
      }else res.status(404).json({ message: "Not being able to find CrewMember." });
  } 
     else {
      res.status(400).json({ message: "Missing attributes!" });
    }
  } catch (err) {
    next(err);
  }
});

app.delete("/:CrewMemberId/Ships/:shipId", async (req, res, next) => {
  try {
    const crewMember = await CrewMember.findByPk(req.params.CrewMemberId);
      if(crewMember){
        if(crewMember.shipId == req.params.shipId){
          await crewMember.destroy();
          res.status(201).json({ message: "CrewMember deleted!" });
        } else res.status(404).json({ message: "This CrewMember doesnt belong to this Ship!" });
      }else res.status(404).json({ message: "Not being able to find CrewMember." });
  } catch (err) {
    next(err);
  }
});

module.exports = app;