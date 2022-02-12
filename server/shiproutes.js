const express = require('express');
const Ship = require('./Ship');
const CrewMember = require('./CrewMember');
const { Op } = require("sequelize");
const app = express();

// import
app.post('/import', async (request, response, next) => {
  try {
    const registry = {};
    for (let u of request.body) {
      const ship = await Ship.create(u);
      for (let s of u.CrewMembers) {
        const crewMember = await CrewMember.create(s);
        registry[s.id] = crewMember;
        ship.addCrewMember(crewMember);
      }
      await ship.save();
    }
    response.sendStatus(204);
  } catch (error) {
    next(error);
  }
});
// export
app.get('/export', async (request, response, next) => {
  try {
    const result = [];
    for (let u of await Ship.findAll()) {
      const ship = {
        name:u.name,
        displacement:u.displacement,
        CrewMembers: []
      };
      for (let c of await u.getCrewMembers()) {
        ship.CrewMembers.push({
          role: c.role,
          name:c.name
        });
      }
      result.push(ship);
    }
    if (result.length > 0) {
      response.json(result);
    } else {
      response.sendStatus(204);
    }
  } catch (error) {
    next(error);
  }
});

app.get('/', async (req, res) => {
  try {
    const query = {}
    let pageSize = 2
    const allowedFilters = ['name', 'displacement']
    const filterKeys = Object.keys(req.query).filter(e => allowedFilters.indexOf(e) !== -1)
    if (filterKeys.length > 0) {
      query.where = {}
      for (const key of filterKeys) {
        query.where[key] = {
          [Op.like]: `${req.query[key]}%`
        }
      }
    }
    const sortField = req.query.sortField
    let sortOrder = 'ASC'
    if (req.query.sortOrder && req.query.sortOrder === '-1') {
      sortOrder = 'DESC'
    }

    if (req.query.pageSize) {
      pageSize = parseInt(req.query.pageSize)
    }

    if (sortField) {
      query.order = [[sortField, sortOrder]]
    }

    if (!isNaN(parseInt(req.query.page))) {
      query.limit = pageSize
      query.offset = pageSize * parseInt(req.query.page)
    }
    const records = await Ship.findAll(query)
    const count = await Ship.count()
    res.status(200).json({ records, count })
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})
app.get('/all', async (req, res, next) => {
  try {
    const ships = await Ship.findAll();
    res.status(200).json(ships);
  } catch (err) {
    next(err);
  }
});
app.get('/:id', async (req, res, next) => {
  try {
    const ships = await Ship.findByPk(req.params.id);
    res.status(200).json(ships);
  } catch (err) {
    next(err);
  }
});

app.post("/", async (req, res, next) => {
    try {
      if(req.body.name && req.body.displacement){
        await Ship.create(req.body);
        res.status(201).json({ message: "Ship Created!" });
      } else {
        res.status(400).json({ message: "Missing attributes!" });
      }
    } catch (err) {
      next(err);
    }
  });
  
  app.put("/:shipId", async (req, res, next) => {
    try {
      const ship = await Ship.findByPk(req.params.shipId);
      if(ship){
        if(req.body.name && req.body.displacement){
          await ship.update(req.body);
          res.status(201).json({ message: "ship Updated!" });
        } else {
          res.status(400).json({ message: "Missing attributes!" });
        }
      } else {
        res.status(404).json({ message: "No such ship!" });
      }
    } catch (err) {
      next(err);
    }
  });
  
  app.delete("/:shipId", async (req, res, next) => {
    try {
      const ship = await Ship.findByPk(req.params.shipId);
      if(ship){
       await ship.destroy();
          res.status(202).json({ message: "ship Deleted!" });
      } else {
        res.status(404).json({ message: "No such ship!" });
      }
    } catch (err) {
      next(err);
    }
  });

module.exports = app;