'use strict';

require('dotenv').config({path: `${__dirname}/.test.env`});
const faker = require('faker');
const superagent = require('superagent');
const expect = require('expect');




const server = require('../lib/server.js');
const mockBar = require('./lib/mock-bar.js');
const clearDB =  require('./lib/clear-db.js'); //write these...


const API_URL = `http://localhost:${process.env.PORT}`;
let tempBar; //eslint-disable-line

describe('testing Bar routes', () => {
  before(server.start);
  after(server.stop);
  afterEach(clearDB);

///POST REQUEST
  describe('test POST /api/bars',() => {
    let barData = {name: faker.name.title(),
      address:faker.address.streetAddress(),
      bestDrink: faker.address.streetAddress(),
    };

    it('should respond with a Bar', () => {
      return superagent.post(`${API_URL}/api/bars`)
      .send(barData)
      .then(res => {
        console.log(res.body);

        expect(res.status).toEqual(200);
        expect(res.body._id).toExist();

        expect(res.body.name).toEqual(barData.name);
        expect(res.body.tasks).toEqual([]);
      });
    });


    it('should respond with a 400... because it has no body', () => {
      return superagent.post(`${API_URL}/api/bars`)
      .catch(res => {
        // console.log('res status^^^^^^^^^^',res.status);
        expect(res.status).toEqual(400);
      });
    });


    it('should be a 409 becuase it has the same name property twice..', ()=>{
      return superagent.post(`${API_URL}/api/bars`)
      .send(barData)
      .catch(res => {
        expect(res.status).toEqual(409);
      });
    });
  });

////GET REQUEST
  describe('testing GET /api/bars/:id', () => {

    it('should respond with an a list', () => {
      let tempBar;
      return mockBar.createOne() //have to write this part...
      .then(bar => {
        tempBar = bar;
        // console.log(tempBar);
        return superagent.get(`${API_URL}/api/bars/${bar._id}`);
      })
      .then(res => {

        // console.log('res.^^^^',res.body);
        expect(res.status).toEqual(200);
        expect(res.body.name).toEqual(tempBar.name);
        expect(res.body.tasks).toEqual([]);
        expect(res.body._id).toExist();
      });
    });

    it('should respond with an array of 30 bars!!', () => {
      return mockBar.createMany(60)
      .then(() => {
        return superagent.get(`${API_URL}/api/bars?page=2`);
      })
      .then(res => {
        // console.log(res.body.map(bar=>bar.name));
        // console.log('res.^^^^',res.body);
        expect(res.status).toEqual(200);
        expect(res.body.length).toEqual(30);
        res.body.forEach(bar =>{
          expect(bar._id).toExist();
          expect(bar.tasks).toExist([]);
          expect(bar.name).toExist();
        });
      });
    });

    it('should respond with an array of 30 bars!!', () => {
      let tempBars; //eslint-disable-line
      return mockBar.createMany(60)
      .then(bars => {
        tempBars = bars;
        return superagent.get(`${API_URL}/api/bars?page=3`);
      })
      .then(res => {
        console.log(res.body.map(bar=>bar.name));
        // console.log('res.^^^^',res.body);
        expect(res.status).toEqual(200);
        expect(res.body.length).toEqual(0);
      });
    });
    it('should respond with a 404', () => {
      return superagent.get(`${API_URL}/api/bars/id:suhhdude`)
      .catch((err) => {

        expect(err.status).toEqual(404);
      });
    });
  });

//PUT REQUESTS!!!

  describe('testing PUT /api/bars', () => {

    it('should respond with updating bar content information...', () => {
      let tempBar;
      return mockBar.createOne()
      .then(bar => {
        tempBar = bar;
        return superagent.put( `${API_URL}/api/bars/${bar._id}`)
        .send({name:'updated',address:'updated',bestDrink:'updated'});
      })
      .then(res => {
        expect(res.status).toEqual(200);
        expect(res.body._id).toEqual(tempBar._id);
        expect(res.body.name).toEqual('updated');
        expect(res.body.bestDrink).toEqual('updated');
      });
    });

    it('should respond with a 400 bad request', () => {
      let tempBar;
      return mockBar.createOne()
      .then(bar => {
        tempBar = bar;
        return superagent.put(`${API_URL}/api/bars/${tempBar._id}`)
        .send({});
      })
      .catch((err) => {
        expect(err.status).toEqual(400);
      });
    });
    it('should respond with a 404 bad request', () => {
      return superagent.put(`${API_URL}/api/bars/3948769356456badrequest`)
      // .send({})
      .catch((err) => {
        expect(err.status).toEqual(404);
      });
    });
  });

  describe('test DELETE /api/bars', () => {
    it('should delete our tempBar...', () => {
      let tempBar;
      return mockBar.createOne()
      .then(bar => {
        tempBar = bar;
        return superagent.delete(`${API_URL}/api/bars/${tempBar._id}`);
      })
      .catch(err => {
        expect(err.status).toEqual(204);
        console.log('im in the delete test');
      });
    });

    it('should be a bad request, 404', () => {
      return superagent.delete(`${API_URL}/api/bars/yeahhhhnooo`)
      .catch(err => {
        expect(err.status).toEqual(404);
        console.log('im in the delete test');
      });
    });
  });
});
