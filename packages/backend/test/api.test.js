import { expect } from 'chai';
import request from 'supertest';
import sinon from 'sinon';
import app from '../src/server.js';
import { gitcoinService } from '../src/services/gitcoin.js';
import { pohService } from '../src/services/poh.js';
import { brightidService } from '../src/services/brightid.js';

describe('API Endpoints', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const res = await request(app).get('/health');
      
      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('ok');
      expect(res.body.service).to.equal('NotABot Backend');
      expect(res.body.oracleAddress).to.be.a('string');
    });
  });

  describe('POST /api/gitcoin/verify', () => {
    it('should verify valid Gitcoin passport', async () => {
      sinon.stub(gitcoinService, 'getPassportScore').resolves({
        score: 75,
        rawScore: '75.5'
      });

      const res = await request(app)
        .post('/api/gitcoin/verify')
        .send({ userAddress: '0x1234567890123456789012345678901234567890' });

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.score).to.equal(75);
      expect(res.body.data.signature).to.be.a('string');
    });

    it('should reject low score', async () => {
      sinon.stub(gitcoinService, 'getPassportScore').resolves({
        score: 10,
        rawScore: '10.0'
      });

      const res = await request(app)
        .post('/api/gitcoin/verify')
        .send({ userAddress: '0x1234567890123456789012345678901234567890' });

      expect(res.status).to.equal(400);
      expect(res.body.code).to.equal('SCORE_TOO_LOW');
    });

    it('should reject invalid address', async () => {
      const res = await request(app)
        .post('/api/gitcoin/verify')
        .send({ userAddress: 'invalid' });

      expect(res.status).to.equal(400);
    });
  });

  describe('POST /api/poh/verify', () => {
    it('should verify registered PoH user', async () => {
      sinon.stub(pohService, 'isRegistered').resolves({
        registered: true,
        pohId: '0x1234567890abcdef'
      });

      const res = await request(app)
        .post('/api/poh/verify')
        .send({ userAddress: '0x1234567890123456789012345678901234567890' });

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.signature).to.be.a('string');
    });

    it('should reject unregistered user', async () => {
      sinon.stub(pohService, 'isRegistered').rejects(new Error('NOT_REGISTERED_IN_POH'));

      const res = await request(app)
        .post('/api/poh/verify')
        .send({ userAddress: '0x1234567890123456789012345678901234567890' });

      expect(res.status).to.equal(404);
    });
  });

  describe('POST /api/brightid/verify', () => {
    it('should verify BrightID user', async () => {
      sinon.stub(brightidService, 'isVerified').resolves({
        unique: true,
        contextId: '0xabcdef1234567890'
      });

      const res = await request(app)
        .post('/api/brightid/verify')
        .send({ userAddress: '0x1234567890123456789012345678901234567890' });

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.signature).to.be.a('string');
    });

    it('should reject unverified user', async () => {
      sinon.stub(brightidService, 'isVerified').rejects(new Error('NOT_VERIFIED_IN_BRIGHTID'));

      const res = await request(app)
        .post('/api/brightid/verify')
        .send({ userAddress: '0x1234567890123456789012345678901234567890' });

      expect(res.status).to.equal(404);
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limit', async () => {
      const promises = [];
      for (let i = 0; i < 110; i++) {
        promises.push(
          request(app)
            .post('/api/gitcoin/verify')
            .send({ userAddress: '0x1234567890123456789012345678901234567890' })
        );
      }
      const results = await Promise.all(promises);
      const tooManyRequests = results.filter(r => r.status === 429);
      expect(tooManyRequests.length).to.be.greaterThan(0);
    });
  });
});

